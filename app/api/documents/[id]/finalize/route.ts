import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PDFDocument } from "pdf-lib";
// import signpdf from "@signpdf/signpdf"; // Se usará cuando se tenga el certificado .p12
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const recursoId = resolvedParams.id;
    
    const supabase = await createClient();

    // 1. Obtener el recurso y verificar permisos
    const { data: recurso, error: recError } = await supabase
      .from("recursos")
      .select("*, salas(backroom_id, backrooms(propietario_id))")
      .eq("id", recursoId)
      .single();

    if (recError || !recurso) throw new ApiError(404, "Documento no encontrado");

    const propietarioId = recurso.salas?.backrooms?.propietario_id;
    const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", user.id).single();

    if (propietarioId !== perfil?.id) {
      throw new ApiError(403, "Solo el administrador del Backroom puede sellar el documento");
    }

    // 2. Obtener todas las firmas virtuales de este documento
    const { data: firmas } = await supabase
      .from("document_signatures")
      .select("*")
      .eq("recurso_id", recursoId);

    if (!firmas || firmas.length === 0) {
      throw new ApiError(400, "No hay firmas para sellar en este documento");
    }

    // 3. Descargar el archivo PDF desde Storage
    // Extraer ruta del Storage desde la URL del recurso (Asumiendo que url es pública o la ruta exacta)
    // Normalmente la URL es: https://[proyecto].supabase.co/storage/v1/object/public/[bucket]/[ruta]
    const storagePathMatch = recurso.url.match(/public\/([^/]+)\/(.+)$/);
    if (!storagePathMatch) {
      throw new ApiError(400, "URL de almacenamiento inválida");
    }
    const bucket = storagePathMatch[1];
    const filePath = storagePathMatch[2];

    const { data: fileBlob, error: downloadError } = await supabase
      .storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileBlob) throw new ApiError(500, "Error descargando el documento base");

    const arrayBuffer = await fileBlob.arrayBuffer();
    
    // 4. Cargar el PDF en pdf-lib
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();

    // 5. Incrustar cada firma (Sticker) en el PDF
    for (const firma of firmas) {
      // Las imágenes de firma vienen en Base64 Data URL (data:image/png;base64,...)
      const base64Data = firma.signature_image_url.split(',')[1];
      if (!base64Data) continue;

      const imageBytes = Buffer.from(base64Data, 'base64');
      const pngImage = await pdfDoc.embedPng(imageBytes);
      
      // Ajustar página (0-indexed en pdf-lib, 1-indexed en la app)
      const pageIndex = firma.page_number - 1;
      if (pageIndex < 0 || pageIndex >= pages.length) continue;
      const page = pages[pageIndex];

      // Convertir coordenadas de HTML (Top-Left) a PDF (Bottom-Left)
      const pdfHeight = page.getHeight();
      
      // Dimensiones por defecto del sticker
      const stickerWidth = 150; 
      const stickerHeight = (pngImage.height / pngImage.width) * stickerWidth;

      page.drawImage(pngImage, {
        x: firma.pos_x,
        y: pdfHeight - firma.pos_y - stickerHeight, // Invertir Y
        width: stickerWidth,
        height: stickerHeight,
      });
    }

    // 6. Guardar los bytes del PDF modificado
    const pdfBytes = await pdfDoc.save();

    // 7. Sello Criptográfico (Placeholder para el .p12)
    /*
      TODO: Cuando el usuario suba su certificado .p12
      1. Descargar certificado desde organizations.certificate_path
      2. Leer contraseña
      3. const signedPdf = signpdf.sign(pdfBytes, p12Buffer, { pass: password });
      4. pdfBytes = signedPdf;
    */

    // 8. Sobrescribir el archivo original en Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw new ApiError(500, "Error guardando el documento final");

    // 9. Limpiar las firmas virtuales (Ya están quemadas en el PDF)
    await supabase.from("document_signatures").delete().eq("recurso_id", recursoId);

    return NextResponse.json({ success: true, message: "Documento sellado exitosamente" });

  } catch (error) {
    return handleApiError(error);
  }
}

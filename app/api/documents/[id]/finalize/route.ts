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
    // La url en base de datos es la ruta del archivo en el bucket 'recursos'
    const bucket = "recursos";
    const filePath = recurso.url;

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
    let pdfBytes = await pdfDoc.save();

    // 7. Sello Criptográfico (.p12)
    // Obtener la organización del recurso para ver si tiene certificado
    const { data: backroom } = await supabase
      .from("backrooms")
      .select("organization_id")
      .eq("id", recurso.salas.backroom_id)
      .single();
    
    if (backroom?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("name, certificate_path, certificate_password, plan")
        .eq("id", backroom.organization_id)
        .single();
      
      // Si la org tiene un certificado configurado y está en plan Pro o Enterprise
      if (org && org.certificate_path && org.certificate_password && (org.plan === "pro" || org.plan === "enterprise")) {
        const signpdf = (await import("@signpdf/signpdf")).default;
        const { plainAddPlaceholder } = await import("@signpdf/placeholder-plain");
        const { P12Signer } = await import("@signpdf/signer-p12");
        
        // Descargar certificado desde Storage
        const { data: certBlob } = await supabase.storage.from("certificates").download(org.certificate_path);
        
        if (certBlob) {
          const p12Buffer = Buffer.from(await certBlob.arrayBuffer());
          
          // Añadir el placeholder para la firma (al final del archivo)
          const pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer: Buffer.from(pdfBytes),
            reason: 'Firma y Sello de Backroom',
            signatureLength: 8192,
            contactInfo: 'admin@backroom.test',
            name: org.name || 'Organización',
            location: 'Global',
          });

          // Firmar criptográficamente
          const signer = new P12Signer(p12Buffer, { passphrase: org.certificate_password });
          const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);
          
          pdfBytes = new Uint8Array(signedPdf);
        }
      }
    }

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

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUsuarioInterno, checkRoomPermission } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { AuditService } from "@/lib/services/audit.service";
import { v4 as uuidv4 } from "uuid";
import puppeteer from "puppeteer";

export const maxDuration = 60; // 1 minuto de timeout

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(401, "Usuario interno no encontrado");

    const supabase = await createClient();
    const { data: sala, error: salaError } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // Verificar permiso 'recursos.subir'
    const hasUploadPerm = await checkRoomPermission(user.id, roomId, "recursos.subir");
    if (!hasUploadPerm) throw new ApiError(403, "No tienes permiso para subir/crear archivos");

    const { nombre, content, isHTML } = await request.json();
    if (!nombre || !content) {
      throw new ApiError(400, "Nombre y contenido son obligatorios");
    }

    const supabaseAdmin = createAdminClient();
    
    // Obtener org_id para los límites
    const { data: backroom } = await supabaseAdmin.from("backrooms").select("propietario_id").eq("id", sala.backroom_id).single();
    if (!backroom) throw new ApiError(500, "No se encontró el backroom");
    
    // Obtener la organización del propietario
    const { data: org } = await supabaseAdmin.from("organizations").select("id").eq("owner_id", backroom.propietario_id).single();
    if (!org) throw new ApiError(500, "No se encontró la organización del backroom");
    
    const { getOrganizationPlan, PLAN_LIMITS } = await import("@/lib/limits");
    const plan = await getOrganizationPlan(org.id);
    const limits = PLAN_LIMITS[plan];

    let fileBuffer: Buffer | Uint8Array;
    let mimeType = "application/pdf";
    let extension = ".pdf";
    let dbTipo = "pdf";

    if (isHTML) {
      const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`;
      fileBuffer = Buffer.from(fullHtml, 'utf-8');
      mimeType = "text/html";
      extension = ".html";
      dbTipo = "doc";
    } else {
      // Convertir texto a HTML básico para el PDF
      const formattedContent = content.replace(/\n/g, '<br/>');
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <h1>${nombre}</h1>
          <div>${formattedContent}</div>
        </body>
        </html>
      `;

      // Convertir a PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
      
      fileBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
      });
      await browser.close();
    }

    const fileSizeBytes = fileBuffer.length;

    // Verificar límites
    if (fileSizeBytes > limits.max_file_bytes) {
      throw new ApiError(413, `El archivo generado supera el límite permitido por tu plan (${limits.max_file_bytes / (1024*1024)}MB)`);
    }

    const { data: recursos, error: sumError } = await supabaseAdmin
      .from("recursos")
      .select("tamano_bytes")
      .limit(10000); 
    
    const usedBytes = recursos?.reduce((acc, curr) => acc + (curr.tamano_bytes || 0), 0) || 0;
    if (usedBytes + fileSizeBytes > limits.storage_bytes) {
      throw new ApiError(422, `Almacenamiento insuficiente. Límite de tu plan: ${limits.storage_bytes / (1024*1024)}MB`);
    }

    const fileName = `${roomId}/${uuidv4()}${extension}`;

    // 1. Subir a Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("recursos")
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (storageError) {
      throw new ApiError(500, "Error al guardar el archivo en la nube: " + storageError.message);
    }

    // 2. Guardar en Base de datos
    const dbName = nombre.endsWith(extension) ? nombre : `${nombre}${extension}`;
    const { data, error: dbError } = await supabaseAdmin
      .from("recursos")
      .insert([{
        sala_id: roomId,
        subido_por: usuario.id,
        url: fileName,
        tipo: dbTipo,
        nombre: dbName,
        tamano_bytes: fileSizeBytes
      }])
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from("recursos").remove([fileName]);
      throw new ApiError(500, `Error al registrar el archivo en la base de datos: ${dbError.message}`);
    }

    // Auditoría
    await AuditService.logAction({
      orgId: org.id,
      actorId: user.id,
      action: "RESOURCE_UPLOADED",
      targetType: "resource",
      targetId: data.id,
      details: { fileName: dbName, size: fileSizeBytes, note: "Generado desde editor" }
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

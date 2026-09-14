import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkPermission, checkRoomPermission } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import puppeteer from "puppeteer";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string, resourceId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId, resourceId } = await params;

    const adminSupabase = createAdminClient();
    const { data: sala, error: salaError } = await adminSupabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // Verificar permiso 'recursos.eliminar'
    const hasDeletePerm = await checkRoomPermission(user.id, roomId, "recursos.eliminar");
    if (!hasDeletePerm) throw new ApiError(403, "No tienes permiso para eliminar recursos");

    const supabaseAdmin = createAdminClient();
    
    // Buscar si el recurso es un archivo físico
    const { data: recurso, error: fetchError } = await supabaseAdmin
      .from("recursos")
      .select("*")
      .eq("id", resourceId)
      .single();
      
    if (fetchError || !recurso) throw new ApiError(404, "Recurso no encontrado");

    // Eliminar de Storage si es archivo
    if (recurso.tipo !== "link" && recurso.tipo !== "youtube") {
      await supabaseAdmin.storage.from("recursos").remove([recurso.url]);
    }

    // Eliminar de la BD
    const { error } = await supabaseAdmin
      .from("recursos")
      .delete()
      .eq("id", resourceId);

    if (error) throw new ApiError(500, "Error al eliminar de la base de datos");

    return NextResponse.json({ message: "Eliminado exitosamente" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string, resourceId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId, resourceId } = await params;

    const adminSupabase = createAdminClient();
    const { data: sala, error: salaError } = await adminSupabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // We can require upload permission to edit
    const hasUploadPerm = await checkRoomPermission(user.id, roomId, "recursos.subir");
    if (!hasUploadPerm) throw new ApiError(403, "No tienes permiso para editar recursos");

    const { content, isHTML } = await request.json();
    if (!content || !isHTML) {
      throw new ApiError(400, "Contenido inválido para actualización");
    }

    const supabaseAdmin = createAdminClient();
    
    const { data: recurso, error: fetchError } = await supabaseAdmin
      .from("recursos")
      .select("*")
      .eq("id", resourceId)
      .single();
      
    if (fetchError || !recurso) throw new ApiError(404, "Recurso no encontrado");

    if (recurso.tipo !== "doc") {
      throw new ApiError(400, "Solo se pueden editar documentos HTML directamente");
    }

    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }</style></head><body>${content}</body></html>`;
    
    // Regenerar el PDF usando Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "domcontentloaded" });
    
    const fileBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
    });
    await browser.close();

    const newSizeBytes = fileBuffer.length;

    // We skip limits check for edit to keep it simple
    const { error: storageError } = await supabaseAdmin.storage
      .from("recursos")
      .upload(recurso.url, fileBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

    if (storageError) {
      throw new ApiError(500, "Error al guardar el archivo en la nube: " + storageError.message);
    }

    const { error: dbError } = await supabaseAdmin
      .from("recursos")
      .update({ tamano_bytes: newSizeBytes })
      .eq("id", resourceId);

    if (dbError) {
      throw new ApiError(500, "Error al actualizar metadata del archivo");
    }

    return NextResponse.json({ message: "Actualizado exitosamente" }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

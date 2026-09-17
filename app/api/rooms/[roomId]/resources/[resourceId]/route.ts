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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new ApiError(400, "Contenido inválido para actualización. Se requiere un archivo.");
    }

    const supabaseAdmin = createAdminClient();
    
    const { data: recurso, error: fetchError } = await supabaseAdmin
      .from("recursos")
      .select("*")
      .eq("id", resourceId)
      .single();
      
    if (fetchError || !recurso) throw new ApiError(404, "Recurso no encontrado");

    const fileBuffer = await file.arrayBuffer();
    const newSizeBytes = file.size;

    // We skip limits check for edit to keep it simple
    const { error: storageError } = await supabaseAdmin.storage
      .from("recursos")
      .upload(recurso.url, fileBuffer, {
        contentType: file.type || "application/pdf",
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

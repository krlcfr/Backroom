import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkPermission, getUsuarioInterno, checkRoomPermission } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { v4 as uuidv4 } from "uuid";

// Configuración para el tamaño máximo en Next.js (aunque también lo controlamos en el formData)
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
    if (!hasUploadPerm) throw new ApiError(403, "No tienes permiso para subir archivos");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new ApiError(400, "No se proporcionó ningún archivo");
    }

    const supabaseAdmin = createAdminClient();
    
    // Obtener org_id para los límites
    const { data: backroom } = await supabaseAdmin.from("backrooms").select("organizacion_id").eq("id", sala.backroom_id).single();
    if (!backroom) throw new ApiError(500, "No se encontró el backroom");
    
    const { getOrganizationPlan, PLAN_LIMITS } = await import("@/lib/limits");
    const plan = await getOrganizationPlan(backroom.organizacion_id);
    const limits = PLAN_LIMITS[plan];

    // Verificar tamaño máximo de archivo
    if (file.size > limits.max_file_bytes) {
      throw new ApiError(413, `El archivo supera el límite permitido por tu plan (${limits.max_file_bytes / (1024*1024)}MB)`);
    }

    // Verificar espacio total de almacenamiento disponible
    const { data: recursos, error: sumError } = await supabaseAdmin
      .from("recursos")
      .select("tamano_bytes")
      .limit(10000); // Hack rápido para MVP. Debería ser una suma SQL de los recursos del backroom/org.
    
    const usedBytes = recursos?.reduce((acc, curr) => acc + (curr.tamano_bytes || 0), 0) || 0;
    if (usedBytes + file.size > limits.storage_bytes) {
      throw new ApiError(422, `Almacenamiento insuficiente. Límite de tu plan: ${limits.storage_bytes / (1024*1024)}MB`);
    }

    const fileExt = file.name.split('.').pop() || '';
    const fileName = `${roomId}/${uuidv4()}.${fileExt}`;

    // 1. Subir a Storage
    const buffer = await file.arrayBuffer();
    const { error: storageError } = await supabaseAdmin.storage
      .from("recursos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (storageError) {
      throw new ApiError(500, "Error al guardar el archivo en la nube: " + storageError.message);
    }

    // Inferir el tipo
    let tipo = "archivo";
    if (file.type.startsWith("image/")) tipo = "image";
    else if (file.type === "application/pdf") tipo = "pdf";

    // 2. Guardar en Base de datos
    const { data, error: dbError } = await supabaseAdmin
      .from("recursos")
      .insert([{
        sala_id: roomId,
        subido_por: usuario.id,
        url: fileName,
        tipo,
        nombre: file.name,
        tamano_bytes: file.size
      }])
      .select()
      .single();

    if (dbError) {
      // Intentar rollback del storage
      await supabaseAdmin.storage.from("recursos").remove([fileName]);
      throw new ApiError(500, `Error al registrar el archivo en la base de datos: ${dbError.message}`);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

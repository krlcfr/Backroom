import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/rbac";
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

    const supabase = await createClient();
    const { data: sala, error: salaError } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // Verificar permiso 'archivos_subir'
    const hasUploadPerm = await checkPermission(user.id, sala.backroom_id, "archivos_subir", roomId);
    if (!hasUploadPerm) throw new ApiError(403, "No tienes permiso para subir archivos");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new ApiError(400, "No se proporcionó ningún archivo");
    }

    // Límite 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new ApiError(400, "El archivo supera el límite de 10MB");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${roomId}/${uuidv4()}.${fileExt}`;
    const supabaseAdmin = createAdminClient();

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
        subido_por: user.id,
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

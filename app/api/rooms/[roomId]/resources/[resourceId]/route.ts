import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkPermission, checkRoomPermission } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string, resourceId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId, resourceId } = await params;

    const supabase = await createClient();
    const { data: sala, error: salaError } = await supabase
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

    if (error) throw new ApiError(500, "Error al eliminar el recurso");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner } from "@/lib/auth/rbac";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId, userId } = await params;

    // Solo el dueño puede auditar los permisos granulares por ahora
    const owner = await isOwner(user.id, backroomId);
    if (!owner) throw new ApiError(403, "Solo el propietario puede auditar permisos.");

    const supabase = await createClient();
    
    // Obtener todas las salas del backroom
    const { data: salas, error: salasError } = await supabase
      .from("salas")
      .select("id")
      .eq("backroom_id", backroomId);
      
    if (salasError) throw new ApiError(500, "Error al obtener salas del backroom.");
    
    const salaIds = salas.map(s => s.id);

    if (salaIds.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Obtener todos los permisos de este usuario para estas salas
    const { data: permisos, error: permisosError } = await supabase
      .from("sala_permisos")
      .select("*")
      .eq("usuario_id", userId)
      .in("sala_id", salaIds);

    if (permisosError) throw new ApiError(500, "Error al obtener permisos granulares.");

    return NextResponse.json({ data: permisos }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

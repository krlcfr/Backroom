import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission } from "@/lib/auth/rbac";

// GET /api/backrooms/[backroomId]/members — BE-19
// Lista todos los miembros del backroom con su permiso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId } = await params;

    // Solo miembros activos pueden listar
    const hasAccess = await checkPermission(user.id, backroomId, "solo_visualizar");
    if (!hasAccess) throw new ApiError(403, "Sin acceso a este BackRoom.");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("backroom_miembros")
      .select("usuario_id, permiso, asignado_por, created_at, usuarios!backroom_miembros_usuario_id_fkey(id, username, correo, nombre_completo)")
      .eq("backroom_id", backroomId);

    if (error) throw new ApiError(500, "No se pudieron obtener los miembros.");

    return NextResponse.json({ data: { members: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

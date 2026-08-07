import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission } from "@/lib/auth/rbac";

// GET /api/backrooms/[backroomId]/roles — Lista roles (permisos) de los miembros
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId } = await params;

    const hasAccess = await checkPermission(user.id, backroomId, "solo_visualizar");
    if (!hasAccess) throw new ApiError(403, "Sin acceso a este BackRoom.");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("backroom_miembros")
      .select("usuario_id, permiso, asignado_por, created_at, usuarios(username)")
      .eq("backroom_id", backroomId);

    if (error) throw new ApiError(500, "No se pudieron obtener los roles.");

    return NextResponse.json({ data: { roles: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

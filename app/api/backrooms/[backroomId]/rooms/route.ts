import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { handleApiError, ApiError } from "@/lib/api-error"
import { checkRoomPermission } from "@/lib/auth/rbac"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth()
    const { backroomId } = await params

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, created_at, parent_id, icono")
      .eq("backroom_id", backroomId)
      .order("created_at", { ascending: true })

    if (error) throw new ApiError(500, "No se pudieron cargar las salas.")

    const roomsWithPermissions = [];
    for (const room of data ?? []) {
      const canView = await checkRoomPermission(user.id, room.id, "salas.ver");
      if (!canView) continue;

      const canAccess = await checkRoomPermission(user.id, room.id, "salas.acceder");
      const canCreateSubrooms = await checkRoomPermission(user.id, room.id, "salas.crear");

      roomsWithPermissions.push({
        ...room,
        can_access: canAccess,
        can_create_subrooms: canCreateSubrooms
      });
    }

    return NextResponse.json(roomsWithPermissions)
  } catch (error) {
    return handleApiError(error)
  }
}

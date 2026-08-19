import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkRoomPermission } from "@/lib/auth/rbac";
import { z } from "zod";

const updateRoomSchema = z.object({
  nombre: z.string().min(1).max(200).optional(),
  descripcion: z.string().max(2000).optional().nullable(),
});

// GET /api/rooms/[roomId] — BE-34
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("salas")
      .select("*")
      .eq("id", roomId)
      .maybeSingle();

    if (error || !data) throw new ApiError(404, "Sala no encontrada.");
    return NextResponse.json({ data: { room: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/rooms/[roomId] — BE-35
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;

    const hasAccess = await checkRoomPermission(user.id, roomId, "salas.editar");
    if (!hasAccess) throw new ApiError(403, "No tienes permiso para editar esta sala.");

    const body = await request.json();
    const input = updateRoomSchema.parse(body);
    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("salas")
      .update(input)
      .eq("id", roomId)
      .select()
      .single();

    if (error || !data) throw new ApiError(404, "Sala no encontrada.");
    return NextResponse.json({ data: { room: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/rooms/[roomId] — BE-36
// Elimina la sala. La cascada de hijas se activa cuando exista parent_id.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;

    const hasAccess = await checkRoomPermission(user.id, roomId, "salas.eliminar");
    if (!hasAccess) throw new ApiError(403, "No tienes permiso para eliminar esta sala.");

    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase.from("salas").delete().eq("id", roomId);
    if (error) throw new ApiError(500, "No se pudo eliminar la sala.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

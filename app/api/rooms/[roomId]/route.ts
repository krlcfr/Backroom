import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
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
    await requireAuth();
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
    await requireAuth();
    const { roomId } = await params;
    const body = await request.json();
    const input = updateRoomSchema.parse(body);
    const supabase = await createClient();

    const { data, error } = await supabase
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
    await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("salas").delete().eq("id", roomId);
    if (error) throw new ApiError(500, "No se pudo eliminar la sala.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const moveRoomSchema = z.object({
  new_parent_id: z.string().uuid().nullable(),
});

// POST /api/rooms/[roomId]/move — BE-39
// Mueve una sala con su subárbol a un nuevo padre.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;
    const body = await request.json();
    const input = moveRoomSchema.parse(body);

    // TODO: implementar cuando tabla `rooms` exista en Supabase
    // Hay que validar que new_parent_id no sea descendiente de roomId (ciclos)
    /*
    const supabase = await createClient();
    const { error } = await supabase
      .from("rooms")
      .update({ parent_id: input.new_parent_id })
      .eq("id", roomId);
    if (error) throw new ApiError(500, "No se pudo mover la sala.");
    return NextResponse.json({ data: { success: true } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `rooms` en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

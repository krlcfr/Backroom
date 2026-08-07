import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
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
    const supabase = await createClient();

    // Verificar que new_parent_id no sea descendiente de roomId (evitar ciclos)
    if (input.new_parent_id) {
      const { data: allSalas } = await supabase
        .from("salas")
        .select("id, parent_id");

      const descendants = new Set<string>();
      function collectDescendants(id: string) {
        (allSalas ?? [])
          .filter((s) => s.parent_id === id)
          .forEach((s) => {
            descendants.add(s.id);
            collectDescendants(s.id);
          });
      }
      collectDescendants(roomId);

      if (descendants.has(input.new_parent_id)) {
        throw new ApiError(400, "No se puede mover una sala a uno de sus propios descendientes.");
      }

      // Calcular nueva profundidad del padre
      const { data: newParent } = await supabase
        .from("salas")
        .select("depth")
        .eq("id", input.new_parent_id)
        .single();

      if (!newParent) throw new ApiError(404, "Sala destino no encontrada.");
    }

    const { error } = await supabase
      .from("salas")
      .update({ parent_id: input.new_parent_id })
      .eq("id", roomId);

    if (error) throw new ApiError(500, "No se pudo mover la sala.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

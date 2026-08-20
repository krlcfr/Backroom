import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkRoomPermission } from "@/lib/auth/rbac";
import { z } from "zod";

const moveRoomSchema = z.object({
  new_parent_id: z.string().uuid().nullable(),
});

// Límite de profundidad en la versión actual (MVP)
const MAX_DEPTH = 3;

// POST /api/rooms/[roomId]/move — BE-39
// Mueve una sala con su subárbol a un nuevo padre y recalcula profundidades.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;

    const body = await request.json();
    const input = moveRoomSchema.parse(body);
    const supabase = await createClient();

    // Permisos: necesita 'salas.editar' en la sala que se mueve
    const canEdit = await checkRoomPermission(user.id, roomId, "salas.editar");
    if (!canEdit) throw new ApiError(403, "No tienes permiso para editar (mover) esta sala.");

    if (input.new_parent_id) {
      // Necesita 'salas.crear' en el nuevo padre
      const canCreateInParent = await checkRoomPermission(user.id, input.new_parent_id, "salas.crear");
      if (!canCreateInParent) throw new ApiError(403, "No tienes permiso para mover salas a ese destino.");
    }

    const { data: currentRoom } = await supabase
      .from("salas")
      .select("id, depth, backroom_id, parent_id")
      .eq("id", roomId)
      .single();

    if (!currentRoom) throw new ApiError(404, "Sala no encontrada.");

    // Evitar mover al mismo padre
    if (currentRoom.parent_id === input.new_parent_id) {
      return NextResponse.json({ data: { success: true } }, { status: 200 });
    }

    // Traer todas las salas del mismo backroom para validaciones de ciclo y profundidad
    const { data: allSalas } = await supabase
      .from("salas")
      .select("id, parent_id, depth")
      .eq("backroom_id", currentRoom.backroom_id);

    const salas = allSalas ?? [];

    const descendants = new Set<string>();
    let maxDescendantDepth = currentRoom.depth;

    function collectDescendants(id: string) {
      salas
        .filter((s) => s.parent_id === id)
        .forEach((s) => {
          descendants.add(s.id);
          if (s.depth > maxDescendantDepth) maxDescendantDepth = s.depth;
          collectDescendants(s.id);
        });
    }
    collectDescendants(roomId);

    if (input.new_parent_id && descendants.has(input.new_parent_id)) {
      throw new ApiError(400, "No se puede mover una sala a uno de sus propios descendientes.");
    }

    let newParentDepth = -1; // -1 significa nivel raíz
    if (input.new_parent_id) {
      const newParent = salas.find((s) => s.id === input.new_parent_id);
      if (!newParent) throw new ApiError(404, "Sala destino no encontrada.");
      newParentDepth = newParent.depth;
    }

    const newRoomDepth = newParentDepth + 1;
    const depthOffset = newRoomDepth - currentRoom.depth;
    
    if (maxDescendantDepth + depthOffset > MAX_DEPTH) {
      throw new ApiError(400, `No se puede mover aquí. La profundidad del subárbol excedería el límite de ${MAX_DEPTH}.`);
    }

    // Usamos el cliente admin para bypass de RLS y actualizar todo en lote
    const adminSupabase = createAdminClient();

    // Actualizar el padre de la sala movida
    const { error: moveError } = await adminSupabase
      .from("salas")
      .update({ parent_id: input.new_parent_id, depth: newRoomDepth })
      .eq("id", roomId);

    if (moveError) throw new ApiError(500, "Error al mover la sala principal.");

    // Actualizar la profundidad de los descendientes si es necesario
    if (depthOffset !== 0 && descendants.size > 0) {
      // Supabase no soporta un update bulk dinámico tan fácilmente, pero podemos iterar
      // o hacer las peticiones concurrentemente
      const updatePromises = Array.from(descendants).map(descId => {
        const descNode = salas.find(s => s.id === descId);
        if (descNode) {
          return adminSupabase
            .from("salas")
            .update({ depth: descNode.depth + depthOffset })
            .eq("id", descId);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

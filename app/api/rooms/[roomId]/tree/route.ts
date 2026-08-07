import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

// GET /api/rooms/[roomId]/tree — BE-38
// Devuelve el árbol completo de salas desde este nodo usando CTE recursiva.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;

    // TODO: implementar CTE recursiva cuando tabla `rooms` exista en Supabase
    // Ejemplo de query CTE:
    /*
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_room_tree", { root_room_id: roomId });
    if (error) throw new ApiError(500, "No se pudo obtener el árbol de salas.");
    return NextResponse.json({ data: { room: data } }, { status: 200 });
    */

    // Alternativa sin RPC — construcción en memoria:
    /*
    const { data: allRooms } = await supabase
      .from("rooms")
      .select("id, name, description, depth, parent_id")
      .eq("backroom_id", <backroomId>); // necesita backroom_id

    function buildTree(nodes, parentId) {
      return nodes
        .filter(n => n.parent_id === parentId)
        .map(n => ({ ...n, children: buildTree(nodes, n.id) }));
    }
    return NextResponse.json({ data: { room: buildTree(allRooms, roomId) } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `rooms` y función RPC en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

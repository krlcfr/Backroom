import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/rooms/[roomId]/tree — BE-38
// Árbol recursivo de salas. Requiere columna parent_id en tabla salas.
// TODO: activar tras migración:
//   ALTER TABLE salas ADD COLUMN parent_id uuid REFERENCES salas(id) ON DELETE CASCADE;
//   ALTER TABLE salas ADD COLUMN depth integer NOT NULL DEFAULT 0;
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();

    // Alternativa sin RPC — construcción del árbol en memoria tras migración
    /*
    const { data: sala } = await supabase
      .from("salas").select("backroom_id").eq("id", roomId).single();
    if (!sala) throw new ApiError(404, "Sala no encontrada.");

    const { data: allRooms, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, parent_id")
      .eq("backroom_id", sala.backroom_id);

    if (error) throw new ApiError(500, "No se pudo obtener el árbol.");

    function buildTree(nodes: any[], parentId: string | null): any[] {
      return nodes
        .filter(n => n.parent_id === parentId)
        .map(n => ({ ...n, children: buildTree(nodes, n.id) }));
    }

    const tree = buildTree(allRooms, roomId);
    return NextResponse.json({ data: { room: tree } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Pendiente migración: columnas `parent_id` y `depth` en tabla `salas`.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

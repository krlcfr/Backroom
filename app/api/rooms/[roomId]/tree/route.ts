import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/rooms/[roomId]/tree — BE-38
// Devuelve el árbol completo de salas desde este nodo.
// Construye el árbol en memoria usando todas las salas del mismo backroom.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();

    // Obtener el backroom_id de la sala raíz
    const { data: rootSala } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (!rootSala) throw new ApiError(404, "Sala no encontrada.");

    // Traer todas las salas del mismo backroom
    const { data: allSalas, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, parent_id, created_at")
      .eq("backroom_id", rootSala.backroom_id);

    if (error) throw new ApiError(500, "No se pudo obtener el árbol de salas.");

    // Construir árbol en memoria
    function buildTree(nodes: any[], parentId: string | null): any[] {
      return nodes
        .filter((n) => n.parent_id === parentId)
        .map((n) => ({ ...n, children: buildTree(nodes, n.id) }));
    }

    const tree = buildTree(allSalas ?? [], roomId);

    return NextResponse.json({ data: { room: tree } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

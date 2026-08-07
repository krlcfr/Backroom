import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

// GET /api/rooms/[roomId]/children — BE-37
// Devuelve las salas hijas directas de una sala.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;

    // TODO: implementar cuando tabla `rooms` exista en Supabase
    /*
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, description, depth, created_at")
      .eq("parent_id", roomId)
      .order("created_at", { ascending: true });
    if (error) throw new ApiError(500, "No se pudieron obtener las salas hijas.");
    return NextResponse.json({ data: { children: data } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `rooms` en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

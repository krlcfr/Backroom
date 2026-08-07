import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/rooms/[roomId]/children — BE-37
// Devuelve las salas hijas directas.
// TODO: activar filtro por parent_id tras migración de columna en `salas`
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();

    // TODO: descomentar tras migración ALTER TABLE salas ADD COLUMN parent_id
    /*
    const { data, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, created_at")
      .eq("parent_id", roomId)
      .order("created_at", { ascending: true });
    if (error) throw new ApiError(500, "No se pudieron obtener las salas hijas.");
    return NextResponse.json({ data: { children: data } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Pendiente migración: columna `parent_id` en tabla `salas`.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

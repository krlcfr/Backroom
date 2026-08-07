import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const PERMISSION_CODES = [
  "salas.ver",
  "salas.acceder",
  "salas.crear",
  "salas.editar",
  "salas.eliminar",
  "archivos.subir",
  "archivos.editar",
  "archivos.eliminar",
] as const;

const updatePermissionsSchema = z.object({
  inherit_permissions: z.boolean().optional(),
  assignments: z.array(
    z.object({
      user_id: z.string().uuid(),
      permission_code: z.enum(PERMISSION_CODES),
      granted: z.boolean(),
    })
  ),
});

// GET /api/rooms/[roomId]/permissions — BE-45
// Devuelve la matriz de permisos de la sala (miembros × 8 códigos).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;

    // TODO: implementar cuando tabla `room_permissions` exista en Supabase
    /*
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("room_permissions")
      .select("user_id, permission_code, granted, usuarios(username)")
      .eq("room_id", roomId);
    if (error) throw new ApiError(500, "No se pudieron obtener los permisos.");
    return NextResponse.json({ data: { room_id: roomId, permissions: data } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `room_permissions` en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/rooms/[roomId]/permissions — BE-46
// Actualiza permisos en batch para una sala.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await requireAuth();
    const { roomId } = await params;
    const body = await request.json();
    const input = updatePermissionsSchema.parse(body);

    // TODO: implementar cuando tabla `room_permissions` exista en Supabase
    /*
    const supabase = await createClient();
    const upserts = input.assignments.map(a => ({
      room_id: roomId,
      user_id: a.user_id,
      permission_code: a.permission_code,
      granted: a.granted,
    }));
    const { error } = await supabase.from("room_permissions").upsert(upserts);
    if (error) throw new ApiError(500, "No se pudieron actualizar los permisos.");
    return NextResponse.json({ data: { room_id: roomId, updated: input.assignments.length } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `room_permissions` en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

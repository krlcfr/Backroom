import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission } from "@/lib/auth/rbac";
import { z } from "zod";

const createRoomSchema = z.object({
  backroom_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

// POST /api/rooms — BE-33
// Crea una sala dentro de un backroom, opcionalmente con un padre (parent_id).
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createRoomSchema.parse(body);

    // Verificar que el usuario tenga permiso de contribuir al backroom
    const hasAccess = await checkPermission(user.id, input.backroom_id, "contribuir");
    if (!hasAccess) throw new ApiError(403, "Se requiere permiso 'contribuir' para crear salas.");

    const supabase = await createClient();

    // Calcular profundidad
    // TODO: descomentar cuando la tabla `rooms` exista en Supabase
    /*
    let depth = 0;
    if (input.parent_id) {
      const { data: parent } = await supabase
        .from("rooms")
        .select("depth")
        .eq("id", input.parent_id)
        .single();
      if (!parent) throw new ApiError(404, "Sala padre no encontrada.");
      depth = parent.depth + 1;
    }

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        backroom_id: input.backroom_id,
        parent_id: input.parent_id ?? null,
        name: input.name,
        description: input.description ?? null,
        depth,
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo crear la sala.");

    return NextResponse.json({ data: { room: data } }, { status: 201 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `rooms` en Supabase." } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

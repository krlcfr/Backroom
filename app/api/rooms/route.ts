import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission } from "@/lib/auth/rbac";
import { z } from "zod";

const createRoomSchema = z.object({
  backroom_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(1).max(200),
  descripcion: z.string().max(2000).optional(),
});

// POST /api/rooms — BE-33
// Crea una sala dentro de un backroom.
// Nota: la tabla `salas` aún NO tiene columnas `parent_id` ni `depth`.
// TODO: ejecutar en Supabase SQL Editor:
//   ALTER TABLE salas ADD COLUMN parent_id uuid REFERENCES salas(id) ON DELETE CASCADE;
//   ALTER TABLE salas ADD COLUMN depth integer NOT NULL DEFAULT 0;
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createRoomSchema.parse(body);

    const hasAccess = await checkPermission(user.id, input.backroom_id, "contribuir");
    if (!hasAccess) throw new ApiError(403, "Se requiere permiso 'contribuir' para crear salas.");

    const supabase = await createClient();

    // Calcular profundidad (activo cuando existan parent_id y depth en la tabla)
    let depth = 0;
    if (input.parent_id) {
      // TODO: descomentar tras migración de columnas
      /*
      const { data: parent } = await supabase
        .from("salas").select("depth").eq("id", input.parent_id).single();
      if (!parent) throw new ApiError(404, "Sala padre no encontrada.");
      depth = parent.depth + 1;
      */
    }

    const { data, error } = await supabase
      .from("salas")
      .insert({
        backroom_id: input.backroom_id,
        nombre: input.nombre,
        descripcion: input.descripcion ?? null,
        // parent_id: input.parent_id ?? null, // TODO: activar tras migración
        // depth,                              // TODO: activar tras migración
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo crear la sala.");

    return NextResponse.json({ data: { room: data } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission, checkRoomPermission } from "@/lib/auth/rbac";
import { z } from "zod";

const createRoomSchema = z.object({
  backroom_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  nombre: z.string().min(1).max(200),
  descripcion: z.string().max(2000).optional(),
  icono: z.string().optional(),
});

// POST /api/rooms — BE-33
// Crea una sala dentro de un backroom, opcionalmente con padre (árbol recursivo).
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createRoomSchema.parse(body);

    if (input.parent_id) {
      const hasRoomAccess = await checkRoomPermission(user.id, input.parent_id, "salas.crear");
      if (!hasRoomAccess) throw new ApiError(403, "No tienes permiso para crear sub-salas aquí.");
    } else {
      const hasAccess = await checkPermission(user.id, input.backroom_id, "contribuir");
      if (!hasAccess) throw new ApiError(403, "Se requiere permiso 'contribuir' para crear salas principales.");
    }

    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Calcular profundidad según el padre
    let depth = 0;
    if (input.parent_id) {
      const { data: parent } = await supabase
        .from("salas")
        .select("depth")
        .eq("id", input.parent_id)
        .single();
      if (!parent) throw new ApiError(404, "Sala padre no encontrada.");
      depth = (parent.depth ?? 0) + 1;
    }

    // Chequeo de límites del plan
    const { data: backroomData } = await adminSupabase.from("backrooms").select("propietario_id").eq("id", input.backroom_id).single();
    if (backroomData && backroomData.propietario_id) {
      const { data: orgData } = await adminSupabase.from("organizations").select("id").eq("owner_id", backroomData.propietario_id).single();
      if (orgData) {
        const { getOrganizationPlan, PLAN_LIMITS } = await import("@/lib/limits");
        const plan = await getOrganizationPlan(orgData.id);
        const limits = PLAN_LIMITS[plan];
        if (depth > limits.max_depth) {
          throw new ApiError(422, `Límite de profundidad alcanzado para el plan ${plan.toUpperCase()} (máximo ${limits.max_depth} niveles)`);
        }
      }
    }

    const { data, error } = await adminSupabase
      .from("salas")
      .insert({
        backroom_id: input.backroom_id,
        nombre: input.nombre,
        descripcion: input.descripcion ?? null,
        parent_id: input.parent_id ?? null,
        depth,
        icono: input.icono ?? "grid_view",
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo crear la sala.");

    return NextResponse.json({ data: { room: data } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

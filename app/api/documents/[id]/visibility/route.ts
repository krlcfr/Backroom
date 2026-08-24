import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getUsuarioInterno } from "@/lib/auth/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: recursoId } = await params;
    const body = await request.json();
    const { visibility_mode } = body;

    if (!visibility_mode || !["sala_completa", "solo_firmantes"].includes(visibility_mode)) {
      throw new ApiError(400, "Modo de visibilidad inválido");
    }

    const supabaseAdmin = createAdminClient();

    // 1. Obtener recurso para verificar si es el dueño
    const { data: recurso, error: recError } = await supabaseAdmin
      .from("recursos")
      .select("salas(backrooms(propietario_id))")
      .eq("id", recursoId)
      .single();

    if (recError || !recurso) throw new ApiError(404, "Recurso no encontrado");

    const perfilId = (await getUsuarioInterno(user.id))?.id;
    const propietarioId = recurso.salas?.backrooms?.propietario_id;

    if (propietarioId !== perfilId) {
      throw new ApiError(403, "Solo el dueño del Backroom puede cambiar la visibilidad del documento");
    }

    // 2. Actualizar recurso
    const { error: updateError } = await supabaseAdmin
      .from("recursos")
      .update({ visibility_mode })
      .eq("id", recursoId);

    if (updateError) throw new ApiError(500, "Error al actualizar la visibilidad");

    return NextResponse.json({ success: true, visibility_mode });
  } catch (error) {
    return handleApiError(error);
  }
}

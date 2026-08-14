import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getUsuarioInterno } from "@/lib/auth/rbac";

// POST /api/invitations/[token]/accept — BE-51
// Acepta una invitación y asocia al usuario autenticado al backroom.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await requireAuth();
    const { token } = await params;
    const supabase = await createClient();

    const { data: invitacion, error: invError } = await supabase
      .from("invitaciones")
      .select("id, backroom_id, activa, expira_en")
      .eq("link_token", token)
      .maybeSingle();

    if (invError || !invitacion) throw new ApiError(404, "Invitación no encontrada.");
    if (!invitacion.activa) throw new ApiError(404, "Invitación revocada.");
    if (invitacion.expira_en && new Date(invitacion.expira_en) < new Date()) {
      throw new ApiError(404, "Invitación expirada.");
    }

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    // Insertar en backroom_miembros
    const { error: memberError } = await supabase.from("backroom_miembros").insert({
      backroom_id: invitacion.backroom_id,
      usuario_id: usuario.id,
      permiso: "solo_visualizar",
      asignado_por: usuario.id,
    });

    if (memberError) throw new ApiError(409, "Ya eres miembro de este BackRoom.");

    // Marcar invitación como usada
    await supabase
      .from("invitaciones")
      .update({ activa: false })
      .eq("id", invitacion.id);

    return NextResponse.json(
      { data: { success: true, backroom_id: invitacion.backroom_id } },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

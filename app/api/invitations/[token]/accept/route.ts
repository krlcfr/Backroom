import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

// POST /api/invitations/[token]/accept — BE-51
// Acepta una invitación y asocia al usuario autenticado al backroom.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await requireAuth();
    const { token } = await params;

    // TODO: descomentar cuando la tabla `invitations` exista en Supabase
    /*
    const supabase = await createClient();

    const { data: invitation, error: invError } = await supabase
      .from("invitations")
      .select("id, backroom_id, email, active, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (invError || !invitation) throw new ApiError(404, "Invitación no encontrada.");
    if (!invitation.active) throw new ApiError(404, "Invitación revocada.");
    if (new Date(invitation.expires_at) < new Date()) throw new ApiError(404, "Invitación expirada.");

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    // Insertar en backroom_miembros
    const { error: memberError } = await supabase.from("backroom_miembros").insert({
      backroom_id: invitation.backroom_id,
      usuario_id: usuario.id,
      permiso: "solo_visualizar",
      asignado_por: usuario.id,
    });

    if (memberError) throw new ApiError(409, "Ya eres miembro de este BackRoom.");

    // Marcar invitación como usada
    await supabase.from("invitations").update({ active: false }).eq("id", invitation.id);

    return NextResponse.json({ data: { success: true, backroom_id: invitation.backroom_id } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `invitations` en Supabase.", token } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

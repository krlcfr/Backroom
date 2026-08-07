import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner } from "@/lib/auth/rbac";

// DELETE /api/invitations/[token]/revoke — BE-52
// Revoca una invitación pendiente. Solo el propietario del backroom puede hacerlo.
export async function DELETE(
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
      .select("id, backroom_id, active")
      .eq("token", token)
      .maybeSingle();

    if (invError || !invitation) throw new ApiError(404, "Invitación no encontrada.");
    if (!invitation.active) throw new ApiError(409, "La invitación ya fue revocada o usada.");

    const owner = await isOwner(user.id, invitation.backroom_id);
    if (!owner) throw new ApiError(403, "Solo el propietario puede revocar invitaciones.");

    const { error } = await supabase
      .from("invitations")
      .update({ active: false })
      .eq("id", invitation.id);

    if (error) throw new ApiError(500, "No se pudo revocar la invitación.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `invitations` en Supabase.", token } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

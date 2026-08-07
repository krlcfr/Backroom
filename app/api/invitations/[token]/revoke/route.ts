import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();

    const { data: invitacion, error: invError } = await supabase
      .from("invitaciones")
      .select("id, backroom_id, activa")
      .eq("link_token", token)
      .maybeSingle();

    if (invError || !invitacion) throw new ApiError(404, "Invitación no encontrada.");
    if (!invitacion.activa) throw new ApiError(409, "La invitación ya fue revocada o usada.");

    const owner = await isOwner(user.id, invitacion.backroom_id);
    if (!owner) throw new ApiError(403, "Solo el propietario puede revocar invitaciones.");

    const { error } = await supabase
      .from("invitaciones")
      .update({ activa: false })
      .eq("id", invitacion.id);

    if (error) throw new ApiError(500, "No se pudo revocar la invitación.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

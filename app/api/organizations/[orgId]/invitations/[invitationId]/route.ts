import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { InvitationsService } from "@/lib/services/invitations.service";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; invitationId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId, invitationId } = await params;

    await InvitationsService.revokeInvitation(user.id, orgId, invitationId);

    return NextResponse.json({ message: "Invitación revocada con éxito" });
  } catch (error) {
    return handleApiError(error);
  }
}

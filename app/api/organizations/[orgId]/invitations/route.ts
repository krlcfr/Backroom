import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { InvitationsService, createInvitationSchema } from "@/lib/services/invitations.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;
    
    const body = await request.json();
    const input = createInvitationSchema.parse(body);

    const invitation = await InvitationsService.createInvitation(user.id, orgId, input);

    // Auditoría
    const { AuditService } = await import("@/lib/services/audit.service");
    await AuditService.logAction({
      orgId: orgId,
      actorId: user.id,
      action: "MEMBER_INVITED",
      targetType: "member",
      targetId: invitation.id,
      details: { email: input.email, role: input.role }
    });

    return NextResponse.json({ data: { invitation } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    
    const { orgId } = await params;
    
    const invitations = await InvitationsService.listPendingInvitations(user.id, orgId);

    return NextResponse.json({ data: invitations });
  } catch (error) {
    return handleApiError(error);
  }
}

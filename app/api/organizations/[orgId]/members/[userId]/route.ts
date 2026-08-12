import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { updateMemberRoleSchema } from "@/lib/validations/schemas";
import { OrganizationsService } from "@/lib/services/organizations.service";

// PATCH /api/organizations/[orgId]/members/[userId] — BE-19a
// Cambia el rol Miembro↔Admin (roles fijos R-09). Solo Propietario.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId, userId } = await params;

    const input = updateMemberRoleSchema.parse(await request.json());

    const member = await OrganizationsService.updateRole(user.id, orgId, userId, input);

    return NextResponse.json({ data: { member } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/organizations/[orgId]/members/[userId] — BE-19b
// Remueve un miembro de la organización. Solo Propietario.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId, userId } = await params;

    await OrganizationsService.removeMember(user.id, orgId, userId);

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

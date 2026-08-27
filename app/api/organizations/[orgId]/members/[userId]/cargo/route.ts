import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { updateMemberCargoSchema } from "@/lib/validations/schemas";
import { OrganizationsService } from "@/lib/services/organizations.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId, userId } = await params;

    const input = updateMemberCargoSchema.parse(await request.json());

    const member = await OrganizationsService.updateMemberCargo(user.id, orgId, userId, input.cargo_id);

    return NextResponse.json({ data: { member } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

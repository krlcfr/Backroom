import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { OrganizationsService } from "@/lib/services/organizations.service";

// GET /api/organizations/[orgId]/members — BE-19
// Lista los miembros de la organización. Requiere ser miembro activo.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    const organization = await OrganizationsService.getById(user.id, orgId);
    if (!organization) {
      throw new ApiError(404, "Organización no encontrada");
    }

    const members = await OrganizationsService.listMembers(orgId);

    return NextResponse.json({ data: { members } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

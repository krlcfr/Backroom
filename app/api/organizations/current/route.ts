import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const org = await OrganizationsService.getOrgForUser(user.id);

    if (!org) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    return NextResponse.json({ orgId: org.id }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

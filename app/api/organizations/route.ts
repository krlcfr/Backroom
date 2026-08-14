import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createOrganizationSchema } from "@/lib/validations/schemas";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "");
    const description = String(formData.get("description") ?? "") || null;
    const logoEntry = formData.get("logo");

    const input = createOrganizationSchema.parse({ name, description });
    const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;

    const organization = await OrganizationsService.create(user.id, input, logoFile);

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

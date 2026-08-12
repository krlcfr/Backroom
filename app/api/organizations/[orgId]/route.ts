import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { updateOrganizationSchema } from "@/lib/validations/schemas";
import { OrganizationsService } from "@/lib/services/organizations.service";

// GET /api/organizations/[orgId] — BE-16
// Obtiene el perfil de la organización. Requiere ser miembro activo.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    const organization = await OrganizationsService.getById(user.id, orgId);

    return NextResponse.json({ data: { organization } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/organizations/[orgId] — BE-17
// Edita nombre, descripción y logo. Solo Propietario.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    const contentType = request.headers.get("content-type") ?? "";

    let input;
    let logoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      input = updateOrganizationSchema.parse({
        name: String(formData.get("name") ?? undefined) || undefined,
        description: formData.has("description")
          ? String(formData.get("description"))
          : undefined,
      });
      const logoEntry = formData.get("logo");
      logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;
    } else {
      input = updateOrganizationSchema.parse(await request.json());
    }

    const organization = await OrganizationsService.update(user.id, orgId, input, logoFile);

    return NextResponse.json({ data: { organization } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/organizations/[orgId] — BE-18
// Elimina la org con cascada (BackRooms del Propietario, miembros). Solo Propietario.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const user = await requireAuth();
    const { orgId } = await params;

    await OrganizationsService.remove(user.id, orgId);

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

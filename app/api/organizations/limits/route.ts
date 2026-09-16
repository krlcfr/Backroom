import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getLimitsForOrg, getOrganizationPlan, getOrganizationUsageMetrics } from "@/lib/limits";
import { OrganizationsService } from "@/lib/services/organizations.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const org = await OrganizationsService.getOrgForUser(user.id);
    
    if (!org) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "No se encontró una organización" } },
        { status: 404 }
      );
    }

    const plan = await getOrganizationPlan(org.id);
    const limits = await getLimitsForOrg(org.id);
    
    const current_usage = await getOrganizationUsageMetrics(org.id, org.ownerId);

    const data = {
      plan,
      limits,
      current_usage,
      storage_percentage: Math.round((current_usage.storage_bytes / limits.storage_bytes) * 100),
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Inicia sesión para ver los límites." } },
      { status: 401 }
    );
  }
}

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getLimitsForOrg, getOrganizationPlan } from "@/lib/limits";
import { OrganizationsService } from "@/lib/services/organizations.service";
import { createAdminClient } from "@/lib/supabase/admin";

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
    
    const adminSupabase = createAdminClient();
    
    // 1. Members count
    const { count: membersCount } = await adminSupabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .eq("status", "active");
      
    // 2. Storage bytes (approx for MVP: getting recent resources from org's backrooms)
    // First get backroom IDs for this org (which is mapped through owner_id here for now)
    const { data: backrooms } = await adminSupabase
      .from("backrooms")
      .select("id")
      .eq("propietario_id", org.ownerId);
      
    let totalBytes = 0;
    let maxDepth = 0;
    let totalResources = 0;
    
    if (backrooms && backrooms.length > 0) {
      const backroomIds = backrooms.map(b => b.id);
      
      const { data: salas } = await adminSupabase
        .from("salas")
        .select("id, depth")
        .in("backroom_id", backroomIds);
        
      if (salas && salas.length > 0) {
        maxDepth = Math.max(...salas.map(s => s.depth));
        const salaIds = salas.map(s => s.id);
        
        const { data: recursos } = await adminSupabase
          .from("recursos")
          .select("tamano_bytes")
          .in("sala_id", salaIds);
          
        if (recursos) {
          totalResources = recursos.length;
          totalBytes = recursos.reduce((acc, curr) => acc + (curr.tamano_bytes || 0), 0);
        }
      }
    }

    const current_usage = {
      storage_bytes: totalBytes,
      members: (membersCount || 0) + 1, // +1 for owner
      max_depth: maxDepth,
      resources: totalResources,
    };

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

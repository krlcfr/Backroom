// lib/limits.ts
import { createAdminClient } from "@/lib/supabase/admin";

export const PLAN_LIMITS = {
  free: {
    storage_bytes: 100 * 1024 * 1024, // 100 MB
    max_members: 4,
    max_depth: 2, // 3 niveles
    max_resources_per_room: 10,
    allowed_types: ["docx", "pptx", "mp3", "mp4", "enlace"] as const,
    max_file_bytes: 50 * 1024 * 1024,
  },
  pro: {
    storage_bytes: 10 * 1024 * 1024 * 1024, // 10 GB
    max_members: 50,
    max_depth: 5, // 6 niveles
    max_resources_per_room: 100,
    allowed_types: ["docx", "pptx", "mp3", "mp4", "enlace", "pdf", "image"] as const, // + pdf & imágenes
    max_file_bytes: 500 * 1024 * 1024,
  },
  enterprise: {
    storage_bytes: 500 * 1024 * 1024 * 1024, // 500 GB
    max_members: 1000,
    max_depth: 10, // 11 niveles
    max_resources_per_room: 999999, // Prácticamente ilimitado
    allowed_types: ["docx", "pptx", "mp3", "mp4", "enlace", "pdf", "image", "zip", "rar"] as const, // + archivos comprimidos
    max_file_bytes: 5 * 1024 * 1024 * 1024, // 5 GB
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
export type LimitKey = keyof typeof PLAN_LIMITS.free;

/**
 * Obtiene el plan de una organización desde la BD.
 */
export async function getOrganizationPlan(orgId: string): Promise<PlanType> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .single();
    
  return (data?.plan as PlanType) || "free";
}

/**
 * Verifica si se supera un límite numérico del plan asociado a la organización.
 * @returns true si el valor actual supera (o iguala) el límite.
 */
export async function exceedsLimit(orgId: string, limitKey: LimitKey, current: number): Promise<boolean> {
  const plan = await getOrganizationPlan(orgId);
  const limitValue = PLAN_LIMITS[plan][limitKey];
  
  // Para arrays (allowed_types) esto no aplica directamente, pero para números sí:
  if (typeof limitValue === "number") {
    return current >= limitValue;
  }
  
  return false;
}

/**
 * Retorna los límites de una org específica (útil para pasar al frontend)
 */
export async function getLimitsForOrg(orgId: string) {
  const plan = await getOrganizationPlan(orgId);
  return PLAN_LIMITS[plan];
}
export async function getOrganizationUsageMetrics(orgId: string, ownerId: string) {
  const adminSupabase = createAdminClient();
  
  // 1. Members count
  const { count: membersCount } = await adminSupabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("status", "active");
    
  // 2. Storage bytes (approx for MVP: getting recent resources from org's backrooms)
  const { data: backrooms } = await adminSupabase
    .from("backrooms")
    .select("id")
    .eq("propietario_id", ownerId);
    
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

  return {
    storage_bytes: totalBytes,
    members: (membersCount || 0) + 1, // +1 for owner
    max_depth: maxDepth,
    resources: totalResources,
  };
}

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

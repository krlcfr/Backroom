import { createClient } from "@/lib/supabase/server";

export interface AuditLogOptions {
  backroomId: string;
  actorId: string;
  action: string;
  targetType: "sala" | "archivo" | "miembro" | "backroom" | "rol" | "permiso" | "invitacion";
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(options: AuditLogOptions) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      backroom_id: options.backroomId,
      actor_id: options.actorId,
      action: options.action,
      target_type: options.targetType,
      target_id: options.targetId ?? null,
      details: options.details ?? null,
      ip_address: options.ipAddress ?? null,
    });

    if (error) {
      console.error("[Audit Error]", error);
      // We don't throw error to prevent blocking the main action if audit logging fails
    }
  } catch (err) {
    console.error("[Audit Error] Exception:", err);
  }
}

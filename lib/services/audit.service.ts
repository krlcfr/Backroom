import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";

export type AuditAction = 
  | "MEMBER_INVITED" 
  | "MEMBER_JOINED" 
  | "MEMBER_REMOVED" 
  | "ROLE_CHANGED"
  | "ROOM_CREATED" 
  | "ROOM_DELETED" 
  | "ROOM_PERMISSIONS_UPDATED"
  | "RESOURCE_UPLOADED" 
  | "RESOURCE_DELETED" 
  | "RESOURCE_DOWNLOADED"
  | "ORG_SETTINGS_UPDATED"
  | "BILLING_PLAN_CHANGED"
  | "DOCUMENT_SENT_FOR_SIGNATURE"
  | "DOCUMENT_SIGNED"
  | "DOCUMENT_SEALED";

export type TargetType = "member" | "room" | "resource" | "organization" | "billing" | "document_signature";

export class AuditService {
  /**
   * Registra una nueva acción en el log de auditoría de la organización.
   * Utiliza el cliente administrador para evitar problemas de RLS si la inserción se
   * realiza desde un contexto de sistema, pero asocia el actor correcto.
   */
  static async logAction(params: {
    orgId: string;
    actorId: string;
    action: AuditAction;
    targetType: TargetType;
    targetId?: string;
    details?: any;
    ipAddress?: string;
  }) {
    try {
      const adminSupabase = createAdminClient();
      
      const { error } = await adminSupabase.from("audit_logs").insert({
        organization_id: params.orgId,
        actor_id: params.actorId,
        action: params.action,
        target_type: params.targetType,
        target_id: params.targetId,
        details: params.details,
        ip_address: params.ipAddress,
      });

      if (error) {
        console.error("[AuditService] Error logging action:", error);
      }
    } catch (err) {
      console.error("[AuditService] Unexpected error logging action:", err);
    }
  }

  /**
   * Lista los registros de auditoría de una organización.
   * Valida que el usuario que lo solicita tenga permisos (Admin o Propietario).
   */
  static async listLogs(authId: string, orgId: string, limit = 50, offset = 0) {
    const supabase = await createClient();
    const perfil = await getUsuarioInterno(authId);

    if (!perfil) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    // El RLS ya protege la lectura (solo administradores y propietarios ven los logs de su org)
    // Sin embargo, para extraer detalles (como nombres de usuarios), podemos traer los datos relacionales.
    const { data, error, count } = await supabase
      .from("audit_logs")
      .select("*, actor:usuarios!actor_id(username, nombre_completo, correo)", { count: 'exact' })
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[AuditService] listLogs Error:", error);
      throw new ApiError(500, "Error obteniendo logs de auditoría");
    }

    return {
      data,
      count
    };
  }
}

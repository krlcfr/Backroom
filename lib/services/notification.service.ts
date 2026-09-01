import { createAdminClient } from "@/lib/supabase/server";

export type NotificationType = 'INVITATION' | 'WORKFLOW_ACTION_REQUIRED' | 'WORKFLOW_STATUS_UPDATE' | 'SYSTEM_ALERT';

export interface CreateNotificationParams {
  userId: string;
  organizationId?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  actionData?: any;
}

export class NotificationService {
  /**
   * Envía una notificación a un usuario específico.
   * Utiliza el cliente administrador para evitar problemas de RLS.
   */
  static async send(params: CreateNotificationParams) {
    try {
      const adminSupabase = createAdminClient();
      
      const { error } = await adminSupabase.from("notifications").insert({
        user_id: params.userId,
        organization_id: params.organizationId || null,
        type: params.type,
        title: params.title,
        message: params.message,
        action_url: params.actionUrl || null,
        action_data: params.actionData || null,
      });

      if (error) {
        console.error("[NotificationService] Error sending notification:", error);
      }
    } catch (err) {
      console.error("[NotificationService] Unexpected error:", err);
    }
  }

  /**
   * Envía notificaciones a los responsables del siguiente paso del flujo.
   */
  static async notifyNextStep(workflowId: string, nextNodes: any[]) {
    // Aquí obtenemos más información del flujo para armar un mensaje corporativo
    const adminSupabase = createAdminClient();
    
    const { data: workflow } = await adminSupabase
      .from("document_workflows")
      .select("title, organization_id")
      .eq("id", workflowId)
      .single();

    const docTitle = workflow?.title || "un documento";
    const orgId = workflow?.organization_id;

    for (const node of nextNodes) {
      if (node.assigned_user_id) {
        await this.send({
          userId: node.assigned_user_id,
          organizationId: orgId,
          type: 'WORKFLOW_ACTION_REQUIRED',
          title: "Acción Requerida en Flujo de Aprobación",
          message: Se requiere su revisión y acción () para el documento "".,
          actionData: { workflow_id: workflowId, node_id: node.id }
        });
      } else {
        // TODO: Si no hay usuario asignado, buscar a todos los usuarios con ese cargo_id y notificarles
        // Por ahora lo dejamos preparado.
        console.warn([NotificationService] No hay usuario asignado explícitamente para el cargo );
      }
    }
  }
}

import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
   * Envía una notificación a un usuario específico (Base de datos / Realtime).
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
   * Notifica a los usuarios del Paso 1 de un workflow recién creado (Email vía Resend)
   */
  static async notifyWorkflowAssigned(params: {
    workflowTitle: string;
    documentTitle: string;
    recipientEmails: string[];
    actionRequired: string; // "sign" | "approve" | "review"
    creatorName: string;
  }): Promise<void> {
    if (!resend) {
      console.warn("[NotificationService] No RESEND_API_KEY configured. Skipping email notification.");
      return;
    }

    if (params.recipientEmails.length === 0) return;

    const actionMap: Record<string, string> = {
      'sign': 'firmar',
      'approve': 'aprobar',
      'review': 'revisar'
    };

    const actionText = actionMap[params.actionRequired] || 'procesar';

    try {
      await resend.emails.send({
        from: "Backroom App <no-reply@backroom.com>",
        to: params.recipientEmails,
        subject: "Acción requerida: " + params.documentTitle,
        html: 
          <div style="font-family: sans-serif; max-w-600px; margin: 0 auto; color: #333;">
            <h2>Tienes un documento pendiente de acción</h2>
            <p>Hola,</p>
            <p><strong> + params.creatorName + </strong> te ha asignado el primer paso del flujo de trabajo <strong> + params.workflowTitle + </strong>.</p>
            <p>Se requiere que ingreses a la plataforma para <strong> + actionText + </strong> el documento: <strong> + params.documentTitle + </strong>.</p>
            <br/>
            <p>Saludos,<br/>El equipo de Backroom</p>
          </div>
        
      });
      console.log("[NotificationService] Sent workflow assignment email to " + params.recipientEmails.join(', '));
    } catch (error) {
      console.error("[NotificationService] Error sending email:", error);
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
          message: "Se requiere su revisión y acción para el documento " + docTitle,
          actionData: { workflow_id: workflowId, node_id: node.id }
        });
      } else {
        // Si no hay usuario asignado, buscar a todos los usuarios con ese cargo_id y notificarles
        console.warn("[NotificationService] No hay usuario asignado explícitamente para el cargo");
      }
    }
  }
}

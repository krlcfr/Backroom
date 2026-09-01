import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export class NotificationService {
  /**
   * Notifica a los usuarios del Paso 1 de un workflow recién creado
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
        from: "Backroom App <no-reply@backroom.com>", // You might need a verified domain in Resend
        to: params.recipientEmails,
        subject: `Acción requerida: ${params.documentTitle}`,
        html: `
          <div style="font-family: sans-serif; max-w-600px; margin: 0 auto; color: #333;">
            <h2>Tienes un documento pendiente de acción</h2>
            <p>Hola,</p>
            <p><strong>${params.creatorName}</strong> te ha asignado el primer paso del flujo de trabajo <strong>${params.workflowTitle}</strong>.</p>
            <p>Se requiere que ingreses a la plataforma para <strong>${actionText}</strong> el documento: <strong>${params.documentTitle}</strong>.</p>
            <br/>
            <p>Saludos,<br/>El equipo de Backroom</p>
          </div>
        `
      });
      console.log(`[NotificationService] Sent workflow assignment email to ${params.recipientEmails.join(', ')}`);
    } catch (error) {
      console.error("[NotificationService] Error sending email:", error);
    }
  }

  /**
   * Efecto Dominó: Notifica al siguiente paso cuando el actual se completa
   */
  static async notifyNextStep(params: {
    workflowId: string;
    completedStepOrder: number;
  }): Promise<void> {
    // To be implemented in execution engine phase
    console.log(`[NotificationService] notifyNextStep for workflow ${params.workflowId}, step ${params.completedStepOrder}`);
  }
}

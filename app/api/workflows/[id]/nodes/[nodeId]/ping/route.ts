import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/session';
import { NotificationService } from '@/lib/services/notification.service';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const user = await requireAuth();
    const { id, nodeId } = await params;
    const supabaseAdmin = createAdminClient();

    // Obtener información del nodo y el usuario asignado
    const { data: node, error: nodeError } = await supabaseAdmin
      .from('workflow_nodes')
      .select('*, usuarios!workflow_nodes_assigned_user_id_fkey(auth_id)')
      .eq('id', nodeId)
      .eq('workflow_id', id)
      .single();

    if (nodeError || !node) {
      return NextResponse.json({ error: 'Nodo no encontrado' }, { status: 404 });
    }

    const authId = node.usuarios?.auth_id;
    if (!authId) {
      return NextResponse.json({ error: 'El usuario asignado no tiene un auth_id válido' }, { status: 400 });
    }

    // Obtener información del flujo
    const { data: workflow } = await supabaseAdmin
      .from('document_workflows')
      .select('title, organization_id')
      .eq('id', id)
      .single();

    const docTitle = workflow?.title || 'un documento';

    // Enviar notificación de recordatorio
    await NotificationService.send({
      userId: authId,
      organizationId: workflow?.organization_id,
      type: 'WORKFLOW_ACTION_REQUIRED',
      title: '🔔 Recordatorio: Acción Requerida',
      message: `El remitente ha solicitado que por favor revises/firmes el documento: ${docTitle} lo antes posible.`,
      actionData: { workflow_id: id, node_id: nodeId }
    });

    return NextResponse.json({ success: true, message: 'Recordatorio enviado' });
  } catch (error: any) {
    console.error('Error en POST /api/workflows/[id]/nodes/[nodeId]/ping:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

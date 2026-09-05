import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AuditService } from '@/lib/services/audit.service';
import { z } from 'zod';

const submitSchema = z.object({
  // Podemos añadir más campos si el payload lo requiere en el futuro
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const workflowId = id;

    // Ejecutar la transacción RPC
    const { data: rpcData, error: rpcError } = await supabase.rpc('submit_workflow_transaction', {
      p_workflow_id: workflowId,
      p_user_id: user.id
    });

    if (rpcError) {
      console.error('Error RPC submit_workflow_transaction:', rpcError);
      return NextResponse.json({ error: 'Error al enviar el flujo' }, { status: 500 });
    }

    // El RPC retorna JSONB con 'success', 'error' si falló lógico, y 'first_node_users'
    const result = rpcData as unknown as { success: boolean; error?: string; workflow_id?: string; first_node_users?: any[] };

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'No se pudo iniciar el flujo' }, { status: 400 });
    }

    // Registrar en auditoría (TC-07)
    // Para registrar necesitamos el document_id y org_id, los sacamos del workflow
    const { data: wfData } = await supabase
      .from('document_workflows')
      .select('organization_id, document_id')
      .eq('id', workflowId)
      .single();

    if (wfData) {
      await AuditService.logAction({
        orgId: wfData.organization_id,
        actorId: user.id,
        action: 'flujo_enviado',
        targetType: 'workflow',
        targetId: wfData.document_id,
        details: { workflow_id: workflowId, first_node_users: result.first_node_users }
      });
    }

    // Notificaciones: aquí se podría integrar NotificationService enviando emails a result.first_node_users

    return NextResponse.json({
      success: true,
      message: 'Flujo iniciado correctamente',
      data: result
    });

  } catch (error: any) {
    console.error('Error en /api/workflows/[id]/submit:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

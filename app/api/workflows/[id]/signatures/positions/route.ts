import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth/session';
import { z } from 'zod';

const positionsSchema = z.object({
  positions: z.array(z.object({
    nodeId: z.string(),
    pageNumber: z.number().int().min(1),
    xPercent: z.number().min(0).max(100),
    yPercent: z.number().min(0).max(100),
  }))
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    const body = await req.json();
    const { positions } = positionsSchema.parse(body);

    const user = await requireAuth();
    const supabaseAdmin = createAdminClient();

    // Obtener los nodos del flujo para mapearlos
    const { data: nodes, error: nodesError } = await supabaseAdmin
      .from('workflow_nodes')
      .select('id, assigned_user_id')
      .eq('workflow_id', workflowId);

    if (nodesError || !nodes) {
      return NextResponse.json({ error: 'No se encontraron nodos del flujo' }, { status: 404 });
    }

    // Obtener el document_id
    const { data: wfData } = await supabaseAdmin
      .from('document_workflows')
      .select('document_id')
      .eq('id', workflowId)
      .single();

    if (!wfData) {
      return NextResponse.json({ error: 'No se encontró el flujo' }, { status: 404 });
    }

    // Preparar registros a insertar
    const positionsToInsert = positions.map(pos => {
      const node = nodes.find(n => n.id === pos.nodeId);
      return {
        workflow_id: workflowId,
        resource_id: wfData.document_id,
        workflow_node_id: pos.nodeId,
        assigned_user_id: node?.assigned_user_id || user.id, // Fallback por seguridad de null constraint
        page_number: pos.pageNumber,
        pos_x_percent: pos.xPercent,
        pos_y_percent: pos.yPercent,
        width_px: 150,
        height_px: 60,
        is_signed: false
      };
    });

    if (positionsToInsert.length > 0) {
      // Eliminar posiciones anteriores si existieran
      await supabaseAdmin
        .from('workflow_signature_positions')
        .delete()
        .eq('workflow_id', workflowId);

      const { error: insertError } = await supabaseAdmin
        .from('workflow_signature_positions')
        .insert(positionsToInsert);

      if (insertError) {
        throw new Error(insertError.message);
      }
      
      // Actualizar total_signers_count
      await supabaseAdmin
        .from('document_workflows')
        .update({ total_signers_count: positionsToInsert.length })
        .eq('id', workflowId);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error saving signature positions:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

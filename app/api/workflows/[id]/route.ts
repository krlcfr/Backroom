import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/session';
import { AuditService } from '@/lib/services/audit.service';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    // Verificamos permisos y la existencia del flujo
    const { data: workflow, error: wfError } = await supabase
      .from('document_workflows')
      .select('organization_id, document_id, created_by')
      .eq('id', id)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ error: 'Flujo no encontrado' }, { status: 404 });
    }

    // Eliminamos el flujo
    const { error: deleteError } = await supabase
      .from('document_workflows')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error al eliminar flujo:', deleteError);
      return NextResponse.json({ error: 'No se pudo eliminar el flujo' }, { status: 500 });
    }

    // Registrar en auditoría
    await AuditService.logAction({
      orgId: workflow.organization_id,
      actorId: user.id,
      action: 'flujo_eliminado',
      targetType: 'workflow',
      targetId: workflow.document_id,
      details: { workflow_id: id }
    });

    return NextResponse.json({ success: true, message: 'Flujo eliminado correctamente' });
  } catch (error: any) {
    console.error('Error en DELETE /api/workflows/[id]:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

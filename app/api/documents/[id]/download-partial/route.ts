import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PdfStampService } from '@/lib/services/pdf-stamp.service';
import { AuditService } from '@/lib/services/audit.service';


export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener workflow del documento
    const { data: workflow, error: wfError } = await supabase
      .from('document_workflows')
      .select('id, organization_id, created_by, status')
      .eq('document_id', documentId)
      .single();

    if (wfError || !workflow) {
      return NextResponse.json({ error: 'Workflow no encontrado para este documento' }, { status: 404 });
    }

    // Determinar permisos de descarga
    let canDownload = false;
    let maxStepOrder: number | undefined = undefined; // Undefined = todas las firmas disponibles

    // 1. ¿Es el creador?
    if (workflow.created_by === user.id) {
      canDownload = true;
    } else {
      // 2. ¿Tiene permiso explícito en la nueva tabla?
      const { data: perm } = await supabase
        .from('workflow_download_permissions')
        .select('can_download_partial, can_download_full')
        .eq('workflow_id', workflow.id)
        .eq('user_id', user.id)
        .single();
      
      if (perm?.can_download_full || perm?.can_download_partial) {
        canDownload = true;
      } else {
        // 3. ¿Es admin o propietario de la org?
        // En supabase RPC existe is_org_owner e is_org_admin
        const { data: isAdmin } = await supabase.rpc('is_org_admin', { org: workflow.organization_id });
        const { data: isOwner } = await supabase.rpc('is_org_owner', { org: workflow.organization_id });
        if (isAdmin || isOwner) {
          canDownload = true;
        }
      }
    }

    if (!canDownload) {
      return NextResponse.json({ error: 'No tienes permiso para descargar este documento' }, { status: 403 });
    }

    // Determinar hasta qué paso estampar
    // Si no es el creador ni admin, solo estampamos hasta el paso donde está asignado
    if (workflow.created_by !== user.id) {
      const { data: userNode } = await supabase
        .from('workflow_nodes')
        .select('step_order')
        .eq('workflow_id', workflow.id)
        .eq('assigned_user_id', user.id)
        .order('step_order', { ascending: false })
        .limit(1)
        .single();
      
      if (userNode) {
        maxStepOrder = userNode.step_order;
      }
    }

    // Generar el PDF
    const pdfBytes = await PdfStampService.generateStampedPdf(documentId, workflow.id, maxStepOrder);

    // Auditoría
    await AuditService.logAction({
      orgId: workflow.organization_id,
      actorId: user.id,
      action: 'descarga_parcial_ejecutada',
      targetType: 'workflow',
      targetId: documentId,
      details: { workflow_id: workflow.id, maxStepOrder }
    });

    // Retornar el archivo como blob descargable
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="documento_parcial_${documentId}.pdf"`,
      }
    });

  } catch (error: any) {
    console.error('Error en download-partial:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: error.statusCode || 500 }
    );
  }
}

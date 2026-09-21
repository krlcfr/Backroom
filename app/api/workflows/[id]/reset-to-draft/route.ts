import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workflowId } = await params;
    await requireAuth();
    const supabaseAdmin = createAdminClient();
    
    // 1. Delete positions
    await supabaseAdmin
      .from('workflow_signature_positions')
      .delete()
      .eq('workflow_id', workflowId);

    // 2. Set status to draft
    const { error: updateError } = await supabaseAdmin
      .from('document_workflows')
      .update({ 
        status: 'draft',
        total_signers_count: 0,
        placed_signatures_count: 0
      })
      .eq('id', workflowId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error resetting workflow to draft:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

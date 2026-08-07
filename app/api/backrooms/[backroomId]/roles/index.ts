import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { ApiError } from '@/lib/api-error';

// GET /api/backrooms/[backroomId]/roles
export async function GET(request: NextRequest, { params }: { params: { backroomId: string } }) {
  try {
    await requireAuth();
    const { backroomId } = params;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('backroom_miembros')
      .select('usuario_id, permiso')
      .eq('backroom_id', backroomId);
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as any).message }, { status: 500 });
  }
}

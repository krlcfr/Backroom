import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { isOwner } from '@/lib/auth/rbac';
import { ApiError, handleApiError } from '@/lib/api-error';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer', 'contribuir', 'solo_visualizar'])
});

// POST /api/backrooms/[backroomId]/roles/[userId]
// Assign or update a role for a user in a backroom
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string; userId: string }> }
) {
  try {
    const requester = await requireAuth();
    const { backroomId, userId } = await params;

    // Solo el propietario (owner) puede cambiar roles
    const owner = await isOwner(requester.id, backroomId);
    if (!owner) {
      throw new ApiError(403, 'Forbidden');
    }

    const body = await request.json();
    const { role } = updateRoleSchema.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('backroom_miembros')
      .upsert({
        backroom_id: backroomId,
        usuario_id: userId,
        permiso: role,
        asignado_por: requester.id,
      })
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/backrooms/[backroomId]/roles/[userId]
// Remove a user's role (i.e., revoke membership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string; userId: string }> }
) {
  try {
    const requester = await requireAuth();
    const { backroomId, userId } = await params;
    const owner = await isOwner(requester.id, backroomId);
    if (!owner) {
      throw new ApiError(403, 'Forbidden');
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('backroom_miembros')
      .delete()
      .eq('backroom_id', backroomId)
      .eq('usuario_id', userId);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}

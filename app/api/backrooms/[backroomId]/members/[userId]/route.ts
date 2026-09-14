import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner } from "@/lib/auth/rbac";

import { Permiso } from "@/lib/auth/rbac";

// PATCH /api/backrooms/[backroomId]/members/[userId] — BE-19a
// Cambia el permiso de un miembro. Solo el propietario puede hacerlo.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId, userId } = await params;

    const owner = await isOwner(user.id, backroomId);
    if (!owner) throw new ApiError(403, "Solo el propietario puede cambiar permisos.");

    const body = await request.json();
    const permiso: Permiso = body?.permiso;

    if (permiso !== "solo_visualizar" && permiso !== "contribuir" && permiso !== "admin") {
      throw new ApiError(400, "Permiso inválido. Use 'solo_visualizar', 'contribuir' o 'admin'.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("backroom_miembros")
      .update({ permiso })
      .eq("backroom_id", backroomId)
      .eq("usuario_id", userId)
      .select()
      .single();

    if (error || !data) throw new ApiError(404, "Miembro no encontrado.");

    return NextResponse.json({ data: { member: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/backrooms/[backroomId]/members/[userId] — BE-19b
// Elimina un miembro del backroom. Solo el propietario puede hacerlo.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string; userId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId, userId } = await params;

    const owner = await isOwner(user.id, backroomId);
    if (!owner) throw new ApiError(403, "Solo el propietario puede remover miembros.");

    const supabase = await createClient();
    const { error } = await supabase
      .from("backroom_miembros")
      .delete()
      .eq("backroom_id", backroomId)
      .eq("usuario_id", userId);

    if (error) throw new ApiError(500, "No se pudo remover el miembro.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

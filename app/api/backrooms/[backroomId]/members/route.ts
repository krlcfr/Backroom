import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkPermission, getUsuarioInterno, isOwner } from "@/lib/auth/rbac";
import { z } from "zod";

// GET /api/backrooms/[backroomId]/members — BE-19
// Lista todos los miembros del backroom con su permiso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId } = await params;

    // Solo miembros activos pueden listar
    const hasAccess = await checkPermission(user.id, backroomId, "solo_visualizar");
    if (!hasAccess) throw new ApiError(403, "Sin acceso a este BackRoom.");

    // Usamos el cliente admin porque la tabla `usuarios` tiene RLS y un usuario
    // normal no puede ver los datos de los demás usuarios, pero en esta vista de
    // miembros sí es necesario.
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("backroom_miembros")
      .select("usuario_id, permiso, asignado_por, created_at, usuarios!backroom_miembros_usuario_id_fkey(id, username, correo, nombre_completo)")
      .eq("backroom_id", backroomId);

    if (error) throw new ApiError(500, "No se pudieron obtener los miembros.");

    return NextResponse.json({ data: { members: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  permiso: z.enum(["admin", "contribuir", "solo_visualizar"]),
});

// POST /api/backrooms/[backroomId]/members
// Añade un usuario existente a la backroom
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId } = await params;
    const body = await request.json();
    const input = addMemberSchema.parse(body);

    const isUserOwner = await isOwner(user.id, backroomId);
    if (!isUserOwner) throw new ApiError(403, "Solo el propietario puede añadir miembros.");

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    const supabaseAdmin = createAdminClient();

    // Comprobar si el usuario ya es miembro
    const { data: existing } = await supabaseAdmin
      .from("backroom_miembros")
      .select("usuario_id")
      .eq("backroom_id", backroomId)
      .eq("usuario_id", input.userId)
      .maybeSingle();

    if (existing) throw new ApiError(409, "El usuario ya es miembro de este Backroom.");

    const { data, error } = await supabaseAdmin
      .from("backroom_miembros")
      .insert({
        backroom_id: backroomId,
        usuario_id: input.userId,
        permiso: input.permiso,
        asignado_por: usuario.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error asignando miembro:", error);
      throw new ApiError(500, "No se pudo asignar el miembro al Backroom.");
    }

    return NextResponse.json({ data: { member: data } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

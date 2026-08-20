import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { isOwner } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";
import { updateRoomPermissionsSchema } from "@/lib/validations/room-permissions.schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Obtener la sala para verificar pertenencia al backroom
    const { data: sala, error: salaError } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) {
      throw new ApiError(404, "Sala no encontrada");
    }

    // Solo el propietario puede ver la matriz de permisos
    const esDueno = await isOwner(user.id, sala.backroom_id);
    if (!esDueno) {
      throw new ApiError(403, "No tienes permiso para gestionar permisos");
    }

    // Obtener miembros del backroom con su información de usuario (Bypassing RLS on usuarios)
    const { data: miembros, error: miembrosError } = await supabaseAdmin
      .from("backroom_miembros")
      .select("usuario_id, permiso, usuarios!backroom_miembros_usuario_id_fkey(username, nombre_completo, correo)")
      .eq("backroom_id", sala.backroom_id);

    if (miembrosError) throw new ApiError(500, "Error al obtener miembros");

    // Obtener permisos específicos de la sala
    const { data: permisos, error: permisosError } = await supabase
      .from("sala_permisos")
      .select("*")
      .eq("sala_id", roomId);

    if (permisosError && permisosError.code !== '42P01') {
       // 42P01 is relation does not exist, safe to ignore if migration not run yet
       throw new ApiError(500, "Error al obtener permisos de sala");
    }

    // Combinar en una matriz
    const matriz = miembros.map(m => {
      const p = permisos ? permisos.find(p => p.usuario_id === m.usuario_id) : undefined;
      const u = Array.isArray(m.usuarios) ? m.usuarios[0] : m.usuarios;
      return {
        usuario_id: m.usuario_id,
        username: u?.username,
        nombre_completo: u?.nombre_completo,
        correo: u?.correo,
        rol_general: m.permiso, // 'contribuir' o 'solo_visualizar'
        permisos_especificos: p ? {
          salas_ver: p.salas_ver,
          salas_acceder: p.salas_acceder,
          archivos_subir: p.archivos_subir,
          archivos_editar: p.archivos_editar,
          archivos_eliminar: p.archivos_eliminar,
          salas_crear: p.salas_crear,
          salas_editar: p.salas_editar,
          salas_eliminar: p.salas_eliminar,
        } : null,
      };
    });

    return NextResponse.json({ data: matriz }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;
    const body = await request.json();
    const input = updateRoomPermissionsSchema.parse(body);
    const supabase = await createClient();

    const { data: sala } = await supabase
      .from("salas")
      .select("backroom_id, parent_id")
      .eq("id", roomId)
      .single();

    if (!sala) throw new ApiError(404, "Sala no encontrada");

    const esDueno = await isOwner(user.id, sala.backroom_id);
    if (!esDueno) throw new ApiError(403, "No tienes permiso para gestionar permisos");

    // Si pide heredar del padre
    if (input.heredar_de_padre) {
      if (!sala.parent_id) {
        throw new ApiError(400, "La sala raíz no puede heredar permisos");
      }
      // Buscar permisos del padre
      const { data: permisosPadre } = await supabase
        .from("sala_permisos")
        .select("*")
        .eq("sala_id", sala.parent_id)
        .eq("usuario_id", input.usuario_id)
        .single();
      
      if (permisosPadre) {
        input.permisos = {
          salas_ver: permisosPadre.salas_ver,
          salas_acceder: permisosPadre.salas_acceder,
          archivos_subir: permisosPadre.archivos_subir,
          archivos_editar: permisosPadre.archivos_editar,
          archivos_eliminar: permisosPadre.archivos_eliminar,
          salas_crear: permisosPadre.salas_crear,
          salas_editar: permisosPadre.salas_editar,
          salas_eliminar: permisosPadre.salas_eliminar,
        };
      }
    }

    // Upsert a la tabla sala_permisos
    const { data, error } = await supabase
      .from("sala_permisos")
      .upsert({
        sala_id: roomId,
        usuario_id: input.usuario_id,
        salas_ver: input.permisos.salas_ver ?? false,
        salas_acceder: input.permisos.salas_acceder ?? false,
        archivos_subir: input.permisos.archivos_subir ?? false,
        archivos_editar: input.permisos.archivos_editar ?? false,
        archivos_eliminar: input.permisos.archivos_eliminar ?? false,
        salas_crear: input.permisos.salas_crear ?? false,
        salas_editar: input.permisos.salas_editar ?? false,
        salas_eliminar: input.permisos.salas_eliminar ?? false,
        updated_at: new Date().toISOString(),
      }, { onConflict: "sala_id, usuario_id" })
      .select()
      .single();

    if (error) {
       console.error(error);
       throw new ApiError(500, "Error al actualizar permisos");
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

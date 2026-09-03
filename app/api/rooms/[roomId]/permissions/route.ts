import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { isOwner } from "@/lib/auth/rbac";
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
    const supabaseAdmin = createAdminClient();

    // Obtener la sala para verificar pertenencia al backroom
    const { data: sala, error: salaError } = await supabaseAdmin
      .from("salas")
      .select("backroom_id, backrooms(id, propietario_id)")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) {
      throw new ApiError(404, "Sala no encontrada");
    }

    // Propietario o administrador de la organización
    const esDueno = await isOwner(user.id, sala.backroom_id);
    if (!esDueno) {
      throw new ApiError(403, "No tienes permiso para gestionar permisos");
    }

    const backroomPropietarioId = (sala.backrooms as any)?.propietario_id;

    // Buscar la organización del propietario
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id, owner_id")
      .eq("owner_id", backroomPropietarioId)
      .maybeSingle();

    // Recolectar todos los usuarios de la organización y/o backroom
    const miembrosMap = new Map<string, {
      usuario_id: string;
      username: string;
      nombre_completo: string;
      correo: string;
      rol_general: string;
    }>();

    // 1. Añadir el owner de la organización si existe
    if (org) {
      const { data: ownerUser } = await supabaseAdmin
        .from("usuarios")
        .select("id, username, nombre_completo, correo")
        .eq("id", org.owner_id)
        .maybeSingle();
      
      if (ownerUser) {
        miembrosMap.set(ownerUser.id, {
          usuario_id: ownerUser.id,
          username: ownerUser.username || "",
          nombre_completo: ownerUser.nombre_completo || ownerUser.username || "",
          correo: ownerUser.correo || "",
          rol_general: "Propietario",
        });
      }

      // 2. Añadir todos los miembros activos de la organización
      const { data: orgMembers } = await supabaseAdmin
        .from("organization_members")
        .select("user_id, role, usuarios(id, username, nombre_completo, correo)")
        .eq("organization_id", org.id)
        .eq("status", "active");

      if (orgMembers) {
        for (const m of orgMembers) {
          const u: any = Array.isArray(m.usuarios) ? m.usuarios[0] : m.usuarios;
          if (u) {
            miembrosMap.set(m.user_id, {
              usuario_id: m.user_id,
              username: u.username || "",
              nombre_completo: u.nombre_completo || u.username || "",
              correo: u.correo || "",
              rol_general: m.role === "admin" ? "Administrador" : "Miembro",
            });
          }
        }
      }
    }

    // 3. Añadir miembros de backroom_miembros (por compatibilidad previa)
    const { data: legacyMembers } = await supabaseAdmin
      .from("backroom_miembros")
      .select("usuario_id, permiso, usuarios(id, username, nombre_completo, correo)")
      .eq("backroom_id", sala.backroom_id);

    if (legacyMembers) {
      for (const m of legacyMembers) {
        if (!miembrosMap.has(m.usuario_id)) {
          const u: any = Array.isArray(m.usuarios) ? m.usuarios[0] : m.usuarios;
          if (u) {
            miembrosMap.set(m.usuario_id, {
              usuario_id: m.usuario_id,
              username: u.username || "",
              nombre_completo: u.nombre_completo || u.username || "",
              correo: u.correo || "",
              rol_general: m.permiso || "Miembro",
            });
          }
        }
      }
    }

    const miembrosList = Array.from(miembrosMap.values());

    // Obtener permisos específicos de la sala
    const { data: permisos } = await supabaseAdmin
      .from("sala_permisos")
      .select("*")
      .eq("sala_id", roomId);

    // Combinar en la matriz de permisos
    const matriz = miembrosList.map(m => {
      const p = permisos ? permisos.find(p => p.usuario_id === m.usuario_id) : undefined;
      return {
        usuario_id: m.usuario_id,
        username: m.username,
        nombre_completo: m.nombre_completo,
        correo: m.correo,
        rol_general: m.rol_general,
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
    const supabaseAdmin = createAdminClient();

    const { data: sala } = await supabaseAdmin
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
      const { data: permisosPadre } = await supabaseAdmin
        .from("sala_permisos")
        .select("*")
        .eq("sala_id", sala.parent_id)
        .eq("usuario_id", input.usuario_id)
        .maybeSingle();
      
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
    const { data, error } = await supabaseAdmin
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

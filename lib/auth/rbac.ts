import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export type Permiso = "contribuir" | "solo_visualizar" | "admin";
export type CodigoPermiso = "salas.crear" | "salas.editar" | "salas.eliminar" | "salas.ver" | "salas.acceder" | "miembros.gestionar" | "recursos.subir" | "archivos.subir" | "recursos.eliminar" | "configuracion.editar";

export async function getUsuarioInterno(authId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("usuarios")
    .select("id, es_superadmin, correo")
    .eq("auth_id", authId)
    .single();

  return data;
}

export async function isOwner(authId: string, backroomId: string) {
  const usuario = await getUsuarioInterno(authId);
  if (!usuario) return false;

  const supabase = await createClient();
  const { data: backroom } = await supabase
    .from("backrooms")
    .select("propietario_id")
    .eq("id", backroomId)
    .single();

  if (!backroom) return false;

  return backroom.propietario_id === usuario.id;
}

export async function checkPermission(authId: string, backroomId: string, permisoRequerido: Permiso) {
  const esDueno = await isOwner(authId, backroomId);
  if (esDueno) return true;

  const usuario = await getUsuarioInterno(authId);
  if (!usuario) return false;

  const supabase = await createClient();
  const { data: miembro } = await supabase
    .from("backroom_miembros")
    .select("permiso")
    .eq("backroom_id", backroomId)
    .eq("usuario_id", usuario.id)
    .single();

  if (!miembro) return false;

  if (permisoRequerido === "solo_visualizar") {
    return miembro.permiso === "solo_visualizar" || miembro.permiso === "contribuir";
  }

  return miembro.permiso === "contribuir";
}
export async function checkRoomPermission(authId: string, roomId: string, permisoRequerido: CodigoPermiso) {
  const usuario = await getUsuarioInterno(authId);
  if (!usuario) return false;

  const supabase = await createClient();

  // Obtener la sala para saber el backroom_id
  const { data: sala } = await supabase
    .from("salas")
    .select("backroom_id")
    .eq("id", roomId)
    .single();

  if (!sala) return false;

  // Si es dueño del backroom, lo puede todo
  const esDueno = await isOwner(authId, sala.backroom_id);
  if (esDueno) return true;

  // Consultar permisos específicos de la sala
  const allowedPermissions = [
    "salas_ver", "salas_acceder", "salas_crear", "salas_editar", "salas_eliminar",
    "recursos_ver", "recursos_subir", "recursos_eliminar", "configuracion_editar", "miembros_gestionar", "archivos_subir"
  ];
  
  const colName = permisoRequerido.replace(".", "_");
  if (!allowedPermissions.includes(colName)) {
    return false;
  }

  const { data: permiso } = await supabase
    .from("sala_permisos")
    .select(colName)
    .eq("sala_id", roomId)
    .eq("usuario_id", usuario.id)
    .maybeSingle();

  if (permiso && typeof (permiso as any)[colName] === "boolean") {
    return (permiso as any)[colName] === true;
  }

  // Fallback: si no hay permisos específicos, usamos el rol general?
  // La regla "Matriz sala x miembros con los 8 permisos" indica que
  // idealmente el permiso se determina explícitamente en sala_permisos.
  // Pero si queremos un comportamiento por defecto para 'contribuir':
  const { data: miembro } = await supabase
    .from("backroom_miembros")
    .select("permiso")
    .eq("backroom_id", sala.backroom_id)
    .eq("usuario_id", usuario.id)
    .single();

  if (!miembro) return false;

  if (miembro.permiso === "contribuir") return true;

  // Si es solo_visualizar y el permiso requerido es de lectura, pasamos.
  if (miembro.permiso === "solo_visualizar" && (permisoRequerido === "salas.ver" || permisoRequerido === "salas.acceder")) {
    return true;
  }

  return false;
}

export type Role = Permiso;

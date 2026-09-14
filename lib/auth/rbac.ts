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

  const supabase = createAdminClient();
  const { data: backroom } = await supabase
    .from("backrooms")
    .select("propietario_id")
    .eq("id", backroomId)
    .single();

  if (!backroom) return false;

  // Propietario directo del Backroom
  if (backroom.propietario_id === usuario.id) return true;

  // Propietario o Administrador de la Organización vinculada al Backroom
  const { data: org } = await supabase
    .from("organizations")
    .select("id, owner_id")
    .eq("owner_id", backroom.propietario_id)
    .maybeSingle();

  if (org) {
    if (org.owner_id === usuario.id) return true;

    const { data: member } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", org.id)
      .eq("user_id", usuario.id)
      .eq("status", "active")
      .maybeSingle();

    if (member?.role === "admin") return true;
  }

  return false;
}

export async function checkPermission(authId: string, backroomId: string, permisoRequerido: Permiso) {
  const esDueno = await isOwner(authId, backroomId);
  if (esDueno) return true;

  const usuario = await getUsuarioInterno(authId);
  if (!usuario) return false;

  const supabase = createAdminClient();
  
  // 1. Verificar si es miembro directo en backroom_miembros
  const { data: miembro } = await supabase
    .from("backroom_miembros")
    .select("permiso")
    .eq("backroom_id", backroomId)
    .eq("usuario_id", usuario.id)
    .maybeSingle();

  if (miembro) {
    if (permisoRequerido === "solo_visualizar") {
      return miembro.permiso === "solo_visualizar" || miembro.permiso === "contribuir" || miembro.permiso === "admin";
    }
    return miembro.permiso === "contribuir" || miembro.permiso === "admin";
  }

  // 2. Verificar si es miembro activo en la organización del Backroom
  const { data: backroom } = await supabase
    .from("backrooms")
    .select("propietario_id")
    .eq("id", backroomId)
    .single();

  if (backroom) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", backroom.propietario_id)
      .maybeSingle();

    if (org) {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", org.id)
        .eq("user_id", usuario.id)
        .eq("status", "active")
        .maybeSingle();

      if (orgMember) {
        if (orgMember.role === "admin") return true;
        if (permisoRequerido === "solo_visualizar") return true;
        return orgMember.role === "member";
      }
    }
  }

  return false;
}
export async function checkRoomPermission(authId: string, roomId: string, permisoRequerido: CodigoPermiso) {
  const usuario = await getUsuarioInterno(authId);
  if (!usuario) return false;

  const supabase = createAdminClient();

  // Obtener la sala para saber el backroom_id usando admin para saltar RLS temporalmente
  const { data: sala } = await supabase
    .from("salas")
    .select("backroom_id")
    .eq("id", roomId)
    .single();

  if (!sala) return false;

  // Si es dueño o admin del backroom/organización, lo puede todo
  const esDueno = await isOwner(authId, sala.backroom_id);
  if (esDueno) return true;

  // Consultar permisos específicos de la sala
  const { data: permiso } = await supabase
    .from("sala_permisos")
    .select(permisoRequerido.replace(".", "_"))
    .eq("sala_id", roomId)
    .eq("usuario_id", usuario.id)
    .maybeSingle();

  if (permiso) {
    return (permiso as any)[permisoRequerido.replace(".", "_")] === true;
  }

  // Fallback: verificar membresía en backroom o en la organización
  const { data: miembro } = await supabase
    .from("backroom_miembros")
    .select("permiso")
    .eq("backroom_id", sala.backroom_id)
    .eq("usuario_id", usuario.id)
    .maybeSingle();

  if (miembro) {
    if (miembro.permiso === "contribuir" || miembro.permiso === "admin") return true;
    if (miembro.permiso === "solo_visualizar" && (permisoRequerido === "salas.ver" || permisoRequerido === "salas.acceder")) {
      return true;
    }
  }

  // Fallback para miembros de organización
  const { data: backroom } = await supabase
    .from("backrooms")
    .select("propietario_id")
    .eq("id", sala.backroom_id)
    .single();

  if (backroom) {
    const { data: orgRel } = await supabase
      .from("organization_backrooms")
      .select("organization_id")
      .eq("backroom_id", sala.backroom_id)
      .maybeSingle();

    if (orgRel) {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgRel.organization_id)
        .eq("user_id", usuario.id)
        .eq("status", "active")
        .maybeSingle();

      if (orgMember) {
        if (orgMember.role === "admin") return true;
        if (permisoRequerido === "salas.ver" || permisoRequerido === "salas.acceder") return true;
      }
    }
  }

  return false;
}

export type Role = Permiso;

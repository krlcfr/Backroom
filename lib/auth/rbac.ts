import { createClient } from "@/lib/supabase/server";

type Permiso = "solo_visualizar" | "contribuir";

export async function getUsuarioInterno(authId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("usuarios")
    .select("id, es_superadmin")
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
export type Role = Permiso;

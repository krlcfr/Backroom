import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno, isOwner } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import type { CreateBackroomInput, UpdateBackroomInput } from "@/lib/validations/schemas";

function toBackroomResponse(row: {
  id: string;
  propietario_id: string;
  nombre: string;
  descripcion: string | null;
  portada_url: string | null;
  created_at: string;
  usuarios?: { auth_id: string; username: string } | null;
}, ownerAuthIdOverride?: string) {
  return {
    id: row.id,
    ownerId: ownerAuthIdOverride ?? row.usuarios?.auth_id ?? row.propietario_id,
    ownerName: row.usuarios?.username ?? null,
    name: row.nombre,
    description: row.descripcion,
    coverUrl: row.portada_url,
    createdAt: row.created_at,
  };
}

export class BackroomsService {
  static async create(authId: string, input: CreateBackroomInput) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: backroom, error: backroomError } = await supabase
      .from("backrooms")
      .insert({
        propietario_id: usuario.id,
        nombre: input.name,
        descripcion: input.description,
        portada_url: input.coverUrl,
      })
      .select()
      .single();

    if (backroomError || !backroom) {
      throw new ApiError(500, "No se pudo crear la BackRoom");
    }

    const { error: miembroError } = await supabase.from("backroom_miembros").insert({
      backroom_id: backroom.id,
      usuario_id: usuario.id,
      permiso: "contribuir",
      asignado_por: usuario.id,
    });

    if (miembroError) {
      await supabase.from("backrooms").delete().eq("id", backroom.id);
      throw new ApiError(500, "No se pudo crear la BackRoom");
    }

    return toBackroomResponse(backroom, authId);
  }

  static async listForUser() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("backrooms")
      .select("*, usuarios(auth_id, username)")
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "No se pudieron obtener las BackRooms");
    }

    return data.map((row) => toBackroomResponse(row));
  }

  static async getById(backroomId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("backrooms")
      .select("*, usuarios(auth_id, username)")
      .eq("id", backroomId)
      .maybeSingle();

    if (error || !data) {
      throw new ApiError(404, "BackRoom no encontrada");
    }

    return toBackroomResponse(data);
  }

  static async deleteById(authId: string, backroomId: string) {
    const owns = await isOwner(authId, backroomId);

    if (!owns) {
      throw new ApiError(404, "BackRoom no encontrada");
    }

    const supabase = await createClient();

    const { error } = await supabase.from("backrooms").delete().eq("id", backroomId);

    if (error) {
      throw new ApiError(500, "No se pudo eliminar la BackRoom");
    }
  }

  static async updateById(authId: string, backroomId: string, input: UpdateBackroomInput) {
    const owns = await isOwner(authId, backroomId);

    if (!owns) {
      throw new ApiError(403, "Solo el propietario puede editar el BackRoom");
    }

    const supabase = await createClient();

    const updateData: any = {};
    if (input.name !== undefined) updateData.nombre = input.name;
    if (input.description !== undefined) updateData.descripcion = input.description;
    if (input.coverUrl !== undefined) updateData.portada_url = input.coverUrl;

    if (Object.keys(updateData).length === 0) {
      return this.getById(backroomId); // Nothing to update
    }

    const { data, error } = await supabase
      .from("backrooms")
      .update(updateData)
      .eq("id", backroomId)
      .select("*, usuarios(auth_id, username)")
      .single();

    if (error || !data) {
      throw new ApiError(500, "No se pudo actualizar la BackRoom");
    }

    return toBackroomResponse(data);
  }
}

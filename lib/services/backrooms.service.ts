import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import type { CreateBackroomInput } from "@/lib/validations/schemas";

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

    return backroom;
  }

  static async listForUser() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("backrooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "No se pudieron obtener las BackRooms");
    }

    return data;
  }
}

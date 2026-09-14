import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import type {
  CreateCargoInput,
  UpdateCargoInput,
} from "@/lib/validations/schemas";

function toCargoResponse(row: {
  id: string;
  organization_id: string;
  nombre: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class CargosService {
  static async listByOrg(authId: string, orgId: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    // Verify access to org
    const { data: hasAccess } = await supabase.rpc("is_org_member", { org: orgId });
    const { data: isOwner } = await supabase.rpc("is_org_owner", { org: orgId });

    if (!hasAccess && !isOwner) {
      throw new ApiError(403, "No tienes acceso a esta organización");
    }

    const { data, error } = await supabase
      .from("cargos")
      .select("*")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "No se pudieron obtener los cargos");
    }

    return (data ?? []).map(toCargoResponse);
  }

  static async create(authId: string, orgId: string, input: CreateCargoInput) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    // Verify ownership or admin access
    const { data: isOwner } = await supabase.rpc("is_org_owner", { org: orgId });
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { org: orgId });

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "Solo los administradores o propietarios pueden crear cargos");
    }

    const { data, error } = await supabase
      .from("cargos")
      .insert({
        organization_id: orgId,
        nombre: input.nombre,
        descripcion: input.descripcion ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new ApiError(500, "No se pudo crear el cargo");
    }

    return toCargoResponse(data);
  }

  static async update(authId: string, cargoId: string, input: UpdateCargoInput) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    // Fetch the cargo first to get the orgId
    const { data: cargo, error: fetchError } = await supabase
      .from("cargos")
      .select("organization_id")
      .eq("id", cargoId)
      .maybeSingle();

    if (fetchError || !cargo) {
      throw new ApiError(404, "Cargo no encontrado");
    }

    // Verify ownership or admin access
    const { data: isOwner } = await supabase.rpc("is_org_owner", { org: cargo.organization_id });
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { org: cargo.organization_id });

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "Solo los administradores o propietarios pueden actualizar cargos");
    }

    const updateData: Record<string, string | null> = {};
    if (input.nombre !== undefined) updateData.nombre = input.nombre;
    if (input.descripcion !== undefined) updateData.descripcion = input.descripcion;

    const { data: updated, error: updateError } = await supabase
      .from("cargos")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", cargoId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new ApiError(500, "No se pudo actualizar el cargo");
    }

    return toCargoResponse(updated);
  }

  static async remove(authId: string, cargoId: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: cargo, error: fetchError } = await supabase
      .from("cargos")
      .select("organization_id")
      .eq("id", cargoId)
      .maybeSingle();

    if (fetchError || !cargo) {
      throw new ApiError(404, "Cargo no encontrado");
    }

    // Verify ownership or admin access
    const { data: isOwner } = await supabase.rpc("is_org_owner", { org: cargo.organization_id });
    const { data: isAdmin } = await supabase.rpc("is_org_admin", { org: cargo.organization_id });

    if (!isOwner && !isAdmin) {
      throw new ApiError(403, "Solo los administradores o propietarios pueden eliminar cargos");
    }

    const { error: deleteError } = await supabase
      .from("cargos")
      .delete()
      .eq("id", cargoId);

    if (deleteError) {
      throw new ApiError(500, "No se pudo eliminar el cargo");
    }
  }
}

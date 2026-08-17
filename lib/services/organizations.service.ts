import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  UpdateMemberRoleInput,
} from "@/lib/validations/schemas";

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const LOGO_MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
};

function toOrgResponse(row: {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    description: row.description,
    logoUrl: row.logo_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMemberResponse(row: {
  user_id: string;
  role: string;
  status: string;
  joined_at: string | null;
  last_access_at: string | null;
  usuarios?: { username: string; nombre_completo: string; correo: string } | null;
}) {
  return {
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    lastAccessAt: row.last_access_at,
    username: row.usuarios?.username ?? null,
    fullName: row.usuarios?.nombre_completo ?? null,
    email: row.usuarios?.correo ?? null,
  };
}

export class OrganizationsService {
  static async getOrgForUser(authId: string) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      return null;
    }

    const supabase = await createClient();

    const { data: ownerOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", usuario.id)
      .maybeSingle();

    if (ownerOrg) {
      return toOrgResponse(ownerOrg);
    }

    const { data: memberships } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", usuario.id)
      .eq("status", "active");

    const orgIds = (memberships ?? []).map((m) => m.organization_id);

    if (orgIds.length > 0) {
      const { data: memberOrg } = await supabase
        .from("organizations")
        .select("*")
        .in("id", orgIds)
        .maybeSingle();

      if (memberOrg) {
        return toOrgResponse(memberOrg);
      }
    }

    return null;
  }

  static async create(authId: string, input: CreateOrganizationInput, logoFile?: File | null) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const existing = await this.getOrgForUser(authId);

    if (existing) {
      throw new ApiError(409, "Ya perteneces a una organización");
    }

    const logo = logoFile && logoFile.size > 0 ? logoFile : null;
    const logoExt = logo ? LOGO_MIME_EXT[logo.type] : null;

    if (logo && !logoExt) {
      throw new ApiError(400, "El logo debe ser una imagen PNG, JPEG o WebP");
    }

    if (logo && logo.size > LOGO_MAX_BYTES) {
      throw new ApiError(400, "El logo no puede superar 2 MB");
    }

    const supabase = await createClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({
        owner_id: usuario.id,
        name: input.name,
        description: input.description,
      })
      .select()
      .single();

    if (orgError || !org) {
      throw new ApiError(500, "No se pudo crear la organización");
    }

    if (logo) {
      const path = `${org.id}/logo${logoExt}`;
      const buffer = await logo.arrayBuffer();

      const admin = createAdminClient();
      const { error: uploadError } = await admin.storage
        .from("org-logos")
        .upload(path, buffer, { contentType: logo.type, upsert: true });

      if (uploadError) {
        console.error("Storage upload error (create):", uploadError.message, uploadError);
        await supabase.from("organizations").delete().eq("id", org.id);
        throw new ApiError(500, `No se pudo subir el logo: ${uploadError.message}`);
      }

      org.logo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-logos/${path}`;

      const { error: updateError } = await supabase
        .from("organizations")
        .update({ logo_url: org.logo_url })
        .eq("id", org.id);

      if (updateError) {
        throw new ApiError(500, "No se pudo crear la organización");
      }
    }

    return toOrgResponse(org);
  }

  static async getById(authId: string, orgId: string) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .maybeSingle();

    if (error || !org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    const isMember = await this.isActiveMember(orgId);
    if (!isMember && org.owner_id !== usuario.id) {
      throw new ApiError(403, "No tienes acceso a esta organización");
    }

    return toOrgResponse(org);
  }

  static async update(
    authId: string,
    orgId: string,
    input: UpdateOrganizationInput,
    logoFile?: File | null
  ) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .maybeSingle();

    if (orgError || !org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== usuario.id) {
      throw new ApiError(403, "Solo el Propietario puede editar la organización");
    }

    const updateData: Record<string, string | null> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;

    if (logoFile && logoFile.size > 0) {
      const logoExt = LOGO_MIME_EXT[logoFile.type];

      if (!logoExt) {
        throw new ApiError(400, "El logo debe ser una imagen PNG, JPEG o WebP");
      }

      if (logoFile.size > LOGO_MAX_BYTES) {
        throw new ApiError(400, "El logo no puede superar 2 MB");
      }

      const path = `${org.id}/logo${logoExt}`;
      const buffer = await logoFile.arrayBuffer();

      const admin = createAdminClient();
      const { error: uploadError } = await admin.storage
        .from("org-logos")
        .upload(path, buffer, { contentType: logoFile.type, upsert: true });

      if (uploadError) {
        console.error("Storage upload error:", uploadError.message, uploadError);
        throw new ApiError(500, `No se pudo subir el logo: ${uploadError.message}`);
      }

      updateData.logo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-logos/${path}`;
    }

    const { data: updated, error: updateError } = await supabase
      .from("organizations")
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq("id", orgId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new ApiError(500, "No se pudo actualizar la organización");
    }

    return toOrgResponse(updated);
  }

  static async remove(authId: string, orgId: string) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .maybeSingle();

    if (orgError || !org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== usuario.id) {
      throw new ApiError(403, "Solo el Propietario puede eliminar la organización");
    }

    const { data: backrooms } = await supabase
      .from("backrooms")
      .select("id")
      .eq("propietario_id", usuario.id);

    for (const backroom of backrooms ?? []) {
      await supabase.from("backrooms").delete().eq("id", backroom.id);
    }

    await supabase.from("organization_members").delete().eq("organization_id", orgId);

    const { error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", orgId);

    if (deleteError) {
      throw new ApiError(500, "No se pudo eliminar la organización");
    }
  }

  static async listMembers(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("organization_members")
      .select("*, usuarios(username, nombre_completo, correo)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new ApiError(500, "No se pudieron obtener los miembros");
    }

    return (data ?? []).map((row) => toMemberResponse(row));
  }

  static async updateRole(authId: string, orgId: string, userId: string, input: UpdateMemberRoleInput) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (orgError || !org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== usuario.id) {
      throw new ApiError(403, "Solo el Propietario puede cambiar roles");
    }

    if (org.owner_id === userId) {
      throw new ApiError(400, "No se puede cambiar el rol del Propietario");
    }

    const { data, error } = await supabase
      .from("organization_members")
      .update({ role: input.role, updated_at: new Date().toISOString() })
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new ApiError(404, "Miembro no encontrado");
    }

    return toMemberResponse(data);
  }

  static async removeMember(authId: string, orgId: string, userId: string) {
    const usuario = await getUsuarioInterno(authId);

    if (!usuario) {
      throw new ApiError(404, "Perfil no encontrado");
    }

    const supabase = await createClient();

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (orgError || !org) {
      throw new ApiError(404, "Organización no encontrada");
    }

    if (org.owner_id !== usuario.id) {
      throw new ApiError(403, "Solo el Propietario puede remover miembros");
    }

    if (org.owner_id === userId) {
      throw new ApiError(400, "No puedes removerte a ti mismo");
    }

    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("organization_id", orgId)
      .eq("user_id", userId);

    if (error) {
      throw new ApiError(500, "No se pudo remover el miembro");
    }
  }

  private static async isActiveMember(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("is_org_member", { org: orgId });

    if (error) return false;

    return data === true;
  }
}

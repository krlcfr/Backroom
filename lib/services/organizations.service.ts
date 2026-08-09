import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import type { CreateOrganizationInput } from "@/lib/validations/schemas";

const LOGO_MAX_BYTES = 2 * 1024 * 1024;

const LOGO_MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
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

      const { error: uploadError } = await supabase.storage
        .from("org-logos")
        .upload(path, buffer, { contentType: logo.type, upsert: true });

      if (uploadError) {
        await supabase.from("organizations").delete().eq("id", org.id);
        throw new ApiError(500, "No se pudo subir el logo");
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
}

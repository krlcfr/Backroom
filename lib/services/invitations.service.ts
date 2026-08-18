import { createClient } from "@/lib/supabase/server";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/api-error";
import { z } from "zod";
import { Resend } from "resend";

export const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member"]).default("member"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export class InvitationsService {
  static async createInvitation(authId: string, orgId: string, input: CreateInvitationInput) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado");

    const supabase = await createClient();

    // Verify user is owner or admin
    const { data: org } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (!org) throw new ApiError(404, "Organización no encontrada");

    let hasPermission = org.owner_id === usuario.id;

    if (!hasPermission) {
      const { data: member } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", usuario.id)
        .eq("status", "active")
        .maybeSingle();

      if (member?.role === "admin") {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      throw new ApiError(403, "No tienes permisos para invitar miembros");
    }

    // Verify if already a member
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id")
      .eq("correo", input.email)
      .maybeSingle();

    if (existingUser) {
      const { data: existingMember } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", orgId)
        .eq("user_id", existingUser.id)
        .eq("status", "active")
        .maybeSingle();

      if (existingMember) {
        throw new ApiError(409, "El usuario ya es miembro de esta organización");
      }
    }

    // Check if there's an active pending invitation
    const { data: existingInvite } = await supabase
      .from("organization_invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", input.email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      throw new ApiError(409, "Ya hay una invitación pendiente para este correo");
    }

    // Generate secure token
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { data: invitation, error: insertError } = await supabase
      .from("organization_invitations")
      .insert({
        organization_id: orgId,
        created_by: usuario.id,
        email: input.email,
        role: input.role,
        token,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError || !invitation) {
      throw new ApiError(500, "Error al crear la invitación");
    }

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invitaciones/${token}`;
        
        await resend.emails.send({
          from: "BackRoom <onboarding@resend.dev>", // Cambiar a dominio verificado en prod
          to: input.email,
          subject: "Has sido invitado a unirte a un BackRoom",
          html: `
            <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 20px;">
              <h2>¡Hola!</h2>
              <p>Has sido invitado a unirte a un espacio en BackRoom.</p>
              <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
              <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Aceptar Invitación</a>
              <p style="margin-top: 20px; color: #666; font-size: 12px;">Este enlace expira en 7 días.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("Error sending invitation email:", err);
        // We don't throw here so the invitation is still created even if email fails in dev
      }
    }

    return invitation;
  }

  static async getInvitationByToken(token: string) {
    const supabase = await createClient();

    const { data: invitation, error } = await supabase
      .from("organization_invitations")
      .select("*, organizations(name, logo_url)")
      .eq("token", token)
      .maybeSingle();

    if (error || !invitation) {
      throw new ApiError(404, "Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new ApiError(400, "Esta invitación ya no es válida");
    }

    if (new Date(invitation.expires_at) < new Date()) {
      // Auto-update to expired
      await supabase
        .from("organization_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);
      throw new ApiError(400, "Esta invitación ha expirado");
    }

    return invitation;
  }

  static async acceptInvitation(authId: string, token: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado");

    const supabase = await createClient();
    const invitation = await this.getInvitationByToken(token); // Validates expiration and status

    if (invitation.email.toLowerCase() !== usuario.correo.toLowerCase()) {
      throw new ApiError(403, "Esta invitación fue enviada a otro correo electrónico");
    }

    // Begin transaction-like operations
    // 1. Mark as accepted
    const { error: updateError } = await supabase
      .from("organization_invitations")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (updateError) throw new ApiError(500, "No se pudo aceptar la invitación");

    // 2. Insert into members
    const { error: insertError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: invitation.organization_id,
        user_id: usuario.id,
        role: invitation.role,
        status: "active",
        joined_at: new Date().toISOString(),
      });

    if (insertError) {
      if (insertError.code !== '23505') { // 23505 = unique_violation
        throw new ApiError(500, "No se pudo vincular a la organización");
      }
    }

    return { organization_id: invitation.organization_id };
  }

  static async revokeInvitation(authId: string, orgId: string, invitationId: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado");

    const supabase = await createClient();

    // Verify user is owner or admin
    const { data: org } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (!org) throw new ApiError(404, "Organización no encontrada");

    let hasPermission = org.owner_id === usuario.id;

    if (!hasPermission) {
      const { data: member } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", orgId)
        .eq("user_id", usuario.id)
        .eq("status", "active")
        .maybeSingle();

      if (member?.role === "admin") {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      throw new ApiError(403, "No tienes permisos para revocar invitaciones");
    }

    const { error } = await supabase
      .from("organization_invitations")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", invitationId)
      .eq("organization_id", orgId);

    if (error) {
      throw new ApiError(500, "No se pudo revocar la invitación");
    }
  }

  static async listPendingInvitations(orgId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("organization_invitations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw new ApiError(500, "Error al listar invitaciones");

    return data;
  }
}

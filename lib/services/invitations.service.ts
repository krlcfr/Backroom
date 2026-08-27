import { createAdminClient } from "@/lib/supabase/admin";
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

    const admin = createAdminClient();

    // Verify user is owner or admin
    const { data: org, error: orgError } = await admin
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (orgError || !org) throw new ApiError(404, "Organización no encontrada");

    let hasPermission = org.owner_id === usuario.id;

    if (!hasPermission) {
      const { data: member } = await admin
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
    
    // Chequear límites del plan
    const { getOrganizationPlan, PLAN_LIMITS } = await import("@/lib/limits");
    const plan = await getOrganizationPlan(orgId);
    const limits = PLAN_LIMITS[plan];

    const { count: membersCount } = await admin.from("organization_members").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "active");
    const { count: pendingCount } = await admin.from("organization_invitations").select("*", { count: "exact", head: true }).eq("organization_id", orgId).eq("status", "pending");
    
    const totalMembersAndInvites = (membersCount || 0) + (pendingCount || 0) + 1; // +1 por el owner (si no está en members, o si está, membersCount lo cubre. Owner cuenta como miembro. Para no errar sumamos +1 por seguridad o asumimos que owner está en members. En BackRoom el owner NO está en members, así que owner es +1).
    if (totalMembersAndInvites > limits.max_members) {
      throw new ApiError(422, `Límite de miembros alcanzado para el plan ${plan.toUpperCase()} (máximo ${limits.max_members} usuarios)`);
    }

    const emailLower = input.email.toLowerCase().trim();

    // Verify if target email is already the owner or a member
    const { data: existingUser } = await admin
      .from("usuarios")
      .select("id")
      .eq("correo", emailLower)
      .maybeSingle();

    if (existingUser) {
      if (org.owner_id === existingUser.id) {
        throw new ApiError(409, "El usuario ya es propietario de esta organización");
      }

      const { data: existingMember } = await admin
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
    const { data: existingInvite } = await admin
      .from("organization_invitations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("email", emailLower)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      throw new ApiError(409, "Ya hay una invitación pendiente para este correo");
    }

    // Generate secure token (64 hex characters)
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { data: invitation, error: insertError } = await admin
      .from("organization_invitations")
      .insert({
        organization_id: orgId,
        created_by: usuario.id,
        email: emailLower,
        role: input.role,
        token,
        status: "pending",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError || !invitation) {
      console.error("Error creating invitation in database:", insertError);
      throw new ApiError(500, "Error al crear la invitación");
    }

    // Send email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const inviteLink = `${baseUrl}/invitaciones/${token}`;
        
        // En entorno local, siempre imprimimos el link por si no llega el correo
        if (process.env.NODE_ENV === "development") {
          console.log(`\n📧 [DEV] Link de invitación para ${emailLower}: ${inviteLink}\n`);
        }

        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "BackRoom <onboarding@resend.dev>",
            to: emailLower,
            subject: "Has sido invitado a unirte a un BackRoom",
            html: `
              <h2>¡Hola!</h2>
              <p>Has sido invitado a unirte a una organización en BackRoom.</p>
              <p>Tu rol asignado será: <strong>${input.role}</strong>.</p>
              <br/>
              <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
              <a href="${inviteLink}" style="padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px;">
                Aceptar Invitación
              </a>
              <br/><br/>
              <p>Este enlace expirará el: ${new Date(expiresAt).toLocaleDateString("es-CO")}</p>
            `,
          });
        } catch (error: any) {
          // Si estamos en desarrollo y el error es por sandbox de Resend, lo perdonamos
          if (process.env.NODE_ENV === "development" && error?.name === "validation_error") {
            console.warn(`\n⚠️ [DEV] Resend bloqueó el correo (Sandbox). ¡Usa el enlace de arriba para continuar!\n`);
          } else {
            throw error; // Si es otro error o estamos en producción, que explote
          }
        }
      } catch (err) {
        console.error("Error sending invitation email:", err);
        // We don't throw here so the invitation is still created even if email fails in dev
      }
    }

    return invitation;
  }

  static async getInvitationByToken(token: string) {
    const admin = createAdminClient();

    const { data: invitation, error } = await admin
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
      await admin
        .from("organization_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id);
      throw new ApiError(400, "Esta invitación ha expirado");
    }

    return invitation;
  }

  static async getInvitationInfo(token: string) {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("organization_invitations")
      .select("*, organizations(name, logo_url)")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) throw new ApiError(404, "Invitación no encontrada");
    if (data.status !== "pending") throw new ApiError(400, "La invitación ya fue aceptada, revocada o expiró");

    // Verificar expiración sin mutar
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    if (now > expiresAt) {
      throw new ApiError(400, "Esta invitación ha expirado");
    }

    return {
      email: data.email,
      role: data.role,
      organization: data.organizations
    };
  }

  static async acceptInvitation(authId: string, token: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado");

    const admin = createAdminClient();
    const invitation = await this.getInvitationByToken(token); // Validates expiration and status

    if (invitation.email.toLowerCase() !== usuario.correo.toLowerCase()) {
      throw new ApiError(403, "Esta invitación fue enviada a otro correo electrónico");
    }

    // MVP: 1 usuario = 1 organización (como owner o miembro)
    const { data: ownedOrg } = await admin
      .from("organizations")
      .select("id")
      .eq("owner_id", usuario.id)
      .maybeSingle();

    const { data: memberOrg } = await admin
      .from("organization_members")
      .select("id")
      .eq("user_id", usuario.id)
      .eq("status", "active")
      .maybeSingle();

    if (ownedOrg || memberOrg) {
      throw new ApiError(409, "Ya perteneces a una organización. Debes abandonarla antes de unirte a otra.");
    }

    // Begin transaction-like operations
    // 1. Mark as accepted
    const { error: updateError } = await admin
      .from("organization_invitations")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error updating invitation status:", updateError);
      throw new ApiError(500, "No se pudo aceptar la invitación");
    }

    // 2. Insert into members
    const { error: insertError } = await admin
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
        console.error("Error inserting organization member:", insertError);
        throw new ApiError(500, "No se pudo vincular a la organización");
      }
    }

    const { AuditService } = await import("@/lib/services/audit.service");
    await AuditService.logAction({
      orgId: invitation.organization_id,
      actorId: usuario.id,
      action: "MEMBER_JOINED",
      targetType: "member",
      targetId: usuario.id,
      details: { role: invitation.role }
    });

    return { organization_id: invitation.organization_id };
  }

  static async revokeInvitation(authId: string, orgId: string, invitationId: string) {
    const usuario = await getUsuarioInterno(authId);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado");

    const admin = createAdminClient();

    // Verify user is owner or admin
    const { data: org } = await admin
      .from("organizations")
      .select("owner_id")
      .eq("id", orgId)
      .maybeSingle();

    if (!org) throw new ApiError(404, "Organización no encontrada");

    let hasPermission = org.owner_id === usuario.id;

    if (!hasPermission) {
      const { data: member } = await admin
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

    const { error } = await admin
      .from("organization_invitations")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", invitationId)
      .eq("organization_id", orgId);

    if (error) {
      console.error("Error revoking invitation:", error);
      throw new ApiError(500, "No se pudo revocar la invitación");
    }
  }

  static async listPendingInvitations(orgId: string) {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("organization_invitations")
      .select("*")
      .eq("organization_id", orgId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error listing pending invitations:", error);
      throw new ApiError(500, "Error al listar invitaciones");
    }

    return data;
  }
}


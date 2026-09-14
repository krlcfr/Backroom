import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUsuarioInterno } from "@/lib/auth/rbac";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const admin = createAdminClient();

    const { data, error } = await admin
      .from("organization_invitations")
      .select("*, organizations(name, logo_url)")
      .eq("email", usuario.correo)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user invitations:", error);
      return NextResponse.json({ error: "Error al obtener invitaciones" }, { status: 500 });
    }

    // Filtrar invitaciones que no han expirado
    const now = new Date();
    const validInvitations = data.filter((inv) => {
      const expiresAt = new Date(inv.expires_at);
      return now <= expiresAt;
    });

    return NextResponse.json({ data: { invitations: validInvitations } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

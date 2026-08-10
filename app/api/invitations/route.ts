import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner, getUsuarioInterno } from "@/lib/auth/rbac";
import { z } from "zod";

const createInvitationSchema = z.object({
  backroom_id: z.string().uuid(),
  email: z.string().email(),
});

// POST /api/invitations — BE-49
// Crea una invitación por email a un backroom. Solo el propietario puede invitar.
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createInvitationSchema.parse(body);

    const owner = await isOwner(user.id, input.backroom_id);
    if (!owner) throw new ApiError(403, "Solo el propietario puede invitar miembros.");

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    const supabase = await createClient();

    // Verificar que no exista ya una invitación activa para este email en este backroom
    const { data: existing } = await supabase
      .from("invitaciones")
      .select("id")
      .eq("backroom_id", input.backroom_id)
      .eq("email", input.email)
      .eq("activa", true)
      .maybeSingle();

    if (existing) throw new ApiError(409, "Ya existe una invitación activa para este email.");

    const codigo = `BR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const expira_en = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("invitaciones")
      .insert({
        backroom_id: input.backroom_id,
        creado_por: usuario.id,
        email: input.email,
        codigo,
        activa: true,
        expira_en,
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo crear la invitación.");

    return NextResponse.json({ data: { invitation: data } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { isOwner } from "@/lib/auth/rbac";
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

    const supabase = await createClient();

    // Verificar que no exista ya una invitación activa para este email en este backroom
    // TODO: descomentar cuando la tabla `invitations` exista en Supabase
    /*
    const { data: existing } = await supabase
      .from("invitations")
      .select("id")
      .eq("backroom_id", input.backroom_id)
      .eq("email", input.email)
      .eq("active", true)
      .maybeSingle();

    if (existing) throw new ApiError(409, "Ya existe una invitación activa para este email.");

    const token = crypto.randomUUID();
    const code = `BR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("invitations")
      .insert({
        backroom_id: input.backroom_id,
        email: input.email,
        token,
        code,
        invited_by: user.id,
        active: true,
        expires_at,
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo crear la invitación.");

    return NextResponse.json({ data: { invitation: data } }, { status: 201 });
    */

    // Placeholder hasta que la tabla `invitations` exista en Supabase
    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `invitations` en Supabase." } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

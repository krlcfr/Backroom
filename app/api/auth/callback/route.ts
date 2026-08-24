import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";

function baseUsername(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}): string {
  const metadata = user.user_metadata ?? {};
  const providerUsername =
    (metadata.user_name as string) ?? (metadata.preferred_username as string) ?? null;
  const fullName =
    (metadata.full_name as string) ?? (metadata.name as string) ?? null;
  const emailPrefix = user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? "";

  const candidate = providerUsername || fullName?.split(" ")[0] || emailPrefix || "usuario";
  return candidate.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 50) || "usuario";
}

// GET /api/auth/callback — BE-67
// Callback OAuth2: intercambia `code` por sesión, crea el perfil si no existe
// y redirige según contexto (RF-07): superadmin → /admin, con backroom → /dashboard, sin org → /demo/backroom
export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=oauth_cancelado`);
    }

    if (!code) {
      throw new ApiError(400, "Código de autorización no proporcionado.");
    }

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      return NextResponse.redirect(`${origin}/login?error=oauth_fallido`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=oauth_fallido`);
    }

    const supabaseAdmin = createAdminClient();

    // Perfil existente por auth_id
    const { data: existing } = await supabaseAdmin
      .from("usuarios")
      .select("id, es_superadmin")
      .eq("auth_id", user.id)
      .maybeSingle();

    let perfilId = existing?.id ?? null;
    let esSuperadmin = existing?.es_superadmin ?? false;

    if (!perfilId) {
      if (user.email) {
        // Buscar si existe un perfil huérfano con este correo
        const { data: existingByEmail } = await supabaseAdmin
          .from("usuarios")
          .select("id, es_superadmin")
          .eq("correo", user.email)
          .maybeSingle();

        if (existingByEmail) {
          await supabaseAdmin
            .from("usuarios")
            .update({ auth_id: user.id })
            .eq("id", existingByEmail.id);

          perfilId = existingByEmail.id;
          esSuperadmin = existingByEmail.es_superadmin;
        }
      }
    }

    if (!perfilId) {
      // Username único: base + sufijo si colisiona
      const base = baseUsername(user);
      let username = base;
      for (let i = 2; i <= 50; i++) {
        const { data: colision } = await supabaseAdmin
          .from("usuarios")
          .select("id")
          .eq("username", username)
          .maybeSingle();
        if (!colision) break;
        username = `${base.slice(0, 40)}_${i}`;
      }

      const { data: insert, error: insertError } = await supabaseAdmin
        .from("usuarios")
        .insert({
          auth_id: user.id,
          username,
          nombre_completo:
            (user.user_metadata?.full_name as string) ??
            (user.user_metadata?.name as string) ??
            user.email ??
            username,
          correo: user.email ?? "",
        })
        .select("id, es_superadmin")
        .single();

      if (insertError || !insert) {
        return NextResponse.redirect(`${origin}/login?error=oauth_fallido`);
      }

      perfilId = insert.id;
      esSuperadmin = insert.es_superadmin ?? false;
    }

    // Verificar si tiene organización (propetario o miembro)
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("owner_id", perfilId)
      .maybeSingle();

    const { data: orgMember } = await supabaseAdmin
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", perfilId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (org || orgMember) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    const { data: member } = await supabaseAdmin
      .from("backroom_miembros")
      .select("backroom_id")
      .eq("usuario_id", perfilId)
      .limit(1)
      .maybeSingle();
    const { data: owner } = await supabaseAdmin
      .from("backrooms")
      .select("id")
      .eq("propietario_id", perfilId)
      .limit(1)
      .maybeSingle();

    if (member || owner) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // Ya no existe el modo Demo; los usuarios sin org deben crear una
    return NextResponse.redirect(`${origin}/org/crear`);
  } catch (error) {
    return handleApiError(error);
  }
}

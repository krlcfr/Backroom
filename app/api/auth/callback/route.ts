import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/auth/callback — BE-67
// Callback OAuth2: intercambia `code` por sesión y redirige según contexto
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

    // TODO: verificar si el usuario ya tiene perfil en `usuarios`, si no, crearlo
    // TODO: redirigir según contexto (org / demo / superadmin)

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (error) {
    return handleApiError(error);
  }
}

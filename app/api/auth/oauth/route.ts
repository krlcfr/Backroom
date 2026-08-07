import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkRateLimit } from "@/lib/auth/rate-limit";

// POST /api/auth/oauth — BE-67
// Body: { "provider": "google" | "github" }
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anon";
    const rl = checkRateLimit(`oauth:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT", message: "Demasiadas solicitudes", details: { retryAfter: rl.retryAfter } } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const provider = body?.provider;

    if (provider !== "google" && provider !== "github") {
      throw new ApiError(400, "Proveedor no válido. Use 'google' o 'github'.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });

    if (error || !data.url) {
      throw new ApiError(500, "No se pudo iniciar el flujo OAuth2.");
    }

    return NextResponse.json({ data: { url: data.url } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

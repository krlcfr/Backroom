import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError, ApiError } from "@/lib/api-error";
import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";
import { verifyCaptchaToken } from "@/lib/auth/verify-captcha";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anon";
    const rl = checkRateLimit(`login:${ip}`);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await request.json();
    const input = loginSchema.parse(body);

    const captchaValid = await verifyCaptchaToken(input.captchaToken, ip);
    if (!captchaValid) {
      throw new ApiError(400, "Verificación de seguridad fallida. Intentá de nuevo.", "captcha");
    }

    const usuario = await AuthService.login(input);

    return NextResponse.json(usuario, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

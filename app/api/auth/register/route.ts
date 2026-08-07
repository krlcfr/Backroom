import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anon";
    const rl = checkRateLimit(`register:${ip}`);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await request.json();
    const input = registerSchema.parse(body);

    const usuario = await AuthService.register(input);

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

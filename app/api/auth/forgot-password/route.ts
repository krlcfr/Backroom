import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anon";
    const rl = checkRateLimit(`forgot:${ip}`);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await request.json();
    const input = forgotPasswordSchema.parse(body);

    await AuthService.forgotPassword(input);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

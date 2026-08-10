import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";
import { checkRateLimit, rateLimitResponse } from "@/lib/auth/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anon";
    const rl = checkRateLimit(`reset:${ip}`);
    if (!rl.allowed) return rateLimitResponse(rl.retryAfter!);

    const body = await request.json();
    const input = resetPasswordSchema.parse(body);

    await AuthService.resetPassword(input);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

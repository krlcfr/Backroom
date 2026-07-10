import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const usuario = await AuthService.login(input);

    return NextResponse.json(usuario, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/schemas";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    const usuario = await AuthService.register(input);

    return NextResponse.json(usuario, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

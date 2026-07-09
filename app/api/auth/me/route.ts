import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const user = await requireAuth();
    const perfil = await AuthService.getProfile(user.id);

    return NextResponse.json(perfil, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

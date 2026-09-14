import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    console.log("[DEBUG] /api/auth/me - llamando a requireAuth...");
    const user = await requireAuth();
    console.log("[DEBUG] /api/auth/me - requireAuth OK, llamando a getProfile...");
    const perfil = await AuthService.getProfile(user.id);
    console.log("[DEBUG] /api/auth/me - getProfile OK, retornando...");

    return NextResponse.json(
      {
        ...perfil,
        avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

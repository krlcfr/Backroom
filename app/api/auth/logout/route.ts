import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { handleApiError } from "@/lib/api-error";

export async function POST() {
  try {
    await AuthService.logout();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

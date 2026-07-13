import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createBackroomSchema } from "@/lib/validations/schemas";
import { BackroomsService } from "@/lib/services/backrooms.service";
import { handleApiError } from "@/lib/api-error";

export async function GET() {
  try {
    await requireAuth();
    const backrooms = await BackroomsService.listForUser();

    return NextResponse.json(backrooms, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const input = createBackroomSchema.parse(body);

    const backroom = await BackroomsService.create(user.id, input);

    return NextResponse.json(backroom, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

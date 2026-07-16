import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { BackroomsService } from "@/lib/services/backrooms.service";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    await requireAuth();
    const { backroomId } = await params;

    const backroom = await BackroomsService.getById(backroomId);

    return NextResponse.json(backroom, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { backroomId } = await params;

    await BackroomsService.deleteById(user.id, backroomId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

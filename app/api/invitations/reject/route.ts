import { NextRequest, NextResponse } from "next/server";
import { InvitationsService } from "@/lib/services/invitations.service";
import { handleApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Falta el token de invitación" }, { status: 400 });
    }

    const result = await InvitationsService.rejectInvitation(user.id, token);

    return NextResponse.json({ message: "Invitación rechazada", result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

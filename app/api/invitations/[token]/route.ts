import { NextRequest, NextResponse } from "next/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/invitations/[token] — BE-50
// Valida un token de invitación (activo y no expirado). Endpoint público.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // TODO: descomentar cuando la tabla `invitations` exista en Supabase
    /*
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invitations")
      .select("id, email, backroom_id, active, expires_at, backrooms(nombre)")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) throw new ApiError(404, "Invitación no encontrada.");
    if (!data.active) throw new ApiError(404, "Invitación revocada.");
    if (new Date(data.expires_at) < new Date()) throw new ApiError(404, "Invitación expirada.");

    return NextResponse.json({
      data: {
        invitation: {
          backroom: { name: data.backrooms?.nombre },
          email: data.email,
          valid: true,
        },
      },
    }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `invitations` en Supabase.", token } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

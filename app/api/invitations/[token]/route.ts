import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/invitations/[token] — BE-50
// Valida un token de invitación (activo y no expirado). Endpoint público.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("invitaciones")
      .select("id, codigo, backroom_id, activa, expira_en, backrooms(nombre)")
      .eq("link_token", token)
      .maybeSingle();

    if (error || !data) throw new ApiError(404, "Invitación no encontrada.");
    if (!data.activa) throw new ApiError(404, "Invitación revocada.");
    if (data.expira_en && new Date(data.expira_en) < new Date()) {
      throw new ApiError(404, "Invitación expirada.");
    }

    return NextResponse.json({
      data: {
        invitation: {
          backroom: { name: (data.backrooms as any)?.nombre },
          codigo: data.codigo,
          valid: true,
        },
      },
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

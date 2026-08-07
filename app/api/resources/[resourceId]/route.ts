import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/resources/[resourceId] — BE-42
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAuth();
    const { resourceId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recursos")
      .select("id, nombre, tipo, url, tamano_bytes, sala_id, subido_por, created_at")
      .eq("id", resourceId)
      .maybeSingle();

    if (error || !data) throw new ApiError(404, "Recurso no encontrado.");

    return NextResponse.json({ data: { resource: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/resources/[resourceId] — BE-43
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAuth();
    const { resourceId } = await params;
    const supabase = await createClient();

    const { data: resource } = await supabase
      .from("recursos")
      .select("id, url")
      .eq("id", resourceId)
      .maybeSingle();

    if (!resource) throw new ApiError(404, "Recurso no encontrado.");

    const { error } = await supabase.from("recursos").delete().eq("id", resourceId);
    if (error) throw new ApiError(500, "No se pudo eliminar el recurso.");

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

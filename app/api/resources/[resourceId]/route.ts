import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/resources/[resourceId] — BE-42
// Obtiene un recurso con su signed URL de descarga.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAuth();
    const { resourceId } = await params;

    // TODO: implementar cuando tabla `resources` exista en Supabase
    /*
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources").select("*").eq("id", resourceId).maybeSingle();
    if (error || !data) throw new ApiError(404, "Recurso no encontrado.");

    let signedUrl: string | null = null;
    if (data.storage_path) {
      const { data: signed } = await supabase.storage
        .from("resources").createSignedUrl(data.storage_path, 3600);
      signedUrl = signed?.signedUrl ?? null;
    }
    return NextResponse.json({ data: { resource: { ...data, signedUrl } } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `resources` en Supabase.", resourceId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/resources/[resourceId] — BE-43
// Elimina un recurso. Solo el autor o propietario del backroom puede hacerlo.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requireAuth();
    const { resourceId } = await params;

    // TODO: implementar cuando tabla `resources` exista en Supabase
    /*
    const supabase = await createClient();
    const { data: resource } = await supabase
      .from("resources").select("id, storage_path").eq("id", resourceId).maybeSingle();
    if (!resource) throw new ApiError(404, "Recurso no encontrado.");

    if (resource.storage_path) {
      await supabase.storage.from("resources").remove([resource.storage_path]);
    }
    await supabase.from("resources").delete().eq("id", resourceId);
    return NextResponse.json({ data: { success: true } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `resources` en Supabase.", resourceId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

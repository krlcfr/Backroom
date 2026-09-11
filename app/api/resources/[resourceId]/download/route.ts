import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const user = await requireAuth();
    const supabaseAdmin = createAdminClient();
    const { resourceId } = await params;

    // Obtener info del recurso
    const { data: resource, error } = await supabaseAdmin
      .from("recursos")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (error || !resource) {
      console.error(error);
      throw new ApiError(404, "Recurso no encontrado");
    }

    // Descargar el PDF del Storage
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("resources") // The storage bucket is actually "resources"
      .download(resource.url);

    if (fileError || !fileData) {
      throw new ApiError(500, "Error leyendo PDF del storage");
    }

    const buffer = await fileData.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${resource.nombre}.pdf"`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

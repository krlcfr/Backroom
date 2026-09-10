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
    const supabase = await createClient();
    const { resourceId } = await params;

    // Obtener info del recurso
    const { data: resource, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (error || !resource) {
      throw new ApiError(404, "Recurso no encontrado");
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from("resources")
      .download(resource.ruta_archivo);

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

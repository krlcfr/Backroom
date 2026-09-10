import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { resourceId } = params;

    // Obtener info del recurso
    const { data: resource, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", resourceId)
      .single();

    if (error || !resource) {
      throw new ApiError(404, "Recurso no encontrado");
    }

    // Generar URL firmada
    const { data: urlData, error: urlError } = await supabase.storage
      .from("resources")
      .createSignedUrl(resource.ruta_archivo, 3600);

    if (urlError || !urlData) {
      throw new ApiError(500, "No se pudo generar la URL de descarga");
    }

    // Fetch the file on the server to avoid CORS issues on the client
    const fileRes = await fetch(urlData.signedUrl);
    if (!fileRes.ok) throw new ApiError(500, "Error leyendo PDF del storage");
    
    const buffer = await fileRes.arrayBuffer();

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

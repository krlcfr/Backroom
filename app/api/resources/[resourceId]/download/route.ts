import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
      .from("recursos")
      .download(resource.url);

    if (fileError || !fileData) {
      throw new ApiError(500, "Error leyendo PDF del storage");
    }

    const buffer = await fileData.arrayBuffer();

    // Obtener nombre base quitando la extensión si existe
    let baseName = resource.nombre || "documento";
    if (baseName.toLowerCase().endsWith('.pdf')) {
      baseName = baseName.slice(0, -4);
    }
    
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const finalFileName = `${baseName}_br_${today}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${finalFileName}"`
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

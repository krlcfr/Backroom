import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabaseAdmin = createAdminClient();
    const { id } = await params;

    const { data: wf, error } = await supabaseAdmin
      .from("document_workflows")
      .select("*, recursos(nombre)")
      .eq("id", id)
      .single();

    if (error || !wf) throw new ApiError(404, "Flujo no encontrado");

    let storagePath = wf.traveling_file_path;
    if (!storagePath) {
      const { data: rec } = await supabaseAdmin.from("recursos").select("url").eq("id", wf.document_id).single();
      if (rec) storagePath = rec.url;
    }

    if (!storagePath) throw new ApiError(404, "Archivo no encontrado");

    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("recursos")
      .download(storagePath);

    if (fileError || !fileData) {
      throw new ApiError(500, "Error descargando documento final");
    }

    const buffer = await fileData.arrayBuffer();
    const fileName = (wf.recursos as any)?.nombre || "documento_final";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"_firmado.pdf\""
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

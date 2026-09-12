
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "No autorizado");

    // Fetch resources in this room that have a completed workflow
    const { data: workflows, error } = await supabase
      .from("document_workflows")
      .select(`
        id,
        status,
        updated_at,
        recursos!inner (
          id,
          nombre,
          tipo,
          url,
          tamano_bytes,
          created_at,
          sala_id,
          usuarios (
            nombre_completo
          )
        )
      `)
      .eq("status", "completed")
      .eq("recursos.sala_id", roomId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "Error al obtener documentos finalizados");
    }

    const finalDocs = (workflows || []).map(wf => {
      const res = Array.isArray(wf.recursos) ? wf.recursos[0] : wf.recursos;
      return {
        ...res,
        workflow_id: wf.id,
        finalized_at: wf.updated_at
      };
    });

    return NextResponse.json(finalDocs, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}


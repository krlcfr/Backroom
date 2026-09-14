import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getUsuarioInterno, isOwner } from "@/lib/auth/rbac";

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "No autorizado");

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(401, "Usuario interno no encontrado");

    // Check if owner or superadmin
    let hasFullAccess = false;
    if (usuario.es_superadmin) {
      hasFullAccess = true;
    } else {
      // Find backroom_id for this room
      const { data: roomData } = await supabase
        .from("salas")
        .select("backroom_id")
        .eq("id", roomId)
        .single();
        
      if (roomData) {
        hasFullAccess = await isOwner(user.id, roomData.backroom_id);
      }
    }

    let query = supabase
      .from("document_workflows")
      .select(`
        id,
        status,
        updated_at,
        flow_graph_json,
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

    // Si NO tiene full access, solo ve los que se le asignaron como destinatario final
    if (!hasFullAccess) {
      query = query.filter("flow_graph_json->>final_recipient_id", "eq", usuario.id);
    }

    const { data: workflows, error } = await query;

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

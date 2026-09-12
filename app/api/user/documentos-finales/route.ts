
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) throw new ApiError(401, "No autorizado");

    // Fetch workflows that are completed and have final_recipient_id == user.id
    // Wait, Supabase Postgres filter on jsonb: flow_graph_json->>final_recipient_id
    const { data: workflows, error } = await supabase
      .from("document_workflows")
      .select(`
        id,
        status,
        updated_at,
        flow_graph_json,
        recursos (
          id,
          nombre,
          tipo,
          url,
          tamano_bytes,
          created_at,
          sala_id
        )
      `)
      .eq("status", "completed")
      .filter("flow_graph_json->>final_recipient_id", "eq", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new ApiError(500, "Error fetching final documents: " + error.message);
    }

    // Map them to look like resources but with workflow data
    const finalDocs = (workflows || []).map(wf => {
      const res = Array.isArray(wf.recursos) ? wf.recursos[0] : wf.recursos;
      return {
        ...res,
        workflow_id: wf.id,
        finalized_at: wf.updated_at
      };
    });

    return NextResponse.json({ data: finalDocs }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}


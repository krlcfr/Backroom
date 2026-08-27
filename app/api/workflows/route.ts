import { NextRequest, NextResponse } from "next/server";
import { WorkflowsService } from "@/lib/services/workflows.service";
import { ApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validación mínima
    if (!body.organization_id || !body.document_id || !body.title) {
      throw new ApiError(400, "Faltan campos obligatorios");
    }

    const workflow = await WorkflowsService.createWorkflow({
      organization_id: body.organization_id,
      document_id: body.document_id,
      title: body.title,
      flow_graph_json: body.flow_graph_json || { nodes: [], edges: [] },
      parsed_nodes: body.parsed_nodes || []
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/workflows]", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

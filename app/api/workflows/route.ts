import { NextRequest, NextResponse } from "next/server";
import { WorkflowsService } from "@/lib/services/workflows.service";
import { handleApiError, ApiError } from "@/lib/api-error";
import { z } from "zod";

const createWorkflowSchema = z.object({
  organization_id: z.string().uuid(),
  document_id: z.string().uuid(),
  title: z.string().min(1),
  flow_graph_json: z.any(),
  nodes: z.array(z.object({
    reactFlowId: z.string(),
    cargo_id: z.string().uuid(),
    assigned_user_id: z.string().uuid().optional(),
    node_type: z.enum(['linear', 'parallel', 'final']),
    action_required: z.enum(['sign', 'approve', 'review']),
    step_order: z.number().int().min(1)
  })).min(1, "El flujo debe tener al menos un nodo")
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validación con Zod
    const validatedData = createWorkflowSchema.parse(body);

    const workflow = await WorkflowsService.createWorkflow(validatedData);

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const documentId = url.searchParams.get("document_id");

    if (!documentId) {
      throw new ApiError(400, "El parámetro document_id es requerido");
    }

    const workflow = await WorkflowsService.getWorkflowByDocument(documentId);
    
    if (!workflow) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ data: workflow }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/workflows]", error);
    return handleApiError(error);
  }
}

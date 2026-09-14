import { NextRequest, NextResponse } from "next/server";
import { WorkflowsService } from "@/lib/services/workflows.service";
import { ApiError } from "@/lib/api-error";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  try {
    const { id, nodeId } = await params;
    const body = await req.json();
    const action = body.action; // 'approved' o 'rejected'
    const rejectionReason = body.rejection_reason;

    if (action !== 'approved' && action !== 'rejected') {
      throw new ApiError(400, "Acción inválida. Debe ser 'approved' o 'rejected'.");
    }

    const result = await WorkflowsService.approveNode(id, nodeId, action, rejectionReason);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/workflows/:id/nodes/:nodeId/approve]", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

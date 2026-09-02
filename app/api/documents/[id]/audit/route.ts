import { NextRequest, NextResponse } from "next/server";
import { AuditService } from "@/lib/services/audit.service";
import { ApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new ApiError(401, "No autorizado");
    }

    const resolvedParams = await params;
    const documentId = resolvedParams.id;
    const logs = await AuditService.listLogsByDocument(user.id, documentId);

    return NextResponse.json({ data: logs }, { status: 200 });
  } catch (error: any) {
    console.error("[GET /api/documents/:id/audit]", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

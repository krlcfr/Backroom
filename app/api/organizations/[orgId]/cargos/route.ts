import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CargosService } from "@/lib/services/cargos.service";
import { createCargoSchema } from "@/lib/validations/schemas";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const cargos = await CargosService.listByOrg(session.user.id, orgId);
    return NextResponse.json({ cargos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const input = createCargoSchema.parse(body);

    const cargo = await CargosService.create(session.user.id, orgId, input);
    return NextResponse.json({ cargo }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";
import { createClient } from "@/lib/supabase/server";
import { AuditService } from "@/lib/services/audit.service";
import { z } from "zod";

const createAnnotationSchema = z.object({
  id: z.string().uuid(),
  quote: z.string(),
  comment: z.string().min(1),
  position_data: z.any().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; docId: string }> }
) {
  try {
    await requireAuth(); // Solo usuarios autenticados
    const { docId } = await params;
    const supabase = await createClient();

    const { data: annotations, error } = await supabase
      .from("document_annotations")
      .select(`
        *,
        usuarios (
          nombre_completo,
          avatar_url
        )
      `)
      .eq("document_id", docId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new ApiError(500, `Error fetching annotations: ${error.message}`);
    }

    return NextResponse.json({ data: annotations }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string; docId: string }> }
) {
  try {
    const user = await requireAuth();
    const { docId } = await params;
    const body = await req.json();

    const validatedData = createAnnotationSchema.parse(body);
    const supabase = await createClient();

    const { data: annotation, error } = await supabase
      .from("document_annotations")
      .insert({
        id: validatedData.id,
        document_id: docId,
        user_id: user.id, // from auth
        quote: validatedData.quote,
        comment: validatedData.comment,
        position_data: validatedData.position_data
      })
      .select(`
        *,
        usuarios (
          nombre_completo,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new ApiError(500, `Error al crear anotación: ${error.message}`);
    }

    // Opcional: Obtener organization_id para la auditoría (a través del recurso/sala)
    const { data: docData } = await supabase
      .from("recursos")
      .select("salas (backrooms (organizacion_id))")
      .eq("id", docId)
      .single();
    
    // @ts-ignore
    const orgId = docData?.salas?.backrooms?.organizacion_id;

    if (orgId) {
      // Necesitamos el id de la tabla usuarios, no de auth, para auditoría
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (userProfile) {
        await AuditService.logAction({
          orgId: orgId,
          actorId: userProfile.id,
          // @ts-ignore (We will add ANNOTATION_CREATED to audit.service.ts)
          action: "ANNOTATION_CREATED",
          targetType: "resource",
          targetId: docId,
          details: {
            annotation_id: annotation.id,
            quote: validatedData.quote
          }
        });
      }
    }

    return NextResponse.json({ data: annotation }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

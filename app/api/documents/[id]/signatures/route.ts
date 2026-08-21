import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const recursoId = resolvedParams.id;
    const { signatures } = await request.json();

    if (!Array.isArray(signatures)) {
      throw new ApiError(400, "Formato de firmas inválido");
    }

    const supabase = await createClient();
    const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", user.id).single();
    if (!perfil) throw new ApiError(404, "Usuario interno no encontrado");

    // Borrar firmas anteriores de este usuario en este documento (para sobreescribir)
    await supabase
      .from("document_signatures")
      .delete()
      .eq("recurso_id", recursoId)
      .eq("usuario_id", perfil.id);

    // Insertar las nuevas firmas
    if (signatures.length > 0) {
      const inserts = signatures.map((sig: any) => ({
        recurso_id: recursoId,
        usuario_id: perfil.id,
        signature_image_url: sig.url,
        page_number: sig.page,
        pos_x: sig.x,
        pos_y: sig.y,
        width: 150,
        height: 100
      }));

      const { error: insertError } = await supabase.from("document_signatures").insert(inserts);
      if (insertError) {
        console.error("Error guardando firmas:", insertError);
        throw new ApiError(500, "No se pudieron guardar las posiciones de las firmas");
      }
    }

    return NextResponse.json({ success: true, message: "Firmas guardadas exitosamente" });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const resolvedParams = await params;
    const recursoId = resolvedParams.id;
    
    const supabase = await createClient();
    const { data: signatures, error } = await supabase
      .from("document_signatures")
      .select("*")
      .eq("recurso_id", recursoId);

    if (error) throw new ApiError(500, "Error obteniendo firmas");

    // Formatear para el frontend
    const formatted = signatures.map(sig => ({
      id: sig.id,
      url: sig.signature_image_url,
      x: sig.pos_x,
      y: sig.pos_y,
      page: sig.page_number
    }));

    return NextResponse.json({ signatures: formatted });
  } catch (error) {
    return handleApiError(error);
  }
}

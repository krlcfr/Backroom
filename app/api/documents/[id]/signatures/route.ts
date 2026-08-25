import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { AuditService } from "@/lib/services/audit.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const resolvedParams = await params;
    const recursoId = resolvedParams.id;
    const { signatures } = await request.json(); // Array de firmas a guardar

    if (!Array.isArray(signatures)) {
      throw new ApiError(400, "Formato de firmas inválido");
    }

    const supabase = await createClient();
    const { data: perfil } = await supabase.from("usuarios").select("id").eq("auth_id", user.id).single();
    if (!perfil) throw new ApiError(404, "Usuario interno no encontrado");

    // Verificar si es dueño o creador
    const { data: recurso } = await supabase
      .from("recursos")
      .select("usuario_id, salas(backrooms(propietario_id, organizacion_id))")
      .eq("id", recursoId)
      .single();
    // @ts-expect-error - Supabase type inference bug with nested relations
    const isOwner = recurso?.salas?.backrooms?.propietario_id === perfil.id || (recurso?.salas as any)?.[0]?.backrooms?.propietario_id === perfil.id;
    const isCreator = recurso?.usuario_id === perfil.id;

    const upserts = [];
    
    for (const sig of signatures) {
      // Si la firma es para otro usuario, solo el dueño o el creador puede asignarla
      if (sig.usuario_id && sig.usuario_id !== perfil.id && !isOwner && !isCreator) {
        throw new ApiError(403, "No puedes asignar o modificar firmas de otros usuarios");
      }

      const targetUserId = sig.usuario_id || perfil.id;

      upserts.push({
        ...(sig.id && !sig.id.startsWith("temp-") ? { id: sig.id } : {}),
        recurso_id: recursoId,
        usuario_id: targetUserId,
        signature_image_url: sig.url || null, // null significa que es un placeholder
        page_number: sig.page,
        pos_x: sig.x,
        pos_y: sig.y,
        width: 150,
        height: 100
      });
    }

    // Si el usuario no es owner, no debería poder borrar cajas, solo hacer update de su URL.
    // Si es owner, borramos todo lo que no esté en la lista nueva (para reflejar eliminaciones en el canvas)
    if (isOwner) {
      const idsToKeep = signatures.map((s: any) => s.id).filter((id: string) => id && !id.startsWith("temp-"));
      let query = supabase.from("document_signatures").delete().eq("recurso_id", recursoId);
      if (idsToKeep.length > 0) {
        query = query.not("id", "in", `(${idsToKeep.join(',')})`);
      }
      await query;
    }

    if (upserts.length > 0) {
      const { error: upsertError } = await supabase.from("document_signatures").upsert(upserts, { onConflict: "id" });
      if (upsertError) {
        console.error("Error guardando firmas:", upsertError);
        throw new ApiError(500, "No se pudieron guardar las posiciones de las firmas");
      }
      
      // @ts-expect-error - Bug de tipos anidados
      const orgId = recurso?.salas?.backrooms?.organizacion_id || (recurso?.salas as any)?.[0]?.backrooms?.organizacion_id;
      if (orgId) {
        await AuditService.logAction({
          orgId,
          actorId: perfil.id,
          action: "DOCUMENT_SENT_FOR_SIGNATURE",
          targetType: "resource",
          targetId: recursoId,
          details: { signaturesAssigned: upserts.length }
        }).catch(console.error);
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
      .select("*, usuarios(id, nombre_completo, correo)")
      .eq("recurso_id", recursoId);

    if (error) throw new ApiError(500, "Error obteniendo firmas");

    // Formatear para el frontend
    const formatted = signatures.map(sig => ({
      id: sig.id,
      url: sig.signature_image_url, // Puede ser null
      x: sig.pos_x,
      y: sig.pos_y,
      page: sig.page_number,
      usuario_id: sig.usuario_id,
      nombre_completo: (sig.usuarios as any)?.nombre_completo || (sig.usuarios as any)?.correo || "Usuario Desconocido"
    }));

    return NextResponse.json({ signatures: formatted });
  } catch (error) {
    return handleApiError(error);
  }
}

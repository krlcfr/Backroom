import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabaseAdmin = createAdminClient();
    const { id } = await params;

    const { data: wf, error } = await supabaseAdmin
      .from("document_workflows")
      .select("*, recursos(nombre)")
      .eq("id", id)
      .single();

    if (error || !wf) throw new ApiError(404, "Flujo no encontrado");

    let storagePath = wf.traveling_file_path;
    let isSigner = false;

    // Check if the user is currently an active signer (blind signing rule)
    const { data: perfil } = await supabaseAdmin.from('usuarios').select('id').eq('auth_id', user.id).single();
    if (perfil) {
      const { data: memberRows } = await supabaseAdmin.from('miembros_organizacion').select('cargo_id').eq('usuario_id', perfil.id);
      const cargoIds = memberRows?.map(m => m.cargo_id).filter(Boolean) || [];
      
      let query = supabaseAdmin
        .from('workflow_nodes')
        .select('id')
        .eq('workflow_id', id)
        .eq('status', 'in_turn')
        .eq('action_required', 'sign');
        
      if (cargoIds.length > 0) {
        query = query.or(`assigned_user_id.eq.${perfil.id},and(assigned_user_id.is.null,cargo_id.in.(${cargoIds.join(',')}))`);
      } else {
        query = query.eq('assigned_user_id', perfil.id);
      }
      
      const { data: activeSignNodes } = await query;
      if (activeSignNodes && activeSignNodes.length > 0) {
        isSigner = true;
      }
    }

    // Get original URL
    const { data: rec } = await supabaseAdmin.from("recursos").select("url").eq("id", wf.document_id).single();

    if (!storagePath || isSigner) {
      if (rec) storagePath = rec.url;
    }

    if (!storagePath) throw new ApiError(404, "Archivo no encontrado");

    // BYPASS NEXTJS CACHE
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from("recursos")
      .createSignedUrl(storagePath, 60, { transform: { format: 'origin' } });

    if (signedUrlError || !signedUrlData) {
      throw new ApiError(500, "Error obteniendo URL del documento final");
    }

    const fileRes = await fetch(signedUrlData.signedUrl + (signedUrlData.signedUrl.includes('?') ? '&' : '?') + 't=' + Date.now(), { cache: 'no-store' });
    if (!fileRes.ok) {
      throw new ApiError(500, "Error descargando documento final");
    }

    const buffer = await fileRes.arrayBuffer();
    
    // Obtener nombre base quitando la extensión si existe
    let baseName = (wf.recursos as any)?.nombre || "documento_final";
    if (baseName.toLowerCase().endsWith('.pdf')) {
      baseName = baseName.slice(0, -4);
    }
    
    const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const finalFileName = `${baseName}_br_${today}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${finalFileName}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

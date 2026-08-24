import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { checkPermission, checkRoomPermission, getUsuarioInterno } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleApiError, ApiError } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;

    // Verificar que el usuario tenga acceso a la sala
    // Necesitamos saber a qué backroom pertenece la sala
    const supabase = await createClient();
    const { data: sala, error: salaError } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // Verificar permiso 'salas_acceder'
    const hasAccess = await checkRoomPermission(user.id, roomId, "salas.acceder");
    if (!hasAccess) throw new ApiError(403, "No tienes acceso a esta sala");

    const canUpload = await checkRoomPermission(user.id, roomId, "recursos.subir");
    const canDelete = await checkRoomPermission(user.id, roomId, "recursos.eliminar");

    // Obtener recursos (usamos admin para evitar problemas de RLS de lectura temporalmente, o supabase si hay RLS en recursos)
    // El schema dice que la tabla recursos existe. Asumiremos que supabase normal sirve,
    // pero si RLS nos bloquea usamos admin.
    const supabaseAdmin = createAdminClient();
    const { data: recursos, error: recursosError } = await supabaseAdmin
      .from("recursos")
      .select("*, usuarios!recursos_subido_por_fkey(nombre_completo), salas(backroom_id, backrooms(propietario_id))")
      .eq("sala_id", roomId)
      .order("created_at", { ascending: false });

    if (recursosError) throw new ApiError(500, "Error al cargar recursos");

    // Filtrar recursos según visibility_mode
    const perfilId = (await getUsuarioInterno(user.id))?.id;
    let filteredRecursos = recursos;

    if (perfilId) {
      const { data: mySignatures } = await supabaseAdmin
        .from("document_signatures")
        .select("recurso_id")
        .eq("usuario_id", perfilId);

      const misRecursosFirmables = new Set(mySignatures?.map(s => s.recurso_id) || []);

      filteredRecursos = recursos.filter(res => {
        if (!res.visibility_mode || res.visibility_mode === "sala_completa") return true;
        // Si es 'solo_firmantes'
        const isOwner = res.salas?.backrooms?.propietario_id === perfilId;
        const isAssigned = misRecursosFirmables.has(res.id);
        return isOwner || isAssigned;
      });
    }

    // Limpiar metadata extra (salas)
    filteredRecursos = filteredRecursos.map(res => {
      const { salas, ...rest } = res;
      return rest;
    });

    // Generar Signed URLs para los recursos de tipo 'archivo'
    const resourcesWithUrls = await Promise.all(filteredRecursos.map(async (res) => {
      if (res.tipo !== "link" && res.tipo !== "youtube") {
        // Es un archivo físico guardado en Storage (res.url guarda el path)
        const { data } = await supabaseAdmin.storage
          .from("recursos")
          .createSignedUrl(res.url, 60 * 60); // 1 hora de validez
        
        return { ...res, signedUrl: data?.signedUrl || null };
      }
      return res; // Links y YouTube devuelven su URL original
    }));

    return NextResponse.json({ data: resourcesWithUrls, canUpload, canDelete }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;
    const body = await request.json();
    const { url, tipo, nombre } = body;

    if (!url || !tipo || !nombre) throw new ApiError(400, "Faltan datos obligatorios");

    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(401, "Usuario interno no encontrado");

    const supabase = await createClient();
    const { data: sala, error: salaError } = await supabase
      .from("salas")
      .select("backroom_id")
      .eq("id", roomId)
      .single();

    if (salaError || !sala) throw new ApiError(404, "Sala no encontrada");

    // Verificar permiso 'recursos.subir'
    const hasUploadPerm = await checkRoomPermission(user.id, roomId, "recursos.subir");
    if (!hasUploadPerm) throw new ApiError(403, "No tienes permiso para subir recursos");

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("recursos")
      .insert([{
        sala_id: roomId,
        subido_por: usuario.id,
        url,
        tipo,
        nombre
      }])
      .select()
      .single();

    if (error) throw new ApiError(500, `Error al guardar el recurso: ${error.message}`);

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

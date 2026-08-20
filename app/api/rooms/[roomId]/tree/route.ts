import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getUsuarioInterno } from "@/lib/auth/rbac";

// GET /api/rooms/[roomId]/tree — BE-38
// Devuelve el árbol completo de salas desde este nodo.
// Construye el árbol en memoria usando todas las salas del mismo backroom.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await requireAuth();
    const { roomId } = await params;
    const supabase = await createClient();
    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil de usuario no encontrado.");

    // Obtener el backroom_id de la sala raíz y el propietario del backroom
    const { data: rootSala } = await supabase
      .from("salas")
      .select("backroom_id, backrooms ( propietario_id )")
      .eq("id", roomId)
      .single();

    if (!rootSala) throw new ApiError(404, "Sala no encontrada.");
    const isOwner = rootSala.backrooms?.propietario_id === usuario.id;

    // Traer todas las salas del mismo backroom
    const { data: allSalas, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, parent_id, created_at")
      .eq("backroom_id", rootSala.backroom_id);

    if (error) throw new ApiError(500, "No se pudo obtener el árbol de salas.");

    let userPermissions = new Map<string, any>();
    let memberPermiso: string | null = null;

    if (!isOwner) {
      // Obtener permisos granulares de la tabla sala_permisos
      const { data: permisos } = await supabase
        .from("sala_permisos")
        .select("sala_id, salas_acceder")
        .eq("usuario_id", usuario.id);

      (permisos ?? []).forEach(p => userPermissions.set(p.sala_id, p));

      // Obtener el permiso general del miembro como fallback (contribuir / solo_visualizar)
      const { data: miembro } = await supabase
        .from("backroom_miembros")
        .select("permiso")
        .eq("backroom_id", rootSala.backroom_id)
        .eq("usuario_id", usuario.id)
        .maybeSingle();
      
      memberPermiso = miembro?.permiso ?? null;
    }

    function checkAccess(salaId: string) {
      if (isOwner) return true;
      const p = userPermissions.get(salaId);
      if (p !== undefined) return p.salas_acceder === true;
      // Fallback: si es 'contribuir' o 'solo_visualizar', tienen acceso a navegar el árbol por defecto
      return memberPermiso === "contribuir" || memberPermiso === "solo_visualizar";
    }

    // Construir árbol en memoria agregando hasAccess
    function buildTree(nodes: any[], parentId: string | null): any[] {
      return nodes
        .filter((n) => n.parent_id === parentId)
        .map((n) => ({ 
          ...n, 
          hasAccess: checkAccess(n.id),
          children: buildTree(nodes, n.id) 
        }));
    }

    const tree = buildTree(allSalas ?? [], roomId);

    // Si también se solicitó el árbol desde null (la raíz de la estructura de salas) en vez de roomId, 
    // pero el endpoint se llama con [roomId], la sala actual es la raíz de este subárbol.
    // Vamos a agregar la info de hasAccess a la propia sala raíz.
    const rootNode = allSalas?.find(s => s.id === roomId);
    let result = tree;
    
    // Si queremos retornar un solo nodo raíz con sus hijos:
    if (rootNode) {
      result = [{
        ...rootNode,
        hasAccess: checkAccess(rootNode.id),
        children: tree
      }];
    }

    return NextResponse.json({ data: { room: result } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

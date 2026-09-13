import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { handleApiError, ApiError } from "@/lib/api-error"
import { getUsuarioInterno } from "@/lib/auth/rbac"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    const user = await requireAuth()
    const { backroomId } = await params

    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    const usuario = await getUsuarioInterno(user.id)
    if (!usuario) throw new ApiError(404, "Perfil no encontrado")

    const { data: backroom } = await adminSupabase
      .from("backrooms")
      .select("propietario_id")
      .eq("id", backroomId)
      .single()

    const isOwner = backroom?.propietario_id === usuario.id

    const { data, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, created_at, parent_id, icono")
      .eq("backroom_id", backroomId)
      .order("created_at", { ascending: true })

    if (error) throw new ApiError(500, "No se pudieron cargar las salas.")

    let userPermissions = new Map<string, any>()
    let memberPermiso: string | null = null

    if (!isOwner) {
      const { data: permisos } = await supabase
        .from("sala_permisos")
        .select("sala_id, salas_ver, salas_acceder, salas_crear")
        .eq("usuario_id", usuario.id)

      ;(permisos ?? []).forEach(p => userPermissions.set(p.sala_id, p))

      const { data: miembro } = await supabase
        .from("backroom_miembros")
        .select("permiso")
        .eq("backroom_id", backroomId)
        .eq("usuario_id", usuario.id)
        .maybeSingle()
      
      memberPermiso = miembro?.permiso ?? null
    }

    const roomsWithPermissions = []
    for (const room of data ?? []) {
      let canView = isOwner;
      let canAccess = isOwner;
      let canCreateSubrooms = isOwner;

      if (!isOwner) {
        const p = userPermissions.get(room.id);
        if (p !== undefined) {
          canView = p.salas_ver === true;
          canAccess = p.salas_acceder === true;
          canCreateSubrooms = p.salas_crear === true;
        } else if (memberPermiso) {
          canView = true;
          canAccess = true;
          canCreateSubrooms = memberPermiso === "contribuir" || memberPermiso === "admin";
        } else {
          canView = false;
          canAccess = false;
          canCreateSubrooms = false;
        }
      }

      if (!canView) continue;

      roomsWithPermissions.push({
        ...room,
        can_access: canAccess,
        can_create_subrooms: canCreateSubrooms
      })
    }

    return NextResponse.json(roomsWithPermissions)
  } catch (error) {
    return handleApiError(error)
  }
}

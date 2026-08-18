import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { handleApiError, ApiError } from "@/lib/api-error"
import { checkPermission } from "@/lib/auth/rbac"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ backroomId: string }> }
) {
  try {
    await requireAuth()
    const { backroomId } = await params

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("salas")
      .select("id, nombre, descripcion, depth, created_at")
      .eq("backroom_id", backroomId)
      .is("parent_id", null)
      .order("created_at", { ascending: true })

    if (error) throw new ApiError(500, "No se pudieron cargar las salas.")

    return NextResponse.json(data ?? [])
  } catch (error) {
    return handleApiError(error)
  }
}

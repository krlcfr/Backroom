import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { isOwner } from "@/lib/auth/rbac";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";

// GET /api/audit?backroomId=xxx&page=1&limit=20
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const backroomId = searchParams.get("backroomId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!backroomId) {
      throw new ApiError(400, "Se requiere el ID del backroom");
    }

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(400, "Parámetros de paginación inválidos");
    }

    const esDueno = await isOwner(user.id, backroomId);
    if (!esDueno) {
      throw new ApiError(403, "Solo el propietario puede ver la auditoría");
    }

    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, error, count } = await supabase
      .from("audit_logs")
      .select("*, usuarios!actor_id(username, nombre_completo, correo)", { count: "exact" })
      .eq("backroom_id", backroomId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
       // Ignore relation does not exist before migration is run, avoiding 500 error on new deployment
       if (error.code === '42P01') {
         return NextResponse.json({ data: [], meta: { total: 0, page, limit, totalPages: 0 } }, { status: 200 });
       }
       throw new ApiError(500, "Error al obtener los logs de auditoría");
    }

    return NextResponse.json({
      data: logs,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

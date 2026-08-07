import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { handleApiError, ApiError } from "@/lib/api-error";
import { getUsuarioInterno } from "@/lib/auth/rbac";

const ALLOWED_TYPES = ["docx", "pptx", "mp3", "mp4", "enlace"] as const;
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

// POST /api/resources — BE-40
// Registra un recurso (enlace o archivo) en una sala.
// Nota: la tabla `recursos` tiene: sala_id, subido_por, nombre, tipo, url, tamano_bytes
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const usuario = await getUsuarioInterno(user.id);
    if (!usuario) throw new ApiError(404, "Perfil no encontrado.");

    const body = await request.json();
    const { sala_id, tipo, nombre, url, tamano_bytes } = body;

    if (!sala_id) throw new ApiError(400, "Se requiere sala_id.");
    if (!tipo || !ALLOWED_TYPES.includes(tipo)) {
      throw new ApiError(400, `Tipo inválido. Permitidos: ${ALLOWED_TYPES.join(", ")}.`);
    }
    if (!nombre) throw new ApiError(400, "Se requiere el nombre del recurso.");
    if (tipo !== "enlace" && !url) throw new ApiError(400, "Se requiere la URL del archivo.");
    if (tipo === "enlace" && !url) throw new ApiError(400, "Se requiere la URL del enlace.");
    if (tamano_bytes && tamano_bytes > MAX_SIZE) {
      throw new ApiError(400, "El archivo supera el límite de 50 MB.");
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recursos")
      .insert({
        sala_id,
        subido_por: usuario.id,
        nombre,
        tipo,
        url,
        tamano_bytes: tamano_bytes ?? null,
      })
      .select()
      .single();

    if (error || !data) throw new ApiError(500, "No se pudo registrar el recurso.");

    return NextResponse.json({ data: { resource: data } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/resources?sala_id=X — BE-41
// Lista recursos de una sala.
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const sala_id = searchParams.get("sala_id") ?? searchParams.get("roomId");

    if (!sala_id) throw new ApiError(400, "Se requiere el parámetro 'sala_id'.");

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("recursos")
      .select("id, nombre, tipo, url, tamano_bytes, created_at, subido_por")
      .eq("sala_id", sala_id)
      .order("created_at", { ascending: false });

    if (error) throw new ApiError(500, "No se pudieron obtener los recursos.");

    return NextResponse.json({ data: { resources: data } }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

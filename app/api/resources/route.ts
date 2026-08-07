import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { handleApiError, ApiError } from "@/lib/api-error";

// POST /api/resources — BE-40
// Sube un archivo (multipart/form-data) o registra un enlace.
// GET  /api/resources?roomId=X — BE-41
// Lista los recursos de una sala.

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    // TODO: implementar cuando tabla `resources` y Supabase Storage estén configurados
    // Validar MIME types permitidos: docx, pptx, mp3, mp4 y límite ≤ 50 MB
    /*
    const formData = await request.formData();
    const roomId = formData.get("room_id") as string;
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;
    const name = formData.get("name") as string;
    const url = formData.get("url") as string | null;

    const ALLOWED_TYPES = ["docx", "pptx", "mp3", "mp4", "enlace"];
    if (!ALLOWED_TYPES.includes(type)) throw new ApiError(400, "Tipo de recurso no permitido.");

    if (type !== "enlace" && file) {
      const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
      if (file.size > MAX_SIZE) throw new ApiError(400, "El archivo supera el límite de 50 MB.");

      const supabase = await createClient();
      const path = `${roomId}/${crypto.randomUUID()}.${type}`;
      const { error: storageError } = await supabase.storage.from("resources").upload(path, file);
      if (storageError) throw new ApiError(500, "Error al subir el archivo.");

      const { data, error } = await supabase.from("resources").insert({
        room_id: roomId, name, type, size_bytes: file.size, storage_path: path,
      }).select().single();
      if (error || !data) throw new ApiError(500, "Error al registrar el recurso.");
      return NextResponse.json({ data: { resource: data } }, { status: 201 });
    }

    if (type === "enlace" && url) {
      const { data, error } = await supabase.from("resources").insert({
        room_id: roomId, name, type: "enlace", url,
      }).select().single();
      if (error || !data) throw new ApiError(500, "Error al registrar el enlace.");
      return NextResponse.json({ data: { resource: data } }, { status: 201 });
    }

    throw new ApiError(400, "Datos incompletos.");
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `resources` y Supabase Storage." } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) throw new ApiError(400, "Se requiere el parámetro 'roomId'.");

    // TODO: implementar cuando tabla `resources` exista en Supabase
    /*
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("id, name, type, size_bytes, url, created_at")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "No se pudieron obtener los recursos.");
    return NextResponse.json({ data: { resources: data } }, { status: 200 });
    */

    return NextResponse.json(
      { data: { message: "Endpoint listo — pendiente tabla `resources` en Supabase.", roomId } },
      { status: 501 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

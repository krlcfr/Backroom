import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { DEMO_LIMITS } from "@/lib/limits";

// GET /api/demo/limits — Devuelve los límites del modo demo y su consumo (simulado para el MVP)
export async function GET() {
  try {
    await requireAuth();

    // En un caso real de la base de datos, esto se calcularía haciendo count()
    // y sum() en las tablas reales del usuario.
    // Para la Demo devolvemos el consumo simulado:
    const current_usage = {
      storage_bytes: 1048576, // 1 MB (el documento de ejemplo)
      members: 1,             // Solo el usuario actual
      max_depth: 2,           // El árbol de ejemplo llega a profundidad 2
      resources: 2,           // Dos recursos de ejemplo
    };

    const data = {
      limits: DEMO_LIMITS,
      current_usage,
      // Helper para el Frontend (porcentaje de uso de almacenamiento)
      storage_percentage: Math.round((current_usage.storage_bytes / DEMO_LIMITS.storage_bytes) * 100),
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Inicia sesión para ver los límites." } },
      { status: 401 }
    );
  }
}

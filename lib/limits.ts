// lib/limits.ts
// Límites hardcoded para el Modo Demo (RF-08 a RF-11).
// En la versión con planes, estos valores vendrán de la tabla `planes`.

export const DEMO_LIMITS = {
  /** Almacenamiento máximo total en bytes (100 MB) */
  storage_bytes: 100 * 1024 * 1024,

  /** Número máximo de miembros en el backroom (incluye al propietario) */
  max_members: 4,

  /** Profundidad máxima del árbol de salas (0 = raíz, 2 = 3 niveles: raíz + 2 subsalas) */
  max_depth: 2,

  /** Número máximo de recursos por sala */
  max_resources_per_room: 10,

  /** Tipos de archivo permitidos */
  allowed_types: ["docx", "pptx", "mp3", "mp4", "enlace"] as const,

  /** Tamaño máximo por archivo en bytes (50 MB) */
  max_file_bytes: 50 * 1024 * 1024,
} as const;

export type DemoLimitKey = keyof typeof DEMO_LIMITS;

/**
 * Verifica si se supera un límite numérico del modo Demo.
 * @returns true si el valor actual supera (o iguala) el límite.
 */
export function exceedsLimit(current: number, limit: number): boolean {
  return current >= limit;
}

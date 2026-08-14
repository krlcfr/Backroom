// lib/demo.ts
// Helpers de presentación compartidos por las vistas del Modo Demo.

export function formatBytes(bytes: number | null) {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function barColor(pct: number) {
  if (pct >= 100) return "bg-rose-500"
  if (pct >= 80) return "bg-amber-500"
  return "bg-[#7c3aed]"
}

"use client"

import { useState } from "react"
import IconPicker from "@/components/ui/icon-picker"

interface CreateRoomModalProps {
  backroomId: string
  parentRoomId?: string | null
  parentRoomName?: string
  currentDepth?: number
  onClose: () => void
  onCreated: (room: { id: string; nombre: string }) => void
}

export default function CreateRoomModal({
  backroomId,
  parentRoomId,
  parentRoomName,
  currentDepth = 0,
  onClose,
  onCreated,
}: CreateRoomModalProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [icono, setIcono] = useState("grid_view")
  const [heredarPermisos, setHeredarPermisos] = useState(true)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const depth = parentRoomId ? currentDepth + 1 : 1
  const maxDepth = 2 // Solo se permiten 2 niveles: Backroom -> Sala
  const atMaxDepth = currentDepth >= maxDepth - 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (atMaxDepth) {
      setError("Profundidad máxima alcanzada (nivel 2). No se pueden crear más subsalas.")
      return
    }

    const trimmed = nombre.trim()
    if (trimmed.length < 1) {
      setError("El nombre es requerido")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backroom_id: backroomId,
          parent_id: parentRoomId ?? null,
          nombre: trimmed,
          descripcion: descripcion.trim() || undefined,
          icono: icono,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo crear la sala")
      }

      const result = await res.json()
      onCreated(result.data.room)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la sala")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#303036] border border-[#4a4455] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-[#4a4455] flex items-center justify-between bg-[#27272a]">
          <h2 className="text-[20px] font-semibold text-[#e2e2e2] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d2bbff]">add_box</span>
            Nueva sala{parentRoomName ? ` en ${parentRoomName}` : ""}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <span className="text-[13px] text-[#958da1] bg-[#282a2b] px-2 py-1 rounded-md border border-[#4a4455] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">layers</span>
              Nivel {depth} de {maxDepth}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 shrink-0">
                <label className="text-[12px] font-medium text-[#ccc3d8]">Icono</label>
                <IconPicker value={icono} onChange={setIcono} />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[12px] font-medium text-[#ccc3d8]">
                  Nombre de la sala <span className="text-[#ffb4ab]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Arquitectura Frontend"
                  className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 placeholder:text-[#ccc3d8]/40 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[#ccc3d8]">Descripción técnica</label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles sobre el propósito de esta sala..."
                className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 placeholder:text-[#ccc3d8]/40 resize-none transition-all"
                disabled={loading}
              />
            </div>

            <div className="flex items-start gap-3 bg-[#1a1c1c] p-3 rounded-lg border border-[#4a4455]/50">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type="checkbox"
                  checked={heredarPermisos}
                  onChange={(e) => setHeredarPermisos(e.target.checked)}
                  className="w-4 h-4 bg-[#1e2020] border-[#4a4455] rounded text-[#7c3aed] focus:ring-[#a78bfa]/50 focus:ring-offset-0 cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[14px] text-[#e2e2e2] cursor-pointer select-none">
                  Heredar permisos de la sala padre
                </label>
                <span className="text-[12px] text-[#958da1] mt-0.5">
                  Los usuarios con acceso{parentRoomName ? ` a '${parentRoomName}'` : " a esta sala"} tendrán el mismo nivel de acceso aquí.
                </span>
              </div>
            </div>
          </div>

          {error && <p className="text-[12px] text-[#ffb4ab]">{error}</p>}

          <div className="px-0 py-4 flex items-center justify-end gap-3 border-t border-[#4a4455]/50">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-[#4a4455] bg-transparent text-[#e2e2e2] text-[12px] font-medium hover:bg-[#333535] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || atMaxDepth}
              className="px-5 py-2 rounded-lg bg-[#7c3aed] text-[#fafafa] text-[12px] font-semibold hover:bg-[#8b5cf6] transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              {loading ? "Creando..." : atMaxDepth ? "Profundidad máxima" : "Crear sala"}
              {!loading && !atMaxDepth && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CargosModal({ orgId, cargos, onClose }: { orgId: string, cargos: any[], onClose: () => void }) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/organizations/${orgId}/cargos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion }),
      })
      if (!res.ok) throw new Error("No se pudo crear el cargo")
      setNombre("")
      setDescripcion("")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/cargos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("No se pudo eliminar el cargo")
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#3f3f46] bg-[#27272a] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[18px] font-semibold text-[#e2e2e2]">Gestionar Cargos</h3>
          <button onClick={onClose} className="text-[#ccc3d8] hover:text-white">✕</button>
        </div>
        
        {error && <p className="mb-4 text-[12px] text-[#ffb4ab]">{error}</p>}
        
        <form onSubmit={handleCreate} className="mb-6 flex flex-col gap-3 border-b border-[#3f3f46] pb-6">
          <input
            type="text"
            placeholder="Nombre del cargo (ej. Gerente General)"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            disabled={loading}
            className="rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 py-2 text-[13px] text-[#e2e2e2] outline-none focus:border-[#a78bfa]"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 py-2 text-[13px] text-[#e2e2e2] outline-none focus:border-[#a78bfa]"
          />
          <button type="submit" disabled={loading} className="rounded-lg bg-[#7c3aed] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#8b5cf6] disabled:opacity-50">
            {loading ? "Guardando..." : "Crear Cargo"}
          </button>
        </form>

        <div className="max-h-[300px] overflow-y-auto">
          {cargos.length === 0 ? (
            <p className="text-center text-[13px] text-[#ccc3d8]">No hay cargos creados aún.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {cargos.map(c => (
                <li key={c.id} className="flex items-center justify-between rounded-lg border border-[#3f3f46] bg-[#18181b] p-3">
                  <div>
                    <p className="text-[14px] font-medium text-[#e2e2e2]">{c.nombre}</p>
                    {c.descripcion && <p className="text-[12px] text-[#ccc3d8]">{c.descripcion}</p>}
                  </div>
                  <button onClick={() => handleDelete(c.id)} disabled={loading} className="text-[12px] text-[#ffb4ab] hover:text-red-400 disabled:opacity-50">Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

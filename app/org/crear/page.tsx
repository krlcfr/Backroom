"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CrearOrganizacionPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError("")

    try {
      // Simulate API call for now.
      // const res = await fetch("/api/orgs", { ... })
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Temporary redirection back to the demo panel
      router.push("/demo/backroom")
    } catch (err: any) {
      setError(err.message || "Error al crear la organización")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#18181b] text-[#e2e2e2]">
      <main className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight text-[#e2e2e2] mb-2">Crear Organización</h1>
          <p className="text-[14px] text-[#ccc3d8]">Configura el entorno base para tu equipo y proyectos.</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)]"
        >
          {/* Logo Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">Logo de la organización</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-[#1e2020] border border-[#4a4455] flex items-center justify-center overflow-hidden">
                <span className="material-symbols-outlined text-[#958da1] text-3xl">image</span>
              </div>
              <button 
                type="button"
                className="px-4 py-2 text-[12px] font-medium border border-[#3f3f46] rounded-lg hover:bg-[#27272a] text-[#e2e2e2] transition-colors bg-transparent"
              >
                Subir imagen
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="orgName" className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">Nombre de la organización</label>
            <input 
              id="orgName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Acme Corp" 
              className="bg-[#18181b] border border-[#3f3f46] rounded-lg w-full px-4 py-3 text-[14px] text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none transition-all"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="orgDesc" className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">Descripción técnica</label>
            <textarea 
              id="orgDesc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente el propósito o dominio técnico..." 
              className="bg-[#18181b] border border-[#3f3f46] rounded-lg w-full px-4 py-3 text-[14px] text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Warning Notice */}
          <div className="bg-[#7c3aed]/10 border border-[#d2bbff]/30 rounded-lg p-4 flex items-start gap-3 mt-2">
            <span className="material-symbols-outlined text-[#d2bbff] mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
            <div>
              <h4 className="text-[12px] font-medium text-[#d2bbff] mb-1">Aviso de Permisos</h4>
              <p className="text-[14px] text-[#ccc3d8] leading-relaxed">
                Al crear esta organización, te convertirás en el <strong>Propietario único</strong>. Podrás invitar a otros miembros y asignar roles más adelante.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-[#ffb4ab] mt-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-[#3f3f46]">
            <button 
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-5 py-2.5 text-[12px] font-medium text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#8b5cf6] text-[#fafafa] text-[12px] font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_4px_12px_rgba(124,58,237,0.2)] active:scale-[0.98]"
            >
              {loading ? "Creando..." : "Crear organización"}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

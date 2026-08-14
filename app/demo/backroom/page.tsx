"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { barColor, formatBytes } from "@/lib/demo"

interface SalaNode {
  id: string
  nombre: string
  descripcion?: string
  acceso: "publico" | "restringido"
  icono: string
  depth: number
  children: SalaNode[]
}

interface Recurso {
  id: string
  sala_id: string
  nombre: string
  tipo: string
  url: string
  tamano_bytes: number | null
  subido_por: string
  created_at: string
}

interface BackroomData {
  backroom: { id: string; nombre: string; descripcion: string; portada_url: string }
  tree: SalaNode[]
  sample_resources: Recurso[]
}

interface LimitsData {
  limits: {
    storage_bytes: number
    max_members: number
    max_depth: number
    max_resources_per_room: number
    max_file_bytes: number
  }
  current_usage: { storage_bytes: number; members: number; max_depth: number; resources: number }
  storage_percentage: number
}

const TIPO_ICON: Record<string, { icon: string; color: string }> = {
  pdf: { icon: "picture_as_pdf", color: "text-rose-400" },
  docx: { icon: "description", color: "text-amber-400" },
  pptx: { icon: "slideshow", color: "text-amber-500" },
  mp3: { icon: "audio_file", color: "text-blue-400" },
  mp4: { icon: "video_file", color: "text-purple-400" },
  enlace: { icon: "link", color: "text-green-400" },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
  if (d.toDateString() === now.toDateString()) return `Hoy, ${time}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Ayer, ${time}`
  return d.toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })
}

export default function DemoBackroomPage() {
  const [backroom, setBackroom] = useState<BackroomData | null>(null)
  const [limits, setLimits] = useState<LimitsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [limitsOpen, setLimitsOpen] = useState(true)
  const [modal, setModal] = useState(false)

  async function load() {
    setError("")
    try {
      const [brRes, limRes] = await Promise.all([
        fetch("/api/demo/backroom"),
        fetch("/api/demo/limits"),
      ])
      if (!brRes.ok || !limRes.ok) throw new Error("No se pudo cargar la Demo.")
      const brJson = await brRes.json()
      const limJson = await limRes.json()
      const brData: BackroomData = brJson.data
      const limData: LimitsData = limJson.data
      setBackroom(brData)
      setLimits(limData)
      const firstWithResources =
        brData.sample_resources.find((r) => brData.tree.some((s) => s.id === r.sala_id))?.sala_id ?? null
      setSelectedId(firstWithResources ?? brData.tree[0]?.id ?? null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar la Demo."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = setTimeout(() => {
      load()
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const selectedSala = useMemo(() => {
    if (!backroom || !selectedId) return null
    return backroom.tree.find((s) => s.id === selectedId) ?? null
  }, [backroom, selectedId])

  const resources = useMemo(() => {
    if (!backroom || !selectedId) return []
    return backroom.sample_resources.filter((r) => r.sala_id === selectedId)
  }, [backroom, selectedId])

  const depthLevels = limits ? limits.limits.max_depth + 1 : 1
  const depthReached = limits ? Math.min(limits.current_usage.max_depth + 1, depthLevels) : 1

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex items-center gap-3 text-[#ccc3d8]">
          <span className="material-symbols-outlined animate-spin text-[#d2bbff]">progress_activity</span>
          <span>Cargando Demo…</span>
        </div>
      </div>
    )
  }

  if (error || !backroom || !limits) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="material-symbols-outlined text-[#ffb4ab] text-[40px]">error</span>
        <p className="text-[#e2e2e2] text-[15px]">{error || "No se pudo cargar la Demo."}</p>
        <button
          onClick={load}
          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#8B5CF6] transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col">
      {/* Persistent Demo Banner */}
      <div className="bg-[#3B0764] text-white px-6 py-3 flex items-center justify-between border-b border-[#5a00c6]">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-400">warning</span>
          <span className="text-[14px]">
            Estás en modo Demo. Crea tu organización para acceder a todas las funcionalidades.
          </span>
        </div>
        <Link
          href="/demo/limites"
          className="text-[13px] font-medium underline hover:text-amber-300 transition-colors"
        >
          Ver límites de Demo
        </Link>
      </div>

      {/* 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-[1440px] mx-auto w-full">
        {/* Col 1: Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden gap-6">
          {/* Header + Breadcrumb */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#ccc3d8] text-[12px] font-medium">
              <span>Dashboard</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span>BackRoom Demo</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="text-[#d2bbff] font-medium">
                {selectedSala?.nombre ?? backroom.backroom.nombre}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <h1 className="text-[28px] font-semibold text-[#e2e2e2]">{backroom.backroom.nombre}</h1>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setModal(true)}
                  className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Subir recurso
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-[200px] bg-[#303036] text-white text-center text-[12px] rounded-md px-2 py-2 border border-[#3F3F46] shadow-lg z-50">
                  Disponible al crear tu organización
                </span>
              </div>
            </div>
          </div>

          {/* Grid of Child Rooms */}
          <div className="grid grid-cols-2 gap-4">
            {backroom.tree.map((sala) => {
              const isPublic = sala.acceso === "publico"
              return (
                <button
                  key={sala.id}
                  type="button"
                  onClick={() => setSelectedId(sala.id)}
                  className={`bg-[#27272A] border rounded-xl p-4 flex flex-col gap-3 hover:border-[#4a4455] transition-colors text-left group ${
                    selectedId === sala.id
                      ? "border-[#d2bbff] ring-1 ring-[#d2bbff]"
                      : "border-[#3F3F46]"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPublic ? "bg-[#3B0764]/30" : "bg-[#282a2b]"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined ${
                          isPublic ? "text-[#d2bbff]" : "text-amber-400"
                        }`}
                      >
                        {sala.icono}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium border ${
                        isPublic
                          ? "bg-[#282a2b] text-[#ccc3d8] border-[#4a4455]"
                          : "bg-rose-900/30 text-rose-400 border-rose-900"
                      }`}
                    >
                      {isPublic ? "Público" : "Restringido"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#e2e2e2] group-hover:text-[#d2bbff] transition-colors">
                      {sala.nombre}
                    </h3>
                    {sala.descripcion && (
                      <p className="text-sm text-[#ccc3d8] mt-1">{sala.descripcion}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Recursos Recientes */}
          <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-[#3F3F46]">
              <h2 className="text-[18px] font-semibold text-[#e2e2e2]">Recursos Recientes</h2>
            </div>
            {resources.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="material-symbols-outlined text-[#4a4455] text-[40px]">inbox</span>
                <p className="text-[14px] text-[#ccc3d8]">Sin recursos en esta sala.</p>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-[14px]">
                  <thead className="sticky top-0 bg-[#27272A] border-b border-[#3F3F46] text-[#ccc3d8] text-[12px] font-medium">
                    <tr>
                      <th className="py-3 px-4 font-normal w-12">TIPO</th>
                      <th className="py-3 px-4 font-normal">NOMBRE</th>
                      <th className="py-3 px-4 font-normal w-24">TAMAÑO</th>
                      <th className="py-3 px-4 font-normal w-32">AUTOR</th>
                      <th className="py-3 px-4 font-normal w-32">FECHA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3F3F46]">
                    {resources.map((r) => {
                      const tipo = TIPO_ICON[r.tipo] ?? { icon: "description", color: "text-[#e2e2e2]" }
                      return (
                        <tr key={r.id} className="hover:bg-[#282a2b] transition-colors cursor-pointer">
                          <td className="py-3 px-4">
                            <span className={`material-symbols-outlined ${tipo.color}`}>{tipo.icon}</span>
                          </td>
                          <td className="py-3 px-4 text-[#e2e2e2] font-medium">{r.nombre}</td>
                          <td className="py-3 px-4 text-[#ccc3d8]">{formatBytes(r.tamano_bytes)}</td>
                          <td className="py-3 px-4 text-[#ccc3d8]">{r.subido_por}</td>
                          <td className="py-3 px-4 text-[#ccc3d8]">{formatDate(r.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Col 2: Limits Panel (collapsible) */}
        <div
          className={`bg-[#27272A] border border-[#3F3F46] rounded-xl flex flex-col overflow-hidden transition-all duration-300 ${
            limitsOpen ? "w-1/4 min-w-[240px]" : "w-12 min-w-12"
          }`}
        >
          <div className="p-4 border-b border-[#3F3F46] flex items-center justify-between">
            {limitsOpen && <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Límites Demo</h2>}
            <button
              onClick={() => setLimitsOpen((v) => !v)}
              className="text-[#ccc3d8] hover:text-[#d2bbff] transition-colors"
              aria-label={limitsOpen ? "Contraer panel" : "Expandir panel"}
            >
              <span className="material-symbols-outlined">{limitsOpen ? "chevron_right" : "chevron_left"}</span>
            </button>
          </div>

          {limitsOpen && (
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Storage */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] text-[#ccc3d8] uppercase tracking-wider">Almacenamiento</span>
                  <span className="text-[13px] text-[#d2bbff]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                    {formatBytes(limits.current_usage.storage_bytes)} / {formatBytes(limits.limits.storage_bytes)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121414] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor(limits.storage_percentage)} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(limits.storage_percentage, 100)}%` }}
                  />
                </div>
                {limits.storage_percentage >= 80 && (
                  <p className="mt-2 text-xs text-amber-500">Alerta: Cerca del límite</p>
                )}
              </div>

              {/* Members */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] text-[#ccc3d8] uppercase tracking-wider">Miembros</span>
                  <span className="text-[13px] text-[#d2bbff]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                    {limits.current_usage.members} / {limits.limits.max_members}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121414] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor((limits.current_usage.members / limits.limits.max_members) * 100)} rounded-full transition-all duration-700`}
                    style={{
                      width: `${Math.min((limits.current_usage.members / limits.limits.max_members) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Depth */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] text-[#ccc3d8] uppercase tracking-wider">Niveles de Sala</span>
                  <span className="text-[13px] text-[#d2bbff]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                    Nivel {depthReached} de {depthLevels}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121414] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor((depthReached / depthLevels) * 100)} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((depthReached / depthLevels) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Resources */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[12px] text-[#ccc3d8] uppercase tracking-wider">Recursos</span>
                  <span className="text-[13px] text-[#d2bbff]" style={{ fontFamily: "'Courier Prime', monospace" }}>
                    {limits.current_usage.resources} / {limits.limits.max_resources_per_room}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#121414] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor((limits.current_usage.resources / limits.limits.max_resources_per_room) * 100)} rounded-full transition-all duration-700`}
                    style={{
                      width: `${Math.min((limits.current_usage.resources / limits.limits.max_resources_per_room) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-[#3F3F46] mt-4">
                <div className="bg-[#121414] border border-[#3F3F46] rounded-lg p-4 text-center">
                  <span className="material-symbols-outlined text-[#d2bbff] mb-2 text-[30px] block">
                    rocket_launch
                  </span>
                  <h3 className="text-[12px] text-[#e2e2e2] mb-2 font-medium">Desbloquea todo el poder</h3>
                  <p className="text-xs text-[#ccc3d8] mb-4">
                    Actualiza a una organización completa para eliminar los límites de almacenamiento y usuarios.
                  </p>
                  <Link
                    href="/org/crear"
                    className="w-full block bg-[#7c3aed] text-white py-2 rounded-lg text-[12px] font-medium hover:bg-[#8B5CF6] transition-colors"
                  >
                    Crear Organización
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Limit Modal */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-[#1e2020] border border-[#4a4455] rounded-xl p-6 text-center">
            <span className="material-symbols-outlined text-amber-400 text-[36px] mb-3 block">lock</span>
            <h3 className="text-[18px] font-semibold text-[#e2e2e2] mb-2">Límite de la Demo alcanzado</h3>
            <p className="text-[14px] text-[#ccc3d8] mb-6">
              Esta acción está disponible al crear tu organización. Desbloquea el acceso completo al sistema.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/org/crear"
                className="w-full bg-[#7c3aed] text-white py-2.5 rounded-lg text-[12px] font-medium hover:bg-[#8B5CF6] transition-colors"
              >
                Crear mi organización
              </Link>
              <button
                onClick={() => setModal(false)}
                className="w-full bg-transparent border border-[#4a4455] text-[#e2e2e2] py-2.5 rounded-lg text-[12px] font-medium hover:bg-[#282a2b] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

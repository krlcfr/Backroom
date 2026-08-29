"use client"


import { useEffect, useState } from "react"
import Link from "next/link"
import { barColor, formatBytes } from "@/lib/demo"

interface LimitsData {
  plan?: string
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

const METRIC_CARDS: Array<{
  key: "storage" | "members" | "depth" | "resources"
  icon: string
  iconColor: string
  title: string
  description: string
}> = [
  {
    key: "storage",
    icon: "dns",
    iconColor: "text-amber-400",
    title: "Almacenamiento",
    description: "Capacidad total para documentos encriptados de tu BackRoom.",
  },
  {
    key: "members",
    icon: "group",
    iconColor: "text-blue-400",
    title: "Miembros Activos",
    description: "Usuarios con acceso concurrente al BackRoom.",
  },
  {
    key: "depth",
    icon: "account_tree",
    iconColor: "text-purple-400",
    title: "Niveles de Sala",
    description: "Profundidad máxima de la estructura jerárquica de salas.",
  },
  {
    key: "resources",
    icon: "token",
    iconColor: "text-green-400",
    title: "Recursos de API",
    description: "Recursos compartidos dentro de cada sala del BackRoom.",
  },
]

export default function DemoLimitesPage() {
  const [data, setData] = useState<LimitsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function load() {
    setError("")
    try {
      const res = await fetch("/api/organizations/limits")
      if (!res.ok) throw new Error("No se pudieron cargar los límites.")
      const json = await res.json()
      setData(json.data as LimitsData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar los límites."
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

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="flex items-center gap-3 text-[#ccc3d8]">
          <span className="material-symbols-outlined animate-spin text-[#d2bbff]">progress_activity</span>
          <span>Cargando métricas...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="material-symbols-outlined text-[#ffb4ab] text-[40px]">error</span>
        <p className="text-[#e2e2e2] text-[15px]">{error || "No se pudieron cargar los límites."}</p>
        <button
          onClick={load}
          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-[12px] font-medium text-white hover:bg-[#8B5CF6] transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const { limits, current_usage } = data
  const depthLevels = limits.max_depth + 1
  const depthReached = Math.min(current_usage.max_depth + 1, depthLevels)
  const membersPct = (current_usage.members / limits.max_members) * 100
  const depthPct = (depthReached / depthLevels) * 100
  const resourcesPct = (current_usage.resources / limits.max_resources_per_room) * 100

  const metricValues: Record<string, { value: string; pct: number }> = {
    storage: {
      value: `${formatBytes(current_usage.storage_bytes)} / ${formatBytes(limits.storage_bytes)}`,
      pct: data.storage_percentage,
    },
    members: { value: `${current_usage.members} / ${limits.max_members}`, pct: membersPct },
    depth: { value: `Nivel ${depthReached} de ${depthLevels}`, pct: depthPct },
    resources: { value: `${current_usage.resources} / ${limits.max_resources_per_room}`, pct: resourcesPct },
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center px-8 py-12">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-[#7c3aed]/20 border border-[#7c3aed]/40 rounded-full px-3 py-1 text-[#d2bbff] text-[11px] font-medium tracking-wider uppercase">
            Plan {data.plan || "Free"}
          </span>
          <h1 className="mt-4 text-[36px] font-bold text-[#e2e2e2]">Consumo y Límites</h1>
          <p className="mt-3 max-w-xl text-[15px] text-[#ccc3d8]">
            Monitorea el uso de los recursos de tu organización. Si necesitas más capacidad, actualiza tu plan en Configuración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
          {METRIC_CARDS.map((card) => {
            const metric = metricValues[card.key]
            return (
              <div key={card.key} className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#121414] border border-[#3F3F46] flex items-center justify-center">
                      <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                    </div>
                    <h3 className="text-[16px] font-semibold text-[#e2e2e2]">{card.title}</h3>
                  </div>
                  <span
                    className="bg-[#121414] border border-[#3F3F46] rounded-full px-3 py-1 text-[12px] text-[#d2bbff] whitespace-nowrap"
                    style={{ fontFamily: "'Courier Prime', monospace" }}
                  >
                    {metric.value}
                  </span>
                </div>
                <p className="text-[13px] text-[#ccc3d8] mb-5">{card.description}</p>
                <div className="w-full h-2 bg-[#121414] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor(metric.pct)} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(metric.pct, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


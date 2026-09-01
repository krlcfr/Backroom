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
    icon: "hard_drive",
    iconColor: "text-amber-500",
    title: "Almacenamiento Total",
    description: "Capacidad utilizada para todos los documentos de tu organización.",
  },
  {
    key: "members",
    icon: "group",
    iconColor: "text-blue-500",
    title: "Miembros Activos",
    description: "Usuarios con acceso a la plataforma corporativa.",
  },
  {
    key: "depth",
    icon: "account_tree",
    iconColor: "text-purple-500",
    title: "Profundidad de Salas",
    description: "Niveles máximos de anidación permitidos para las salas.",
  },
  {
    key: "resources",
    icon: "folder_open",
    iconColor: "text-emerald-500",
    title: "Recursos por Sala",
    description: "Límite de documentos o archivos por cada sala individual.",
  },
]

export default function StoragePage() {
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
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-[#958da1]">
          <span className="material-symbols-outlined animate-spin text-[#7c3aed]">refresh</span>
          <span className="text-sm font-medium">Calculando métricas de almacenamiento...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-5xl">cloud_off</span>
        <p className="text-[#e2e2e2] text-sm font-medium">{error || "No se pudieron cargar los límites."}</p>
        <button
          onClick={load}
          className="mt-2 rounded-lg bg-[#3f3f46] hover:bg-[#52525b] px-4 py-2 text-xs font-medium text-white transition-colors"
        >
          Reintentar conexión
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
    depth: { value: `${depthReached} / ${depthLevels} niveles`, pct: depthPct },
    resources: { value: `${current_usage.resources} / ${limits.max_resources_per_room}`, pct: resourcesPct },
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8">
      {/* Encabezado Corporativo */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2] flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-3xl">data_usage</span>
            Almacenamiento y Límites
          </h1>
          <p className="text-sm text-[#958da1]">
            Visualiza el consumo de recursos de tu organización en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#958da1] uppercase font-bold tracking-wider">Plan Actual</span>
          <span className="bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#d2bbff] px-4 py-1.5 rounded-lg text-sm font-semibold uppercase">
            {data.plan || "Gratuito"}
          </span>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {METRIC_CARDS.map((card) => {
          const metric = metricValues[card.key]
          
          return (
            <div key={card.key} className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-6 relative overflow-hidden transition-all hover:border-[#52525b]">
              
              {/* Decoración de fondo sutil */}
              <div className="absolute -right-6 -top-6 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">{card.icon}</span>
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#121414] border border-[#3f3f46] flex items-center justify-center">
                    <span className={`material-symbols-outlined text-[24px] ${card.iconColor}`}>{card.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#e2e2e2]">{card.title}</h3>
                    <p className="text-xs text-[#958da1] mt-0.5 line-clamp-1">{card.description}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-bold text-[#e2e2e2] font-mono tracking-tight">
                    {metric.value.split('/')[0].trim()}
                  </span>
                  <span className="text-sm text-[#958da1] font-mono mb-1">
                    / {metric.value.split('/')[1]?.trim() || ''}
                  </span>
                </div>

                <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor(metric.pct)} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(Math.max(metric.pct, 2), 100)}%` }}
                  />
                </div>
                
                <div className="mt-2 text-right">
                  <span className="text-[10px] font-bold text-[#958da1]">
                    {metric.pct.toFixed(1)}% utilizado
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 bg-[#121414] border border-[#3f3f46] rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#7c3aed]">rocket_launch</span>
          <p className="text-sm text-[#c4b5d6]">
            ¿Necesita más capacidad para su equipo corporativo?
          </p>
        </div>
        <Link 
          href="/dashboard/configuracion" 
          className="px-6 py-2 bg-[#e2e2e2] hover:bg-white text-[#0c0f0f] text-sm font-bold rounded-lg transition-colors whitespace-nowrap"
        >
          Mejorar Plan
        </Link>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

async function mockCreate(data: { nombre: string; descripcion?: string; portada_url?: string }) {
  await new Promise((r) => setTimeout(r, 600))
  return {
    backroom: {
      id: crypto.randomUUID(),
      nombre: data.nombre,
      descripcion: data.descripcion ?? null,
      portada_url: data.portada_url ?? null,
      propietario_id: "user-1",
      cant_salas: 0,
      created_at: new Date().toISOString(),
    },
  }
}

export default function NuevaBackRoomPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [portadaUrl, setPortadaUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const trimmed = nombre.trim()
    if (trimmed.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres")
      return
    }

    setLoading(true)

    try {
      const { backroom } = await mockCreate({
        nombre: trimmed,
        descripcion: descripcion.trim() || undefined,
        portada_url: portadaUrl.trim() || undefined,
      })

      router.push(`/dashboard/backrooms/${backroom.id}`)
      router.refresh()
    } catch {
      setError("No se pudo crear la BackRoom")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-8">
      <h1 className="mb-8 text-2xl font-bold">Nueva BackRoom</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-zinc-900">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            required
            maxLength={60}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-zinc-900">
            Descripción
          </label>
          <textarea
            id="descripcion"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div>
          <label htmlFor="portada" className="mb-1 block text-sm font-medium text-zinc-900">
            URL de portada
          </label>
          <input
            id="portada"
            type="url"
            value={portadaUrl}
            onChange={(e) => setPortadaUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Creando…" : "Crear"}
          </button>

          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

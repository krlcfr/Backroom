"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"

interface Backroom {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  ownerId: string
  ownerName: string | null
  createdAt: string
}

export default function BackRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [backroom, setBackroom] = useState<Backroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBackroom() {
      try {
        const res = await fetch(`/api/backrooms/${id}`)
        if (!res.ok) {
          throw new Error("No se pudo cargar la BackRoom")
        }
        const data = await res.json()
        setBackroom(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchBackroom()
  }, [id])

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const esPropietario = currentUserId !== null && backroom?.ownerId === currentUserId

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ?? null)
    })
  }, [])

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/backrooms/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("No se pudo eliminar")
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("No se pudo eliminar la BackRoom")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-1/4" />
          <div className="h-32 bg-zinc-200 rounded" />
        </div>
      </div>
    )
  }

  if (error || !backroom) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 text-center">
        <p className="text-red-600">{error || "BackRoom no encontrada"}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-zinc-500 hover:text-zinc-900"
        >
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-900">
          Dashboard
        </Link>
        <span className="mx-2">›</span>
        <span className="text-zinc-900">{backroom.name}</span>
      </nav>

      <div className="mb-8 overflow-hidden rounded-lg border border-zinc-200">
        <div
          className="flex h-32 items-end p-6 bg-cover bg-center"
          style={
            backroom.coverUrl
              ? { backgroundImage: `url(${backroom.coverUrl})` }
              : { backgroundImage: "linear-gradient(to bottom right, #8B5CF6, #7C3AED)" }
          }
        >
          <h1 className="text-2xl font-bold text-white">{backroom.name}</h1>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-zinc-500">
            Propietario: <span className="text-zinc-900">{backroom.ownerName ?? "Desconocido"}</span>
          </p>
          {esPropietario && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                  <Link
                    href={`/dashboard/backrooms/${id}/miembros`}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    Gestionar miembros
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-50"
                  >
                    Eliminar BackRoom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {backroom.description && (
        <div className="mb-6 text-zinc-600">
          <p>{backroom.description}</p>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Salas</h2>
        {esPropietario && (
          <button
            disabled
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Nueva sala
          </button>
        )}
      </div>

      <div className="rounded-lg border border-dashed border-zinc-300 py-12 text-center">
        <p className="mb-4 text-sm text-zinc-500">
          Las salas se implementarán en el Módulo 3 (M-03).
        </p>
        {esPropietario && (
          <button
            disabled
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Crear primera sala (próximamente)
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Eliminar BackRoom</h3>
            <p className="mb-6 text-sm text-zinc-500">
              Esta acción es irreversible. Se eliminarán todas las salas y recursos asociados.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

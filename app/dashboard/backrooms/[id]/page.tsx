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
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#333535] rounded w-1/4" />
          <div className="h-32 bg-[#333535] rounded" />
        </div>
      </div>
    )
  }

  if (error || !backroom) {
    return (
      <div className="max-w-4xl text-center">
        <p className="text-[#ffb4ab]">{error || "BackRoom no encontrada"}</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-[#ccc3d8] hover:text-[#d2bbff]"
        >
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <nav className="mb-6 text-[12px] text-[#ccc3d8]">
        <Link href="/dashboard" className="hover:text-[#d2bbff] transition-colors">
          Dashboard
        </Link>
        <span className="mx-2 text-[#4a4455]">›</span>
        <span className="text-[#e2e2e2]">{backroom.name}</span>
      </nav>

      <div className="mb-8 overflow-hidden rounded-xl border border-[#4a4455]">
        <div
          className="flex h-32 items-end p-6 bg-cover bg-center"
          style={
            backroom.coverUrl
              ? { backgroundImage: `url(${backroom.coverUrl})` }
              : { backgroundImage: "linear-gradient(to bottom right, #8B5CF6, #7C3AED)" }
          }
        >
          <h1 className="text-[24px] font-bold text-white">{backroom.name}</h1>
        </div>
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e2020]">
          <p className="text-[13px] text-[#ccc3d8]">
            Propietario: <span className="text-[#e2e2e2]">{backroom.ownerName ?? "Desconocido"}</span>
          </p>
          {esPropietario && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md px-2 py-1 text-[13px] text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-[#4a4455] bg-[#1e2020] py-1 shadow-lg">
                  <Link
                    href={`/dashboard/backrooms/${id}/miembros`}
                    className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#ccc3d8] hover:bg-[#333535] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    Gestionar miembros
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-[13px] text-[#ffb4ab] hover:bg-[#333535] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Eliminar BackRoom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {backroom.description && (
        <div className="mb-6 text-[#ccc3d8] text-[14px]">
          <p>{backroom.description}</p>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Salas</h2>
        {esPropietario && (
          <button
            disabled
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-[12px] font-medium text-white opacity-50 cursor-not-allowed"
          >
            Nueva sala
          </button>
        )}
      </div>

      <div className="rounded-xl border-2 border-dashed border-[#4a4455] py-12 text-center bg-[#1e2020]/50">
        <span className="material-symbols-outlined text-[#958da1] text-[48px] mb-4 block">meeting_room</span>
        <p className="mb-4 text-[14px] text-[#ccc3d8]">
          Las salas se implementarán en el Módulo 3 (M-03).
        </p>
        {esPropietario && (
          <button
            disabled
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-[12px] font-medium text-white opacity-50 cursor-not-allowed"
          >
            Crear primera sala (próximamente)
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121414]/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-xl border border-[#4a4455] bg-[#1e2020] p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3 text-[#ffb4ab] mb-4">
              <span className="material-symbols-outlined text-[36px]">warning</span>
              <h3 className="text-[20px] font-semibold">Eliminar BackRoom</h3>
            </div>
            <p className="mb-6 text-[14px] text-[#ccc3d8]">
              Esta acción es <strong className="text-[#e2e2e2]">irreversible</strong>. Se eliminarán todas las salas y recursos asociados.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 border border-[#4a4455] rounded-lg text-[12px] font-medium text-[#ccc3d8] hover:bg-[#333535] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-[#ffb4ab] text-[#690005] hover:bg-[#ffb4ab]/80 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
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

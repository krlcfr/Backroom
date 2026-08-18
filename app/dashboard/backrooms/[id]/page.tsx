"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import RoomTree from "@/components/salas/room-tree"
import SubRoomsGrid from "@/components/salas/sub-rooms-grid"
import RightPanel from "@/components/salas/right-panel"
import CreateRoomModal from "@/components/modals/create-room-modal"
import Breadcrumb from "@/components/ui/breadcrumb"

interface Backroom {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  ownerId: string
  ownerName: string | null
  createdAt: string
}

interface Sala {
  id: string
  nombre: string
  descripcion: string | null
  depth: number
  created_at: string
}

interface SalaNode {
  id: string
  nombre: string
  depth: number
  children?: SalaNode[]
}

export default function BackRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [backroom, setBackroom] = useState<Backroom | null>(null)
  const [rooms, setRooms] = useState<Sala[]>([])
  const [tree, setTree] = useState<SalaNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [editNombre, setEditNombre] = useState("")
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editError, setEditError] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [showCreateRoom, setShowCreateRoom] = useState(false)
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [backroomRes, roomsRes] = await Promise.all([
          fetch(`/api/backrooms/${id}`),
          fetch(`/api/backrooms/${id}/rooms`),
        ])

        if (!backroomRes.ok) throw new Error("No se pudo cargar la BackRoom")
        const backroomData = await backroomRes.json()
        setBackroom(backroomData)

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          setRooms(roomsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  async function handleDelete() {
    if (!id) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/backrooms/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("No se pudo eliminar")
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("No se pudo eliminar la BackRoom")
      setDeleting(false)
    }
  }

  function openEdit() {
    setMenuOpen(false)
    if (!backroom) return
    setEditNombre(backroom.name)
    setEditDescripcion(backroom.description ?? "")
    setEditError("")
    setShowEditModal(true)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!backroom) return
    setEditError("")

    const trimmed = editNombre.trim()
    if (trimmed.length < 3) {
      setEditError("El nombre debe tener al menos 3 caracteres")
      return
    }

    setEditLoading(true)

    try {
      const res = await fetch(`/api/backrooms/${backroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: editDescripcion.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo actualizar")
      }

      const updated = await res.json()
      setBackroom(updated)
      setShowEditModal(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#333535] rounded w-3/4" />
            <div className="h-4 bg-[#333535] rounded w-1/2" />
            <div className="h-4 bg-[#333535] rounded w-2/3" />
          </div>
        </div>
        <div className="flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#333535] rounded w-1/4" />
            <div className="h-32 bg-[#333535] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !backroom) {
    return (
      <div className="text-center py-16">
        <p className="text-[#ffb4ab]">{error || "BackRoom no encontrada"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-[#ccc3d8] hover:text-[#d2bbff]">
          Volver al dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {tree.length > 0 && (
        <aside className="w-64 shrink-0 hidden md:flex flex-col">
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            <RoomTree rooms={tree} backroomId={backroom.id} />
          </nav>
        </aside>
      )}

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <Breadcrumb items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: backroom.name },
          ]} />
          <h1 className="text-[28px] font-bold text-[#e2e2e2] mb-2">{backroom.name}</h1>
          {backroom.description && (
            <p className="text-[#ccc3d8] text-[16px] max-w-2xl">{backroom.description}</p>
          )}
        </div>

        <SubRoomsGrid
          rooms={rooms}
          backroomId={backroom.id}
          onCreateClick={() => setShowCreateRoom(true)}
        />
      </main>

      <RightPanel backroom={backroom} esPropietario={esPropietario} />

      {showCreateRoom && (
        <CreateRoomModal
          backroomId={backroom.id}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setShowCreateRoom(false)
            setRooms((prev) => [...prev, { ...room, descripcion: null, depth: 0, created_at: new Date().toISOString() }])
          }}
        />
      )}

      {showEditModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false) }}
        >
          <div className="bg-[#303036] border border-[#4a4455] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Editar BackRoom</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEdit} className="px-6 py-2 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[#ccc3d8]">Nombre</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 transition-all"
                  disabled={editLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[#ccc3d8]">
                  Descripción <span className="text-[#ccc3d8]/50 font-normal">(Opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  placeholder="Define el propósito y nivel de acceso..."
                  className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 placeholder:text-[#ccc3d8]/40 resize-none transition-all"
                  disabled={editLoading}
                />
              </div>

              {editError && <p className="text-[12px] text-[#ffb4ab]">{editError}</p>}

              <div className="px-0 py-4 flex items-center justify-end gap-3 border-t border-[#4a4455]/50">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg border border-[#4a4455] bg-transparent text-[#e2e2e2] text-[12px] font-medium hover:bg-[#333535] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 rounded-lg bg-[#7c3aed] text-[#fafafa] text-[12px] font-semibold hover:bg-[#8b5cf6] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {editLoading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import RoomTree from "@/components/salas/room-tree"
import SubRoomsGrid from "@/components/salas/sub-rooms-grid"
import CreateRoomModal from "@/components/modals/create-room-modal"
import Breadcrumb from "@/components/ui/breadcrumb"

interface Sala {
  id: string
  nombre: string
  descripcion: string | null
  depth: number
  parent_id: string | null
  backroom_id: string
  created_at: string
}

interface SalaNode {
  id: string
  nombre: string
  depth: number
  children?: SalaNode[]
}

interface Backroom {
  id: string
  name: string
}

export default function SalaPage() {
  const { id, salaId } = useParams<{ id: string; salaId: string }>()
  const router = useRouter()

  const [sala, setSala] = useState<Sala | null>(null)
  const [children, setChildren] = useState<Sala[]>([])
  const [tree, setTree] = useState<SalaNode[]>([])
  const [backroom, setBackroom] = useState<Backroom | null>(null)
  const [parentSala, setParentSala] = useState<Sala | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateRoom, setShowCreateRoom] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editNombre, setEditNombre] = useState("")
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editError, setEditError] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)

  const atMaxDepth = sala && sala.depth >= 2

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    async function fetchData() {
      try {
        const [salaRes, roomsRes, backroomRes] = await Promise.all([
          fetch(`/api/rooms/${salaId}`),
          fetch(`/api/backrooms/${id}/rooms`),
          fetch(`/api/backrooms/${id}`),
        ])

        if (!salaRes.ok) throw new Error("No se pudo cargar la sala")
        const salaData = await salaRes.json()
        const salaInfo: Sala = salaData.data.room
        setSala(salaInfo)

        if (salaInfo.parent_id) {
          const parentRes = await fetch(`/api/rooms/${salaInfo.parent_id}`)
          if (parentRes.ok) {
            const parentData = await parentRes.json()
            setParentSala(parentData.data.room)
          }
        }

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json()
          const rootRoom = roomsData.find((r: any) => r.depth === 0)
          
          if (rootRoom) {
            const treeRes = await fetch(`/api/rooms/${rootRoom.id}/tree`)
            if (treeRes.ok) {
              const treeData = await treeRes.json()
              const treeNodes = treeData.data.room as SalaNode[]
              setTree(treeNodes)

              // Reconstruir children directos de esta sala a partir del árbol plano
              const thisRoomChildren = roomsData.filter((r: any) => r.parent_id === salaId)
              setChildren(thisRoomChildren)
            }
          }
        }

        if (backroomRes.ok) {
          const brData = await backroomRes.json()
          setBackroom({ id: brData.id, name: brData.name })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    if (salaId) fetchData()
  }, [id, salaId])

  function openEdit() {
    setMenuOpen(false)
    if (!sala) return
    setEditNombre(sala.nombre)
    setEditDescripcion(sala.descripcion ?? "")
    setEditError("")
    setShowEditModal(true)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!sala) return
    setEditError("")

    const trimmed = editNombre.trim()
    if (trimmed.length < 1) {
      setEditError("El nombre es requerido")
      return
    }

    setEditLoading(true)

    try {
      const res = await fetch(`/api/rooms/${sala.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: trimmed,
          descripcion: editDescripcion.trim() || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo actualizar")
      }

      const updated = await res.json()
      setSala(updated.data.room)
      setShowEditModal(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!sala) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/rooms/${sala.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("No se pudo eliminar")
      if (sala.parent_id) {
        router.push(`/dashboard/backrooms/${id}/salas/${sala.parent_id}`)
      } else {
        router.push(`/dashboard/backrooms/${id}`)
      }
      router.refresh()
    } catch {
      setError("No se pudo eliminar la sala")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#333535] rounded w-3/4" />
            <div className="h-4 bg-[#333535] rounded w-1/2" />
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

  if (error || !sala) {
    return (
      <div className="text-center py-16">
        <p className="text-[#ffb4ab]">{error || "Sala no encontrada"}</p>
        <Link href={`/dashboard/backrooms/${id}`} className="mt-4 inline-block text-[#ccc3d8] hover:text-[#d2bbff]">
          Volver a la BackRoom
        </Link>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: backroom?.name ?? "BackRoom", href: `/dashboard/backrooms/${id}` },
    ...(parentSala ? [{ label: parentSala.nombre, href: `/dashboard/backrooms/${id}/salas/${parentSala.id}` }] : []),
    { label: sala.nombre },
  ]

  return (
    <div className="flex gap-6">
      {tree.length > 0 && (
        <aside className="w-64 shrink-0 hidden md:flex flex-col">
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            <RoomTree rooms={tree} backroomId={id} activeRoomId={salaId} />
          </nav>
        </aside>
      )}

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <h1 className="text-[28px] font-bold text-[#e2e2e2] mb-2">{sala.nombre}</h1>
            {sala.descripcion && (
              <p className="text-[#ccc3d8] text-[16px] max-w-2xl">{sala.descripcion}</p>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#27272a] border border-[#4a4455] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 py-1">
                <button
                  onClick={openEdit}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Editar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setConfirmDelete(true) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {!atMaxDepth && (
          <SubRoomsGrid
            rooms={children}
            backroomId={id}
            onCreateClick={() => setShowCreateRoom(true)}
          />
        )}

        {atMaxDepth && children.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-[#958da1] mb-3 block">folder_off</span>
            <p className="text-[14px] text-[#958da1]">Esta sala no tiene subsalas.</p>
            <p className="text-[12px] text-[#958da1]/70 mt-1">Profundidad máxima alcanzada (nivel 3).</p>
          </div>
        )}
      </main>

      {showCreateRoom && (
        <CreateRoomModal
          backroomId={id}
          parentRoomId={salaId}
          parentRoomName={sala.nombre}
          currentDepth={sala.depth}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setShowCreateRoom(false)
            setChildren((prev) => [...prev, { ...room, descripcion: null, depth: sala.depth + 1, parent_id: salaId, backroom_id: id, created_at: new Date().toISOString() }])
            setTree((prev) => [...prev, { id: room.id, nombre: room.nombre, depth: sala.depth + 1, children: [] }])
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
              <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Editar Sala</h2>
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
                  placeholder="Define el propósito de esta sala..."
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
              <h3 className="text-[20px] font-semibold">Eliminar Sala</h3>
            </div>
            <p className="mb-6 text-[14px] text-[#ccc3d8]">
              Esta acción es <strong className="text-[#e2e2e2]">irreversible</strong>. Se eliminarán todas las subsalas y recursos asociados.
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

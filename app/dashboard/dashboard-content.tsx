"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import IconPicker from "@/components/ui/icon-picker"

interface Backroom {
  id: string
  ownerId: string
  ownerName: string | null
  name: string
  description: string | null
  coverUrl: string | null
  createdAt: string
  icono?: string
}

interface Org {
  id: string
  ownerId: string
  name: string
  description: string | null
  logoUrl: string | null
}

interface DashboardContentProps {
  backrooms: Backroom[]
  org: Org | null
  currentUserId: string | null
}

export default function DashboardContent({ backrooms: initialBackrooms, org, currentUserId }: DashboardContentProps) {
  const router = useRouter()
  
  const [backrooms, setBackrooms] = useState<Backroom[]>(initialBackrooms)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [icono, setIcono] = useState("domain")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const [menuBackroomId, setMenuBackroomId] = useState<string | null>(null)
  const [editBackroom, setEditBackroom] = useState<Backroom | null>(null)
  const [editNombre, setEditNombre] = useState("")
  const [editDescripcion, setEditDescripcion] = useState("")
  const [editIcono, setEditIcono] = useState("domain")
  const [editError, setEditError] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [deleteBackroom, setDeleteBackroom] = useState<Backroom | null>(null)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const orgName = org?.name ?? "Tu espacio"

  useEffect(() => {
    function handleOpen() {
      setShowCreateModal(true)
    }
    window.addEventListener("open-create-backroom", handleOpen)
    return () => window.removeEventListener("open-create-backroom", handleOpen)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuBackroomId(null)
      }
    }
    if (menuBackroomId) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuBackroomId])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const trimmed = nombre.trim()
    if (trimmed.length < 3) {
      setError("El nombre debe tener al menos 3 caracteres")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/backrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: descripcion.trim() || undefined,
          icono: icono,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo crear la BackRoom")
      }

      const backroom = await res.json()
      setShowCreateModal(false)
      setNombre("")
      setDescripcion("")
      router.push(`/dashboard/backrooms/${backroom.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la BackRoom")
    } finally {
      setLoading(false)
    }
  }

  function closeModal() {
    setShowCreateModal(false)
    setNombre("")
    setDescripcion("")
    setError("")
  }

  function openEdit(br: Backroom) {
    setMenuBackroomId(null)
    setEditBackroom(br)
    setEditNombre(br.name)
    setEditDescripcion(br.description ?? "")
    setEditIcono(br.icono ?? "domain")
    setEditError("")
  }

  function closeEditModal() {
    setEditBackroom(null)
    setEditNombre("")
    setEditDescripcion("")
    setEditError("")
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editBackroom) return
    setEditError("")

    const trimmed = editNombre.trim()
    if (trimmed.length < 3) {
      setEditError("El nombre debe tener al menos 3 caracteres")
      return
    }

    setEditLoading(true)

    try {
      const res = await fetch(`/api/backrooms/${editBackroom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          description: editDescripcion.trim() || undefined,
          icono: editIcono,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "No se pudo actualizar")
      }

      setEditBackroom(null)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setEditLoading(false)
    }
  }

  function openDelete(br: Backroom) {
    setMenuBackroomId(null)
    setDeleteBackroom(br)
  }

  async function handleDelete() {
    if (!deleteBackroom) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/backrooms/${deleteBackroom.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("No se pudo eliminar")
      setDeleteBackroom(null)
      router.refresh()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-headline-lg font-semibold text-[#e2e2e2]">Mis BackRooms</h1>
          <p className="text-[#ccc3d8] mt-1">
            {org ? `Gestiona los espacios de trabajo seguros de ${orgName}.` : "Tus espacios de trabajo personales."}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg flex items-center gap-2 self-start md:self-auto text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva BackRoom
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {backrooms.length > 0 ? (
            backrooms.map((br: Backroom) => {
              const esInvitado = currentUserId !== null && br.ownerId !== currentUserId
              const esPropietario = currentUserId !== null && br.ownerId === currentUserId

              return (
                <div key={br.id} className="relative group/card">
                  <Link
                    href={`/dashboard/backrooms/${br.id}`}
                    className="block bg-[#27272a] border border-[#3f3f46] rounded-xl p-6 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#333535] flex items-center justify-center border border-[#4a4455]">
                          <span className="material-symbols-outlined text-[#d2bbff] text-[24px]">folder_special</span>
                        </div>
                        <div>
                          <h3 className="text-[20px] font-semibold text-[#e2e2e2]">{br.name}</h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#7c3aed]/20 text-[#d2bbff] border border-[#7c3aed]/30 mt-1">
                            {esInvitado ? "Invitado" : "Activo"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {br.description ? (
                      <p className="text-[#ccc3d8] text-[14px] mb-6 max-w-xl">
                        {br.description}
                      </p>
                    ) : (
                      <div className="mb-6" />
                    )}
                    <div className="grid grid-cols-3 gap-4 border-t border-[#4a4455] pt-4 mt-auto">
                      <div>
                        <p className="text-[12px] font-medium text-[#ccc3d8] mb-1">Archivos</p>
                        <p className="text-[13px] text-[#e2e2e2]">---</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-[#ccc3d8] mb-1">Tamaño</p>
                        <p className="text-[13px] text-[#e2e2e2]">---</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-[#ccc3d8] mb-1">Última act.</p>
                        <p className="text-[13px] text-[#e2e2e2]">---</p>
                      </div>
                    </div>
                  </Link>
                  {esPropietario && (
                    <div className="absolute top-4 right-4" ref={menuBackroomId === br.id ? menuRef : undefined}>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setMenuBackroomId(menuBackroomId === br.id ? null : br.id)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2] transition-colors relative z-10"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {menuBackroomId === br.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-[#4a4455] bg-[#1e2020] py-1 shadow-lg">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openEdit(br)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-[13px] text-[#ccc3d8] hover:bg-[#333535] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              openDelete(br)
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-left text-[13px] text-[#ffb4ab] hover:bg-[#333535] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-[#4a4455] bg-[#121414]/50">
              <div className="w-16 h-16 rounded-full bg-[#333535] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#958da1] text-[32px]">inventory_2</span>
              </div>
              <h3 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">No hay BackRooms</h3>
              <p className="text-[#ccc3d8] max-w-md mb-6">
                {org
                  ? "Crea la primera BackRoom de tu organización para empezar a organizar archivos y salas."
                  : "Creá tu primera BackRoom para empezar a organizar archivos y salas."}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
              >
                Crear primera BackRoom
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-6">
            <h3 className="text-[12px] font-medium text-[#ccc3d8] uppercase tracking-wider mb-4 border-b border-[#4a4455] pb-2">
              Métricas Globales
            </h3>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#e2e2e2] text-[14px]">Total BackRooms</span>
                  <span className="material-symbols-outlined text-[#4a4455] text-[16px]">analytics</span>
                </div>
                <span className="text-[36px] font-bold text-[#d2bbff]">{backrooms.length}</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#e2e2e2] text-[14px]">Almacenamiento</span>
                  <span className="text-[13px] text-[#ccc3d8]">--- / 10 GB</span>
                </div>
                <div className="w-full bg-[#333535] rounded-full h-1.5">
                  <div className="bg-[#d2bbff] h-1.5 rounded-full" style={{ width: "0%" }} />
                </div>
              </div>

              <div className="pt-4 border-t border-[#4a4455]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#e2e2e2] text-[14px]">Miembros Activos</span>
                  <span className="bg-[#333535] text-[#ccc3d8] text-xs px-2 py-0.5 rounded-full">0</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#333535] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#958da1] text-[16px]">person</span>
                    </div>
                    <div>
                      <p className="text-[14px] text-[#e2e2e2]">---</p>
                      <p className="text-[12px] text-[#ccc3d8]">---</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva BackRoom */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-[#303036] border border-[#4a4455] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Crear nueva BackRoom</h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-2 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 shrink-0">
                  <label className="text-[12px] font-medium text-[#ccc3d8]">Icono</label>
                  <IconPicker value={icono} onChange={setIcono} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[12px] font-medium text-[#ccc3d8]">Nombre de la sala</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Proyecto Alpha"
                    className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 placeholder:text-[#ccc3d8]/40 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-[#ccc3d8]">
                    Descripción <span className="text-[#ccc3d8]/50 font-normal">(Opcional)</span>
                  </label>
                  <span className="text-[10px] text-[#ccc3d8]/50">Máx 200 carácteres</span>
                </div>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Define el propósito y nivel de acceso..."
                  className="w-full bg-[#1e2020] border border-[#4a4455] rounded-lg px-3 py-2.5 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 placeholder:text-[#ccc3d8]/40 resize-none transition-all"
                  disabled={loading}
                />
              </div>

              {org && (
                <div className="p-3 bg-[#282a2b] rounded-lg border border-[#4a4455] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#d2bbff] text-[18px] mt-0.5">shield</span>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-[#e2e2e2]">Heredar permisos de {org.name}</span>
                    <span className="text-[12px] text-[#ccc3d8] mt-0.5 leading-snug">
                      La sala adoptará la jerarquía base. Podrás configurar accesos granulares más tarde.
                    </span>
                  </div>
                </div>
              )}

              {error && <p className="text-[12px] text-[#ffb4ab]">{error}</p>}

              <div className="px-0 py-4 flex items-center justify-end gap-3 border-t border-[#4a4455]/50">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg border border-[#4a4455] bg-transparent text-[#e2e2e2] text-[12px] font-medium hover:bg-[#333535] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-[#7c3aed] text-[#fafafa] text-[12px] font-semibold hover:bg-[#8b5cf6] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar BackRoom */}
      {editBackroom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal() }}
        >
          <div className="bg-[#303036] border border-[#4a4455] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Editar BackRoom</h2>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleEdit} className="px-6 py-2 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 shrink-0">
                  <label className="text-[12px] font-medium text-[#ccc3d8]">Icono</label>
                  <IconPicker value={editIcono} onChange={setEditIcono} />
                </div>
                <div className="flex flex-col gap-2 flex-1">
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
                  onClick={closeEditModal}
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

      {/* Modal Eliminar BackRoom */}
      {deleteBackroom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteBackroom(null) }}
        >
          <div className="bg-[#303036] border border-[#4a4455] rounded-2xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-[480px] overflow-hidden flex flex-col">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 text-[#ffb4ab]">
                <span className="material-symbols-outlined text-[36px]">warning</span>
                <h3 className="text-[20px] font-semibold">Eliminar BackRoom</h3>
              </div>
            </div>

            <div className="px-6 pb-6">
              <p className="text-[14px] text-[#ccc3d8] mb-6">
                Esta acción es <strong className="text-[#e2e2e2]">irreversible</strong>. Se eliminarán todas las salas y recursos asociados a <strong className="text-[#e2e2e2]">{deleteBackroom.name}</strong>.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteBackroom(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-lg border border-[#4a4455] bg-transparent text-[#e2e2e2] text-[12px] font-medium hover:bg-[#333535] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-[#ffb4ab] text-[#690005] hover:bg-[#ffb4ab]/80 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface OrgMember {
  userId: string
  role: string
  status: string
  fullName: string | null
  email: string | null
  username: string | null
}

interface AddBackroomMemberModalProps {
  backroomId: string
  existingMembersIds: string[]
  onClose: () => void
  onSuccess: () => void
}

export default function AddBackroomMemberModal({ backroomId, existingMembersIds, onClose, onSuccess }: AddBackroomMemberModalProps) {
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  
  const [selectedUserId, setSelectedUserId] = useState("")
  const [permiso, setPermiso] = useState("solo_visualizar")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrgMembers() {
      try {
        setLoadingMembers(true)
        // 1. Get current org
        const orgRes = await fetch("/api/organizations/current")
        if (!orgRes.ok) throw new Error("No se pudo obtener la organización actual")
        const orgData = await orgRes.json()

        // 2. Get members
        const membersRes = await fetch(`/api/organizations/${orgData.orgId}/members`)
        if (!membersRes.ok) throw new Error("No se pudieron obtener los miembros de la organización")
        const membersData = await membersRes.json()

        // Filter out those who are already in the backroom
        const availableMembers = membersData.data?.filter((m: OrgMember) => !existingMembersIds.includes(m.userId)) || []
        setOrgMembers(availableMembers)
        
        if (availableMembers.length > 0) {
          setSelectedUserId(availableMembers[0].userId)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingMembers(false)
      }
    }

    fetchOrgMembers()
  }, [existingMembersIds])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      setError("Selecciona un usuario válido.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/backrooms/${backroomId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, permiso }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Error al añadir miembro al backroom")
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Añadir miembro de Organización</h2>
          <p className="text-sm text-[#a1a1aa] mb-6">
            Selecciona un miembro de tu organización para darle acceso directo a este Backroom.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          {loadingMembers ? (
            <div className="py-8 flex justify-center items-center">
              <span className="w-6 h-6 border-2 border-white/30 border-t-[#7c3aed] rounded-full animate-spin"></span>
            </div>
          ) : orgMembers.length === 0 ? (
            <div className="py-4 text-center text-[#a1a1aa] text-sm">
              Todos los miembros de la organización ya están en este Backroom o no hay más miembros disponibles.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-[#e4e4e7] mb-1">
                  Usuario
                </label>
                <select
                  id="userId"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-[#fafafa] focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] appearance-none"
                >
                  {orgMembers.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName || m.username} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="permiso" className="block text-sm font-medium text-[#e4e4e7] mb-1">
                  Rol en el Backroom
                </label>
                <select
                  id="permiso"
                  value={permiso}
                  onChange={(e) => setPermiso(e.target.value)}
                  className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-[#fafafa] focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] appearance-none"
                >
                  <option value="solo_visualizar">Solo visualizar (Lector)</option>
                  <option value="contribuir">Contribuir (Editor)</option>
                  <option value="admin">Administrador (Gestor)</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedUserId}
                  className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    "Añadir miembro"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null

  return createPortal(modalContent, document.body)
}

"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

interface Member {
  userId: string
  role: string
  status: string
  joinedAt: string | null
  lastAccessAt: string | null
  username: string | null
  fullName: string | null
  email: string | null
}

interface MiembrosTableProps {
  orgId: string
  ownerUserId: string
  currentUserId: string | null
  esPropietario: boolean
  miembros: Member[]
}

const ROLE_LABELS: Record<string, string> = {
  Propietario: "Propietario",
  admin: "Administrador",
  member: "Miembro",
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  pending: "Pendiente",
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

function memberDisplayName(m: Member) {
  return m.fullName || m.username || m.email || "Usuario"
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}

export default function MiembrosTable({
  orgId,
  ownerUserId,
  currentUserId,
  esPropietario,
  miembros,
}: MiembrosTableProps) {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "member">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all")
  const [busyUserId, setBusyUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [removing, setRemoving] = useState<Member | null>(null)

  const rows = useMemo(() => {
    const membersPlusOwner = [
      {
        userId: ownerUserId,
        role: "Propietario",
        status: "active",
        joinedAt: null,
        lastAccessAt: null,
        username: null,
        fullName: null,
        email: null,
      } as Member,
      ...miembros.filter((m) => m.userId !== ownerUserId),
    ]

    return membersPlusOwner.filter((m) => {
      const matchRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && m.role === "admin") ||
        (roleFilter === "member" && m.role === "member")
      const matchStatus =
        statusFilter === "all" || m.status === statusFilter
      return matchRole && matchStatus
    })
  }, [miembros, ownerUserId, roleFilter, statusFilter])

  async function handleChangeRole(member: Member, nextRole: string) {
    setBusyUserId(member.userId)
    setError("")

    try {
      const res = await fetch(
        `/api/organizations/${orgId}/members/${member.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: nextRole }),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "No se pudo cambiar el rol")
        return
      }

      router.refresh()
    } catch {
      setError("Error de conexión al cambiar el rol")
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleRemove() {
    if (!removing) return
    setBusyUserId(removing.userId)
    try {
      const isInvite = removing.userId.startsWith("invite-")
      if (isInvite) {
        const inviteId = removing.userId.replace("invite-", "")
        const res = await fetch(`/api/organizations/${orgId}/invitations/${inviteId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const { error } = await res.json()
          throw new Error(error?.message || "Error al revocar invitación")
        }
      } else {
        const res = await fetch(`/api/organizations/${orgId}/members/${removing.userId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const { error } = await res.json()
          throw new Error(error?.message || "Error al remover miembro")
        }
      }
      
      router.refresh()
      setRemoving(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusyUserId(null)
    }
  }

  const roleBadge = (role: string) => {
    const styles =
      role === "Propietario"
        ? "bg-[#7c3aed]/20 text-[#d2bbff] border-[#d2bbff]/30"
        : role === "admin"
          ? "bg-[#4a4455] text-[#e2e2e2] border-[#3f3f46]"
          : "bg-[#1e2020] text-[#ccc3d8] border-[#3f3f46]"
    return (
      <span
        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}
      >
        {ROLE_LABELS[role] ?? role}
      </span>
    )
  }

  const statusBadge = (status: string) => {
    const active = status === "active"
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
          active
            ? "border-[#b9f6ca]/30 bg-[#b9f6ca]/10 text-[#b9f6ca]"
            : "border-[#ffb4ab]/30 bg-[#ffb4ab]/10 text-[#ffb4ab]"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#4ade80]" : "bg-[#f87171]"}`}
        />
        {STATUS_LABELS[status] ?? status}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-[#3f3f46] bg-[#27272a]">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#3f3f46] p-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 py-2 text-[13px] text-[#e2e2e2] outline-none focus:border-[#a78bfa]"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="member">Miembros</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-[#3f3f46] bg-[#18181b] px-3 py-2 text-[13px] text-[#e2e2e2] outline-none focus:border-[#a78bfa]"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="pending">Pendientes</option>
        </select>
      </div>

      {error && <p className="border-b border-[#3f3f46] px-4 py-3 text-[12px] text-[#ffb4ab]">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#3f3f46] text-[11px] uppercase tracking-wide text-[#ccc3d8]/60">
              <th className="px-4 py-3 font-medium">Miembro</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Fecha unión</th>
              <th className="px-4 py-3 font-medium">Último acceso</th>
              {esPropietario && <th className="px-4 py-3 font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={esPropietario ? 6 : 5} className="px-4 py-10 text-center text-[#ccc3d8]">
                  Sin miembros para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              rows.map((m) => {
                const isOwner = m.role === "Propietario"
                const isSelf = m.userId === currentUserId
                const isInvite = m.userId.startsWith("invite-")
                const busy = busyUserId === m.userId

                return (
                  <tr key={m.userId} className="border-b border-[#3f3f46] last:border-0 hover:bg-[#18181b]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4a4455] text-[11px] font-semibold text-[#e2e2e2]">
                          {initials(memberDisplayName(m))}
                        </span>
                        <div>
                          <p className="font-medium text-[#e2e2e2]">
                            {memberDisplayName(m)}
                            {isSelf && (
                              <span className="ml-2 text-[11px] text-[#ccc3d8]/60">(tú)</span>
                            )}
                          </p>
                          <p className="text-[12px] text-[#ccc3d8]">{m.email ?? `@${m.username ?? ""}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{roleBadge(m.role)}</td>
                    <td className="px-4 py-3">{statusBadge(m.status)}</td>
                    <td className="px-4 py-3 text-[#ccc3d8]">{formatDate(m.joinedAt)}</td>
                    <td className="px-4 py-3 text-[#ccc3d8]">{formatDate(m.lastAccessAt)}</td>
                    {esPropietario && (
                      <td className="px-4 py-3">
                        {isOwner ? (
                          <span className="text-[12px] text-[#ccc3d8]/50">Único</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {!isInvite && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  handleChangeRole(m, m.role === "admin" ? "member" : "admin")
                                }
                                className="rounded-lg border border-[#3f3f46] px-3 py-1.5 text-[12px] text-[#e2e2e2] hover:bg-[#18181b] disabled:opacity-50"
                              >
                                {busy
                                  ? "Guardando..."
                                  : m.role === "admin"
                                    ? "Hacer Miembro"
                                    : "Hacer Admin"}
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setRemoving(m)}
                              className="rounded-lg border border-[#ffb4ab]/30 px-3 py-1.5 text-[12px] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50"
                            >
                              {isInvite ? "Revocar" : "Remover"}
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación */}
      {removing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#3f3f46] bg-[#27272a] p-6">
            <h3 className="text-[16px] font-semibold text-[#e2e2e2]">
              {removing.userId.startsWith("invite-") ? "Revocar invitación para" : "Remover a"} {memberDisplayName(removing)}?
            </h3>
            <p className="mt-2 text-[13px] text-[#ccc3d8]">
              {removing.userId.startsWith("invite-") 
                ? "El enlace de invitación dejará de ser válido inmediatamente."
                : "El miembro perderá el acceso a la organización y a sus BackRooms."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoving(null)}
                disabled={busyUserId === removing.userId}
                className="px-4 py-2 text-[12px] text-[#ccc3d8] hover:text-[#e2e2e2] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={busyUserId === removing.userId}
                className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                {busyUserId === removing.userId ? "Procesando..." : (removing.userId.startsWith("invite-") ? "Revocar" : "Remover")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

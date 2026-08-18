import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { InvitationsService } from "@/lib/services/invitations.service"
import { getUsuarioInterno } from "@/lib/auth/rbac"
import MiembrosTable from "./miembros-table"
import InviteButton from "./invite-button"

export default async function MiembrosPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const authId = sessionData.session?.user?.id ?? null

  let org = null
  let esPropietario = false
  let usuarioInternoId: string | null = null
  let miembros: Awaited<ReturnType<typeof OrganizationsService.listMembers>> = []
  let pendingInvitations: any[] = []

  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      usuarioInternoId = perfil?.id ?? null
      esPropietario = org !== null && org.ownerId === usuarioInternoId

      if (org) {
        miembros = await OrganizationsService.listMembers(org.id)
        pendingInvitations = await InvitationsService.listPendingInvitations(org.id)
      }
    } catch {
      org = null
    }
  }

  if (!org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#18181b] p-8 text-center">
        <h1 className="text-xl font-bold text-[#e2e2e2]">Sin organización</h1>
        <p className="max-w-md text-sm text-[#ccc3d8]">
          Aún no perteneces a una organización. Crea una para gestionar miembros.
        </p>
        <Link
          href="/org/crear"
          className="rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-[#fafafa] hover:bg-[#8b5cf6]"
        >
          Crear organización
        </Link>
      </div>
    )
  }

  const allMembers = [
    ...miembros,
    ...pendingInvitations.map((inv) => ({
      userId: `invite-${inv.id}`,
      role: inv.role,
      status: inv.status, // "pending"
      joinedAt: null,
      lastAccessAt: null,
      username: null,
      fullName: null,
      email: inv.email,
    }))
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2]">Miembros de {org.name}</h1>
          <p className="text-sm text-[#ccc3d8]">
            {miembros.length} miembro{miembros.length !== 1 ? "s" : ""} activo{miembros.length !== 1 ? "s" : ""} y {pendingInvitations.length} invitación{pendingInvitations.length !== 1 ? "es" : ""} pendiente{pendingInvitations.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[#3f3f46] px-4 py-2 text-sm text-[#ccc3d8] hover:text-[#e2e2e2]"
        >
          Volver al dashboard
        </Link>
      </div>

      <div className="mb-6">
        <InviteButton orgId={org.id} />
      </div>

      <MiembrosTable
        orgId={org.id}
        ownerUserId={org.ownerId}
        currentUserId={usuarioInternoId}
        esPropietario={esPropietario}
        miembros={allMembers}
      />
    </div>
  )
}

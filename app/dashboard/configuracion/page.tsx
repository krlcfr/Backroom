
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Configuración" };
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { InvitationsService } from "@/lib/services/invitations.service"
import { CargosService } from "@/lib/services/cargos.service"
import { getUsuarioInterno } from "@/lib/auth/rbac"
import ConfiguracionForm from "./configuracion-form"
import MiembrosTable from "./miembros/miembros-table"
import InviteButton from "./miembros/invite-button"

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const authId = sessionData.session?.user?.id ?? null

  let org = null
  let esPropietario = false
  let usuarioInternoId: string | null = null
  let miembros: Awaited<ReturnType<typeof OrganizationsService.listMembers>> = []
  let pendingInvitations: any[] = []
  let cargos: any[] = []

  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      usuarioInternoId = perfil?.id ?? null
      esPropietario = org !== null && org.ownerId === usuarioInternoId

      if (org) {
        miembros = await OrganizationsService.listMembers(org.id)
        pendingInvitations = await InvitationsService.listPendingInvitations(org.id)
        cargos = await CargosService.listByOrg(authId, org.id)
      }
    } catch {
      org = null
    }
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-[#333535] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#958da1] text-[32px]">apartment</span>
        </div>
        <h2 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">Sin organización</h2>
        <p className="text-[#ccc3d8] max-w-md mb-6">
          Aún no perteneces a una organización. Crea una para configurar su perfil.
        </p>
        <Link
          href="/org/crear"
          className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
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
    <div className="flex flex-col gap-12">
      <section>
        <h2 className="text-xl font-bold text-[#e2e2e2] mb-4 border-b border-[#3f3f46] pb-2">
          Perfil de la Organización
        </h2>
        {!esPropietario ? (
          <div className="rounded-xl border border-[#4a4455] bg-[#1e2020] p-8 text-center">
            <span className="material-symbols-outlined text-[#ffb4ab] text-[48px] mb-4 block">lock</span>
            <p className="text-[14px] text-[#ffb4ab]">
              Solo el Propietario puede configurar el perfil de la organización.
            </p>
          </div>
        ) : (
          <ConfiguracionForm
            org={{
              id: org.id,
              name: org.name,
              description: org.description ?? "",
              logoUrl: org.logoUrl,
              updatedAt: org.updatedAt,
              hasCertificate: !!org.certificatePath,
            }}
          />
        )}
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between border-b border-[#3f3f46] pb-2">
          <div>
            <h2 className="text-xl font-bold text-[#e2e2e2]">Miembros y Permisos</h2>
            <p className="text-sm text-[#ccc3d8]">
              {miembros.length} miembro{miembros.length !== 1 ? "s" : ""} activo{miembros.length !== 1 ? "s" : ""} y {pendingInvitations.length} invitación{pendingInvitations.length !== 1 ? "es" : ""} pendiente{pendingInvitations.length !== 1 ? "s" : ""}.
            </p>
          </div>
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
          cargos={cargos}
        />
      </section>
    </div>
  )
}


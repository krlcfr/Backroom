import { createClient } from "@/lib/supabase/server"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { SuperAdminService } from "@/lib/services/superadmin.service"
import { getUsuarioInterno } from "@/lib/auth/rbac"
import DashboardSidebar from "@/components/layout/dashboard-sidebar"
import DashboardHeader from "@/components/layout/dashboard-header"
import SessionTimeout from "@/components/session-timeout"
import { UpsellModal } from "@/components/modals/upsell-modal"
import { LimitsProvider } from "@/components/providers/limits-provider"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const authId = sessionData.session?.user?.id ?? null

  let org: { id: string; ownerId: string; name: string; description: string | null; logoUrl: string | null; updatedAt: string } | null = null
  let usuarioInternoId: string | null = null
  let esPropietario = false
  let isSuperAdmin = false

  if (authId) {
    try {
      isSuperAdmin = await SuperAdminService.isSuperAdmin(authId)
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      usuarioInternoId = perfil?.id ?? null
      esPropietario = org !== null && org.ownerId === usuarioInternoId
    } catch {
      org = null
    }
  }

  const userName = sessionData.session?.user?.user_metadata?.full_name
    ?? sessionData.session?.user?.user_metadata?.name
    ?? sessionData.session?.user?.email
    ?? "Usuario"

  const userAvatar = sessionData.session?.user?.user_metadata?.avatar_url ?? null

  return (
    <LimitsProvider>
      <div className="flex min-h-screen flex-col bg-[#121414]">
        <SessionTimeout />
        <DashboardHeader userName={userName} userAvatar={userAvatar} />
        <div className="flex flex-1 pt-16">
          <DashboardSidebar
            orgName={org?.name ?? null}
            orgLogo={org?.logoUrl ?? null}
            orgUpdatedAt={org?.updatedAt ?? null}
            esPropietario={esPropietario}
            isSuperAdmin={isSuperAdmin}
          />
          <main className="flex-1 md:ml-[260px] p-4 md:p-8 w-full">
            {children}
          </main>
        </div>
        <UpsellModal orgId={org?.id} />
      </div>
    </LimitsProvider>
  )
}

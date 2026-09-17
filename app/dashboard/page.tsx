import { createClient } from "@/lib/supabase/server"
import { BackroomsService } from "@/lib/services/backrooms.service"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { getLimitsForOrg, getOrganizationPlan, getOrganizationUsageMetrics } from "@/lib/limits"
import { redirect } from "next/navigation"
import DashboardContent from "./dashboard-content"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Dashboard',
}

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser();
  const authId = user?.id ?? null

  let org: Org | null = null
  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
    } catch {
      org = null
    }
  }

  if (!org) {
    redirect("/org/crear")
  }

  let backrooms: Backroom[] = []
  try {
    backrooms = await BackroomsService.listForUser(authId ?? undefined)
  } catch {
    backrooms = []
  }

  let esPropietario = false
  if (authId && org) {
    const { getUsuarioInterno } = await import("@/lib/auth/rbac")
    const perfil = await getUsuarioInterno(authId)
    if (perfil && org.ownerId === perfil.id) {
      esPropietario = true
    }
  }

  const limits = await getLimitsForOrg(org.id)
  const current_usage = await getOrganizationUsageMetrics(org.id, org.ownerId)

  return (
    <DashboardContent
      backrooms={backrooms}
      org={org}
      currentUserId={authId}
      esPropietario={esPropietario}
      limits={limits}
      currentUsage={current_usage}
    />
  )
}

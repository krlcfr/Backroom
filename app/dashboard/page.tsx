import { createClient } from "@/lib/supabase/server"
import { BackroomsService } from "@/lib/services/backrooms.service"
import { OrganizationsService } from "@/lib/services/organizations.service"
import DashboardContent from "./dashboard-content"

interface Backroom {
  id: string
  ownerId: string
  ownerName: string | null
  name: string
  description: string | null
  coverUrl: string | null
  createdAt: string
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
  const { data: sessionData } = await supabase.auth.getSession()
  const authId = sessionData.session?.user?.id ?? null

  let org: Org | null = null
  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
    } catch {
      org = null
    }
  }

  let backrooms: Backroom[] = []
  try {
    backrooms = await BackroomsService.listForUser()
  } catch {
    backrooms = []
  }

  return (
    <DashboardContent
      backrooms={backrooms}
      org={org}
      currentUserId={authId}
    />
  )
}

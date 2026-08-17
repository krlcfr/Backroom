import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { BackroomsService } from "@/lib/services/backrooms.service"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { getUsuarioInterno } from "@/lib/auth/rbac"

const PORTADA_COLORS = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
]

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
  let usuarioInternoId: string | null = null
  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      usuarioInternoId = perfil?.id ?? null
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

  const currentUserId = authId
  const orgName = org?.name ?? "Tu espacio"

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#e2e2e2] leading-tight">Mis BackRooms</h1>
          <p className="text-[#ccc3d8] mt-1">
            {org ? `Gestiona los espacios de trabajo seguros de ${orgName}.` : "Tus espacios de trabajo personales."}
          </p>
        </div>
        <Link
          href="/dashboard/backrooms/nuevo"
          className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg flex items-center gap-2 self-start md:self-auto text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nueva BackRoom
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {backrooms.length > 0 ? (
            backrooms.map((br: Backroom, i: number) => {
              const gradient = PORTADA_COLORS[i % PORTADA_COLORS.length]
              const esInvitado = currentUserId !== null && br.ownerId !== currentUserId

              return (
                <Link
                  key={br.id}
                  href={`/dashboard/backrooms/${br.id}`}
                  className="group rounded-xl p-6 flex flex-col relative overflow-hidden border border-[#4a4455] bg-[#1e2020] hover:border-[#7c3aed]/50 transition-all"
                >
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
                  {br.description && (
                    <p className="text-[#ccc3d8] text-[14px] mb-4 max-w-xl">
                      {br.description}
                    </p>
                  )}
                </Link>
              )
            })
          ) : (
            <div className="rounded-xl p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#4a4455] bg-[#1e2020]/50">
              <div className="w-16 h-16 rounded-full bg-[#333535] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[#958da1] text-[32px]">inventory_2</span>
              </div>
              <h3 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">No hay BackRooms</h3>
              <p className="text-[#ccc3d8] max-w-md mb-6">
                {org
                  ? "Crea la primera BackRoom de tu organización para empezar a organizar archivos y salas."
                  : "Creá tu primera BackRoom para empezar a organizar archivos y salas."}
              </p>
              <Link
                href="/dashboard/backrooms/nuevo"
                className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
              >
                Crear primera BackRoom
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-xl p-6 border border-[#4a4455] bg-[#1e2020]">
            <h3 className="text-[12px] font-medium text-[#ccc3d8] uppercase tracking-wider mb-4 border-b border-[#4a4455] pb-2">
              Resumen
            </h3>
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#e2e2e2] text-[14px]">Total BackRooms</span>
                  <span className="material-symbols-outlined text-[#958da1] text-[16px]">analytics</span>
                </div>
                <span className="text-[36px] font-bold text-[#d2bbff]">{backrooms.length}</span>
              </div>

              {org && (
                <div className="pt-4 border-t border-[#4a4455]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#e2e2e2] text-[14px]">Organización</span>
                  </div>
                  <p className="text-[14px] text-[#d2bbff] font-medium">{org.name}</p>
                  {org.description && (
                    <p className="text-[12px] text-[#ccc3d8] mt-1">{org.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

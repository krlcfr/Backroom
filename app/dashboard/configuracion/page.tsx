import type { Metadata } from "next";
export const metadata: Metadata = { title: "Configuración" };
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { OrganizationsService } from "@/lib/services/organizations.service"
import { getUsuarioInterno } from "@/lib/auth/rbac"
import ConfiguracionForm from "./configuracion-form"

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const authId = sessionData.session?.user?.id ?? null

  let org = null
  let esPropietario = false

  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      esPropietario = org !== null && org.ownerId === perfil?.id
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-lg font-semibold text-[#e2e2e2] mb-2">Configuración de Organización</h1>
        <p className="text-[#ccc3d8]">
          Gestiona los detalles, seguridad y ciclo de vida de &apos;{org.name}&apos;.
        </p>
      </div>

      {!esPropietario ? (
        <div className="rounded-xl border border-[#4a4455] bg-[#1e2020] p-8 text-center">
          <span className="material-symbols-outlined text-[#ffb4ab] text-[48px] mb-4 block">lock</span>
          <p className="text-[14px] text-[#ffb4ab]">
            Solo el Propietario puede configurar la organización.
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
          }}
        />
      )}
    </div>
  )
}

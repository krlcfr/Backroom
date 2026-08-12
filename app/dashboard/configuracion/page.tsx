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
  let usuarioInternoId: string | null = null

  if (authId) {
    try {
      org = await OrganizationsService.getOrgForUser(authId)
      const perfil = await getUsuarioInterno(authId)
      usuarioInternoId = perfil?.id ?? null
      esPropietario = org !== null && org.ownerId === usuarioInternoId
    } catch {
      org = null
    }
  }

  if (!org) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#18181b] p-8 text-center">
        <h1 className="text-xl font-bold text-[#e2e2e2]">Sin organización</h1>
        <p className="max-w-md text-sm text-[#ccc3d8]">
          Aún no perteneces a una organización. Crea una para configurar su perfil.
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e2e2e2]">Configuración de la organización</h1>
          <p className="text-sm text-[#ccc3d8]">Edita el perfil de {org.name}.</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[#3f3f46] px-4 py-2 text-sm text-[#ccc3d8] hover:text-[#e2e2e2]"
        >
          Volver al dashboard
        </Link>
      </div>

      {!esPropietario ? (
        <div className="rounded-lg border border-[#3f3f46] bg-[#27272a] p-8 text-center">
          <p className="text-sm text-[#ffb4ab]">
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
          }}
        />
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { InvitationsService } from "@/lib/services/invitations.service"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function InvitationLandingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  let invitation: any = null
  let errorMsg = null

  try {
    invitation = await InvitationsService.getInvitationByToken(token)
  } catch (error: any) {
    errorMsg = error.message || "Invitación no válida o expirada"
  }

  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const isAuthenticated = !!sessionData.session

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] p-4 font-sans text-[#fafafa]">
      <div className="w-full max-w-md rounded-2xl border border-[#27272a] bg-[#18181b] p-8 shadow-2xl">
        {errorMsg ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#fafafa]">Enlace no válido</h2>
            <p className="mb-6 text-sm text-[#a1a1aa]">{errorMsg}</p>
            <Link
              href="/dashboard"
              className="inline-block w-full rounded-lg bg-[#27272a] px-4 py-2 text-sm font-medium hover:bg-[#3f3f46] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <div className="text-center">
            {invitation.organizations?.logo_url ? (
              <img
                src={invitation.organizations.logo_url}
                alt="Logo"
                className="mx-auto mb-4 h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-[#27272a] text-xl font-bold text-[#fafafa]">
                {invitation.organizations?.name?.substring(0, 2).toUpperCase()}
              </div>
            )}
            
            <h2 className="mb-2 text-xl font-semibold text-[#fafafa]">Estás invitado</h2>
            <p className="mb-6 text-sm text-[#a1a1aa]">
              Te han invitado a unirte a <strong>{invitation.organizations?.name}</strong> como {invitation.role === "admin" ? "Administrador" : "Miembro"}.
            </p>

            {isAuthenticated ? (
              <form
                action={async () => {
                  "use server"
                  try {
                    await InvitationsService.acceptInvitation(sessionData.session!.user.id, token)
                  } catch (e: any) {
                    return redirect(`/invitaciones/${token}?error=${encodeURIComponent(e.message)}`)
                  }
                  redirect("/dashboard")
                }}
              >
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors"
                >
                  Aceptar invitación
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/login?redirect=/invitaciones/${token}`}
                  className="block w-full rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors"
                >
                  Iniciar sesión para aceptar
                </Link>
                <Link
                  href={`/registro?redirect=/invitaciones/${token}&email=${encodeURIComponent(invitation.email)}`}
                  className="block w-full rounded-lg border border-[#3f3f46] bg-transparent px-4 py-2.5 text-sm font-medium text-[#e4e4e7] hover:bg-[#27272a] transition-colors"
                >
                  Crear una cuenta nueva
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

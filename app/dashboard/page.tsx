import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { BackroomsService } from "@/lib/services/backrooms.service"

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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const currentUserId = sessionData.session?.user?.id ?? null

  let backrooms: Backroom[] = []
  try {
    backrooms = await BackroomsService.listForUser()
  } catch {
    backrooms = []
  }

  const limite = 3

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis BackRooms</h1>
        {backrooms.length < limite && (
          <Link
            href="/dashboard/backrooms/nuevo"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Nueva BackRoom
          </Link>
        )}
      </div>

      {backrooms.length > 0 && (
        <p className="mb-6 text-sm text-zinc-500">
          {backrooms.length} de {limite} BackRooms usadas
        </p>
      )}

      {backrooms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-zinc-300 py-16">
          <p className="text-sm text-zinc-500">
            Todavía no tenés ninguna BackRoom.
          </p>
          <Link
            href="/dashboard/backrooms/nuevo"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Crear primera BackRoom
          </Link>
          <Link
            href="#"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Unirse con código
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {backrooms.map((br: Backroom, i: number) => {
            const gradient =
              PORTADA_COLORS[i % PORTADA_COLORS.length]
            const esInvitado = currentUserId !== null && br.ownerId !== currentUserId

            return (
              <Link
                key={br.id}
                href={`/dashboard/backrooms/${br.id}`}
                className="group overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-28 items-end bg-cover bg-center p-4"
                  style={
                    br.coverUrl
                      ? { backgroundImage: `url(${br.coverUrl})` }
                      : { backgroundImage: `linear-gradient(to bottom right, ${gradient})` }
                  }
                >
                  {esInvitado && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-700">
                      {br.ownerName ?? "Invitado"}
                    </span>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="font-semibold text-zinc-900 group-hover:underline">
                    {br.name}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {br.description ? "Con descripción" : "Sin descripción"}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {backrooms.length > 0 && backrooms.length < limite && (
        <div className="mt-8">
          <Link
            href="#"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Unirse con código
          </Link>
        </div>
      )}
    </div>
  )
}

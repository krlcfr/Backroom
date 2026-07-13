import Link from "next/link"

const MOCK_USER_ID = "user-1"

const MOCK_BACKROOMS = [
  {
    id: "br-1",
    nombre: "Matemáticas Discretas",
    descripcion: "Apuntes y ejercicios de MD",
    portada_url: null,
    propietario_id: MOCK_USER_ID,
    cant_salas: 3,
    created_at: "2026-07-01",
  },
  {
    id: "br-2",
    nombre: "Programación Web",
    descripcion: "Recursos de frontend y backend",
    portada_url: null,
    propietario_id: "user-2",
    cant_salas: 5,
    created_at: "2026-07-05",
  },
]

const PORTADA_COLORS = [
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
]

export default function DashboardPage() {
  const backrooms = MOCK_BACKROOMS
  const currentUserId = MOCK_USER_ID
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
          {backrooms.map((br, i) => {
            const gradient =
              PORTADA_COLORS[i % PORTADA_COLORS.length]
            const esInvitado = br.propietario_id !== currentUserId

            return (
              <Link
                key={br.id}
                href={`/dashboard/backrooms/${br.id}`}
                className="group overflow-hidden rounded-lg border border-zinc-200 transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-28 items-end bg-gradient-to-br ${gradient} p-4`}
                >
                  {esInvitado && (
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-700">
                      Invitado
                    </span>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h2 className="font-semibold text-zinc-900 group-hover:underline">
                    {br.nombre}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {br.cant_salas} sala{br.cant_salas !== 1 ? "s" : ""}
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

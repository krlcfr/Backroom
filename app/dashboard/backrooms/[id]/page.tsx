"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const MOCK_USER_ID = "user-1"

const MOCK_SALAS = [
  { id: "sala-1", nombre: "Parciales viejos", cant_recursos: 4 },
  { id: "sala-2", nombre: "Resúmenes", cant_recursos: 7 },
  { id: "sala-3", nombre: "Ejercicios prácticos", cant_recursos: 2 },
]

const MOCK_BACKROOMS: Record<string, { nombre: string; descripcion: string; propietario_id: string; propietario_nombre: string; salas: typeof MOCK_SALAS }> = {
  "br-1": {
    nombre: "Matemáticas Discretas",
    descripcion: "Apuntes y ejercicios de MD",
    propietario_id: MOCK_USER_ID,
    propietario_nombre: "Vos",
    salas: MOCK_SALAS,
  },
  "br-2": {
    nombre: "Programación Web",
    descripcion: "Recursos de frontend y backend",
    propietario_id: "user-2",
    propietario_nombre: "Carlos",
    salas: [],
  },
}

export default function BackRoomPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const backroom = MOCK_BACKROOMS[id] ?? {
    nombre: "BackRoom",
    descripcion: "",
    propietario_id: MOCK_USER_ID,
    propietario_nombre: "Vos",
    salas: [],
  }

  const esPropietario = backroom.propietario_id === MOCK_USER_ID

  async function handleDelete() {
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 600))
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-900">
          Dashboard
        </Link>
        <span className="mx-2">›</span>
        <span className="text-zinc-900">{backroom.nombre}</span>
      </nav>

      <div className="mb-8 overflow-hidden rounded-lg border border-zinc-200">
        <div className="flex h-32 items-end bg-gradient-to-br from-violet-500 to-purple-600 p-6">
          <h1 className="text-2xl font-bold text-white">{backroom.nombre}</h1>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-zinc-500">
            Propietario: <span className="text-zinc-900">{backroom.propietario_nombre}</span>
          </p>
          {esPropietario && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              >
                ⋮
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-zinc-200 bg-white py-1 shadow-lg">
                  <Link
                    href={`/dashboard/backrooms/${id}/miembros`}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    Gestionar miembros
                  </Link>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-50"
                  >
                    Eliminar BackRoom
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Salas</h2>
        {esPropietario && (
          <button
            disabled
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Nueva sala
          </button>
        )}
      </div>

      {backroom.salas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-12 text-center">
          <p className="mb-4 text-sm text-zinc-500">
            Esta BackRoom todavía no tiene salas.
          </p>
          {esPropietario && (
            <button
              disabled
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white opacity-50"
            >
              Crear primera sala
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {backroom.salas.map((sala) => (
            <Link
              key={sala.id}
              href={`/dashboard/backrooms/${id}/salas/${sala.id}`}
              className="rounded-lg border border-zinc-200 p-4 transition-shadow hover:shadow-md"
            >
              <h3 className="font-medium text-zinc-900">{sala.nombre}</h3>
              <p className="mt-1 text-xs text-zinc-500">
                {sala.cant_recursos} recurso{sala.cant_recursos !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">Eliminar BackRoom</h3>
            <p className="mb-6 text-sm text-zinc-500">
              Esta acción es irreversible. Se eliminarán todas las salas y recursos asociados.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import Link from "next/link"

interface Sala {
  id: string
  nombre: string
  descripcion: string | null
  depth: number
  created_at: string
  icono?: string
}

interface SubRoomsGridProps {
  rooms: Sala[]
  backroomId: string
  onCreateClick: () => void
  canCreate?: boolean
}

export default function SubRoomsGrid({ rooms, backroomId, onCreateClick, canCreate = true }: SubRoomsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Link
          key={room.id}
          href={`/dashboard/backrooms/${backroomId}/salas/${room.id}`}
          className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-4 hover:border-[#7c3aed] transition-colors group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1e2020] flex items-center justify-center text-[#d2bbff] group-hover:bg-[#7c3aed]/20 transition-colors">
              <span className="material-symbols-outlined">{room.icono || "grid_view"}</span>
            </div>
          </div>
          <h3 className="font-semibold text-[#e2e2e2] text-[16px] mb-1">{room.nombre}</h3>
          {room.descripcion && (
            <p className="text-[#ccc3d8] text-[13px] line-clamp-2">{room.descripcion}</p>
          )}
        </Link>
      ))}

      <button
        onClick={() => {
          if (canCreate) {
            onCreateClick()
          } else {
            window.dispatchEvent(new CustomEvent("show-upsell", { detail: { message: "Has alcanzado el límite de jerarquía (niveles de salas) de tu plan actual." } }))
          }
        }}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center min-h-[160px] transition-colors ${
          canCreate
            ? "border-[#4a4455] hover:bg-[#7c3aed]/10 hover:border-[#7c3aed] group"
            : "border-[#3f3f46] bg-[#27272a] opacity-60 cursor-not-allowed"
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
          canCreate
            ? "bg-[#1e2020] text-[#d2bbff] group-hover:bg-[#7c3aed]/20"
            : "bg-[#333535] text-[#958da1]"
        }`}>
          <span className="material-symbols-outlined text-[32px]">{canCreate ? "add" : "lock"}</span>
        </div>
        <h3 className="font-semibold text-[#e2e2e2] text-[16px] mb-1">Crear nueva sala</h3>
        <p className="text-[#ccc3d8] text-[13px]">
          {canCreate ? "Configura un nuevo espacio de trabajo jerárquico." : "Límite alcanzado"}
        </p>
      </button>
    </div>
  )
}

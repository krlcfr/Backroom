"use client"

import Link from "next/link"

interface Sala {
  id: string
  nombre: string
  descripcion: string | null
  depth: number
  created_at: string
}

interface SubRoomsGridProps {
  rooms: Sala[]
  backroomId: string
  onCreateClick: () => void
}

export default function SubRoomsGrid({ rooms, backroomId, onCreateClick }: SubRoomsGridProps) {
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
              <span className="material-symbols-outlined">folder</span>
            </div>
          </div>
          <h3 className="font-semibold text-[#e2e2e2] text-[16px] mb-1">{room.nombre}</h3>
          {room.descripcion && (
            <p className="text-[#ccc3d8] text-[13px] line-clamp-2">{room.descripcion}</p>
          )}
        </Link>
      ))}

      <button
        onClick={onCreateClick}
        className="border-2 border-dashed border-[#4a4455] rounded-xl p-4 hover:bg-[#7c3aed]/10 hover:border-[#7c3aed] transition-colors group flex flex-col items-center justify-center text-center min-h-[160px]"
      >
        <div className="w-12 h-12 rounded-full bg-[#1e2020] flex items-center justify-center text-[#d2bbff] mb-3 group-hover:bg-[#7c3aed]/20 transition-colors">
          <span className="material-symbols-outlined text-[32px]">add</span>
        </div>
        <h3 className="font-semibold text-[#e2e2e2] text-[16px] mb-1">Crear nueva sala</h3>
        <p className="text-[#ccc3d8] text-[13px]">Configura un nuevo espacio de trabajo jerárquico.</p>
      </button>
    </div>
  )
}

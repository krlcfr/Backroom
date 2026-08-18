"use client"

import Link from "next/link"

interface Backroom {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  ownerId: string
  ownerName: string | null
  createdAt: string
}

interface RightPanelProps {
  backroom: Backroom
  esPropietario: boolean
}

export default function RightPanel({ backroom, esPropietario }: RightPanelProps) {
  const createdDate = new Date(backroom.createdAt).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <aside className="w-80 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/dashboard/backrooms/${backroom.id}/salas`}
          className="w-full bg-[#7c3aed] text-white hover:bg-[#8b5cf6] transition-colors text-[12px] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">upload</span>
          Subir recurso
        </Link>
        {esPropietario && (
          <Link
            href={`/dashboard/backrooms/${backroom.id}/miembros`}
            className="w-full bg-transparent border border-[#3f3f46] text-[#e2e2e2] hover:bg-[#27272a] transition-colors text-[12px] font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            Gestionar permisos
          </Link>
        )}
      </div>

      <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-4">
        <h3 className="text-[12px] text-[#ccc3d8] uppercase tracking-wider mb-4 border-b border-[#3f3f46] pb-2 font-medium">
          Room Details
        </h3>
        <div className="flex flex-col gap-3 text-[14px]">
          <div className="flex justify-between">
            <span className="text-[#958da1]">Creada</span>
            <span className="text-[#ccc3d8] text-[13px]">{createdDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#958da1]">Propietario</span>
            <span className="text-[#ccc3d8] text-[13px]">{backroom.ownerName ?? "Desconocido"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#958da1]">Estado</span>
            <span className="text-[#d2bbff] flex items-center gap-1 text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#d2bbff]" />
              Activa
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

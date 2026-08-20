"use client"

import { useState } from "react"
import Link from "next/link"
import RoomTree, { RoomNode } from "./room-tree"
import RoomGraphModal from "./room-graph-modal"

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
  tree?: RoomNode[]
  activeRoomId?: string
}

export default function RightPanel({ backroom, esPropietario, tree, activeRoomId }: RightPanelProps) {
  const [isTreeExpanded, setIsTreeExpanded] = useState(true)
  const [showGraph, setShowGraph] = useState(false)

  const createdDate = new Date(backroom.createdAt).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
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

      {tree && tree.length > 0 && (
        <div className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-4">
          <div
            onClick={() => setIsTreeExpanded(!isTreeExpanded)}
            className="flex items-center justify-between w-full text-left cursor-pointer"
          >
            <h3 className="text-[12px] text-[#ccc3d8] uppercase tracking-wider font-medium flex items-center gap-2">
              Estructura de Salas
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGraph(true)
                }}
                className="flex items-center gap-1 text-[10px] text-[#a78bfa] hover:text-[#d2bbff] transition-colors bg-[#333535] px-1.5 py-0.5 rounded"
                title="Ver mapa visual"
              >
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                Mapa
              </button>
            </h3>
            <span className="material-symbols-outlined text-[16px] text-[#958da1] transition-transform">
              {isTreeExpanded ? "expand_less" : "expand_more"}
            </span>
          </div>
          
          {isTreeExpanded && (
            <div className="mt-3 border-t border-[#3f3f46] pt-2">
              <RoomTree rooms={tree} backroomId={backroom.id} activeRoomId={activeRoomId} />
            </div>
          )}
        </div>
      )}
      </aside>
      {showGraph && tree && (
        <RoomGraphModal
          tree={tree}
          backroomId={backroom.id}
          backroomName={backroom.name}
          activeRoomId={activeRoomId}
          onClose={() => setShowGraph(false)}
        />
      )}
    </>
  )
}

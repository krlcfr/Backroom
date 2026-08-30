"use client"

import { useState, useEffect } from "react"
import HierarchyMapView from "./hierarchy-map-view"
import type { RoomNode } from "@/components/salas/room-tree"

export default function HierarchyPageClient({ backrooms }: { backrooms: any[] }) {
  const [selectedBackroomId, setSelectedBackroomId] = useState<string | null>(
    backrooms.length > 0 ? backrooms[0].id : null
  )
  const [tree, setTree] = useState<RoomNode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHierarchy() {
      if (!selectedBackroomId) return
      setLoading(true)
      setError(null)
      try {
        // 1. Obtener las salas del backroom para encontrar la sala raíz
        const roomsRes = await fetch(`/api/backrooms/${selectedBackroomId}/rooms`)
        if (!roomsRes.ok) throw new Error("Error al obtener salas")
        const roomsData = await roomsRes.json()
        
        const rootRoom = roomsData.find((r: any) => r.depth === 0)
        if (!rootRoom) {
          setTree([])
          setLoading(false)
          return
        }

        // 2. Obtener el árbol a partir de la sala raíz
        const treeRes = await fetch(`/api/rooms/${rootRoom.id}/tree`)
        if (!treeRes.ok) throw new Error("Error al obtener el árbol")
        const treeData = await treeRes.json()
        
        setTree(treeData.data.room)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchHierarchy()
  }, [selectedBackroomId])

  if (backrooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-[#333535] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[#958da1] text-[32px]">account_tree</span>
        </div>
        <h2 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">Sin Jerarquías</h2>
        <p className="text-[#ccc3d8] max-w-md">
          Aún no tienes ningún BackRoom creado. Crea uno primero para ver su jerarquía.
        </p>
      </div>
    )
  }

  const selectedBackroom = backrooms.find(b => b.id === selectedBackroomId)

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg font-semibold text-[#e2e2e2]">Jerarquía</h1>
          <p className="text-[#ccc3d8] mt-1">Explora la estructura completa de tus BackRooms.</p>
        </div>
        
        {backrooms.length > 1 && (
          <select
            value={selectedBackroomId || ""}
            onChange={(e) => setSelectedBackroomId(e.target.value)}
            className="bg-[#27272a] border border-[#3f3f46] text-[#e2e2e2] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#7c3aed]"
          >
            {backrooms.map((br) => (
              <option key={br.id} value={br.id}>
                {br.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 w-full bg-[#18181b] rounded-2xl relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-[#7c3aed] text-4xl">autorenew</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-[#ff6b6b]">
            <p>{error}</p>
          </div>
        ) : tree.length > 0 ? (
          <HierarchyMapView 
            tree={tree} 
            backroomId={selectedBackroomId!} 
            backroomName={selectedBackroom?.nombre || "BackRoom"} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#ccc3d8]">
            <p>No hay salas en este BackRoom.</p>
          </div>
        )}
      </div>
    </div>
  )
}

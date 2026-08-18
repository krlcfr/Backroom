"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import RoomTree from "@/components/salas/room-tree"
import SubRoomsGrid from "@/components/salas/sub-rooms-grid"
import CreateRoomModal from "@/components/modals/create-room-modal"
import Breadcrumb from "@/components/ui/breadcrumb"

interface Sala {
  id: string
  nombre: string
  descripcion: string | null
  depth: number
  parent_id: string | null
  backroom_id: string
  created_at: string
}

interface SalaNode {
  id: string
  nombre: string
  depth: number
  children?: SalaNode[]
}

interface Backroom {
  id: string
  name: string
}

export default function SalaPage() {
  const { id, salaId } = useParams<{ id: string; salaId: string }>()
  const router = useRouter()

  const [sala, setSala] = useState<Sala | null>(null)
  const [children, setChildren] = useState<Sala[]>([])
  const [tree, setTree] = useState<SalaNode[]>([])
  const [backroom, setBackroom] = useState<Backroom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateRoom, setShowCreateRoom] = useState(false)

  const atMaxDepth = sala && sala.depth >= 2

  useEffect(() => {
    async function fetchData() {
      try {
        const [salaRes, treeRes, backroomRes] = await Promise.all([
          fetch(`/api/rooms/${salaId}`),
          fetch(`/api/rooms/${salaId}/tree`),
          fetch(`/api/backrooms/${id}`),
        ])

        if (!salaRes.ok) throw new Error("No se pudo cargar la sala")
        const salaData = await salaRes.json()
        setSala(salaData.data.room)

        if (treeRes.ok) {
          const treeData = await treeRes.json()
          const treeNodes = treeData.data.room as SalaNode[]
          setTree(treeNodes)
          const flatChildren: Sala[] = []
          function collect(nodes: SalaNode[]) {
            for (const n of nodes) {
              flatChildren.push({ id: n.id, nombre: n.nombre, depth: n.depth, descripcion: null, parent_id: null, backroom_id: id, created_at: "" })
              if (n.children) collect(n.children)
            }
          }
          if (treeNodes.length > 0) collect(treeNodes)
          setChildren(flatChildren)
        }

        if (backroomRes.ok) {
          const brData = await backroomRes.json()
          setBackroom({ id: brData.id, name: brData.name })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    if (salaId) fetchData()
  }, [id, salaId])

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#333535] rounded w-3/4" />
            <div className="h-4 bg-[#333535] rounded w-1/2" />
          </div>
        </div>
        <div className="flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#333535] rounded w-1/4" />
            <div className="h-32 bg-[#333535] rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !sala) {
    return (
      <div className="text-center py-16">
        <p className="text-[#ffb4ab]">{error || "Sala no encontrada"}</p>
        <Link href={`/dashboard/backrooms/${id}`} className="mt-4 inline-block text-[#ccc3d8] hover:text-[#d2bbff]">
          Volver a la BackRoom
        </Link>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: backroom?.name ?? "BackRoom", href: `/dashboard/backrooms/${id}` },
    { label: sala.nombre },
  ]

  return (
    <div className="flex gap-6">
      {tree.length > 0 && (
        <aside className="w-64 shrink-0 hidden md:flex flex-col">
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            <RoomTree rooms={tree} backroomId={id} activeRoomId={salaId} />
          </nav>
        </aside>
      )}

      <main className="flex-1 flex flex-col gap-6 min-w-0">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-[28px] font-bold text-[#e2e2e2] mb-2">{sala.nombre}</h1>
          {sala.descripcion && (
            <p className="text-[#ccc3d8] text-[16px] max-w-2xl">{sala.descripcion}</p>
          )}
        </div>

        {!atMaxDepth && (
          <SubRoomsGrid
            rooms={children}
            backroomId={id}
            onCreateClick={() => setShowCreateRoom(true)}
          />
        )}

        {atMaxDepth && children.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-[#958da1] mb-3 block">folder_off</span>
            <p className="text-[14px] text-[#958da1]">Esta sala no tiene subsalas.</p>
            <p className="text-[12px] text-[#958da1]/70 mt-1">Profundidad máxima alcanzada (nivel 3).</p>
          </div>
        )}
      </main>

      {showCreateRoom && (
        <CreateRoomModal
          backroomId={id}
          parentRoomId={salaId}
          parentRoomName={sala.nombre}
          currentDepth={sala.depth}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setShowCreateRoom(false)
            setChildren((prev) => [...prev, { ...room, descripcion: null, depth: sala.depth + 1, parent_id: salaId, backroom_id: id, created_at: new Date().toISOString() }])
            setTree((prev) => [...prev, { id: room.id, nombre: room.nombre, depth: sala.depth + 1, children: [] }])
          }}
        />
      )}
    </div>
  )
}

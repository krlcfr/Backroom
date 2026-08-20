"use client"

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { RoomNode } from "./room-tree"

interface RoomGraphModalProps {
  tree: RoomNode[]
  backroomId: string
  backroomName: string
  activeRoomId?: string
  onClose: () => void
}

// Custom Node component to show icon and name
function CustomRoomNode({ data }: { data: any }) {
  const isRoot = data.isRoot;
  return (
    <div className="flex flex-col items-center justify-center relative cursor-pointer group">
      <Handle type="target" position={Position.Top} className="opacity-0 !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2" />
      
      <div 
        className={`flex items-center justify-center rounded-full border-2 bg-[#222225] transition-all group-hover:scale-110 ${
          data.isActive
            ? "border-[#a78bfa] shadow-[0_0_25px_rgba(167,139,250,0.6)]"
            : "shadow-[0_0_20px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]"
        } ${
          isRoot ? "w-[72px] h-[72px]" : "w-14 h-14"
        } ${
          data.hasAccess ? (data.isActive ? "text-[#a78bfa]" : "border-[#7c3aed] text-[#e2e2e2]") : "border-[#4a4455] text-[#958da1]"
        }`}
      >
        <span className={`material-symbols-outlined ${isRoot ? "text-[32px]" : "text-[24px]"}`}>
          {!data.hasAccess ? "lock" : data.icono || "grid_view"}
        </span>
      </div>

      <span className={`absolute top-full mt-3 font-medium whitespace-nowrap text-center ${
        isRoot ? "text-[16px] text-[#e2e2e2]" : "text-[13px] text-[#ccc3d8]"
      }`}>
        {data.nombre}
      </span>

      <Handle type="source" position={Position.Bottom} className="opacity-0 !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2" />
    </div>
  )
}

const nodeTypes = {
  room: CustomRoomNode,
}

export default function RoomGraphModal({ tree, backroomId, backroomName, activeRoomId, onClose }: RoomGraphModalProps) {
  const router = useRouter()

  // Convert tree into nodes and edges using a radial layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: any[] = []
    const edges: any[] = []

    const RADIUS_STEP = 200; // Distancia entre anillos (profundidades)

    // Nodo sintético de la BackRoom que actuará como centro absoluto
    const syntheticBackroom: RoomNode = {
      id: backroomId,
      nombre: backroomName,
      icono: "domain",
      depth: 0, // Raíz absoluta
      hasAccess: true,
      children: tree,
    }

    // Paso 1: Contar hojas de cada subárbol para asignar arcos proporcionales
    function countLeaves(node: RoomNode): number {
      if (!node.children || node.children.length === 0) return 1;
      let leaves = 0;
      for (const child of node.children) {
        leaves += countLeaves(child);
      }
      return leaves;
    }

    const totalLeaves = countLeaves(syntheticBackroom);

    // Paso 2: Recorrido asignando ángulos
    function traverse(
      node: RoomNode, 
      depth: number, 
      startAngle: number, 
      endAngle: number, 
      parentId?: string
    ) {
      const angle = (startAngle + endAngle) / 2;
      const radius = depth * RADIUS_STEP;

      const position = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }

      nodes.push({
        id: node.id,
        type: "room",
        position,
        data: {
          nombre: node.nombre,
          icono: node.icono,
          hasAccess: node.hasAccess !== false,
          roomId: node.id,
          isRoot: depth === 0,
          isActive: node.id === activeRoomId || (depth === 0 && node.id === backroomId),
        },
      })

      if (parentId) {
        edges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: "straight",
          animated: true,
          style: { stroke: "#7c3aed", strokeWidth: 2, opacity: 0.6 },
        })
      }

      if (node.children && node.children.length > 0) {
        const totalSubLeaves = countLeaves(node);
        let currentAngle = startAngle;
        
        node.children.forEach(child => {
          const childLeaves = countLeaves(child);
          const sliceAngle = ((endAngle - startAngle) * childLeaves) / totalSubLeaves;
          traverse(child, depth + 1, currentAngle, currentAngle + sliceAngle, node.id);
          currentAngle += sliceAngle;
        })
      }
    }

    // El backroom es el centro (0, 0), por lo que startAngle y endAngle son 0 y 2PI
    traverse(syntheticBackroom, 0, 0, Math.PI * 2);

    return { initialNodes: nodes, initialEdges: edges }
  }, [tree, backroomId, backroomName, activeRoomId])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClick = useCallback((event: any, node: any) => {
    if (node.data.hasAccess) {
      onClose()
      router.push(`/dashboard/backrooms/${backroomId}/salas/${node.data.roomId}`)
    }
  }, [router, backroomId, onClose])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#18181b]/90 backdrop-blur-sm">
      <div className="w-[90vw] h-[90vh] bg-[#1e2020] border border-[#3f3f46] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#333535] hover:bg-[#4a4455] text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="absolute top-6 left-6 z-10">
          <h2 className="text-2xl font-bold text-[#e2e2e2] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#7c3aed] text-3xl">account_tree</span>
            Mapa de Salas
          </h2>
          <p className="text-[#ccc3d8] text-sm mt-1">Explora la jerarquía del proyecto</p>
        </div>

        <div className="flex-1 w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-[#1e2020]"
            minZoom={0.2}
          >
            <Background color="#3f3f46" gap={16} />
            <Controls className="bg-[#27272a] border-[#3f3f46] fill-[#e2e2e2]" />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

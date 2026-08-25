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
  auditMode?: boolean
  userPermissions?: { sala_id: string; salas_acceder: boolean }[]
  onNodeAuditClick?: (roomId: string) => void
}

interface CustomNodeData extends Record<string, unknown> {
  isRoot: boolean;
  hasAccess: boolean;
  icono?: string;
  auditMode?: boolean;
  auditAccess?: boolean;
  isActive?: boolean;
  nombre: string;
  roomId: string;
}

// Custom Node component to show icon and name
function CustomRoomNode({ data }: { data: CustomNodeData }) {
  const isRoot = data.isRoot;
  
  // Lógica de colores para modo normal vs auditoría
  let borderColor = data.hasAccess ? "border-[#7c3aed]" : "border-[#4a4455]";
  let textColor = data.hasAccess ? "text-[#e2e2e2]" : "text-[#958da1]";
  let shadow = "shadow-[0_0_20px_rgba(124,58,237,0.15)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]";
  let icon = data.icono || "grid_view";

  if (!data.hasAccess) {
    icon = "lock";
  }

  if (data.auditMode) {
    if (data.auditAccess) {
      borderColor = "border-[#10b981]"; // Verde si tiene acceso
      textColor = "text-[#10b981]";
      shadow = "shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]";
    } else {
      borderColor = "border-[#ef4444]"; // Rojo si no tiene acceso
      textColor = "text-[#ef4444]";
      shadow = "shadow-[0_0_20px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]";
      icon = "block";
    }
  } else if (data.isActive) {
    borderColor = "border-[#a78bfa]";
    textColor = "text-[#a78bfa]";
    shadow = "shadow-[0_0_25px_rgba(167,139,250,0.6)]";
  }

  return (
    <div className="flex flex-col items-center justify-center relative cursor-pointer group">
      <Handle type="target" position={Position.Top} className="opacity-0 !top-1/2 !left-1/2 !transform !-translate-x-1/2 !-translate-y-1/2" />
      
      <div 
        className={`flex items-center justify-center rounded-full border-2 bg-[#222225] transition-all group-hover:scale-110 ${borderColor} ${shadow} ${
          isRoot ? "w-[72px] h-[72px]" : "w-14 h-14"
        } ${textColor}`}
      >
        <span className={`material-symbols-outlined ${isRoot ? "text-[32px]" : "text-[24px]"}`}>
          {icon}
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

export default function RoomGraphModal({ tree, backroomId, backroomName, activeRoomId, onClose, auditMode, userPermissions, onNodeAuditClick }: RoomGraphModalProps) {
  const router = useRouter()

  // Convert tree into nodes and edges using a radial layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: import("@xyflow/react").Node[] = []
    const edges: import("@xyflow/react").Edge[] = []

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

    const totalLeaves = countLeaves(syntheticBackroom); // eslint-disable-line @typescript-eslint/no-unused-vars

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

      // Chequeo de permisos para auditMode
      let auditAccess = true; // Por defecto asumimos que tiene acceso si es admin, pero veamos los permisos
      if (auditMode && userPermissions) {
        // En auditoría, el root node (backroom) siempre es accesible visualmente
        if (depth === 0) {
          auditAccess = true;
        } else {
          const perm = userPermissions.find((p) => p.sala_id === node.id);
          // O si no hay fila de permisos pero el usuario es admin o contribuir, depende de la lógica.
          // Para esta visualización, marcaremos en verde si `salas_acceder` es true explícitamente.
          auditAccess = perm?.salas_acceder === true;
        }
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
          auditMode,
          auditAccess,
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
  }, [tree, backroomId, backroomName, activeRoomId, auditMode, userPermissions])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onNodeClickCallback = useCallback((event: React.MouseEvent, node: import("@xyflow/react").Node) => {
    const nodeData = node.data as CustomNodeData;
    if (auditMode && onNodeAuditClick) {
      // En modo auditoría, hacer click en la Backroom raíz (depth 0) puede que no tenga sentido configurarle permisos
      // porque es la backroom. Pero por si acaso, lo habilitamos solo si no es root, o lo controlamos en el padre.
      if (!nodeData.isRoot) {
        onNodeAuditClick(nodeData.roomId)
      }
    } else if (nodeData.hasAccess) {
      onClose()
      router.push(`/dashboard/backrooms/${backroomId}/salas/${nodeData.roomId}`)
    }
  }, [router, backroomId, onClose, auditMode, onNodeAuditClick])

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
            onNodeClick={onNodeClickCallback}
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

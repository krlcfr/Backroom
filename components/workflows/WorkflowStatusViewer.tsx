"use client";

import { useEffect, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  Node,
  Edge,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface WorkflowStatusViewerProps {
  documentId: string;
}

// Custom Node para visualizar el estado
const StatusCircleNode = ({ data }: { data: any }) => {
  let borderColor = "border-[#3f3f46]"; // Default
  let textColor = "text-[#958da1]";
  let icon = "person";
  let statusText = "Esperando";

  if (data.status === 'approved') {
    borderColor = "border-[#10b981]"; // Verde
    textColor = "text-[#10b981]";
    icon = "check_circle";
    statusText = "Aprobado";
  } else if (data.status === 'rejected') {
    borderColor = "border-[#ef4444]"; // Rojo
    textColor = "text-[#ef4444]";
    icon = "cancel";
    statusText = "Rechazado";
  } else if (data.status === 'pending') {
    borderColor = "border-[#f59e0b]"; // Amarillo
    textColor = "text-[#f59e0b]";
    icon = "pending";
    statusText = "Pendiente";
  }

  return (
    <div className={w-20 h-20 bg-[#27272a] rounded-full flex flex-col items-center justify-center border-2  text-center p-1.5 relative shadow-lg}>
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#d2bbff] !border-none" />
      <span className={material-symbols-outlined text-[20px]  mb-0.5}>{icon}</span>
      <span className="text-[9px] text-[#e2e2e2] font-semibold leading-tight line-clamp-1">{data.label}</span>
      <span className={	ext-[8px]  font-medium}>{statusText}</span>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-[#d2bbff] !border-none" />
    </div>
  );
};

const nodeTypes = { circle: StatusCircleNode, statusCircle: StatusCircleNode };

export function WorkflowStatusViewer({ documentId }: WorkflowStatusViewerProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch(/api/workflows?document_id=);
        if (!res.ok) throw new Error("Error al cargar el flujo");
        const json = await res.json();
        
        if (!json.data) {
          setError("No hay flujo asignado a este documento.");
          setLoading(false);
          return;
        }

        const workflow = json.data;
        const dbNodes = workflow.nodes || []; // Array de workflow_nodes de la BD
        const graphJson = workflow.flow_graph_json;

        if (graphJson && graphJson.nodes) {
          // Mapeamos los nodos del grafo visual con los datos reales de la BD
          const visualNodes: Node[] = graphJson.nodes.map((vNode: any) => {
            // Buscamos si existe un nodo en la BD con este cargo_id
            const dbNode = dbNodes.find((dbN: any) => dbN.cargo_id === vNode.data?.cargo_id);
            
            // Asignamos el label correcto desde la BD si existe, o dejamos el que tenia
            const label = dbNode?.cargo?.nombre || vNode.data?.label || "Desconocido";
            const status = dbNode?.status || 'pending'; // 'pending', 'approved', 'rejected'

            return {
              ...vNode,
              type: 'statusCircle', // Forzamos nuestro custom node
              draggable: false, // Solo lectura
              data: {
                ...vNode.data,
                label,
                status
              }
            };
          });

          setNodes(visualNodes);
          setEdges(graphJson.edges || []);
        } else {
          setError("El flujo guardado no contiene información gráfica válida.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (documentId) {
      loadWorkflow();
    }
  }, [documentId]);

  if (loading) return <div className="p-4 text-[#958da1] text-sm flex items-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Cargando estado del flujo...</div>;
  if (error) return <div className="p-4 text-[#958da1] text-sm">{error}</div>;

  return (
    <div className="w-full h-[400px] border border-[#3f3f46] rounded-xl overflow-hidden relative bg-[#0c0f0f]">
      <div className="absolute top-0 left-0 right-0 bg-[#1a1c1c]/80 backdrop-blur-sm border-b border-[#3f3f46] p-3 z-10 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-[#e2e2e2] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#7c3aed]">account_tree</span>
          Estado de Aprobación
        </h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1 text-[#10b981]"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Aprobado</span>
          <span className="flex items-center gap-1 text-[#f59e0b]"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Pendiente</span>
          <span className="flex items-center gap-1 text-[#ef4444]"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Rechazado</span>
        </div>
      </div>

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          className="bg-[#0c0f0f]"
        >
          <Background color="#3f3f46" gap={16} />
          <Controls showInteractive={false} className="bg-[#27272a] border-[#3f3f46] fill-white" />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

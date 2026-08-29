"use client";

import { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface Cargo {
  id: string;
  name: string;
}

// Algunos cargos de prueba por ahora (idealmente se cargan de la BD)
const DUMMY_CARGOS: Cargo[] = [
  { id: '1', name: 'Gerente General' },
  { id: '2', name: 'Director Legal' },
  { id: '3', name: 'Revisor' },
  { id: '4', name: 'Finanzas' },
];

const CircleNode = ({ data }: { data: any }) => {
  return (
    <div className="w-16 h-16 bg-[#27272a] rounded-full flex flex-col items-center justify-center border-2 border-[#7c3aed] text-center p-1.5 relative shadow-lg">
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#d2bbff] !border-none" />
      {data.avatar ? (
        <img src={data.avatar} alt="avatar" className="w-5 h-5 rounded-full mb-0.5 object-cover" />
      ) : (
        <span className="material-symbols-outlined text-[16px] text-[#7c3aed] mb-0.5">person</span>
      )}
      <span className="text-[9px] text-[#e2e2e2] font-semibold leading-tight line-clamp-2">{data.label}</span>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-[#d2bbff] !border-none" />
    </div>
  );
};

const nodeTypes = { circle: CircleNode };

export function WorkflowBuilderModal({ onClose }: { onClose: () => void }) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [availableCargos, setAvailableCargos] = useState<Cargo[]>(DUMMY_CARGOS);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleCargoClick = (cargo: Cargo) => {
    // Generar un ID único para permitir múltiples instancias del mismo cargo
    const uniqueId = `node_${cargo.id}_${Date.now()}`;

    // Posición en cascada para que no se sobrepongan exactamente
    const offset = (nodes.length % 5) * 20;
    const newPosition = { x: 50 + offset, y: 50 + offset };

    const newNode: Node = {
      id: uniqueId,
      type: 'circle',
      position: newPosition,
      data: { label: cargo.name, cargo_id: cargo.id, node_type: 'linear', action_required: 'sign' },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = () => {
    const flowJson = { nodes, edges };
    console.log("Flujo Guardado:", flowJson);
    alert("Flujo guardado en consola (JSON).");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm">
      <div className="bg-[#121414] w-[90vw] h-[90vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#3f3f46] flex items-center justify-between shrink-0 bg-[#1a1c1c]">
          <h2 className="text-[18px] font-semibold text-[#e2e2e2] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
            Asignación de Flujo
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-sm transition-colors"
            >
              Guardar Flujo
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r border-[#3f3f46] bg-[#18181b] p-4 flex flex-col gap-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-[#958da1] uppercase tracking-wider">Cargos Disponibles</h3>
            <p className="text-xs text-[#958da1] mb-2">Haz clic en un cargo para agregarlo al flujo.</p>
            
            <div className="flex flex-col gap-2">
              {availableCargos.length === 0 && (
                <div className="text-[#958da1] text-sm text-center py-4">No hay más cargos.</div>
              )}
              {availableCargos.map((cargo) => (
                <button
                  key={cargo.id}
                  onClick={() => handleCargoClick(cargo)}
                  className="bg-[#27272a] border border-[#3f3f46] hover:border-[#7c3aed] p-3 rounded-lg cursor-pointer text-[#e2e2e2] text-sm transition-colors flex items-center gap-2 text-left"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#7c3aed]">add_circle</span>
                  {cargo.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Flow Canvas */}
          <main className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0c0f0f]"
              >
                <Background color="#3f3f46" gap={16} />
                <Controls className="bg-[#27272a] border-[#3f3f46] fill-white" />
              </ReactFlow>
            </ReactFlowProvider>
          </main>
        </div>
      </div>
    </div>
  );
}

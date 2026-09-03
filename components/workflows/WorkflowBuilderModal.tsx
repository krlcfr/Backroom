"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  MarkerType,
  Position,
  NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { parseFlowToSteps } from "@/lib/utils/workflow-graph-parser";

interface Cargo {
  id: string;
  name: string;
}

interface Member {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  cargoId: string | null;
  cargoName: string | null;
}

export interface WorkflowBuilderModalProps {
  orgId: string;
  documentId: string;
  documentTitle?: string;
  onClose: () => void;
  onSaveWorkflow?: (workflow: any) => void;
}

const CircleNode = ({ data, selected }: { data: any, selected?: boolean }) => {
  return (
    <div className={`w-16 h-16 bg-[#27272a] rounded-full flex flex-col items-center justify-center border-2 ${selected ? 'border-white' : 'border-[#7c3aed]'} text-center p-1.5 relative shadow-lg`}>
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

export function WorkflowBuilderModal({ orgId, documentId, documentTitle, onClose, onSaveWorkflow }: WorkflowBuilderModalProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [availableCargos, setAvailableCargos] = useState<Cargo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId) as Node<Record<string, any>> | undefined;

  useEffect(() => {
    async function loadData() {
      try {
        const [cargosRes, membersRes] = await Promise.all([
          fetch(`/api/organizations/${orgId}/cargos`),
          fetch(`/api/organizations/${orgId}/members`)
        ]);

        if (cargosRes.ok) {
          const cData = await cargosRes.json();
          setAvailableCargos((cData.cargos || []).map((c: any) => ({
            id: c.id,
            name: c.nombre
          })));
        }

        if (membersRes.ok) {
          const mData = await membersRes.json();
          setMembers(mData.data?.members || []);
        }
      } catch (err) {
        console.error("Error loading workflow data", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (orgId) {
      loadData();
    }
  }, [orgId]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({
      ...params,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#7c3aed',
      },
      style: {
        strokeWidth: 2,
        stroke: '#7c3aed',
      },
    }, eds)),
    [setEdges]
  );

  const handleCargoClick = (cargo: Cargo) => {
    const uniqueId = `node_${cargo.id}_${Date.now()}`;
    const offset = (nodes.length % 5) * 20;
    const newPosition = { x: 50 + offset, y: 50 + offset };

    const newNode: Node = {
      id: uniqueId,
      type: 'circle',
      position: newPosition,
      data: { 
        label: cargo.name, 
        cargoId: cargo.id, 
        action_required: 'approve',
        assigned_user_id: ''
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(uniqueId);
  };

  const onNodeClick: NodeMouseHandler = (event, node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes(nds => 
      nds.map(n => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, ...newData } };
        }
        return n;
      })
    );
  };

  const deleteNode = (id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  const handleSave = async () => {
    const { parsedNodes, errors } = parseFlowToSteps(nodes, edges);

    if (errors.length > 0) {
      alert("Errores en el flujo:\n- " + errors.join("\n- "));
      return;
    }

    try {
      const payload = {
        organization_id: orgId,
        document_id: documentId,
        title: documentTitle || "Flujo de aprobación",
        nodes: parsedNodes,
        flow_graph_json: { nodes, edges }
      };

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error al guardar: " + (err.error || "Desconocido"));
        return;
      }

      const workflowData = await res.json();
      alert("¡Flujo guardado y asignado con éxito!");
      
      if (onSaveWorkflow) {
        onSaveWorkflow(workflowData);
      }
    } catch (e) {
      console.error(e);
      alert("Error inesperado al guardar el flujo");
    }
  };

  const eligibleMembers = selectedNode 
    ? members.filter(m => m.cargoId === selectedNode.data.cargoId)
    : [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm">
      <div className="bg-[#121414] w-[90vw] h-[90vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-[#3f3f46] flex items-center justify-between shrink-0 bg-[#1a1c1c]">
          <h2 className="text-[18px] font-semibold text-[#e2e2e2] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
            Asignación de Flujo {documentTitle ? `- ${documentTitle}` : ''}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={nodes.length === 0}
              className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
            >
              Guardar y Asignar Flujo
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
          <aside className="w-80 border-r border-[#3f3f46] bg-[#18181b] p-4 flex flex-col gap-4 overflow-y-auto">
            {loading ? (
              <div className="text-[#958da1] text-sm text-center py-4">Cargando datos...</div>
            ) : selectedNode ? (
              <div className="flex flex-col gap-4 animate-in slide-in-from-left-2 duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="text-[#958da1] hover:text-[#e2e2e2] flex items-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  </button>
                  <h3 className="text-sm font-semibold text-[#e2e2e2] uppercase tracking-wider">
                    Configurar Nodo
                  </h3>
                </div>

                <div className="bg-[#27272a] p-4 rounded-xl border border-[#3f3f46]">
                  <p className="text-sm font-medium text-white mb-1">Cargo: {selectedNode.data.label}</p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#958da1]">Acción Requerida</label>
                  <select 
                    className="bg-[#27272a] border border-[#3f3f46] text-white text-sm rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                    value={selectedNode.data.action_required || 'approve'}
                    onChange={(e) => updateNodeData(selectedNode.id, { action_required: e.target.value })}
                  >
                    <option value="approve">Aprobar</option>
                    <option value="sign">Firmar</option>
                    <option value="review">Solo Revisar</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#958da1]">Persona Específica</label>
                  <select 
                    className="bg-[#27272a] border border-[#3f3f46] text-white text-sm rounded-lg p-2.5 outline-none focus:border-[#7c3aed]"
                    value={selectedNode.data.assigned_user_id || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { assigned_user_id: e.target.value })}
                  >
                    <option value="">Cualquiera con este cargo</option>
                    {eligibleMembers.map(m => (
                      <option key={m.userId} value={m.userId}>{m.fullName}</option>
                    ))}
                  </select>
                  {eligibleMembers.length === 0 && (
                    <p className="text-[10px] text-yellow-500 mt-1">No hay usuarios con este cargo.</p>
                  )}
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="w-full px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Eliminar Paso
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in slide-in-from-right-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold text-[#958da1] uppercase tracking-wider">Cargos de la Empresa</h3>
                  <p className="text-xs text-[#958da1] mt-1 mb-4">Haz clic en un cargo para agregarlo al flujo.</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {availableCargos.length === 0 && (
                    <div className="text-[#958da1] text-sm text-center py-4 border border-dashed border-[#3f3f46] rounded-lg">
                      No hay cargos creados en la organización.
                    </div>
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
              </div>
            )}
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
                onNodeClick={onNodeClick}
                onEdgeDoubleClick={(_, edge) => setEdges(eds => eds.filter(e => e.id !== edge.id))}
                onPaneClick={onPaneClick}
                nodeTypes={nodeTypes}
                deleteKeyCode={['Backspace', 'Delete']}
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

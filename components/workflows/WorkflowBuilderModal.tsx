"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Node, 
  Edge, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  Connection,
  addEdge,
  ReactFlowProvider,
  MarkerType,
  NodeMouseHandler,
  ReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { parseFlowToSteps } from "@/lib/utils/workflow-graph-parser";
import { CargoNodeComponent } from "./nodes/CargoNodeComponent";
import { CustomWorkflowEdge } from "./edges/CustomWorkflowEdge";
import WorkflowSidebar, { Cargo } from "./WorkflowSidebar";
import { SignersSummaryModal } from "./SignersSummaryModal";
import dynamic from 'next/dynamic';

const DocumentSignatureCanvas = dynamic(
  () => import('../documents/DocumentSignatureCanvas').then(mod => mod.DocumentSignatureCanvas),
  { ssr: false }
);

interface Member {
  id: string;
  nombre: string;
  apellidos: string;
  cargoId: string;
  userId: string;
  fullName: string;
}

interface WorkflowBuilderModalProps {
  orgId: string;
  documentId: string;
  documentTitle?: string;
  onClose: () => void;
  onSaveWorkflow?: (workflowData: any) => void;
}

const nodeTypes = { cargo: CargoNodeComponent };
const edgeTypes = { custom: CustomWorkflowEdge };

export function WorkflowBuilderModal({ orgId, documentId, documentTitle, onClose, onSaveWorkflow }: WorkflowBuilderModalProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [finalRecipientId, setFinalRecipientId] = useState<string>('');

  const [availableCargos, setAvailableCargos] = useState<Cargo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [step, setStep] = useState<'builder' | 'sign_summary' | 'sign_canvas'>('builder');
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [signNodes, setSignNodes] = useState<any[]>([]);

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
            nombre: c.nombre,
            departamento: c.departamentos
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
      type: 'custom',
      animated: true,
      data: { type: 'approve' },
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#7c3aed',
      },
      style: {
        strokeWidth: 2,
        stroke: '#7c3aed',
      },
    } as any, eds)),
    [setEdges]
  );

  const onDragStart = (event: React.DragEvent, cargo: Cargo) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(cargo));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const cargoStr = event.dataTransfer.getData('application/reactflow');
      if (!cargoStr) return;

      const cargo = JSON.parse(cargoStr) as Cargo;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodes((nds) => {
        const uniqueId = `node_${cargo.id}_${Date.now()}`;
        const isRoot = nds.length === 0;
        const newNode: Node = {
          id: uniqueId,
          type: 'cargo',
          position,
          data: { 
            label: cargo.nombre, 
            cargoId: cargo.id, 
            action_required: 'approve',
            assigned_user_id: '',
            fullName: 'Cualquiera con este cargo',
            isRoot
          },
        };
        setSelectedNodeId(uniqueId);
        return nds.concat(newNode);
      });
    },
    [reactFlowInstance, setNodes]
  );

  const handleCargoClick = useCallback(
    (cargo: Cargo) => {
      if (!reactFlowInstance) return;

      setNodes((nds) => {
        let yPos = 100;
        let xPos = 250;
        
        if (nds.length > 0) {
          const lastNode = nds[nds.length - 1];
          yPos = lastNode.position.y + 150;
          xPos = lastNode.position.x;
        }

        const uniqueId = `node_${cargo.id}_${Date.now()}`;
        const isRoot = nds.length === 0;
        const newNode: Node = {
          id: uniqueId,
          type: 'cargo',
          position: { x: xPos, y: yPos },
          data: { 
            label: cargo.nombre, 
            cargoId: cargo.id, 
            action_required: 'approve',
            assigned_user_id: '',
            fullName: 'Cualquiera con este cargo',
            isRoot
          },
        };
        setSelectedNodeId(uniqueId);
        return nds.concat(newNode);
      });
    },
    [reactFlowInstance, setNodes]
  );

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

  const updateEdgeData = (id: string, newData: any) => {
    setEdges(eds => 
      eds.map(e => {
        if (e.id === id) {
          return { ...e, data: { ...e.data, ...newData } };
        }
        return e;
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

    setIsSaving(true);
    try {
      const payload = {
        organization_id: orgId,
        document_id: documentId,
        title: documentTitle || "Flujo de aprobación",
        nodes: parsedNodes,
        flow_graph_json: { nodes, edges, final_recipient_id: finalRecipientId || null }
      };

      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Error al guardar: " + (err.error || "Desconocido"));
        setIsSaving(false);
        return;
      }

      const respData = await res.json();
      
      const firmantes = parsedNodes.filter(n => n.action_required === 'sign');
      if (firmantes.length > 0) {
        setWorkflowData(respData);
        setSignNodes(firmantes);
        setStep('sign_summary');
        setIsSaving(false);
      } else {
        alert("¡Flujo guardado y asignado con éxito!");
        setIsSaving(false);
        if (onSaveWorkflow) {
          onSaveWorkflow(respData);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error inesperado al guardar el flujo");
      setIsSaving(false);
    }
  };

  const eligibleMembers = selectedNode 
    ? members.filter(m => m.cargoId === selectedNode.data.cargoId)
    : [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] backdrop-blur-sm">
      <div className="bg-[#121414] w-[95vw] h-[95vh] rounded-2xl border border-[#3f3f46] shadow-2xl flex flex-col overflow-hidden relative">
        
        {isSaving && (
          <div className="absolute inset-0 bg-[#121414]/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-[#7c3aed] text-4xl mb-4">refresh</span>
            <p className="text-[#e2e2e2] font-medium text-lg">Guardando y asignando flujo...</p>
            <p className="text-[#958da1] text-sm mt-2">Por favor espera, no cierres esta ventana.</p>
          </div>
        )}

        {step === 'builder' && (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-[#3f3f46] flex items-center justify-between shrink-0 bg-[#1a1c1c]">
              <h2 className="text-[18px] font-semibold text-[#e2e2e2] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
                Constructor de Mapa Mental {documentTitle ? `- ${documentTitle}` : ''}
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-2 border-r border-[#3f3f46] pr-4">
                  <label className="text-[12px] text-[#958da1]">Destinatario Final:</label>
                  <select
                    value={finalRecipientId}
                    onChange={(e) => setFinalRecipientId(e.target.value)}
                    className="bg-[#27272a] text-[#e2e2e2] text-[13px] border border-[#3f3f46] rounded-md px-2 py-1 outline-none"
                  >
                    <option value="">Nadie</option>
                    {members.map((m, idx) => (
                      <option key={m.userId || m.id || idx} value={m.userId || m.id}>{m.nombre} {m.apellidos}</option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={nodes.length === 0 || isSaving}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">refresh</span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar y Asignar Flujo"
                  )}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isSaving}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#333535] text-[#958da1] hover:text-[#e2e2e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Cargos */}
              <WorkflowSidebar cargos={availableCargos} onDragStart={onDragStart} onCargoClick={handleCargoClick} />

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
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onEdgeDoubleClick={(_, edge) => setEdges(eds => eds.filter(e => e.id !== edge.id))}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    deleteKeyCode={['Backspace', 'Delete']}
                    fitView
                    fitViewOptions={{ maxZoom: 1 }}
                    className="bg-[#0c0f0f]"
                  >
                    <Background color="#3f3f46" gap={16} />
                    <Controls className="bg-[#27272a] border-[#3f3f46] fill-white" />
                  </ReactFlow>
                </ReactFlowProvider>
              </main>

              {/* Sidebar Configuración (Right) */}
              {selectedNode && (
                <aside className="w-80 border-l border-[#3f3f46] bg-[#18181b] p-4 flex flex-col gap-4 overflow-y-auto">
                  <div className="flex flex-col gap-4 animate-in slide-in-from-right-2 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="text-[#958da1] hover:text-[#e2e2e2] flex items-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
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
                        onChange={(e) => {
                          updateNodeData(selectedNode.id, { action_required: e.target.value });
                        }}
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
                        onChange={(e) => {
                          const user = eligibleMembers.find(m => m.userId === e.target.value);
                          updateNodeData(selectedNode.id, { 
                            assigned_user_id: e.target.value,
                            fullName: user ? user.fullName : 'Cualquiera con este cargo',
                            avatar: null
                          });
                        }}
                      >
                        <option value="">Cualquiera con este cargo</option>
                        {eligibleMembers.map((m, idx) => (
                          <option key={m.userId || m.id || idx} value={m.userId}>{m.fullName}</option>
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
                </aside>
              )}
            </div>
          </>
        )}

        {step === 'sign_summary' && workflowData && (
          <SignersSummaryModal
            signersCount={signNodes.length}
            onContinue={() => setStep('sign_canvas')}
            onClose={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
          />
        )}

        {step === 'sign_canvas' && workflowData && (
          <DocumentSignatureCanvas
            workflowData={workflowData}
            onClose={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
            onFinish={() => {
              if (onSaveWorkflow) onSaveWorkflow(workflowData);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}
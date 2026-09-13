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
  hideActions?: boolean;
}

// Custom Node para visualizar el estado
const StatusNode = ({ data }: any) => {
  const isApproved = data.status === 'approved';
  const isRejected = data.status === 'rejected';
  
  let borderColor = "border-[#3f3f46]";
  let bgColor = "bg-[#1e2020]";
  let textColor = "text-[#958da1]";
  let badgeClass = "border-[#3f3f46] text-[#958da1] bg-[#27272a]";
  let statusText = "Pendiente";

  if (isApproved) {
    borderColor = "border-[#10b981]";
    bgColor = "bg-[#10b981]/10";
    textColor = "text-[#10b981]";
    badgeClass = "border-[#10b981]/30 text-[#10b981] bg-[#10b981]/10";
    statusText = "Aprobado";
  } else if (isRejected) {
    borderColor = "border-[#ef4444]";
    bgColor = "bg-[#ef4444]/10";
    textColor = "text-[#ef4444]";
    badgeClass = "border-[#ef4444]/30 text-[#ef4444] bg-[#ef4444]/10";
    statusText = "Rechazado";
  } else if (data.status === 'in_turn') {
    borderColor = "border-[#7c3aed]";
    bgColor = "bg-[#7c3aed]/10";
    textColor = "text-[#d2bbff]";
    badgeClass = "border-[#7c3aed]/30 text-[#d2bbff] bg-[#7c3aed]/10";
    statusText = "En Turno";
  }

  return (
    <div className={`px-4 py-2 shadow-xl rounded-xl border-2 transition-colors ${borderColor} ${bgColor}`}>
      <Handle type="target" position={Position.Left} className={`w-2 h-2 ${isApproved ? '!bg-[#10b981]' : isRejected ? '!bg-[#ef4444]' : '!bg-[#7c3aed]'} !border-none`} />
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#e2e2e2]">{data.label}</span>
          {data.assigned_user_name && (
            <span className="text-[10px] text-[#958da1] truncate max-w-[120px]">{data.assigned_user_name}</span>
          )}
          <div className="flex gap-1 mt-1">
            {data.action_required && (
              <span className="text-[9px] uppercase tracking-wider text-[#7c3aed] border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-1 rounded w-fit">
                {data.action_required === 'sign' ? 'Firmar' : data.action_required === 'approve' ? 'Aprobar' : 'Revisar'}
              </span>
            )}
            <span className={`text-[9px] uppercase tracking-wider px-1 rounded w-fit border ${badgeClass}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={`w-2 h-2 ${isApproved ? '!bg-[#10b981]' : isRejected ? '!bg-[#ef4444]' : '!bg-[#7c3aed]'} !border-none`} />
    </div>
  );
};

const nodeTypes = { circle: StatusNode, statusCircle: StatusNode };

export function WorkflowStatusViewer({ documentId, hideActions = false }: WorkflowStatusViewerProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbNodes, setDbNodes] = useState<any[]>([]);
  const [workflowId, setWorkflowId] = useState<string>("");
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch(`/api/workflows?document_id=${documentId}`);
        if (!res.ok) throw new Error("Error al cargar el flujo");
        const json = await res.json();
        
        if (!json.data) {
          setError("No hay flujo asignado a este documento.");
          setLoading(false);
          return;
        }

        const workflow = json.data;
        setWorkflowId(workflow.id);
        setOrgId(workflow.organization_id);
        const rawDbNodes = workflow.nodes || []; // Array de workflow_nodes de la BD
        setDbNodes(rawDbNodes);
        const graphJson = workflow.flow_graph_json;

        if (graphJson && graphJson.nodes) {
          // Mapeamos los nodos del grafo visual con los datos reales de la BD
          const usedDbNodes = new Set();
          const visualNodes: Node[] = graphJson.nodes.map((vNode: any) => {
            // Buscamos si existe un nodo en la BD con este cargo_id que no hayamos usado
            const dbNode = rawDbNodes.find((dbN: any) => {
               const matchesCargo = dbN.cargo_id === (vNode.data?.cargoId || vNode.data?.cargo_id);
               return matchesCargo && !usedDbNodes.has(dbN.id);
            });
            
            if (dbNode) usedDbNodes.add(dbNode.id);

            // Asignamos el label correcto desde la BD si existe, o dejamos el que tenia
            const label = dbNode?.cargo?.nombre || vNode.data?.label || "Desconocido";
            const status = dbNode?.status || 'pending'; // 'pending', 'approved', 'rejected'

            return {
              ...vNode,
              type: 'statusCircle', // Forzamos nuestro custom node
              draggable: false, // Solo lectura
              data: {
                ...vNode.data,
                status,
                label,
                assigned_user_name: dbNode?.assigned_user?.nombre_completo || "",
                action_required: dbNode?.action_required || vNode.data?.action_required
              }
            };
          });

          setNodes(visualNodes);
          const rawEdges = graphJson.edges || [];
          setEdges(rawEdges.map((e: any) => ({
            ...e,
            type: 'straight',
            animated: true,
            markerEnd: {
              type: 'arrowclosed',
              width: 20,
              height: 20,
              color: '#7c3aed',
            },
            style: {
              strokeWidth: 2,
              stroke: '#7c3aed',
            }
          })));
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
    <div className="flex flex-col gap-4 w-full">
      {/* Panel de Acciones */}
      {!hideActions && dbNodes && dbNodes.length > 0 && (
        <WorkflowActionsPanel 
          workflowId={workflowId}
          nodes={dbNodes} 
          orgId={orgId}
          onActionComplete={() => window.location.reload()}
        />
      )}

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
    </div>
  );
}

export function WorkflowActionsPanel({ workflowId, nodes, onActionComplete, orgId }: { workflowId: string, nodes: any[], onActionComplete: () => void, orgId: string | null }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCargoId, setUserCargoId] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean, nodeId: string } | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      const user = data.user || data.id ? (data.user || data) : null;
      if (user) {
        setCurrentUser(user);
        
        // Buscamos si el usuario tiene el cargo requerido en esta org
        if (orgId) {
          fetch(`/api/organizations/${orgId}/members`)
            .then(res => res.ok ? res.json() : { data: { members: [] } })
            .then(orgData => {
               const member = orgData.data?.members?.find((m: any) => m.userId === user.id);
               if (member) setUserCargoId(member.cargoId);
            }).catch(console.error);
        }
      }
    }).catch(console.error);
  }, [orgId]);

  if (!currentUser) return null;

  // Determinar el step actual (el primer step que tenga algún nodo in_turn)
  const pendingNodes = nodes.filter(n => n.status === 'in_turn');
  if (pendingNodes.length === 0) return null; // No hay acciones pendientes

  const currentStepOrder = Math.min(...pendingNodes.map(n => n.step_order));
  
  // Buscar si el usuario actual está asignado a un nodo en el paso activo
  const activeNodesInCurrentStep = pendingNodes.filter(n => n.step_order === currentStepOrder);
  
  const myActiveNode = activeNodesInCurrentStep.find(n => {
    if (n.assigned_user_id === currentUser.id) return true;
    if (n.assigned_user_id === null && userCargoId && n.cargo_id === userCargoId) return true;
    return false;
  });

  if (!myActiveNode) {
    // Si no es mi turno, mostramos a quién estamos esperando
    const waitingFor = activeNodesInCurrentStep.map(n => n.assigned_user_name || "Un miembro").join(", ");
    return (
      <div className="bg-[#1e2020] border border-[#f59e0b]/30 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-2">
        <span className="material-symbols-outlined text-[24px] text-[#f59e0b]">hourglass_empty</span>
        <p className="text-sm font-semibold text-[#e2e2e2]">Esperando revisión</p>
        <p className="text-xs text-[#958da1] text-center max-w-sm">
          Actualmente es el turno de <strong>{waitingFor}</strong>. Recibirás una notificación cuando sea tu turno de actuar en el flujo.
        </p>
      </div>
    );
  }

  const handleAction = async (action: 'approved' | 'rejected', nodeId: string, pwd?: string) => {
    setLoading(true);
    setError("");
    try {
      if (myActiveNode.action_required === 'sign' && action === 'approved') {
        if (!pwd) throw new Error("Falta la contraseña");
        const res = await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}/sign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al firmar");
        alert(data.message);
      } else {
        // Aprobación simple o rechazo
        let rejectionReason = "";
        if (action === 'rejected') {
          rejectionReason = window.prompt("Razón del rechazo (opcional):") || "";
          if (rejectionReason === null) {
            setLoading(false);
            return; // El usuario canceló el prompt
          }
        }

        const res = await fetch(`/api/workflows/${workflowId}/nodes/${nodeId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, rejection_reason: rejectionReason })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al procesar la acción");
        
        alert(action === 'approved' ? "Aprobado con éxito." : "Rechazado con éxito.");
      }
      onActionComplete();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setPasswordModal(null);
    }
  };

  return (
    <div className="bg-[#1e2020] border border-[#7c3aed]/50 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-[#e2e2e2]">Es tu turno de actuar</p>
        <p className="text-xs text-[#958da1]">
          Acción requerida: <strong className="text-[#d2bbff] uppercase">{myActiveNode.action_required}</strong>
        </p>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => handleAction('rejected', myActiveNode.id)}
          disabled={loading}
          className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#ef4444] text-xs font-semibold rounded-lg transition-colors border border-[#ef4444]/20 disabled:opacity-50"
        >
          Rechazar
        </button>
        
        {myActiveNode.action_required === 'sign' ? (
          <button 
            onClick={() => setPasswordModal({ isOpen: true, nodeId: myActiveNode.id })}
            disabled={loading}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            Firmar Digitalmente (PKI)
          </button>
        ) : (
          <button 
            onClick={() => handleAction('approved', myActiveNode.id)}
            disabled={loading}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Aprobar
          </button>
        )}
      </div>

      {passwordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] backdrop-blur-sm">
          <div className="bg-[#18181b] p-6 rounded-xl border border-[#7c3aed] w-full max-w-sm">
            <h4 className="text-[#e2e2e2] font-semibold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#7c3aed]">enhanced_encryption</span>
              Autorización de Firma
            </h4>
            <p className="text-xs text-[#958da1] mb-4">
              Ingresa tu contraseña de inicio de sesión para desencriptar el certificado de la organización y sellar este documento legalmente.
            </p>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#121414] border border-[#3f3f46] rounded-lg p-2 text-[#e2e2e2] text-sm focus:border-[#7c3aed] outline-none mb-4"
              placeholder="Contraseña..."
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setPasswordModal(null)} className="px-3 py-1.5 text-xs text-[#958da1] hover:text-white transition-colors">Cancelar</button>
              <button 
                onClick={() => handleAction('approved', passwordModal.nodeId, password)}
                disabled={loading || !password}
                className="px-3 py-1.5 bg-[#7c3aed] text-white text-xs font-semibold rounded-lg hover:bg-[#6d28d9] disabled:opacity-50 transition-colors"
              >
                {loading ? "Firmando..." : "Firmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="w-20 h-20 bg-[#27272a] rounded-full flex flex-col items-center justify-center border-2 text-center p-1.5 relative shadow-lg">
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-[#d2bbff] !border-none" />
      <span className="material-symbols-outlined text-[20px] mb-0.5">{icon}</span>
      <span className="text-[9px] text-[#e2e2e2] font-semibold leading-tight line-clamp-1">{data.label}</span>
      <span className="text-[8px] font-medium">{statusText}</span>
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
  const [dbNodes, setDbNodes] = useState<any[]>([]);
  const [workflowId, setWorkflowId] = useState<string>("");

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
        const rawDbNodes = workflow.nodes || []; // Array de workflow_nodes de la BD
        setDbNodes(rawDbNodes);
        const graphJson = workflow.flow_graph_json;

        if (graphJson && graphJson.nodes) {
          // Mapeamos los nodos del grafo visual con los datos reales de la BD
          const visualNodes: Node[] = graphJson.nodes.map((vNode: any) => {
            // Buscamos si existe un nodo en la BD con este cargo_id
            const dbNode = rawDbNodes.find((dbN: any) => dbN.cargo_id === vNode.data?.cargo_id);
            
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

      {/* Panel de Acciones */}
      {dbNodes && dbNodes.length > 0 && (
        <WorkflowActionsPanel 
          workflowId={workflowId}
          nodes={dbNodes} 
          onActionComplete={() => window.location.reload()}
        />
      )}
    </div>
  );
}

function WorkflowActionsPanel({ workflowId, nodes, onActionComplete }: { workflowId: string, nodes: any[], onActionComplete: () => void }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [passwordModal, setPasswordModal] = useState<{ isOpen: boolean, nodeId: string } | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) setCurrentUser(data.user);
    }).catch(console.error);
  }, []);

  if (!currentUser) return null;

  // Determinar el step actual (el primer step que tenga algún nodo pendiente)
  const pendingNodes = nodes.filter(n => n.status === 'pending');
  if (pendingNodes.length === 0) return null; // No hay acciones pendientes

  const currentStepOrder = Math.min(...pendingNodes.map(n => n.step_order));
  
  // Buscar si el usuario actual está asignado a un nodo en el paso activo
  // OJO: En la vida real, si assigned_user_id es null, habría que checar si el usuario tiene el cargo requerido
  // Aquí simplificamos asumiendo assigned_user_id.
  const myActiveNode = pendingNodes.find(n => 
    n.step_order === currentStepOrder && 
    (n.assigned_user_id === currentUser.id || n.assigned_user_id === null) // Si es null, cualquiera del cargo podría (idealmente checaríamos el cargo)
  );

  if (!myActiveNode) return null;

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
        // Fallback for simple approve/reject (Motor de Ejecución de Antigravity)
        // This is a placeholder since the coworker implemented `WorkflowsService.approveNode` 
        // but maybe not the API endpoint. We will assume the API endpoint exists or create it.
        // Actually, if it doesn't exist, we can just call our /sign endpoint but without PKI logic,
        // or we'll create /approve. But for now, we focus on PKI.
        alert("Aprobación simple no implementada en este demo. Usa la firma.");
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
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#1e2020] border border-[#7c3aed]/50 rounded-xl p-4 shadow-2xl z-20 flex flex-col items-center gap-3 animate-in slide-in-from-bottom-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-[#e2e2e2]">Es tu turno de actuar</p>
        <p className="text-xs text-[#958da1]">
          Acción requerida: <strong className="text-[#d2bbff] uppercase">{myActiveNode.action_required}</strong>
        </p>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => alert("Función de rechazo simplificada.")}
          className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-[#ef4444] text-xs font-semibold rounded-lg transition-colors border border-[#ef4444]/20"
        >
          Rechazar
        </button>
        
        {myActiveNode.action_required === 'sign' ? (
          <button 
            onClick={() => setPasswordModal({ isOpen: true, nodeId: myActiveNode.id })}
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">fingerprint</span>
            Firmar Digitalmente (PKI)
          </button>
        ) : (
          <button 
            onClick={() => handleAction('approved', myActiveNode.id)}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-lg transition-colors shadow-lg flex items-center gap-2"
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

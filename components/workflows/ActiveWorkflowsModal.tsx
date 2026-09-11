"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface WorkflowNode {
  id: string
  node_type: string
  status: string
  step_order: number
  usuarios: {
    nombre_completo: string
  }
}

interface Workflow {
  id: string
  title: string
  status: string
  created_at: string
  document_id: string
  recursos: {
    nombre: string
  }
  workflow_nodes?: WorkflowNode[]
}

interface ActiveWorkflowsModalProps {
  orgId: string
  onClose: () => void
}

export default function ActiveWorkflowsModal({ orgId, onClose }: ActiveWorkflowsModalProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pinging, setPinging] = useState<string | null>(null)

  const loadWorkflows = async () => {
    setLoading(true)
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('document_workflows')
      .select(`
        id,
        status,
        created_at,
        document_id,
        recursos(nombre),
        workflow_nodes(
          id,
          node_type,
          status,
          step_order,
          usuarios!workflow_nodes_assigned_user_id_fkey(nombre_completo)
        )
      `)
      .eq('organization_id', orgId)
      .in('status', ['draft', 'in_progress', 'under_review'])
      .order('created_at', { ascending: false })

    if (data && !error) {
      setWorkflows(data as any)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWorkflows()
  }, [orgId])

  const handleDelete = async (wf: Workflow) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este flujo? Esta acción no se puede deshacer.")) return;
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/workflows/${wf.id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "No se pudo eliminar el flujo");
      }
      setSelectedWorkflow(null);
      loadWorkflows();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setDeleting(false);
    }
  }

  const handlePing = async (node: WorkflowNode) => {
    setPinging(node.id)
    try {
      const res = await fetch(`/api/workflows/${selectedWorkflow!.id}/nodes/${node.id}/ping`, {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error("No se pudo enviar el aviso");
      }
      alert(`Se ha enviado un recordatorio a ${node.usuarios?.nombre_completo || 'el usuario'}.`);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setPinging(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121414]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#3f3f46] bg-[#1e2020] p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {selectedWorkflow && (
              <button 
                onClick={() => setSelectedWorkflow(null)}
                className="text-[#a1a1aa] hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#27272a]"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            )}
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c3aed]">
                {selectedWorkflow ? 'info' : 'account_tree'}
              </span>
              {selectedWorkflow ? 'Detalles del Flujo' : 'Estado de Flujos Activos'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#27272a]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {selectedWorkflow ? (
            <div className="space-y-6">
              <div className="bg-[#27272a] border border-[#3f3f46] p-5 rounded-xl">
                <h3 className="text-lg text-white font-medium mb-1">
                  {selectedWorkflow.recursos?.nombre || 'Documento sin nombre'}
                </h3>
                <p className="text-sm text-[#a1a1aa] mb-4">
                  Iniciado el {new Date(selectedWorkflow.created_at).toLocaleString()}
                </p>
                
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedWorkflow.status === 'draft' ? 'bg-[#3f3f46] text-[#e2e2e2]' :
                    selectedWorkflow.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 
                    selectedWorkflow.status === 'under_review' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedWorkflow.status === 'draft' ? 'Borrador (Incompleto)' : 
                     selectedWorkflow.status === 'in_progress' ? 'En Progreso' : 'En Revisión'}
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-[13px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Participantes del Flujo</h4>
                  {selectedWorkflow.workflow_nodes?.sort((a, b) => a.step_order - b.step_order).map((node) => (
                    <div key={node.id} className="flex items-center justify-between bg-[#1e2020] p-3 rounded-lg border border-[#3f3f46]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold ${
                          node.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          node.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-[#3f3f46] text-[#e2e2e2]'
                        }`}>
                          {node.status === 'approved' ? <span className="material-symbols-outlined text-[16px]">check</span> :
                           node.status === 'rejected' ? <span className="material-symbols-outlined text-[16px]">close</span> :
                           node.usuarios?.nombre_completo?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] text-[#e2e2e2] font-medium">{node.usuarios?.nombre_completo || 'Usuario'}</p>
                          <p className="text-[12px] text-[#958da1]">
                            {node.node_type === 'SIGNATURE' ? 'Firma requerida' : 'Revisión requerida'} 
                            {' • Nivel ' + node.step_order}
                          </p>
                        </div>
                      </div>
                      
                      {node.status === 'pending' && (
                        <button
                          onClick={() => handlePing(node)}
                          disabled={pinging === node.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3f3f46] hover:bg-[#7c3aed] text-[#e2e2e2] rounded-md transition-colors text-[12px] font-medium disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                          {pinging === node.id ? 'Avisando...' : 'Avisar'}
                        </button>
                      )}
                      
                      {node.status === 'approved' && (
                        <span className="text-[12px] font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded">Completado</span>
                      )}
                    </div>
                  ))}
                  {(!selectedWorkflow.workflow_nodes || selectedWorkflow.workflow_nodes.length === 0) && (
                    <p className="text-[13px] text-[#958da1] italic">No hay participantes asignados todavía.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3f3f46]">
                <button 
                  onClick={() => handleDelete(selectedWorkflow)}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                  {deleting ? 'Eliminando...' : 'Eliminar Flujo'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="text-center py-8 text-[#a1a1aa]">Cargando flujos...</div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-8 text-[#a1a1aa] bg-[#27272a] rounded-xl border border-dashed border-[#3f3f46]">
                  No hay flujos activos en este momento.
                </div>
              ) : (
                workflows.map(wf => (
                  <div key={wf.id} className="bg-[#27272a] border border-[#3f3f46] p-4 rounded-xl flex items-center justify-between hover:border-[#7c3aed] transition-colors">
                    <div>
                      <h3 className="text-white font-medium">
                        {wf.recursos?.nombre || 'Documento sin nombre'}
                      </h3>
                      <p className="text-sm text-[#a1a1aa] mt-1">
                        Iniciado el {new Date(wf.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        wf.status === 'draft' ? 'bg-[#3f3f46] text-[#e2e2e2]' :
                        wf.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 
                        wf.status === 'under_review' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {wf.status === 'draft' ? 'Borrador (Incompleto)' : wf.status === 'in_progress' ? 'En Progreso' : 'En Revisión'}
                      </span>
                      <button 
                        onClick={() => setSelectedWorkflow(wf)}
                        className="p-2 rounded-lg bg-[#3f3f46] hover:bg-[#7c3aed] text-white transition-colors flex items-center"
                        title="Ver detalles"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

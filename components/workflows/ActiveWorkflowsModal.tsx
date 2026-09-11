"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

interface Workflow {
  id: string
  title: string
  status: string
  created_at: string
  document_id: string
  recursos: {
    nombre: string
  }
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
        recursos(nombre)
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
      alert("Flujo eliminado exitosamente");
      setSelectedWorkflow(null);
      loadWorkflows();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setDeleting(false);
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
                  <span className="text-sm text-[#a1a1aa]">ID: <span className="font-mono text-xs">{selectedWorkflow.id}</span></span>
                </div>

                <div className="p-4 bg-[#1e2020] rounded-lg border border-[#3f3f46]">
                  <p className="text-[#e2e2e2] text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#7c3aed] text-[18px]">verified</span>
                    El flujo está activo y esperando firmas.
                  </p>
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

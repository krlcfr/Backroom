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

  useEffect(() => {
    async function loadWorkflows() {
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
          recursos:document_id (nombre)
        `)
        .eq('organization_id', orgId)
        .in('status', ['in_progress', 'under_review'])
        .order('created_at', { ascending: false })

      if (data && !error) {
        // En supabase 'recursos' vendrá como un objeto o array dependiendo de la relación,
        // asumimos que document_id es un foreign key válido a recursos
        setWorkflows(data as any)
      }
      setLoading(false)
    }

    loadWorkflows()
  }, [orgId])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121414]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#3f3f46] bg-[#1e2020] p-6 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
            Estado de Flujos Activos
          </h2>
          <button onClick={onClose} className="text-[#a1a1aa] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
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
                    wf.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' : 
                    wf.status === 'under_review' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {wf.status === 'in_progress' ? 'En Progreso' : 'En Revisión'}
                  </span>
                  <button 
                    onClick={() => {
                      // Aquí se podría abrir el visor del flujo más tarde
                      alert("Pronto: Ver detalles del flujo " + wf.id);
                    }}
                    className="p-2 rounded-lg bg-[#3f3f46] hover:bg-[#7c3aed] text-white transition-colors flex items-center"
                    title="Ver detalles"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface Recurso {
  id: string
  nombre: string
  url: string
  tipo: string
  created_at: string
  pending_signature?: boolean
}

export default function RecursosList({ salaId }: { salaId: string }) {
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    async function loadRecursos() {
      const { data } = await supabase
        .from("recursos")
        .select("*")
        .eq("sala_id", salaId)
        .order("created_at", { ascending: false })
      
      if (data) setRecursos(data)
      setLoading(false)
    }
    loadRecursos()
  }, [salaId, supabase])

  if (loading) {
    return <div className="animate-pulse h-20 bg-[#27272a] rounded-xl mt-6"></div>
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#e2e2e2]">Documentos y Recursos</h3>
        <button 
          className="flex items-center gap-2 bg-[#7c3aed] text-white hover:bg-[#8b5cf6] transition-colors text-[13px] font-medium px-4 py-2 rounded-lg"
          onClick={() => alert("Próximamente: Modal para subir o arrastrar archivos PDF/Word")}
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Subir Documento
        </button>
      </div>
      
      {recursos.length === 0 ? (
        <div className="text-center py-12 bg-[#1e2020] border border-[#3f3f46] rounded-xl border-dashed">
          <span className="material-symbols-outlined text-[48px] text-[#958da1] mx-auto mb-3 opacity-50 block">description</span>
          <p className="text-[#958da1] text-sm">No hay documentos en esta sala aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recursos.map(recurso => (
            <div key={recurso.id} className="bg-[#27272a] border border-[#3f3f46] rounded-xl p-4 flex items-center justify-between group hover:border-[#a78bfa]/50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-[#a78bfa]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-[#a78bfa]">description</span>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="text-[#e2e2e2] text-sm font-medium truncate">{recurso.nombre}</span>
                    {recurso.pending_signature && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
                        FIRMA PENDIENTE
                      </span>
                    )}
                  </div>
                  <span className="text-[#958da1] text-xs">{(new Date(recurso.created_at)).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

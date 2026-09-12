
"use client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getIconAndColor, formatSize } from "@/lib/utils/formatters";
import FloatingViewer from "@/components/salas/resources/floating-viewer";

export default function DocumentosFinalesPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/user/documentos-finales`)
      .then(res => res.json())
      .then(data => {
        setDocs(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0c0f0f] p-6 overflow-y-auto">
      <h1 className="text-[24px] font-semibold text-white mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#7c3aed] text-[28px]">task_alt</span>
        Documentos Finalizados
      </h1>
      <p className="text-[#958da1] text-[14px] mb-8">
        Aquí se muestran todos los documentos que han completado su flujo de aprobación y has sido asignado como destinatario final.
      </p>

      {loading ? (
        <div className="flex justify-center p-8">
          <span className="material-symbols-outlined animate-spin text-[#7c3aed] text-3xl">progress_activity</span>
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e2020] rounded-xl border border-[#3f3f46]">
          <span className="material-symbols-outlined text-[#3f3f46] text-[48px] mb-4">folder_open</span>
          <h3 className="text-[16px] font-medium text-[#ccc3d8] mb-1">No hay documentos</h3>
          <p className="text-[#958da1] text-[13px]">Aún no tienes documentos finalizados asignados a ti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(res => {
            const { icon, color, bg } = getIconAndColor(res.tipo);
            const size = formatSize(res.tamano_bytes);
            return (
              <div key={res.id} className="bg-[#1e2020] border border-[#3f3f46] rounded-xl p-4 flex flex-col gap-3 hover:border-[#a78bfa]/50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${bg} ${color}`}>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#e2e2e2] font-medium text-[14px] break-words line-clamp-2" title={res.nombre}>
                      {res.nombre}
                    </h4>
                    <p className="text-[#958da1] text-[12px] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Finalizado {formatDistanceToNow(new Date(res.finalized_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#3f3f46]">
                  <button 
                    onClick={() => setSelectedDoc(res)}
                    className="flex-1 bg-[#27272a] hover:bg-[#333535] text-[#ccc3d8] hover:text-white px-3 py-2 rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Ver Documento
                  </button>
                  <a 
                    href={`/api/resources/${res.id}/download`}
                    download
                    className="w-9 h-9 bg-[#27272a] hover:bg-[#333535] text-[#958da1] hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
                    title="Descargar"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDoc && (
        <FloatingViewer
          url={selectedDoc.url}
          tipo={selectedDoc.tipo}
          nombre={selectedDoc.nombre}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}



import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getIconAndColor, formatSize } from "@/lib/utils/formatters";
import FloatingViewer from "@/components/salas/resources/floating-viewer";

export default function FinalResourcesTab({ roomId }: { roomId: string }) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rooms/${roomId}/finalizados`)
      .then(res => res.json())
      .then(data => {
        setDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8 mt-4">
        <span className="material-symbols-outlined animate-spin text-[#7c3aed] text-3xl">progress_activity</span>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e2020] rounded-xl border border-[#3f3f46] mt-4">
        <span className="material-symbols-outlined text-[#3f3f46] text-[48px] mb-4">task_alt</span>
        <h3 className="text-[16px] font-medium text-[#ccc3d8] mb-1">Sin documentos finalizados</h3>
        <p className="text-[#958da1] text-[13px]">No hay documentos que hayan completado su flujo en esta sala.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(res => {
          const { icon, color, bg } = getIconAndColor(res.tipo);
          const size = formatSize(res.tamano_bytes);
          return (
            <div key={res.id} className="bg-[#1e2020] border border-[#3f3f46] rounded-xl p-3 flex flex-col gap-3 hover:border-[#a78bfa]/50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg} ${color}`}>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[#e2e2e2] font-medium text-[13px] break-words line-clamp-2 cursor-pointer hover:text-[#a78bfa] transition-colors" title={res.nombre} onClick={() => setSelectedDoc(res)}>
                    {res.nombre}
                  </h4>
                  <p className="text-[#958da1] text-[11px] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Finalizado {formatDistanceToNow(new Date(res.finalized_at), { addSuffix: true, locale: es })}
                    {size && (
                      <>
                        <span>•</span>
                        <span>{size}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1 pt-3 border-t border-[#3f3f46]">
                <button 
                  onClick={() => setSelectedDoc(res)}
                  className="flex-1 bg-[#27272a] hover:bg-[#333535] text-[#ccc3d8] hover:text-white px-3 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  Ver Documento
                </button>
                <a 
                  href={`/api/resources/${res.id}/download`}
                  download
                  className="w-8 h-8 bg-[#27272a] hover:bg-[#333535] text-[#958da1] hover:text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
                  title="Descargar"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

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


"use client";

import { useEffect, useState } from "react";

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  actor: {
    nombre_completo: string;
    correo: string;
  };
  ip_address: string;
  details: any;
}

interface DocumentAuditHistoryProps {
  documentId: string;
}

const ACTION_LABELS: Record<string, { text: string, color: string, icon: string }> = {
  "RESOURCE_UPLOADED": { text: "Documento Creado", color: "text-blue-500", icon: "upload_file" },
  "WORKFLOW_CREATED": { text: "Flujo Asignado", color: "text-purple-500", icon: "account_tree" },
  "WORKFLOW_STEP_APPROVED": { text: "Paso Aprobado", color: "text-emerald-500", icon: "check_circle" },
  "WORKFLOW_REJECTED": { text: "Documento Rechazado", color: "text-red-500", icon: "cancel" },
  "DOCUMENT_SIGNED": { text: "Documento Firmado", color: "text-emerald-600", icon: "signature" },
  "DOCUMENT_SEALED": { text: "Documento Sellado", color: "text-blue-600", icon: "verified" },
};

export function DocumentAuditHistory({ documentId }: DocumentAuditHistoryProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAudit() {
      try {
        const res = await fetch(`/api/documents/${documentId}/audit`);
        if (!res.ok) throw new Error("Error al cargar historial");
        const json = await res.json();
        setLogs(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (documentId) {
      loadAudit();
    }
  }, [documentId]);

  if (loading) return <div className="p-4 text-[#958da1] text-sm flex items-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Cargando historial inmutable...</div>;
  if (error) return <div className="p-4 text-[#958da1] text-sm">{error}</div>;
  if (logs.length === 0) return <div className="p-4 text-[#958da1] text-sm">No hay registros de auditoría para este documento.</div>;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-[#e2e2e2] flex items-center gap-2">
        <span className="material-symbols-outlined text-[#7c3aed]">history</span>
        Historial Inmutable (Logs de Auditoría)
      </h3>
      
      <div className="relative border-l border-[#3f3f46] ml-3 pl-4 flex flex-col gap-6">
        {logs.map((log) => {
          const ui = ACTION_LABELS[log.action] || { text: log.action, color: "text-[#958da1]", icon: "info" };
          const date = new Date(log.created_at).toLocaleString();

          return (
            <div key={log.id} className="relative">
              <span className={`absolute -left-[25px] bg-[#121414] border border-[#3f3f46] w-6 h-6 rounded-full flex items-center justify-center ${ui.color}`}>
                <span className="material-symbols-outlined text-[14px]">{ui.icon}</span>
              </span>
              
              <div className="bg-[#18181b] border border-[#3f3f46] rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className={`font-semibold text-sm ${ui.color}`}>{ui.text}</span>
                    <span className="text-xs text-[#e2e2e2]">{log.actor?.nombre_completo || 'Usuario Desconocido'} <span className="text-[#958da1]">({log.actor?.correo || 'N/A'})</span></span>
                  </div>
                  <div className="flex flex-col items-end text-[#958da1] text-[10px]">
                    <span>{date}</span>
                    <span>IP: {log.ip_address || '127.0.0.1'}</span>
                  </div>
                </div>
                
                {log.details && (
                  <div className="mt-2 pt-2 border-t border-[#3f3f46] text-xs text-[#958da1] font-mono break-all">
                    {JSON.stringify(log.details)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

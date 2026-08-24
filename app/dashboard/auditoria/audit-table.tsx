"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  target_type: string;
  target_id: string | null;
  actor: {
    username: string | null;
    nombre_completo: string | null;
    correo: string;
  };
}

export default function AuditTable({ initialLogs, orgId }: { initialLogs: AuditLog[]; orgId: string }) {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [isExporting, setIsExporting] = useState(false);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "MEMBER_INVITED":
      case "MEMBER_JOINED":
        return <span className="rounded bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">Miembros</span>;
      case "MEMBER_REMOVED":
      case "ROLE_CHANGED":
        return <span className="rounded bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-400">Miembros (Peligro)</span>;
      case "ROOM_CREATED":
      case "ROOM_DELETED":
      case "ROOM_PERMISSIONS_UPDATED":
        return <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">Salas</span>;
      case "RESOURCE_UPLOADED":
        return <span className="rounded bg-indigo-500/20 px-2 py-1 text-xs font-medium text-indigo-400">Recurso (Subida)</span>;
      case "RESOURCE_DOWNLOADED":
        return <span className="rounded bg-zinc-500/20 px-2 py-1 text-xs font-medium text-zinc-400">Recurso (Lectura)</span>;
      case "RESOURCE_DELETED":
        return <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-400">Recurso (Borrado)</span>;
      case "ORG_SETTINGS_UPDATED":
      case "BILLING_PLAN_CHANGED":
        return <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400">Organización</span>;
      default:
        return <span className="rounded bg-gray-500/20 px-2 py-1 text-xs font-medium text-gray-400">{action}</span>;
    }
  };

  const getActionDescription = (action: string) => {
    const dict: Record<string, string> = {
      MEMBER_INVITED: "Invitó a un usuario",
      MEMBER_JOINED: "Se unió a la organización",
      MEMBER_REMOVED: "Removió a un usuario",
      ROLE_CHANGED: "Cambió los roles de un usuario",
      ROOM_CREATED: "Creó una nueva sala",
      ROOM_DELETED: "Eliminó una sala",
      ROOM_PERMISSIONS_UPDATED: "Actualizó los permisos de una sala",
      RESOURCE_UPLOADED: "Subió un nuevo archivo/recurso",
      RESOURCE_DOWNLOADED: "Descargó o visualizó un recurso",
      RESOURCE_DELETED: "Eliminó un recurso",
      ORG_SETTINGS_UPDATED: "Actualizó la configuración general",
      BILLING_PLAN_CHANGED: "Cambió el plan de facturación",
    };
    return dict[action] || action;
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Llamar al endpoint de exportación
      const res = await fetch(`/api/organizations/${orgId}/audit/report`);
      if (!res.ok) throw new Error("Fallo al exportar");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auditoria_${orgId}_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert("Hubo un error exportando el PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-[#3f3f46] p-4">
        <h2 className="text-lg font-semibold text-[#e2e2e2]">Últimos Registros</h2>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-lg bg-[#27272a] px-4 py-2 text-sm font-medium text-[#e2e2e2] hover:bg-[#3f3f46] disabled:opacity-50"
        >
          {isExporting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#e2e2e2] border-t-transparent" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          )}
          Exportar PDF
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#ccc3d8]">
          <thead className="bg-[#27272a] text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium text-[#e2e2e2]">Fecha</th>
              <th className="px-6 py-4 font-medium text-[#e2e2e2]">Usuario</th>
              <th className="px-6 py-4 font-medium text-[#e2e2e2]">Categoría</th>
              <th className="px-6 py-4 font-medium text-[#e2e2e2]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#a1a1aa]">
                  No hay registros de auditoría visibles o disponibles.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#27272a]/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {format(new Date(log.created_at), "d MMM yyyy, h:mm a", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#e2e2e2]">{log.actor?.nombre_completo || log.actor?.username || "Usuario Desconocido"}</div>
                    <div className="text-xs text-[#a1a1aa]">{log.actor?.correo}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="px-6 py-4">
                    {getActionDescription(log.action)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FileCheck, PenTool, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryItem {
  id: string;
  action: 'approved' | 'rejected' | 'signed';
  rejection_reason?: string;
  comments?: string;
  created_at: string;
  user: {
    nombre_completo: string;
    correo: string;
  };
  node: {
    action_required: string;
    step_order: number;
  };
}

export function WorkflowHistoryTimeline({ workflowId }: { workflowId: string }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/workflows/${workflowId}/history`);
        if (res.ok) {
          const { data } = await res.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching workflow history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (workflowId) {
      fetchHistory();
    }
  }, [workflowId]);

  if (loading) {
    return <div className="animate-pulse flex flex-col gap-4 p-4">
      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
      <div className="h-10 bg-zinc-800 rounded w-full"></div>
      <div className="h-10 bg-zinc-800 rounded w-full"></div>
    </div>;
  }

  if (history.length === 0) {
    return <div className="text-zinc-500 text-sm p-4 text-center">Aún no hay acciones registradas en este flujo.</div>;
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-700 before:to-transparent">
      {history.map((item, index) => {
        const isApprove = item.action === 'approved';
        const isSign = item.action === 'signed' || (item.action === 'approved' && item.node?.action_required === 'sign'); // A veces se guarda como approved aunque era sign
        const isReject = item.action === 'rejected';

        let Icon = Clock;
        let colorClass = "bg-zinc-800 text-zinc-400";
        let actionText = "Acción Desconocida";

        if (isSign) {
          Icon = PenTool;
          colorClass = "bg-[#7c3aed]/20 text-[#7c3aed] border-[#7c3aed]";
          actionText = "Firmó el documento";
        } else if (isApprove) {
          Icon = FileCheck;
          colorClass = "bg-emerald-500/20 text-emerald-500 border-emerald-500";
          actionText = "Aprobó el documento";
        } else if (isReject) {
          Icon = XCircle;
          colorClass = "bg-red-500/20 text-red-500 border-red-500";
          actionText = "Rechazó el documento";
        }

        return (
          <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icono */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-zinc-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${colorClass} z-10`}>
              <Icon className="w-4 h-4" />
            </div>

            {/* Tarjeta de contenido */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#1e2020] border border-[#3f3f46] p-4 rounded-xl shadow">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-zinc-200 text-sm">{item.user.nombre_completo}</h3>
                <time className="text-xs text-zinc-500 font-mono">
                  {format(new Date(item.created_at), "dd MMM, HH:mm", { locale: es })}
                </time>
              </div>
              <div className="text-sm text-zinc-400">
                {actionText}
                {item.node?.step_order && <span className="ml-2 text-[10px] uppercase bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">Paso {item.node.step_order}</span>}
              </div>
              {item.rejection_reason && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs italic">
                  "{item.rejection_reason}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí podríamos mandar el error a un servicio de logging
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#121414] font-sans">
      <div className="relative bg-[#18181B] border border-[#3F3F46] rounded-xl p-8 flex flex-col items-center text-center gap-6 max-w-md w-full overflow-hidden group hover:border-red-500/50 transition-colors">
        <div className="absolute inset-0 bg-red-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-4xl text-red-500">dns</span>
        </div>
        <div className="space-y-2 z-10 flex-1">
          <div className="text-sm font-mono text-red-500">ERR_500</div>
          <h2 className="text-2xl font-semibold text-[#e2e2e2]">Fallo del Sistema</h2>
          <p className="text-sm text-[#ccc3d8] max-w-xs mx-auto">
            Se ha producido una excepción no controlada en los nodos principales. El equipo de soporte ha sido notificado.
          </p>
        </div>
        <button 
          onClick={() => reset()} 
          className="z-10 mt-2 px-6 py-2.5 rounded-lg bg-[#27272A] text-[#e2e2e2] border border-[#3F3F46] hover:bg-[#3F3F46] transition-all font-medium text-sm"
        >
          Reintentar Conexión
        </button>
      </div>
    </div>
  );
}

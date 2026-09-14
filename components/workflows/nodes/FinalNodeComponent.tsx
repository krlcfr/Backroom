"use client";

import { Handle, Position } from "@xyflow/react";

export const FinalNodeComponent = () => {
  return (
    <div className="w-64 bg-[#1e2020]/50 rounded-xl flex flex-col border-2 border-dashed border-[#7c3aed] overflow-hidden shadow-xl">
      <Handle type="target" position={Position.Top} className="w-4 h-4 !bg-[#7c3aed] !border-2 !border-[#1e2020] -mt-2 z-10" />
      <div className="p-4 flex flex-col items-center justify-center gap-2 text-center">
        <span className="material-symbols-outlined text-[#d2bbff] text-[32px]">task_alt</span>
        <span className="text-white font-semibold text-sm">Fin del Flujo</span>
        <span className="text-[#a1a1aa] text-[11px] leading-tight">El documento finalizado regresa automáticamente al creador.</span>
      </div>
    </div>
  );
};

"use client";

import { Handle, Position } from "@xyflow/react";

export const CargoNodeComponent = ({ data, selected }: { data: any, selected?: boolean }) => {
  return (
    <div className={`w-64 bg-[#1e2020] rounded-xl flex flex-col border-2 overflow-hidden shadow-xl transition-colors ${selected ? 'border-white' : 'border-[#3f3f46]'}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-[#d2bbff] !border-none -ml-1.5" />
      
      {/* Header morado */}
      <div className="bg-[#7c3aed] px-3 py-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-white text-[18px]">
          {data.action_required === 'sign' ? 'draw' : data.action_required === 'review' ? 'visibility' : 'verified'}
        </span>
        <span className="text-white font-semibold text-sm truncate flex-1" title={data.label}>
          {data.label}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-3 flex items-center gap-3 bg-[#27272a]">
        {data.avatar ? (
          <img src={data.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#3f3f46] flex items-center justify-center text-[#958da1]">
            <span className="material-symbols-outlined text-[16px]">person</span>
          </div>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-[#e2e2e2] text-sm font-medium truncate" title={data.fullName || "Empleado No Asignado"}>
            {data.fullName || "Empleado No Asignado"}
          </span>
          <span className="text-[#a1a1aa] text-[11px] truncate">
            Acción: {data.action_required === 'sign' ? 'Firmar' : data.action_required === 'review' ? 'Revisar' : 'Aprobar'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-[#d2bbff] !border-none -mr-1.5" />
    </div>
  );
};

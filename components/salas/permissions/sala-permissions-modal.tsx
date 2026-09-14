"use client"

import { SalaPermissions } from "./sala-permissions"

interface SalaPermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  salaId: string
  salaParentId: string | null
}

export function SalaPermissionsModal({ isOpen, onClose, salaId, salaParentId }: SalaPermissionsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8">
      <div className="bg-[#1e2020] border border-[#3f3f46] rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[#3f3f46]">
          <div>
            <h2 className="text-xl font-bold text-[#e2e2e2]">Matriz de Permisos</h2>
            <p className="text-[#958da1] text-sm mt-1">Configura quién tiene acceso a qué en esta sala.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#27272a] hover:bg-[#3f3f46] flex items-center justify-center text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <SalaPermissions salaId={salaId} salaParentId={salaParentId} />
        </div>
      </div>
    </div>
  )
}

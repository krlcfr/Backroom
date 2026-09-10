"use client"

import { useState } from "react"

export interface Cargo {
  id: string
  nombre: string
  departamento?: {
    nombre: string
  } | null
}

interface WorkflowSidebarProps {
  cargos: Cargo[]
  onDragStart: (event: React.DragEvent, cargo: Cargo) => void
  onCargoClick?: (cargo: Cargo) => void
}

export default function WorkflowSidebar({ cargos, onDragStart, onCargoClick }: WorkflowSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Agrupar por departamento
  const agrupados = cargos.reduce((acc: any, cargo) => {
    const dep = cargo.departamento?.nombre || 'General'
    if (!acc[dep]) acc[dep] = []
    acc[dep].push(cargo)
    return acc
  }, {})

  const deps = Object.keys(agrupados).sort()

  return (
    <aside className="w-64 bg-[#18181b] border-r border-[#3f3f46] flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-[#3f3f46]">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#7c3aed]">account_tree</span>
          Cargos
        </h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#a1a1aa] focus:border-[#7c3aed] focus:outline-none transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <p className="text-xs text-[#a1a1aa] mb-4 px-2">Arrastra los cargos al lienzo para crear el flujo.</p>
        
        {deps.map(dep => {
          const filtrados = agrupados[dep].filter((c: Cargo) => 
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
          )

          if (filtrados.length === 0) return null

          return (
            <div key={dep} className="mb-4">
              <h3 className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">folder</span>
                {dep}
              </h3>
              <div className="space-y-1">
                {filtrados.map((cargo: Cargo) => (
                  <div
                    key={cargo.id}
                    className="bg-[#27272a] border border-[#3f3f46] hover:border-[#7c3aed] hover:bg-[#303036] rounded-lg p-3 cursor-pointer flex items-center gap-3 transition-colors"
                    draggable
                    onDragStart={(e) => onDragStart(e, cargo)}
                    onClick={() => onCargoClick?.(cargo)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1e2020] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#d2bbff] text-[16px]">work</span>
                    </div>
                    <span className="text-sm text-[#e2e2e2] font-medium truncate">{cargo.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {deps.every(dep => agrupados[dep].filter((c: Cargo) => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length === 0) && (
          <div className="text-center py-4 text-[#a1a1aa] text-sm">
            No se encontraron cargos
          </div>
        )}
      </div>
    </aside>
  )
}

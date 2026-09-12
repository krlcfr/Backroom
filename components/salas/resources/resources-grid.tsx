"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import dynamic from "next/dynamic"
import FloatingViewer from "./floating-viewer"

export interface Resource {
  id: string
  nombre: string
  url: string
  tipo: string
  tamano_bytes: number | null
  subido_por: string
  created_at: string
  signedUrl?: string
  is_blind?: boolean
  pending_signature?: boolean
  usuarios: { nombre_completo: string }
}

interface ResourcesGridProps {
  resources: Resource[]
  roomId: string
  canDelete: boolean
  onResourceDeleted: () => void
  onEditDoc?: (res: any) => void
  onAssignWorkflow?: (res: any) => void
}

export default function ResourcesGrid({ resources, roomId, canDelete, onResourceDeleted, onEditDoc, onAssignWorkflow }: ResourcesGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeResource, setActiveResource] = useState<Resource | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as Element).closest('.resource-menu-btn')) return;
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este recurso?")) return;
    setDeleting(id)
    try {
      const res = await fetch(`/api/rooms/${roomId}/resources/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error deleting resource")
      onResourceDeleted()
    } catch (error) {
      console.error(error)
      alert("No se pudo eliminar el recurso")
    } finally {
      setDeleting(null)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    if (resource.is_blind) {
      alert("Este documento está bajo custodia estricta. Su gestión depende del flujo de firmas.");
      return;
    }
    if (resource.tipo === "youtube" || resource.tipo === "video" || resource.tipo === "image" || resource.tipo === "pdf" || resource.tipo === "archivo") {
      setActiveResource(resource)
    }
    if (resource.tipo === "link" && resource.url) {
      window.open(resource.url, "_blank")
    }
    if (resource.tipo === "doc") {
      if (onEditDoc) {
        onEditDoc(resource)
      } else {
        setActiveResource(resource)
      }
    }
  }

  const getIconAndColor = (tipo: string) => {
    switch (tipo) {
      case 'doc': return { icon: 'description', color: 'text-blue-400', bg: 'bg-blue-400/10' }
      case 'pdf': return { icon: 'picture_as_pdf', color: 'text-red-400', bg: 'bg-red-400/10' }
      case 'image': return { icon: 'image', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
      case 'video':
      case 'youtube': return { icon: 'play_circle', color: 'text-rose-400', bg: 'bg-rose-400/10' }
      case 'link': return { icon: 'link', color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
      default: return { icon: 'insert_drive_file', color: 'text-gray-400', bg: 'bg-gray-400/10' }
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return null
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center bg-[#1e2020] rounded-xl border border-[#3f3f46] mt-4">
        <span className="material-symbols-outlined text-[#3f3f46] text-[48px] mb-4">folder_open</span>
        <h3 className="text-[16px] font-medium text-[#ccc3d8] mb-1">Carpeta Vacía</h3>
        <p className="text-[#958da1] text-[13px]">No hay archivos ni enlaces en esta sala.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {resources.map((res) => {
          const { icon, color, bg } = getIconAndColor(res.tipo)
          const size = formatSize(res.tamano_bytes)
          const isMenuOpen = openMenuId === res.id

          return (
            <div key={res.id} className="bg-[#1e2020] border border-[#3f3f46] rounded-xl p-3 flex items-start gap-3 hover:border-[#a78bfa]/50 transition-colors group relative">
              <div 
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer mt-0.5 ${bg} ${color}`}
                onClick={() => handleResourceClick(res)}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </div>
              
              <div className="flex-1 min-w-0" onClick={() => handleResourceClick(res)}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-[#e2e2e2] font-medium text-[13px] break-words cursor-pointer hover:text-[#a78bfa] transition-colors" title={res.nombre}>
                    {res.nombre}
                  </h4>
                  {(res as any).pending_signature && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30" title="Requiere tu firma">
                      FIRMAR
                    </span>
                  )}
                </div>
                <div className="flex items-center text-[11px] text-[#958da1] flex-wrap gap-x-1.5 gap-y-1">
                  <span className="truncate max-w-[120px]">{res.usuarios?.nombre_completo}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(res.created_at.endsWith('Z') ? res.created_at : `${res.created_at}Z`), { addSuffix: true, locale: es })}</span>
                  {size && (
                    <>
                      <span>•</span>
                      <span>{size}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="relative shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(isMenuOpen ? null : res.id);
                  }}
                  className={`resource-menu-btn w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isMenuOpen ? 'bg-[#3f3f46] text-[#e2e2e2]' : 'text-[#958da1] hover:bg-[#3f3f46] hover:text-[#e2e2e2]'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#27272a] border border-[#4a4455] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.4)] z-50 py-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setOpenMenuId(null); handleResourceClick(res); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Ver documento
                    </button>
                    
                    {(res.tipo === "doc" || res.tipo === "pdf" || res.tipo === "archivo") && onAssignWorkflow && (
                      <button
                        onClick={() => { setOpenMenuId(null); onAssignWorkflow(res); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#10b981] hover:bg-[#10b981]/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">account_tree</span>
                        Asignar a Flujo
                      </button>
                    )}
                    
                    {res.tipo === "doc" && onEditDoc && (
                      <button
                        onClick={() => { setOpenMenuId(null); onEditDoc(res); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">draw</span>
                        Editar
                      </button>
                    )}
                    
                    {canDelete && (
                      <button
                        onClick={() => { setOpenMenuId(null); handleDelete(res.id); }}
                        disabled={deleting === res.id}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">{deleting === res.id ? 'progress_activity' : 'delete'}</span>
                        {deleting === res.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {activeResource && (
        <FloatingViewer
          url={activeResource.signedUrl || activeResource.url}
          tipo={activeResource.tipo}
          nombre={activeResource.nombre}
          onClose={() => setActiveResource(null)}
        />
      )}
    </>
  )
}

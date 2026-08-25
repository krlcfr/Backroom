"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import dynamic from "next/dynamic"
import FloatingViewer from "./floating-viewer"
import DocumentStatusModal from "../../modals/document-status-modal"

const DocumentEditorModal = dynamic(
  () => import("@/components/modals/document-editor-modal").then(mod => mod.DocumentEditorModal),
  { ssr: false, loading: () => <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center text-white">Cargando editor PDF...</div> }
)

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
}

export default function ResourcesGrid({ resources, roomId, canDelete, onResourceDeleted }: ResourcesGridProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeResource, setActiveResource] = useState<Resource | null>(null)
  const [statusResource, setStatusResource] = useState<Resource | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este recurso?")) return;
    setDeleting(id)
    try {
      const res = await fetch(`/api/rooms/${roomId}/resources/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Error al eliminar")
      onResourceDeleted()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error")
    } finally {
      setDeleting(null)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    if (resource.is_blind) {
      setStatusResource(resource);
      return;
    }
    if (resource.tipo === "youtube" || resource.tipo === "video" || resource.tipo === "image" || resource.tipo === "pdf" || resource.tipo === "archivo") {
      setActiveResource(resource)
    } else {
      // Es un link normal externo que no queremos empotrar
      window.open(resource.url, "_blank")
    }
  }

  const getIconAndColor = (tipo: string) => {
    switch (tipo) {
      case "youtube":
      case "video":
        return { icon: "play_circle", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" }
      case "image":
        return { icon: "image", color: "text-[#3b82f6]", bg: "bg-[#3b82f6]/10" }
      case "pdf":
      case "archivo":
        return { icon: "description", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" }
      default:
        return { icon: "link", color: "text-[#10b981]", bg: "bg-[#10b981]/10" }
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
    return `${mb.toFixed(1)} MB`;
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[#3f3f46] rounded-xl bg-[#1e2020]/50 mt-4">
        <span className="material-symbols-outlined text-[48px] text-[#4a4455] mb-4">folder_open</span>
        <h3 className="text-[#e2e2e2] font-medium mb-1">Sin Recursos</h3>
        <p className="text-[#958da1] text-sm">Esta sala aún no tiene enlaces ni archivos.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {resources.map((res) => {
          const { icon, color, bg } = getIconAndColor(res.tipo)
          const size = formatSize(res.tamano_bytes)

          return (
            <div key={res.id} className="bg-[#1e2020] border border-[#3f3f46] rounded-xl p-4 flex items-start gap-4 hover:border-[#a78bfa]/50 transition-colors group">
              <div 
                className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${bg} ${color}`}
                onClick={() => handleResourceClick(res)}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h4 
                    className="text-[#e2e2e2] font-medium text-[14px] truncate cursor-pointer hover:text-[#a78bfa] transition-colors"
                    onClick={() => handleResourceClick(res)}
                    title={res.nombre}
                  >
                    {res.nombre}
                  </h4>
                  {(res as any).pending_signature && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap" title="Requiere tu firma">
                      FIRMAR
                    </span>
                  )}
                </div>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-[11px] text-[#958da1]">
                  <span className="truncate">{res.usuarios?.nombre_completo}</span>
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

              <div className="flex items-center gap-1">
                {(res.tipo === "pdf" || res.tipo === "archivo") && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(res.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center shrink-0 rounded-md hover:bg-[#a78bfa]/10 text-[#a78bfa]"
                    title="Firmar / Editar Documento"
                  >
                    <span className="material-symbols-outlined text-[16px]">draw</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(res.id) }}
                    disabled={deleting === res.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 flex items-center justify-center shrink-0 rounded-md hover:bg-[#ef4444]/10 text-[#ef4444] disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deleting === res.id ? (
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    )}
                  </button>
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

      {editingId && (
        <DocumentEditorModal 
          recursoId={editingId} 
          onClose={() => setEditingId(null)} 
        />
      )}

      {statusResource && (
        <DocumentStatusModal 
          recurso={statusResource} 
          onClose={() => setStatusResource(null)} 
        />
      )}
    </>
  )
}

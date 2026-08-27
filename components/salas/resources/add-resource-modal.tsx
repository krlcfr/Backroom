"use client"

import { useState } from "react"

interface AddResourceModalProps {
  roomId: string
  onClose: () => void
  onSuccess: () => void
  initialType?: 'doc' | 'pdf' | 'media' | 'link' | null
  onBack?: () => void
}

export default function AddResourceModal({ roomId, onClose, onSuccess, initialType, onBack }: AddResourceModalProps) {
  const [activeTab, setActiveTab] = useState<"enlace" | "archivo" | "crear">(
    initialType === 'link' ? "enlace" : "archivo"
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para Enlace
  const [url, setUrl] = useState("")
  const [nombreLink, setNombreLink] = useState("")

  // Estados para Archivo
  const [file, setFile] = useState<File | null>(null)

  // Estados para Crear Documento
  const [docName, setDocName] = useState("")
  const [docContent, setDocContent] = useState("")

  const modalTitle = initialType === 'doc' ? 'Subir Documento' 
    : initialType === 'pdf' ? 'Subir PDF' 
    : initialType === 'media' ? 'Subir Audio / Video' 
    : initialType === 'link' ? 'Añadir Enlace' 
    : 'Añadir Recurso';

  const fileAccept = initialType === 'doc' ? '.docx,.txt' 
    : initialType === 'pdf' ? '.pdf' 
    : initialType === 'media' ? 'audio/*,video/*' 
    : undefined;

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/rooms/${roomId}/resources/create-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: docName, content: docContent })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al crear el documento")
      
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Detección simple de youtube
      const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
      const tipo = isYoutube ? "youtube" : "link";

      const res = await fetch(`/api/rooms/${roomId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, tipo, nombre: nombreLink })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al añadir el enlace")
      
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return;

    setError(null)
    setLoading(true)

    try {
      let finalFile = file;
      
      // Si es un archivo de Word, convertirlo a PDF primero usando nuestro backend con Mammoth
      if (file.name.endsWith('.docx')) {
        const convertFormData = new FormData();
        convertFormData.append("file", file);
        const convertRes = await fetch('/api/documents/convert', { 
          method: 'POST', 
          body: convertFormData 
        });
        
        if (!convertRes.ok) {
          const err = await convertRes.json();
          throw new Error(err.error || "Error al convertir el Word a PDF");
        }
        
        const pdfBlob = await convertRes.blob();
        finalFile = new File([pdfBlob], file.name.replace('.docx', '.pdf'), { type: 'application/pdf' });
      }

      const formData = new FormData();
      formData.append("file", finalFile);

      const res = await fetch(`/api/rooms/${roomId}/resources/upload`, {
        method: "POST",
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al subir el archivo")
      
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121414]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#3f3f46] bg-[#1e2020] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-[#958da1] hover:text-[#e2e2e2] transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            )}
            <h2 className="text-[18px] font-semibold text-[#e2e2e2]">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#958da1] hover:text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {!initialType && (
          <div className="flex gap-2 mb-6 bg-[#18181b] p-1 rounded-lg border border-[#3f3f46]">
            <button
              onClick={() => setActiveTab("archivo")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "archivo" ? "bg-[#333535] text-[#e2e2e2] shadow-sm" : "text-[#958da1] hover:text-[#ccc3d8]"
              }`}
            >
              Archivo Físico
            </button>
            <button
              onClick={() => setActiveTab("enlace")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "enlace" ? "bg-[#333535] text-[#e2e2e2] shadow-sm" : "text-[#958da1] hover:text-[#ccc3d8]"
              }`}
            >
              Enlace / Video
            </button>
            <button
              onClick={() => setActiveTab("crear")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "crear" ? "bg-[#333535] text-[#e2e2e2] shadow-sm" : "text-[#958da1] hover:text-[#ccc3d8]"
              }`}
            >
              Crear Documento
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ffb4ab] text-sm">
            {error}
          </div>
        )}

        {activeTab === "archivo" ? (
          <form onSubmit={handleSubmitFile}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#ccc3d8] mb-2">Seleccionar Archivo (Máx 10MB)</label>
              <input
                type="file"
                accept={fileAccept}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#7c3aed]/10 file:text-[#a78bfa] hover:file:bg-[#7c3aed]/20"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
              >
                Cancelar
              </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  )}
                  {loading ? "Subiendo..." : "Subir Archivo"}
                </button>
              </div>
            </form>
          ) : activeTab === "enlace" ? (
            <form onSubmit={handleSubmitLink}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#ccc3d8] mb-2">Nombre / Título</label>
                  <input
                    type="text"
                    value={nombreLink}
                    onChange={(e) => setNombreLink(e.target.value)}
                    placeholder="Ej: Tutorial de Integrales"
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-[#e2e2e2] placeholder:text-[#4a4455] focus:outline-none focus:border-[#a78bfa] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc3d8] mb-2">URL del Enlace</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-[#e2e2e2] placeholder:text-[#4a4455] focus:outline-none focus:border-[#a78bfa] transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !url || !nombreLink}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">add_link</span>
                  )}
                  {loading ? "Guardando..." : "Guardar Enlace"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#ccc3d8] mb-2">Título del Documento</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Ej: Contrato de confidencialidad"
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-[#e2e2e2] placeholder:text-[#4a4455] focus:outline-none focus:border-[#a78bfa] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#ccc3d8] mb-2">Contenido (Texto)</label>
                  <textarea
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    placeholder="Escribe aquí el contenido del documento. Será convertido a un archivo PDF seguro, listo para firmar..."
                    className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg px-4 py-2.5 text-[#e2e2e2] placeholder:text-[#4a4455] focus:outline-none focus:border-[#a78bfa] transition-colors min-h-[200px] resize-y"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !docName || !docContent}
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">edit_document</span>
                  )}
                  {loading ? "Generando PDF..." : "Crear Documento"}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"

interface AddResourceModalProps {
  roomId: string
  onClose: () => void
  onSuccess: () => void
}

export default function AddResourceModal({ roomId, onClose, onSuccess }: AddResourceModalProps) {
  const [activeTab, setActiveTab] = useState<"enlace" | "archivo">("archivo")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados para Enlace
  const [url, setUrl] = useState("")
  const [nombreLink, setNombreLink] = useState("")

  // Estados para Archivo
  const [file, setFile] = useState<File | null>(null)

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
      const formData = new FormData();
      formData.append("file", file);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1e2020] border border-[#3f3f46] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#e2e2e2]">Añadir Recurso</h2>
            <button onClick={onClose} className="text-[#958da1] hover:text-[#ccc3d8] transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex bg-[#27272a] rounded-lg p-1 mb-6">
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
          </div>

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
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface OrgProps {
  id: string
  name: string
  description: string
  logoUrl: string | null
}

type Tab = "perfil" | "seguridad"

export default function ConfiguracionForm({ org }: { org: OrgProps }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>("perfil")
  const [name, setName] = useState(org.name)
  const [description, setDescription] = useState(org.description)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const [confirmName, setConfirmName] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  function handleRemoveLogo() {
    setLogoFile(null)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      if (logoFile) formData.append("logo", logoFile)

      const res = await fetch(`/api/organizations/${org.id}`, {
        method: "PATCH",
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "No se pudieron guardar los cambios")
        return
      }

      setSaved(true)
      setLogoFile(null)
      setLogoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      router.refresh()
    } catch {
      setError("Error de conexión al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (confirmName.trim() !== org.name) return

    setDeleting(true)
    setError("")

    try {
      const res = await fetch(`/api/organizations/${org.id}`, { method: "DELETE" })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || "No se pudo eliminar la organización")
        setDeleting(false)
        return
      }

      setShowDeleteModal(false)
      router.push("/")
      router.refresh()
    } catch {
      setError("Error de conexión al eliminar la organización")
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="border-b border-[#4a4455]">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`px-4 py-2 text-[12px] font-medium transition-colors -mb-px ${
              activeTab === "perfil"
                ? "text-[#d2bbff] border-b-2 border-[#d2bbff]"
                : "text-[#ccc3d8] hover:text-[#e2e2e2]"
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("seguridad")}
            className={`px-4 py-2 text-[12px] font-medium transition-colors -mb-px ${
              activeTab === "seguridad"
                ? "text-[#d2bbff] border-b-2 border-[#d2bbff]"
                : "text-[#ccc3d8] hover:text-[#e2e2e2]"
            }`}
          >
            Seguridad
          </button>
          <button
            disabled
            className="px-4 py-2 text-[12px] font-medium text-[#ccc3d8]/50 cursor-not-allowed flex items-center gap-2"
          >
            Facturación
            <span className="material-symbols-outlined text-[14px]">lock</span>
          </button>
        </div>
      </div>

      {/* Tab: Perfil */}
      {activeTab === "perfil" && (
        <section className="rounded-xl overflow-hidden border border-[#4a4455] bg-[#1e2020]">
          <div className="px-6 py-4 border-b border-[#4a4455]">
            <h3 className="text-[20px] font-semibold text-[#e2e2e2]">Detalles del Perfil</h3>
          </div>

          <form onSubmit={handleSave} className="p-6 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-lg bg-[#333535] border border-[#4a4455] flex items-center justify-center overflow-hidden shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo seleccionado" className="w-full h-full object-cover" />
                ) : org.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={org.logoUrl} alt={`Logo de ${org.name}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#d2bbff] text-[32px]">apartment</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-[#e2e2e2]">Logo de la Organización</label>
                <p className="text-[14px] text-[#ccc3d8]">Recomendado 256x256px o mayor. PNG o JPG.</p>
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#47464a] hover:bg-[#333535] border border-[#4a4455] rounded-lg text-[12px] font-medium text-[#e2e2e2] transition-colors"
                  >
                    Cambiar Logo
                  </button>
                  {(logoPreview || org.logoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-4 py-2 border border-[#4a4455] rounded-lg text-[12px] font-medium hover:bg-[#1e2020] text-[#ffb4ab] transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[#4a4455]" />

            {/* Nombre */}
            <div className="flex flex-col gap-2">
              <label htmlFor="orgName" className="text-[12px] font-medium text-[#e2e2e2]">
                Nombre de la Organización
              </label>
              <input
                id="orgName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#121414] border border-[#4a4455] rounded-lg px-3 py-2 text-[14px] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 transition-all"
              />
              <p className="text-[12px] text-[#ccc3d8]">Este es el nombre visible públicamente.</p>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-2">
              <label htmlFor="orgDesc" className="text-[12px] font-medium text-[#e2e2e2]">
                Descripción Técnica
              </label>
              <textarea
                id="orgDesc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-[#121414] border border-[#4a4455] rounded-lg px-3 py-2 text-[13px] font-['Courier_Prime',monospace] text-[#e2e2e2] focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 transition-all resize-none"
              />
              <p className="text-[12px] text-[#ccc3d8]">Metadatos internos usados por el orquestador.</p>
            </div>

            {error && <p className="text-[12px] text-[#ffb4ab]">{error}</p>}
            {saved && <p className="text-[12px] text-[#b9f6ca]">Cambios guardados correctamente.</p>}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#7c3aed] text-on-primary-container hover:bg-[#8b5cf6] transition-colors rounded-lg text-[12px] font-medium disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tab: Seguridad */}
      {activeTab === "seguridad" && (
        <section className="rounded-xl border border-[#4a4455] bg-[#1e2020] p-8 text-center">
          <span className="material-symbols-outlined text-[#958da1] text-[48px] mb-4 block">shield</span>
          <h3 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">Seguridad</h3>
          <p className="text-[#ccc3d8] max-w-md mx-auto">
            Configuración de seguridad de la organización. Próximamente.
          </p>
        </section>
      )}

      {/* Zona de peligro */}
      <section className="rounded-xl overflow-hidden border border-[#93000a]/30 bg-[#93000a]/10 relative">
        <div className="absolute inset-0 bg-[#93000a]/5 pointer-events-none" />
        <div className="px-6 py-4 border-b border-[#93000a]/20 relative z-10">
          <h3 className="text-[20px] font-semibold text-[#ffb4ab]">Zona de Peligro</h3>
        </div>
        <div className="p-6 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-[12px] font-medium text-[#e2e2e2] mb-1">Eliminar organización</h4>
            <p className="text-[14px] text-[#ccc3d8] max-w-xl">
              Una vez eliminada la organización, no hay vuelta atrás. Por favor, esté seguro.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-[#ffb4ab] text-[#ffb4ab] hover:bg-[#93000a] hover:text-[#ffdad6] rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap"
          >
            Eliminar organización
          </button>
        </div>
      </section>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121414]/80 backdrop-blur-md p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false)
              setConfirmName("")
            }
          }}
        >
          <div className="bg-[#303036] border border-[#4a4455] rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-[#ffb4ab] mb-4">
              <span className="material-symbols-outlined text-[36px]">warning</span>
              <h3 className="text-[28px] font-semibold">Eliminar Organización</h3>
            </div>
            <p className="text-[14px] text-[#ccc3d8] mb-6">
              Esta acción es <strong className="text-[#e2e2e2]">irreversible</strong>. Se eliminarán permanentemente todos los datos, proyectos y configuraciones asociadas a{" "}
              <span className="font-['Courier_Prime',monospace] text-[#e2e2e2] bg-[#333535] px-1 py-0.5 rounded">
                {org.name}
              </span>.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[12px] font-medium text-[#e2e2e2]">
                Escribe{" "}
                <span className="font-['Courier_Prime',monospace] text-[#ffb4ab]">{org.name}</span>{" "}
                para confirmar
              </label>
              <input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={org.name}
                className="bg-[#121414] border border-[#4a4455] rounded-lg px-3 py-2 font-['Courier_Prime',monospace] text-[#e2e2e2] focus:outline-none focus:border-[#ffb4ab] focus:ring-2 focus:ring-[#ffb4ab]/20 transition-all"
              />
            </div>
            <div className="flex justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmName("")
                }}
                disabled={deleting}
                className="px-4 py-2 border border-[#4a4455] rounded-lg text-[12px] font-medium hover:bg-[#27272a] transition-colors flex-1 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmName.trim() !== org.name}
                className="px-4 py-2 bg-[#ffb4ab] text-[#690005] hover:bg-[#ffb4ab]/80 rounded-lg text-[12px] font-medium transition-colors flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Eliminando..." : "Eliminar Definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

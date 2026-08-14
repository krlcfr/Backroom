"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface OrgProps {
  id: string
  name: string
  description: string
  logoUrl: string | null
}

export default function ConfiguracionForm({ org }: { org: OrgProps }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[#3f3f46] bg-[#27272a] p-6 md:p-8 flex flex-col gap-6"
      >
        {/* Logo */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">
            Logo de la organización
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#1e2020] border border-[#4a4455] flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo seleccionado" className="w-full h-full object-cover" />
              ) : org.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logoUrl} alt={`Logo de ${org.name}`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-[#958da1]">
                  {org.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
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
                className="px-4 py-2 text-[12px] font-medium border border-[#3f3f46] rounded-lg hover:bg-[#18181b] text-[#e2e2e2] transition-colors"
              >
                Cambiar imagen
              </button>
              {(logoPreview || org.logoUrl) && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="px-4 py-2 text-[12px] font-medium border border-[#3f3f46] rounded-lg hover:bg-[#18181b] text-[#ccc3d8] transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-[#ccc3d8]/60">PNG, JPEG o WebP · máx. 2 MB</p>
        </div>

        {/* Nombre */}
        <div className="flex flex-col gap-2">
          <label htmlFor="orgName" className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">
            Nombre de la organización
          </label>
          <input
            id="orgName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#18181b] border border-[#3f3f46] rounded-lg w-full px-4 py-3 text-[14px] text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none transition-all"
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-2">
          <label htmlFor="orgDesc" className="text-[12px] font-medium tracking-wide text-[#e2e2e2]">
            Descripción técnica
          </label>
          <textarea
            id="orgDesc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#18181b] border border-[#3f3f46] rounded-lg w-full px-4 py-3 text-[14px] text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none transition-all resize-none"
          />
        </div>

        {error && <p className="text-[12px] text-[#ffb4ab]">{error}</p>}

        {saved && (
          <p className="text-[12px] text-[#b9f6ca]">Cambios guardados correctamente.</p>
        )}

        <div className="flex justify-end pt-4 border-t border-[#3f3f46]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#8b5cf6] text-[#fafafa] text-[12px] font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>

      {/* Zona de peligro */}
      <div className="rounded-xl border border-[#ffb4ab]/30 bg-[#27272a] p-6 md:p-8">
        <h2 className="text-[14px] font-semibold text-[#ffb4ab]">Zona de peligro</h2>
        <p className="mt-2 text-[12px] text-[#ccc3d8]">
          Eliminar la organización borra de forma permanente todas sus BackRooms, salas, recursos,
          permisos y miembros. Esta acción no se puede deshacer.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 px-5 py-2.5 border border-[#ffb4ab]/40 text-[#ffb4ab] text-[12px] font-medium rounded-lg hover:bg-[#ffb4ab]/10 transition-colors"
        >
          Eliminar organización
        </button>
      </div>

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#3f3f46] bg-[#27272a] p-6">
            <h3 className="text-[16px] font-semibold text-[#e2e2e2]">
              ¿Eliminar {org.name}?
            </h3>
            <p className="mt-2 text-[13px] text-[#ccc3d8]">
              Escribe el nombre de la organización para confirmar. Se eliminará todo su contenido
              en cascada.
            </p>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={org.name}
              className="mt-4 bg-[#18181b] border border-[#3f3f46] rounded-lg w-full px-4 py-3 text-[14px] text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20 outline-none"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmName("")
                }}
                disabled={deleting}
                className="px-4 py-2 text-[12px] text-[#ccc3d8] hover:text-[#e2e2e2] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmName.trim() !== org.name}
                className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] text-white text-[12px] font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                {deleting ? "Eliminando..." : "Eliminar organización"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

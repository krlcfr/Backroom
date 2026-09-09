"use client"

import { useState } from "react"
import { createPortal } from "react-dom"

interface InviteBackroomModalProps {
  backroomId: string
  onClose: () => void
  onSuccess: (invitationData: any) => void
}

export default function InviteBackroomModal({ backroomId, onClose, onSuccess }: InviteBackroomModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backroom_id: backroomId, email }),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || "Error al invitar miembro al backroom")
      }

      onSuccess(responseData.data?.invitation)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md rounded-2xl bg-[#18181b] border border-[#27272a] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Invitar miembro al Backroom</h2>
          <p className="text-sm text-[#a1a1aa] mb-6">
            Ingresa el correo electrónico del usuario que deseas invitar a este backroom.
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#e4e4e7] mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-[#27272a] bg-[#09090b] px-4 py-2 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa] transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Enviar invitación"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  if (typeof document === "undefined") return null

  return createPortal(modalContent, document.body)
}

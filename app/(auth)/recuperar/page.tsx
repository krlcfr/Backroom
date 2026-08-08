"use client"

import { useState } from "react"
import Link from "next/link"

export default function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al enviar el correo")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <div className="h-1 w-full bg-[#7c3aed] rounded-t-[11px]"></div>
      
      <div className="p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#121414] border border-[#4a4455] mb-4">
            <span className="material-symbols-outlined text-[#d2bbff] text-2xl">lock_reset</span>
          </div>
          <h1 className="text-[28px] font-semibold leading-9 text-[#e2e2e2] tracking-tight mb-2">Recuperar contraseña</h1>
          
          {sent ? (
            <p className="text-[14px] leading-5 text-[#ccc3d8]">
              Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>.
            </p>
          ) : (
            <p className="text-[14px] leading-5 text-[#ccc3d8]">
              Introduce tu correo electrónico para recibir un enlace de recuperación.
            </p>
          )}
        </div>

        {sent ? (
          <div className="mt-8 text-center">
            <Link href="/login" className="inline-flex items-center gap-1 text-[12px] font-medium tracking-wide text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="bg-[#7c3aed]/10 border border-[#d2bbff]/20 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#d2bbff] text-lg mt-0.5">info</span>
              <p className="text-[14px] leading-5 text-[#d2bbff]">
                Si el correo existe, recibirás instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium tracking-wide text-[#ccc3d8]" htmlFor="email">
                Dirección de Correo Electrónico
              </label>
              <div className="relative input-glow rounded-lg transition-shadow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] text-[18px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full bg-[#121414] border border-[#4a4455] rounded-lg py-2.5 pl-10 pr-4 text-[#e2e2e2] text-[14px] placeholder:text-[#ccc3d8]/50 focus:border-[#7c3aed] focus:ring-0 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-[#ffb4ab]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#7c3aed] text-[#fafafa] hover:bg-[#8b5cf6] text-[12px] font-bold tracking-wide py-3 px-4 rounded-lg transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(124,58,237,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>

            <div className="mt-2 text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-[12px] font-medium tracking-wide text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

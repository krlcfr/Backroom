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
      setError(data.error?.message ?? data.error ?? "Error al enviar el correo")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-semibold tracking-tight text-[#e2e2e2]">Revisá tu correo</h1>
          <p className="text-sm text-[#ccc3d8]">
            Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm text-[#d2bbff] hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-1 flex flex-col gap-1 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#e2e2e2]">Recuperar contraseña</h1>
        <p className="text-sm text-[#ccc3d8]">
          Ingresá tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-1.5 text-[#ccc3d8]">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#4a4455] bg-[#0c0f0f] px-3 py-2 text-sm text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
        />
      </div>

      {error && <p className="text-sm text-[#ffb4ab]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-[#ede0ff] hover:bg-[#8B5CF6] disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>

      <Link
        href="/login"
        className="block text-center text-sm text-[#d2bbff] hover:underline"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  )
}

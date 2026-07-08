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

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-zinc-700">
          Revisá tu correo <strong>{email}</strong>. Te enviamos un enlace para
          restablecer tu contraseña.
        </p>
        <Link
          href="/login"
          className="block text-sm text-zinc-500 hover:text-zinc-900"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-600">
        Ingresá tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </p>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>

      <Link
        href="/login"
        className="block text-center text-sm text-zinc-500 hover:text-zinc-900"
      >
        Volver al inicio de sesión
      </Link>
    </form>
  )
}

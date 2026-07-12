"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ConfirmarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenHash = searchParams.get("token_hash")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    if (!tokenHash) {
      setError("El enlace de recuperación no es válido")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenHash, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Error al restablecer la contraseña")
      setLoading(false)
      return
    }

    router.push("/login?reset=exito")
    router.refresh()
  }

  if (!tokenHash) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600">
          El enlace de recuperación no es válido o ya expiró.
        </p>
        <Link
          href="/recuperar"
          className="block text-sm text-zinc-500 hover:text-zinc-900"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-600">
        Ingresá tu nueva contraseña.
      </p>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-zinc-900">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium mb-1 text-zinc-900">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Restablecer contraseña"}
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

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
      <ConfirmarForm />
    </Suspense>
  )
}

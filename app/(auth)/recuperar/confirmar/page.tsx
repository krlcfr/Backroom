"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ConfirmarForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get("code")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState(
    !code ? "El enlace de recuperación no es válido o ha expirado" : ""
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!code) {
      setError("El enlace de recuperación no es válido o ha expirado")
      return
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error?.message ?? data.error ?? "No se pudo restablecer la contraseña")
      setLoading(false)
      return
    }

    router.push("/login?reset=exito")
    router.refresh()
  }

  if (!code) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-[#ffb4ab]">{error}</p>
        <Link
          href="/recuperar"
          className="block text-sm text-[#d2bbff] hover:underline"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-1 flex flex-col gap-1 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#e2e2e2]">Nueva contraseña</h1>
        <p className="text-sm text-[#ccc3d8]">Elegí una contraseña nueva para tu cuenta.</p>
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-1.5 text-[#ccc3d8]">
          Nueva contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[#4a4455] bg-[#0c0f0f] px-3 py-2 text-sm text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="block text-xs font-medium mb-1.5 text-[#ccc3d8]">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-[#4a4455] bg-[#0c0f0f] px-3 py-2 text-sm text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
        />
      </div>

      {error && <p className="text-sm text-[#ffb4ab]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-[#ede0ff] hover:bg-[#8B5CF6] disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Restablecer contraseña"}
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

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#ccc3d8]">Cargando…</p>}>
      <ConfirmarForm />
    </Suspense>
  )
}

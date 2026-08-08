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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
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
      setError(data.error || "No se pudo restablecer la contraseña")
      setLoading(false)
      return
    }

    router.push("/login?reset=exito")
    router.refresh()
  }

  return (
    <>
      <div className="h-1 w-full bg-[#7c3aed] rounded-t-[11px]"></div>
      
      <div className="p-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#121414] border border-[#4a4455] mb-4">
            <span className="material-symbols-outlined text-[#d2bbff] text-2xl">password</span>
          </div>
          <h1 className="text-[28px] font-semibold leading-9 text-[#e2e2e2] tracking-tight mb-2">Nueva contraseña</h1>
          <p className="text-[14px] leading-5 text-[#ccc3d8]">
            Elegí una contraseña segura para tu cuenta.
          </p>
        </div>

        {!code ? (
          <div className="flex flex-col gap-6 text-center">
            <div className="bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-lg p-4 flex items-start gap-3 text-left">
              <span className="material-symbols-outlined text-[#ffb4ab] text-lg mt-0.5" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
              <p className="text-[14px] leading-5 text-[#ffb4ab]">
                {error}
              </p>
            </div>
            <Link
              href="/recuperar"
              className="inline-flex items-center justify-center gap-1 text-[12px] font-medium tracking-wide text-[#ccc3d8] hover:text-[#d2bbff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Solicitar un nuevo enlace
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium tracking-wide text-[#ccc3d8]" htmlFor="password">
                Nueva contraseña
              </label>
              <div className="relative input-glow rounded-lg transition-shadow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] text-[18px]">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121414] border border-[#4a4455] rounded-lg py-2.5 pl-10 pr-10 text-[#e2e2e2] text-[14px] placeholder:text-[#ccc3d8]/50 focus:border-[#7c3aed] focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium tracking-wide text-[#ccc3d8]" htmlFor="confirm">
                Confirmar contraseña
              </label>
              <div className="relative input-glow rounded-lg transition-shadow">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] text-[18px]">
                  lock
                </span>
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121414] border border-[#4a4455] rounded-lg py-2.5 pl-10 pr-10 text-[#e2e2e2] text-[14px] placeholder:text-[#ccc3d8]/50 focus:border-[#7c3aed] focus:ring-0 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirm ? "visibility" : "visibility_off"}
                  </span>
                </button>
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
              {loading ? "Guardando..." : "Restablecer contraseña"}
              {!loading && <span className="material-symbols-outlined text-[18px]">save</span>}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#ccc3d8]">Cargando…</p>}>
      <ConfirmarForm />
    </Suspense>
  )
}

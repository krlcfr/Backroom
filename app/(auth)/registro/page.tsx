"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import OAuthButtons from "@/components/oauth-buttons"

type FieldErrors = Record<string, string>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]+$/

function validateClient(values: { username: string; fullName: string; email: string; password: string; confirmPassword: string }): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.fullName.trim()) {
    errors.fullName = "El nombre completo es obligatorio."
  }

  if (!values.username.trim()) {
    errors.username = "El nombre de usuario es obligatorio."
  } else if (values.username.length < 3 || values.username.length > 50) {
    errors.username = "Debe tener entre 3 y 50 caracteres."
  } else if (!USERNAME_RE.test(values.username)) {
    errors.username = "Solo letras, números y guión bajo (_)."
  }

  if (!values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio."
  } else if (!EMAIL_RE.test(values.email)) {
    errors.email = "Ingresá un correo electrónico válido."
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria."
  } else if (values.password.length < 8) {
    errors.password = "Debe tener al menos 8 caracteres."
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirmá tu contraseña."
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden."
  }

  return errors
}

const inputBase =
  "w-full rounded-lg border bg-[#0c0f0f] px-3 py-2 text-sm text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/20"
const inputError = "border-[#ffb4ab]/60"
const inputNormal = "border-[#4a4455]"

export default function RegistroPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError("")

    const clientErrors = validateClient({ username, fullName, email, password, confirmPassword })
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }
    setErrors({})
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, fullName, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        if (data.campo) {
          setErrors({ [data.campo]: data.error })
          return
        }
        if (data.detalles) {
          const fieldMap: Record<string, string> = {}
          Object.entries(data.detalles).forEach(([field, messages]) => {
            fieldMap[field] = Array.isArray(messages) && messages.length > 0 ? messages[0] : "Campo inválido"
          })
          setErrors(fieldMap)
          return
        }
        setGlobalError(data.error || "No se pudo completar el registro")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setLoading(false)
      setGlobalError("No se pudo completar el registro. Intentá de nuevo.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-[28px] font-semibold tracking-tight text-[#e2e2e2]">Crear cuenta</h1>
        <p className="text-sm text-[#ccc3d8]">Únete a la plataforma para gestionar tu espacio.</p>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#4a4455]"></div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#ccc3d8]">
          O registrarse con email
        </span>
        <div className="h-px flex-1 bg-[#4a4455]"></div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-medium text-[#ccc3d8]">
            Nombre completo
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej. Jane Doe"
            className={`${inputBase} ${errors.fullName ? inputError : inputNormal}`}
          />
          {errors.fullName && <p className="text-[11px] font-medium text-[#ffb4ab]">{errors.fullName}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-medium text-[#ccc3d8]">
            Nombre de usuario
          </label>
          <div
            className={`flex items-center overflow-hidden rounded-lg border bg-[#0c0f0f] focus-within:ring-2 focus-within:ring-[#A78BFA]/20 ${
              errors.username ? "border-[#ffb4ab]/60" : "border-[#4a4455]"
            }`}
          >
            <span className="pl-3 text-sm text-[#ccc3d8]/50">@</span>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="janedoe"
              className="w-full bg-transparent px-2 py-2 text-sm font-mono text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none"
            />
          </div>
          {errors.username && <p className="text-[11px] font-medium text-[#ffb4ab]">{errors.username}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium text-[#ccc3d8]">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
          />
          {errors.email && <p className="text-[11px] font-medium text-[#ffb4ab]">{errors.email}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium text-[#ccc3d8]">
            Contraseña
          </label>
          <div
            className={`flex items-center overflow-hidden rounded-lg border bg-[#0c0f0f] pr-2 focus-within:ring-2 focus-within:ring-[#A78BFA]/20 ${
              errors.password ? "border-[#ffb4ab]/60" : "border-[#4a4455]"
            }`}
          >
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm tracking-widest text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer p-1 text-[#ccc3d8] hover:text-[#e2e2e2]"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] font-medium text-[#ffb4ab]">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-medium text-[#ccc3d8]">
            Confirmar contraseña
          </label>
          <div
            className={`flex items-center overflow-hidden rounded-lg border bg-[#0c0f0f] pr-2 focus-within:ring-2 focus-within:ring-[#A78BFA]/20 ${
              errors.confirmPassword ? "border-[#ffb4ab]/60" : "border-[#4a4455]"
            }`}
          >
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm tracking-widest text-[#e2e2e2] placeholder:text-[#ccc3d8]/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="cursor-pointer p-1 text-[#ccc3d8] hover:text-[#e2e2e2]"
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] font-medium text-[#ffb4ab]">{errors.confirmPassword}</p>
          )}
        </div>

        {globalError && <p className="text-sm text-[#ffb4ab]">{globalError}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-[#ede0ff] hover:bg-[#8B5CF6] disabled:opacity-50"
        >
          {loading ? "Registrando…" : "Crear cuenta"}
          {!loading && <ArrowIcon className="h-3.5 w-3.5" />}
        </button>
      </form>

      <p className="mt-2 text-center text-[13px] text-[#ccc3d8]">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="ml-1 text-xs font-medium text-[#d2bbff] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}

function EyeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M10.73 5.08A10.93 10.93 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2l20 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

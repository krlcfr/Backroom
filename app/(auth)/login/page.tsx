"use client"

import { useState, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import CaptchaWidget, { type CaptchaWidgetHandle } from "@/components/captcha-widget"

function LoginForm() {
  const searchParams = useSearchParams()
  const reset = searchParams.get("reset")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<CaptchaWidgetHandle>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!captchaToken) {
      setError("Completá la verificación \"No soy un robot\" para continuar.")
      setLoading(false)
      return
    }

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(typeof data.error === "string" ? data.error : data.error?.message || "No se pudo iniciar sesión")
      setLoading(false)
      captchaRef.current?.reset()
      return
    }

    const inv = searchParams.get("invite"); if (inv) { window.location.href = `/invitar/${inv}` } else { window.location.href = "/login" }
  }

  async function handleOAuth(provider: "google" | "github") {
    setError("")
    setOauthLoading(provider)

    try {
      const res = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message || "Error al conectar con el proveedor")
      }

      const { data } = await res.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar con el proveedor")
      setOauthLoading(null)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-weight: normal;
            font-style: normal;
            font-size: 24px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-feature-settings: 'liga';
            -webkit-font-smoothing: antialiased;
        }
        
        /* Subtle glow effect for focused inputs */
        .input-glow:focus-within {
            box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
        }

        /* Toast animation */
        @keyframes slideIn {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        .toast-enter {
            animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .toast-exit {
            animation: fadeOut 0.3s ease-out forwards;
        }
      `}} />

      {/* Error Toast 429 */}
      {error && (
        <div className="toast-enter fixed top-6 right-6 z-50 flex items-center gap-3 bg-[#93000a] border border-[#ffb4ab]/20 p-4 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] max-w-sm w-full">
          <span className="material-symbols-outlined text-[#ffdad6]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
          <div className="flex-1">
            <p className="text-[12px] leading-4 font-bold text-[#ffdad6] tracking-wide">Error</p>
            <p className="text-[14px] leading-5 text-[#ffdad6]/90">{error}</p>
          </div>
          <button 
            type="button"
            className="text-[#ffdad6]/70 hover:text-[#ffdad6] transition-colors p-1 rounded hover:bg-[#ffdad6]/10" 
            onClick={() => setError("")}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-8 pb-6 text-center border-b border-[#4a4455]/50 relative">
        <Link 
          href="/" 
          className="absolute left-6 top-8 text-[#958da1] hover:text-[#e2e2e2] transition-colors flex items-center justify-center"
          title="Volver al inicio"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <h1 className="text-[28px] font-semibold leading-9 text-[#d2bbff] tracking-tight mb-2">BackRoom</h1>
        <p className="text-[14px] leading-5 text-[#ccc3d8]">Accede a tu espacio de control</p>
      </div>

      {/* Body */}
      <div className="p-8 flex flex-col gap-6">
        {/* OAuth Providers */}
        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={loading || oauthLoading !== null || !captchaToken}
            className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-[#4a4455] bg-transparent hover:bg-[#282a2b] transition-colors text-[#e2e2e2] text-[12px] font-medium tracking-wide active:scale-[0.98] disabled:opacity-50"
          >
            <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"></path>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"></path>
              <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05"></path>
              <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853"></path>
            </svg>
            {oauthLoading === "google" ? "Conectando..." : "Continuar con Google"}
          </button>
          <button 
            type="button"
            onClick={() => handleOAuth("github")}
            disabled={loading || oauthLoading !== null || !captchaToken}
            className="flex items-center justify-center gap-3 w-full p-3 rounded-lg border border-[#4a4455] bg-transparent hover:bg-[#282a2b] transition-colors text-[#e2e2e2] text-[12px] font-medium tracking-wide active:scale-[0.98] disabled:opacity-50"
          >
            <svg aria-hidden="true" className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
            {oauthLoading === "github" ? "Conectando..." : "Continuar con GitHub"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-[#4a4455] flex-1"></div>
          <span className="text-[12px] font-medium tracking-wide text-[#ccc3d8] uppercase">o con tu correo</span>
          <div className="h-px bg-[#4a4455] flex-1"></div>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {reset === "exito" && (
            <p className="rounded-md bg-green-900/30 px-3 py-2 text-[14px] text-green-400">
              Contraseña actualizada. Iniciá sesión con tu nueva contraseña.
            </p>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium tracking-wide text-[#e2e2e2]" htmlFor="email">
              Correo electrónico
            </label>
            <div className="relative input-glow rounded-lg transition-shadow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] text-[20px]">
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

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-medium tracking-wide text-[#e2e2e2]" htmlFor="password">
                Contraseña
              </label>
              <Link href="/recuperar" className="text-[12px] font-medium tracking-wide text-[#d2bbff] hover:text-[#7c3aed] transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative input-glow rounded-lg transition-shadow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc3d8] text-[20px]">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
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

          {/* Captcha */}
          <CaptchaWidget
            ref={captchaRef}
            onChange={(token) => {
              setCaptchaToken(token)
              if (token) setError("")
            }}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || oauthLoading !== null || !captchaToken}
            className="mt-2 w-full bg-[#7c3aed] text-[#ede0ff] hover:bg-[#7c3aed]/90 text-[12px] font-bold tracking-wide py-3 px-4 rounded-lg transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(124,58,237,0.2)] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
            {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 bg-[#282a2b]/50 border-t border-[#4a4455] rounded-b-xl text-center">
        <p className="text-[14px] text-[#ccc3d8]">
          ¿No tienes una cuenta?{" "}
          <Link href="/registro" className="text-[#d2bbff] hover:text-[#7c3aed] font-semibold transition-colors">
            Crear una cuenta
          </Link>
        </p>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#ccc3d8] text-center">Cargando…</p>}>
      <LoginForm />
    </Suspense>
  )
}

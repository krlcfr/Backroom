"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function LoginForm() {
  const searchParams = useSearchParams()
  const reset = searchParams.get("reset")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      // En caso de credenciales incorrectas o rate limit, mostramos el error que viene de la API.
      // El backend ya se encarga de devolver un mensaje genérico para credenciales ("Credenciales incorrectas")
      // y un mensaje específico para Rate Limit ("Demasiados intentos. Inténtalo más tarde.").
      setError(data.error?.message || "No se pudo iniciar sesión")
      setLoading(false)
      return
    }

    // Usamos window.location.href para forzar recarga completa y que el middleware evalúe 
    // el rol (SuperAdmin vs Demo vs Org) y redirija automáticamente
    window.location.href = "/"
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
    } catch (err: any) {
      setError(err.message)
      setOauthLoading(null)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border border-zinc-200">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Bienvenido de nuevo</h1>
        <p className="text-sm text-zinc-500 mt-1">Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {reset === "exito" && (
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Contraseña actualizada. Iniciá sesión con tu nueva contraseña.
          </p>
        )}
        
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-zinc-900">
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1 text-zinc-900">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-zinc-500 hover:text-zinc-700 focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/recuperar" className="text-sm text-zinc-600 hover:text-zinc-900 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className="w-full flex justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Ingresando…" : "Iniciar sesión"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-zinc-500">O continuar con</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading || oauthLoading !== null}
            onClick={() => handleOAuth("google")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 transition-colors"
          >
            {oauthLoading === "google" ? "Conectando..." : (
              <>
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.25024 6.65L5.27028 9.765C6.22028 6.665 9.03028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.235C5.02498 13.505 4.88501 12.725 4.88501 11.925C4.88501 11.125 5.01998 10.345 5.26498 9.615L1.23999 6.5C0.439987 8.1 0 9.945 0 11.925C0 13.905 0.444985 15.75 1.23999 17.35L5.26498 14.235Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C9.03037 19.245 6.22037 17.33 5.26538 14.23L1.24036 17.345C3.25536 21.305 7.31037 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </>
            )}
          </button>

          <button
            type="button"
            disabled={loading || oauthLoading !== null}
            onClick={() => handleOAuth("github")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 transition-colors"
          >
            {oauthLoading === "github" ? "Conectando..." : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </>
            )}
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        ¿No tienes una cuenta?{" "}
        <Link href="/registro" className="font-semibold text-zinc-900 hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<p className="text-sm text-zinc-500 text-center">Cargando…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

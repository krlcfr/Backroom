"use client";

import { useEffect } from "react";
import type { Metadata } from "next";

// Note: metadata no funciona en Client Components; está en el layout padre.

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[BackRoom Error]", error);
  }, [error]);

  // Detectar tipo de error por mensaje o digest
  const is429 = error.message?.includes("429") || error.message?.toLowerCase().includes("rate limit");
  const is401 = error.message?.includes("401") || error.message?.toLowerCase().includes("sesión");
  const is403 = error.message?.includes("403") || error.message?.toLowerCase().includes("permiso");

  const errorConfig = is429
    ? {
        code: "429",
        title: "Demasiadas solicitudes",
        description: "Has superado el límite de peticiones. Espera unos minutos antes de intentarlo de nuevo.",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        ),
        color: "amber",
      }
    : is401
    ? {
        code: "401",
        title: "Sesión expirada",
        description: "Tu sesión ha expirado o no tienes una sesión activa. Inicia sesión para continuar.",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        ),
        color: "blue",
      }
    : is403
    ? {
        code: "403",
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a este recurso. Contacta al propietario del BackRoom.",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        ),
        color: "red",
      }
    : {
        code: "500",
        title: "Algo salió mal",
        description: "Ocurrió un error inesperado en el servidor. Nuestro equipo ha sido notificado.",
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        ),
        color: "red",
      };

  const colorMap: Record<string, string> = {
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  const iconColors: Record<string, string> = {
    amber: "text-amber-400",
    blue: "text-blue-400",
    red: "text-red-400",
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className={`text-8xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent select-none`}>
          {errorConfig.code}
        </p>

        <div className="mt-4 mb-6 flex justify-center">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${colorMap[errorConfig.color]}`}>
            <svg className={`w-8 h-8 ${iconColors[errorConfig.color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {errorConfig.icon}
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">{errorConfig.title}</h1>
        <p className="text-slate-400 text-sm mb-8">{errorConfig.description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {is401 ? (
            <a
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Iniciar sesión
            </a>
          ) : (
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          )}
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-colors"
          >
            Volver al dashboard
          </a>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-slate-600 font-mono">ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}

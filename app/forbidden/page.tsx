import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "403 — Acceso denegado | BackRoom",
  description: "No tienes permiso para acceder a este recurso.",
};

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent select-none">
          403
        </p>

        <div className="mt-4 mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Acceso denegado</h1>
        <p className="text-slate-400 text-sm mb-8">
          No tienes permisos para acceder a este recurso. Si crees que es un error, contacta al propietario del BackRoom.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#121414] font-sans">
      <div className="relative bg-[#18181B] border border-[#3F3F46] rounded-xl p-8 flex flex-col items-center text-center gap-6 max-w-md w-full overflow-hidden group hover:border-[#7c3aed]/50 transition-colors">
        <div className="absolute inset-0 bg-[#7c3aed]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-16 h-16 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/30 flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-4xl text-[#7c3aed]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        </div>
        <div className="space-y-2 z-10 flex-1">
          <div className="text-sm font-mono text-[#7c3aed]">ERR_403</div>
          <h2 className="text-2xl font-semibold text-[#e2e2e2]">Acceso Restringido</h2>
          <p className="text-sm text-[#ccc3d8] max-w-xs mx-auto">
            Tus credenciales actuales no poseen los privilegios necesarios para acceder a este recurso.
          </p>
        </div>
        <Link href="/dashboard" className="z-10 mt-2 px-6 py-2.5 rounded-lg border border-[#3F3F46] bg-transparent text-[#e2e2e2] hover:bg-[#27272A] transition-all font-medium text-sm">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}

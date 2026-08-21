import Link from 'next/link';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#121414] font-sans">
      <div className="relative bg-[#18181B] border border-[#3F3F46] rounded-xl p-8 flex flex-col items-center text-center gap-6 max-w-md w-full overflow-hidden group hover:border-[#3F3F46] transition-colors">
        <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-[#27272A] rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity"></div>
        <div className="w-16 h-16 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center z-10">
          <span className="material-symbols-outlined text-4xl text-[#ccc3d8]">hourglass_empty</span>
        </div>
        <div className="space-y-2 z-10 flex-1">
          <div className="text-sm font-mono text-[#7c3aed]">ERR_401</div>
          <h2 className="text-2xl font-semibold text-[#e2e2e2]">Sesión Expirada</h2>
          <p className="text-sm text-[#ccc3d8] max-w-xs mx-auto">
            El token de autenticación ha caducado o no se ha proporcionado. Es necesario revalidar la identidad.
          </p>
        </div>
        <Link href="/login" className="z-10 mt-2 px-6 py-2.5 rounded-lg bg-[#7c3aed] text-white hover:bg-[#8B5CF6] transition-all font-medium text-sm shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link"

export default function ConfirmarCorreoPage() {
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
      `}} />

      <div className="p-8 pb-6 text-center border-b border-[#4a4455]/50 flex flex-col items-center">
        <div className="w-16 h-16 bg-[#7c3aed]/10 rounded-full flex items-center justify-center mb-6 border border-[#7c3aed]/20">
          <span className="material-symbols-outlined text-[#7c3aed] text-[32px]">
            mail
          </span>
        </div>
        <h1 className="text-[28px] font-semibold leading-9 text-[#d2bbff] tracking-tight mb-3">Revisa tu correo</h1>
        <p className="text-[14px] leading-relaxed text-[#ccc3d8] max-w-sm mx-auto">
          Hemos enviado un enlace de confirmación a tu bandeja de entrada. Por favor, haz clic en el enlace para activar tu cuenta.
        </p>
      </div>

      <div className="p-8 flex flex-col gap-6">
        <Link 
          href="/login"
          className="w-full bg-[#121414] text-[#e2e2e2] hover:bg-[#282a2b] border border-[#4a4455] text-[12px] font-bold tracking-wide py-3 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver al inicio de sesión
        </Link>
      </div>
    </>
  )
}

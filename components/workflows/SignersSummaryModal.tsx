"use client"

interface SignersSummaryModalProps {
  signersCount: number;
  onContinue: () => void;
  onClose: () => void;
}

export function SignersSummaryModal({ signersCount, onContinue, onClose }: SignersSummaryModalProps) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-[#121414]/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-[#3f3f46] bg-[#1e2020] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Banner/Icon area */}
        <div className="bg-[#7c3aed]/10 p-8 flex flex-col items-center justify-center border-b border-[#3f3f46]">
          <div className="w-16 h-16 bg-[#7c3aed]/20 rounded-full flex items-center justify-center mb-4 relative">
            <span className="material-symbols-outlined text-[32px] text-[#d2bbff]">draw</span>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#6d28d9] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border border-[#1e2020]">
              {signersCount}
            </div>
          </div>
          <h2 className="text-xl font-bold text-white text-center">¡Flujo guardado con éxito!</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#e2e2e2] text-center mb-6">
            Has establecido a <span className="font-bold text-[#7c3aed]">{signersCount} personas</span> con la acción de firma en este documento.
            <br/><br/>
            Para poder iniciarlo, necesitas <span className="font-semibold text-white">ubicar los espacios de firma</span> dentro de las páginas del PDF.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onContinue}
              className="w-full py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">view_quilt</span>
              Ir a ubicar firmas
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-transparent hover:bg-[#27272a] text-[#a1a1aa] hover:text-white font-medium transition-colors border border-transparent hover:border-[#3f3f46]"
            >
              Hacerlo más tarde
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

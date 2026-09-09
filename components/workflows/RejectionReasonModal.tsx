"use client";

import { useState } from "react";

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  documentName?: string;
}

export function RejectionReasonModal({
  isOpen,
  onClose,
  onSubmit,
  documentName
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Por favor, ingresa un motivo para el rechazo.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("El motivo debe ser más descriptivo (mínimo 10 caracteres).");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(reason.trim());
      setReason(""); // Reset on success
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al rechazar el documento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl overflow-hidden flex flex-col">
          
          <div className="px-6 py-4 border-b border-[#3f3f46] flex items-center justify-between bg-[#1a1c1c]">
            <h2 className="text-lg font-semibold text-[#e2e2e2] flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">cancel</span>
              Rechazar Documento
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-[#958da1] hover:text-[#e2e2e2] transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            {documentName && (
              <p className="text-sm text-[#ccc3d8]">
                Estás a punto de rechazar el documento <strong className="text-[#e2e2e2]">"{documentName}"</strong>. 
                Esto detendrá el flujo de aprobación actual.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="reason" className="text-sm font-medium text-[#e2e2e2]">
                Motivo del rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                placeholder="Explica brevemente por qué rechazas este documento..."
                className="w-full h-32 px-3 py-2 bg-[#1a1c1c] border border-[#3f3f46] rounded-lg text-sm text-[#e2e2e2] placeholder:text-[#958da1] focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all resize-none disabled:opacity-50"
              />
              {error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:text-[#e2e2e2] hover:bg-[#27272a] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Confirmar Rechazo"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

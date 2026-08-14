"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TermsAndConditions, PrivacyPolicy } from "./legal-docs";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function LegalModal({ isOpen, onClose, onAccept }: LegalModalProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [activeTab, setActiveTab] = useState<"terms" | "policy">("terms");

  useEffect(() => {
    if (acceptedTerms && acceptedPolicy) {
      // Pequeño timeout para que el usuario vea que se marcó el check antes de cerrarse
      const t = setTimeout(() => {
        onAccept();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [acceptedTerms, acceptedPolicy, onAccept]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-[#4a4455] bg-[#1e2020] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4a4455] p-6 flex-shrink-0">
          <div>
            <h2 className="text-[20px] font-semibold text-[#e2e2e2]">Términos y Políticas</h2>
            <p className="text-[13px] text-[#ccc3d8] mt-1">
              Debes leer y aceptar ambos documentos para continuar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#4a4455] bg-[#121414] flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-3 text-[14px] font-medium transition-colors ${
              activeTab === "terms"
                ? "border-b-2 border-[#d2bbff] text-[#d2bbff]"
                : "text-[#ccc3d8] hover:bg-[#282a2b] hover:text-[#e2e2e2]"
            }`}
          >
            Términos y Condiciones
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`flex-1 py-3 text-[14px] font-medium transition-colors ${
              activeTab === "policy"
                ? "border-b-2 border-[#d2bbff] text-[#d2bbff]"
                : "text-[#ccc3d8] hover:bg-[#282a2b] hover:text-[#e2e2e2]"
            }`}
          >
            Política de Privacidad
          </button>
        </div>

        {/* Contenido (Scrollable) */}
        <div key={activeTab} className="flex-1 overflow-y-auto p-6 bg-[#0c0f0f]">
          {activeTab === "terms" ? <TermsAndConditions /> : <PrivacyPolicy />}
        </div>

        {/* Footer con Checkboxes */}
        <div className="border-t border-[#4a4455] bg-[#1a1c1c] p-6 flex flex-col gap-4 rounded-b-xl flex-shrink-0">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-5 rounded border border-[#4a4455] bg-[#0c0f0f] peer-checked:border-[#7c3aed] peer-checked:bg-[#7c3aed] transition-all flex items-center justify-center">
                <span className={`material-symbols-outlined text-[16px] text-white opacity-0 peer-checked:opacity-100 transition-opacity`}>check</span>
              </div>
            </div>
            <span className="text-[14px] text-[#ccc3d8] group-hover:text-[#e2e2e2] transition-colors leading-tight">
              He leído y acepto los <span className="font-semibold text-[#d2bbff]">Términos y Condiciones</span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-5 w-5 rounded border border-[#4a4455] bg-[#0c0f0f] peer-checked:border-[#7c3aed] peer-checked:bg-[#7c3aed] transition-all flex items-center justify-center">
                <span className={`material-symbols-outlined text-[16px] text-white opacity-0 peer-checked:opacity-100 transition-opacity`}>check</span>
              </div>
            </div>
            <span className="text-[14px] text-[#ccc3d8] group-hover:text-[#e2e2e2] transition-colors leading-tight">
              He leído y acepto la <span className="font-semibold text-[#d2bbff]">Política de Tratamiento de Datos</span>
            </span>
          </label>
        </div>
        
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { useRouter } from "next/navigation";

export function UpsellModal({ orgId }: { orgId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Escuchar un evento personalizado global "show-upsell"
    const handleShowUpsell = (e: CustomEvent<{ message: string }>) => {
      // Limpiar prefijos feos del backend si existen
      const cleanMessage = e.detail.message.replace("LÍMITE_PLAN: ", "");
      setMessage(cleanMessage);
      setIsOpen(true);
    };

    window.addEventListener("show-upsell" as any, handleShowUpsell);
    return () => window.removeEventListener("show-upsell" as any, handleShowUpsell);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e2020] border border-[#4a4455] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#4a4455] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#5a5465]">
        
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-[#958da1] hover:text-[#e2e2e2] transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#7c3aed]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#7c3aed]/30">
            <span className="material-symbols-outlined text-[#d2bbff] text-[32px]">rocket_launch</span>
          </div>
          <h2 className="text-3xl font-bold text-[#e2e2e2] mb-2">¡Es hora de crecer!</h2>
          <p className="text-[#d2bbff] font-medium bg-[#7c3aed]/10 px-4 py-2 rounded-lg inline-block border border-[#7c3aed]/20">
            {message || "Has alcanzado un límite en tu plan Free."}
          </p>
        </div>

        <div className="flex justify-center scale-90 origin-top">
          {/* Reutilizamos el PricingCards pero lo redirigiremos al checkout usando el modo dashboard */}
          <PricingCards mode="dashboard" currentPlan="free" organizationId={orgId} />
        </div>
        
        <div className="text-center mt-4">
          <button 
            onClick={() => router.push("/dashboard/configuracion/planes")}
            className="text-[#d2bbff] hover:underline text-sm font-medium"
          >
            Ir a configuración de planes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingCardsProps {
  mode: "landing" | "dashboard";
  organizationId?: string;
  currentPlan?: "free" | "pro" | "enterprise";
}

export function PricingCards({ mode, organizationId, currentPlan = "free" }: PricingCardsProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId: string) => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle */}
      <div className="flex items-center gap-3 mb-12">
        <span className={`text-sm ${!isAnnual ? "text-[#e2e2e2] font-semibold" : "text-[#958da1]"}`}>Mensual</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#7c3aed] transition-colors focus:outline-none"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isAnnual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${isAnnual ? "text-[#e2e2e2] font-semibold" : "text-[#958da1]"}`}>
          Anual <span className="ml-1 text-xs text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded-full">-20%</span>
        </span>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {/* Free Plan */}
        <div className="flex flex-col p-8 bg-[#27272a] rounded-2xl border border-[#4a4455] shadow-lg relative">
          <h3 className="text-xl font-bold text-[#e2e2e2] mb-2">Free</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Para empezar a organizarte.</p>
          <div className="text-4xl font-extrabold text-[#e2e2e2] mb-8">
            $0<span className="text-lg font-medium text-[#958da1]">/mes</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              1 Organización
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              1 BackRoom
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Hasta 3 Miembros
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Retención de archivos: 3 días
            </li>
          </ul>

          {mode === "landing" ? (
            <Link href="/registro" className="w-full py-3 px-4 rounded-lg border border-[#4a4455] text-center text-[#e2e2e2] font-medium hover:bg-[#333535] transition-colors">
              Comenzar Gratis
            </Link>
          ) : currentPlan === "free" ? (
            <button disabled className="w-full py-3 px-4 rounded-lg bg-[#333535] text-[#958da1] font-medium cursor-not-allowed">
              Plan Actual
            </button>
          ) : null}
        </div>

        {/* Pro Plan */}
        <div className="flex flex-col p-8 bg-[#303036] rounded-2xl border-2 border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)] relative transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#7c3aed] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Recomendado
          </div>
          <h3 className="text-xl font-bold text-[#e2e2e2] mb-2">Pro</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Para equipos en crecimiento.</p>
          <div className="text-4xl font-extrabold text-[#e2e2e2] mb-8">
            ${isAnnual ? "12" : "15"}
            <span className="text-lg font-medium text-[#958da1]">/mes</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              BackRooms Ilimitados
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Hasta 15 Miembros
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Subida de archivos pesados
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Retención de archivos: 6 meses
            </li>
          </ul>

          {mode === "landing" ? (
            <Link href="/registro" className="w-full py-3 px-4 rounded-lg bg-[#7c3aed] text-center text-white font-medium hover:bg-[#6d28d9] transition-colors shadow-lg shadow-[#7c3aed]/20">
              Elegir Pro
            </Link>
          ) : currentPlan === "free" ? (
            <button 
              onClick={() => handleCheckout(isAnnual ? "price_pro_annual" : "price_pro_monthly")}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#7c3aed] text-center text-white font-medium hover:bg-[#6d28d9] transition-colors shadow-lg shadow-[#7c3aed]/20 disabled:opacity-50"
            >
              {loading ? "Redirigiendo..." : "Mejorar a Pro"}
            </button>
          ) : currentPlan === "pro" ? (
            <button onClick={handlePortal} disabled={loading} className="w-full py-3 px-4 rounded-lg border border-[#7c3aed] text-[#e2e2e2] font-medium hover:bg-[#7c3aed]/10 transition-colors">
              Administrar Suscripción
            </button>
          ) : null}
        </div>

        {/* Enterprise Plan */}
        <div className="flex flex-col p-8 bg-[#27272a] rounded-2xl border border-[#4a4455] shadow-lg relative">
          <h3 className="text-xl font-bold text-[#e2e2e2] mb-2">Enterprise</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Máxima seguridad y aislamiento.</p>
          <div className="text-4xl font-extrabold text-[#e2e2e2] mb-8">
            ${isAnnual ? "40" : "50"}
            <span className="text-lg font-medium text-[#958da1]">/mes</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Todo ilimitado
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Retención infinita
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Base de datos aislada privada
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#7c3aed] text-[20px]">check_circle</span>
              Soporte 24/7
            </li>
          </ul>

          {mode === "landing" ? (
            <Link href="/registro" className="w-full py-3 px-4 rounded-lg border border-[#4a4455] text-center text-[#e2e2e2] font-medium hover:bg-[#333535] transition-colors">
              Contactar Ventas
            </Link>
          ) : currentPlan === "enterprise" ? (
            <button onClick={handlePortal} disabled={loading} className="w-full py-3 px-4 rounded-lg border border-[#4a4455] text-[#e2e2e2] font-medium hover:bg-[#333535] transition-colors">
              Administrar Suscripción
            </button>
          ) : (
            <button 
              onClick={() => handleCheckout(isAnnual ? "price_ent_annual" : "price_ent_monthly")}
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg border border-[#4a4455] text-center text-[#e2e2e2] font-medium hover:bg-[#333535] transition-colors disabled:opacity-50"
            >
              {loading ? "Redirigiendo..." : "Mejorar a Enterprise"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (!organizationId) {
      setErrorMsg("No hay organización seleccionada.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, priceId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("Error al iniciar checkout: " + (data.error || "Desconocido"));
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error al conectar con la pasarela: " + err.message);
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!organizationId) {
      setErrorMsg("No hay organización seleccionada.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("Error al abrir portal: " + (data.error || "Desconocido"));
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error de conexión: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Toggle */}
      <div className="flex items-center gap-3 mb-12">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!isAnnual ? "text-[#e2e2e2]" : "text-[#ccc3d8]"}`}>Mensual</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 bg-[#333535] rounded-full relative transition-colors focus:outline-none"
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-[#d2bbff] transition-transform ${isAnnual ? "left-7" : "left-1"}`} />
          </button>
          <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? "text-[#e2e2e2]" : "text-[#ccc3d8]"}`}>
            Anual
            <span className="bg-[#7c3aed]/20 text-[#d2bbff] text-[10px] px-2 py-0.5 rounded-full border border-[#7c3aed]/30">-20%</span>
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-xl mx-auto mb-8 p-3 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-lg flex items-center gap-3 text-[#ffb4ab]">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        {/* Free Plan */}
        <div className={`flex flex-col p-8 bg-[#27272a] rounded-2xl border transition-all duration-300 relative ${
          currentPlan === "free"
            ? "border-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-[#34d399]"
            : "border-[#4a4455] shadow-lg"
        }`}>
          {currentPlan === "free" && mode === "dashboard" && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#34d399] text-[#1e2020] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Plan Actual
            </div>
          )}
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
        <div className={`flex flex-col p-8 bg-[#303036] rounded-2xl border-2 transition-all duration-300 relative transform md:-translate-y-4 ${
          currentPlan === "pro"
            ? "border-[#34d399] shadow-[0_0_30px_rgba(52,211,153,0.2)] ring-1 ring-[#34d399]"
            : "border-[#7c3aed] shadow-[0_0_30px_rgba(124,58,237,0.15)]"
        }`}>
          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            currentPlan === "pro" && mode === "dashboard" ? "bg-[#34d399] text-[#1e2020]" : "bg-[#7c3aed] text-white"
          }`}>
            {currentPlan === "pro" && mode === "dashboard" ? "Plan Actual" : "Recomendado"}
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
        <div className={`flex flex-col p-8 bg-[#27272a] rounded-2xl border transition-all duration-300 relative ${
          currentPlan === "enterprise"
            ? "border-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-[#34d399]"
            : "border-[#4a4455] shadow-lg"
        }`}>
          {currentPlan === "enterprise" && mode === "dashboard" && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#34d399] text-[#1e2020] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Plan Actual
            </div>
          )}
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

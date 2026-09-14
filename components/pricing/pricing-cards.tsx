"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingCardsProps {
  mode: "landing" | "dashboard";
  organizationId?: string;
  currentPlan?: "free" | "pro" | "enterprise";
}

function InteractiveCard({ children, isPro, currentPlan }: { children: React.ReactNode, isPro?: boolean, currentPlan?: string }) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  // Determine accent color - making the glow much stronger and wider
  const isEnterprise = currentPlan === "enterprise";
  const accentColor = isPro ? "rgba(52,211,153,1)" : "rgba(124,58,237,1)";
  const borderBase = isPro ? "border-[#34d399]/30" : "border-[#3f3f46]/50";

  return (
    <div 
      onMouseMove={handleMouseMove}
      className={`relative group p-[2px] rounded-2xl overflow-visible transition-all duration-500 ease-out z-10 hover:z-30 hover:-translate-y-2 hover:scale-[1.03] ${isPro ? 'md:-translate-y-4 hover:md:-translate-y-6 hover:shadow-[0_20px_40px_-15px_rgba(52,211,153,0.4)]' : 'hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.4)]'}`}
    >
      {/* Capa base del borde estático */}
      <div className="absolute inset-0 bg-[#27272a] rounded-2xl" />

      {/* Efecto de borde brillante reactivo al mouse (mucho más intenso) */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), ${accentColor}, transparent 40%)`
        }}
      />
      
      {/* Fondo mate de la tarjeta */}
      <div className={`relative h-full flex flex-col p-8 rounded-[15px] bg-[#121214] z-10 border border-transparent`}>
        {/* Un glow interno aún más suave */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500 pointer-events-none rounded-[15px]"
          style={{
            background: `radial-gradient(800px circle at var(--mouse-x, 0) var(--mouse-y, 0), ${accentColor}, transparent 40%)`
          }}
        />
        
        <div className="relative z-20 flex flex-col flex-1">
          {children}
        </div>
      </div>
    </div>
  );
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

      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || "Error al procesar el pago");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Error de red");
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    if (!organizationId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("Error al abrir el portal");
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg("Error de red");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
      {/* Annual/Monthly Toggle */}
      <div className="flex items-center gap-3 mb-16 bg-[#18181b] p-1.5 rounded-full border border-[#3f3f46]/50 shadow-inner">
        <span className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer ${!isAnnual ? "text-[#e2e2e2] bg-[#333535]" : "text-[#958da1]"}`} onClick={() => setIsAnnual(false)}>
          Mensual
        </span>
        <button
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAnnual ? "bg-[#7c3aed]" : "bg-[#4a4455]"}`}
          onClick={() => setIsAnnual(!isAnnual)}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-2 ${isAnnual ? "text-[#e2e2e2] bg-[#333535]" : "text-[#958da1]"}`} onClick={() => setIsAnnual(true)}>
          Anual <span className="text-[10px] bg-[#7c3aed]/20 text-[#d2bbff] px-2 py-0.5 rounded-full font-bold border border-[#7c3aed]/30">-20%</span>
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm w-full max-w-md text-center">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full relative z-10">
        
        {/* Free Plan */}
        <InteractiveCard>
          <h3 className="text-xl font-bold text-[#e2e2e2] mb-2 tracking-tight">Free</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Para empezar a organizarte.</p>
          <div className="text-4xl font-extrabold text-[#e2e2e2] mb-8 tracking-tight">
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

          <div className="mt-auto">
            {mode === "landing" ? (
              <Link href="/registro" className="block w-full py-3 px-4 rounded-xl border border-[#3f3f46] text-center text-[#e2e2e2] font-semibold transition-all duration-300 hover:bg-[#7c3aed] hover:border-[#7c3aed] hover:text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] hover:scale-[1.02]">
                Comenzar Gratis
              </Link>
            ) : currentPlan === "free" ? (
              <button disabled className="w-full py-3 px-4 rounded-xl bg-[#27272a] text-[#958da1] font-semibold cursor-not-allowed border border-[#3f3f46]/50">
                Plan Actual
              </button>
            ) : null}
          </div>
        </InteractiveCard>

        {/* Pro Plan */}
        <InteractiveCard isPro>
          <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg ${
            currentPlan === "pro" && mode === "dashboard" 
              ? "bg-[#34d399] text-[#064e3b] shadow-[#34d399]/20" 
              : "bg-[#7c3aed] text-white shadow-[#7c3aed]/30"
          }`}>
            {currentPlan === "pro" && mode === "dashboard" ? "Plan Actual" : "Recomendado"}
          </div>
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Pro</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Para equipos en crecimiento.</p>
          <div className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-md">
            ${isAnnual ? "12" : "15"}
            <span className="text-lg font-medium text-[#958da1]">/mes</span>
          </div>
          
          <ul className="flex flex-col gap-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#34d399] text-[20px]">check_circle</span>
              BackRooms Ilimitados
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#34d399] text-[20px]">check_circle</span>
              Hasta 15 Miembros
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#34d399] text-[20px]">check_circle</span>
              Subida de archivos pesados
            </li>
            <li className="flex items-start gap-3 text-[#ccc3d8] text-sm">
              <span className="material-symbols-outlined text-[#34d399] text-[20px]">check_circle</span>
              Retención de archivos: 6 meses
            </li>
          </ul>

          <div className="mt-auto">
            {mode === "landing" ? (
              <Link href="/registro" className="block w-full py-3 px-4 rounded-xl bg-[#34d399] text-center text-[#064e3b] font-bold transition-all duration-300 hover:bg-[#10b981] hover:text-white hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] hover:scale-[1.02] border border-[#34d399]">
                Elegir Pro
              </Link>
            ) : currentPlan === "free" ? (
              <button 
                onClick={() => handleCheckout(isAnnual ? "price_pro_annual" : "price_pro_monthly")}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#34d399] text-center text-[#064e3b] font-bold transition-all duration-300 hover:bg-[#10b981] hover:text-white hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] hover:scale-[1.02] disabled:opacity-50 border border-[#34d399]"
              >
                {loading ? "Redirigiendo..." : "Mejorar a Pro"}
              </button>
            ) : currentPlan === "pro" ? (
              <button onClick={handlePortal} disabled={loading} className="w-full py-3 px-4 rounded-xl border border-[#34d399] text-[#e2e2e2] font-semibold hover:bg-[#34d399]/20 transition-colors">
                Administrar Suscripción
              </button>
            ) : null}
          </div>
        </InteractiveCard>

        {/* Enterprise Plan */}
        <InteractiveCard currentPlan="enterprise">
          {currentPlan === "enterprise" && mode === "dashboard" && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#34d399] text-[#064e3b] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-[#34d399]/20">
              Plan Actual
            </div>
          )}
          <h3 className="text-xl font-bold text-[#e2e2e2] mb-2 tracking-tight">Enterprise</h3>
          <p className="text-sm text-[#ccc3d8] mb-6">Máxima seguridad y aislamiento.</p>
          <div className="text-4xl font-extrabold text-[#e2e2e2] mb-8 tracking-tight">
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

          <div className="mt-auto">
            {mode === "landing" ? (
              <Link href="/registro" className="block w-full py-3 px-4 rounded-xl border border-[#3f3f46] text-center text-[#e2e2e2] font-semibold transition-all duration-300 hover:bg-white hover:border-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-[1.02]">
                Contactar Ventas
              </Link>
            ) : currentPlan === "enterprise" ? (
              <button onClick={handlePortal} disabled={loading} className="w-full py-3 px-4 rounded-xl border border-[#3f3f46] text-[#e2e2e2] font-semibold hover:bg-[#27272a] transition-all duration-300">
                Administrar Suscripción
              </button>
            ) : (
              <button 
                onClick={() => handleCheckout(isAnnual ? "price_ent_annual" : "price_ent_monthly")}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl border border-[#3f3f46] text-center text-[#e2e2e2] font-semibold transition-all duration-300 hover:bg-white hover:border-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Redirigiendo..." : "Mejorar a Enterprise"}
              </button>
            )}
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
}

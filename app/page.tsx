import Link from "next/link";
import { PricingCards } from "@/components/pricing/pricing-cards";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-[#121414] font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#333535]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7c3aed] rounded-md flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[20px]">folder_open</span>
          </div>
          <span className="text-xl font-bold text-[#e2e2e2]">BackRoom</span>
        </div>
        <nav className="hidden md:flex gap-8 text-[#ccc3d8] text-sm">
          <Link href="#features" className="hover:text-[#e2e2e2] transition-colors">Características</Link>
          <Link href="#pricing" className="hover:text-[#e2e2e2] transition-colors">Precios</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#ccc3d8] hover:text-[#e2e2e2] text-sm font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="px-4 py-2 bg-[#7c3aed] text-white rounded-md text-sm font-medium hover:bg-[#6d28d9] transition-colors">
            Registrarse
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-4 py-24 sm:py-32">
          <div className="rounded-full bg-[#7c3aed]/10 px-4 py-1.5 text-sm font-medium text-[#d2bbff] mb-8 border border-[#7c3aed]/20">
            Organización sin límites para tu equipo
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#e2e2e2] max-w-4xl mb-6">
            El backroom definitivo para <br />tu organización
          </h1>
          <p className="text-lg text-[#ccc3d8] max-w-2xl mb-10">
            Gestiona equipos, salas y recursos con permisos granulares y almacenamiento seguro. Todo en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/registro" className="px-8 py-3.5 bg-[#7c3aed] text-white rounded-lg font-medium hover:bg-[#6d28d9] transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Comenzar gratis
            </Link>
            <Link href="#pricing" className="px-8 py-3.5 bg-[#333535] text-[#e2e2e2] rounded-lg font-medium hover:bg-[#4a4455] transition-colors">
              Ver precios
            </Link>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="px-4 py-24 bg-[#1e2020]">
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-[#e2e2e2] mb-4">Planes que escalan contigo</h2>
            <p className="text-[#ccc3d8] mb-12 text-center">Empieza gratis y mejora cuando tu equipo lo necesite.</p>
            
            {/* The Pricing Cards component will handle the toggle and layout */}
            <PricingCards mode="landing" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#333535] text-center text-[#958da1] text-sm">
        <p>&copy; {new Date().getFullYear()} BackRoom. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

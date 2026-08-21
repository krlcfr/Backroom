import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  
  // RF-67: Con sesión activa, redirigir al espacio correspondiente
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-[#18181B] text-[#e2e2e2] font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 h-16 bg-[#18181B]/80 backdrop-blur-md border-b border-[#3F3F46]">
        <div className="flex justify-between items-center px-4 md:px-8 w-full mx-auto max-w-[1440px] h-full">
          <div className="flex items-center gap-8">
            <Link className="text-xl text-[#d2bbff] font-bold tracking-tight" href="/">BackRoom</Link>
            <nav className="hidden md:flex gap-6">
              <Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#features">Características</Link>
              <Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#faq">FAQ</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link className="text-sm text-[#e2e2e2] hover:text-[#d2bbff] transition-colors" href="/login">Iniciar sesión</Link>
            <Link className="text-sm bg-[#7c3aed] text-[#FAFAFA] hover:bg-[#8B5CF6] px-4 py-2 rounded-lg transition-colors font-medium" href="/registro">Crear cuenta</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#e2e2e2] mb-6 max-w-4xl mx-auto leading-tight tracking-tight">
            Gestiona tus espacios privados con <span className="text-[#7c3aed]">jerarquía</span> y seguridad absoluta
          </h1>
          <p className="text-lg md:text-xl text-[#ccc3d8] mb-10 max-w-2xl mx-auto">
            La plataforma definitiva para organizaciones que requieren un control estricto sobre sus estructuras de datos. Construido para administradores exigentes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link className="text-base bg-[#7c3aed] text-[#FAFAFA] hover:bg-[#8B5CF6] px-8 py-3 rounded-lg transition-colors font-semibold" href="/registro">
              Crear mi organización
            </Link>
            <Link className="text-base border border-[#3F3F46] text-[#e2e2e2] hover:bg-[#27272A] px-8 py-3 rounded-lg transition-colors font-medium" href="#features">
              Ver caractersticas
            </Link>
          </div>
          <div className="mt-16 w-full max-w-5xl mx-auto rounded-xl border border-[#3F3F46] overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-auto object-cover border-b border-[#3F3F46]" 
              alt="Backroom Interface Mockup" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlNrf1LQ8bDtPqwj8BfzCldDRakA2EkprcpIIPeTCU8ssCXSZZswfRvcZblUyY2kYz1WOKKiXmiJB13lqq27_cZ2PjGiIo8LjsWJ6V6eFqhRcTmin9jbohN4dm6CHvm-EwBmgc7HAvU1rMu1nXJOTTkFqxIq1eDWEa5lMeokf5YeTJ-Rtf__-4Swu_y8loEAnmYGLP7-v6yRto_yNpNkIhuRR-00TDD9qYHNDQfo_HgaT1jldfbxJuAA"
            />
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-4 md:px-8 max-w-[1440px] mx-auto" id="features">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#e2e2e2] mb-12 text-center tracking-tight">Arquitectura de Alta Densidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6 hover:border-[#7c3aed]/50 transition-colors group">
              <div className="mb-4 text-[#7c3aed]">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">folder_managed</span>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e2e2] mb-2">BackRooms</h3>
              <p className="text-sm text-[#ccc3d8]">Espacios aislados y seguros para proyectos sensibles. Configuracin dedicada por cada instancia.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6 hover:border-[#7c3aed]/50 transition-colors group">
              <div className="mb-4 text-[#7c3aed]">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">account_tree</span>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e2e2] mb-2">Árbol de salas</h3>
              <p className="text-sm text-[#ccc3d8]">Navegación jerárquica compleja. Organice infinitos niveles con rendimiento optimizado.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6 hover:border-[#7c3aed]/50 transition-colors group">
              <div className="mb-4 text-[#7c3aed]">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">key</span>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e2e2] mb-2">Permisos granulares</h3>
              <p className="text-sm text-[#ccc3d8]">Control de acceso a nivel de archivo. Define quién puede ver, editar o eliminar con precisión suiza.</p>
            </div>
            {/* Card 4 (Spans 2 columns) */}
            <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6 md:col-span-2 hover:border-[#7c3aed]/50 transition-colors group flex flex-col justify-center">
              <div className="mb-4 text-[#7c3aed]">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">history</span>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e2e2] mb-2">Auditoría completa</h3>
              <p className="text-sm text-[#ccc3d8] max-w-xl">Registro inmutable de cada acción. Monitorea accesos, cambios de permisos y descargas en tiempo real para un cumplimiento normativo total.</p>
            </div>
            {/* Card 5 */}
            <div className="bg-[#27272A] border border-[#3F3F46] rounded-xl p-6 hover:border-[#7c3aed]/50 transition-colors group">
              <div className="mb-4 text-[#7c3aed]">
                <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">admin_panel_settings</span>
              </div>
              <h3 className="text-xl font-semibold text-[#e2e2e2] mb-2">Roles fijos</h3>
              <p className="text-sm text-[#ccc3d8]">Perfiles de usuario estandarizados para una rápida implementación y gestión del equipo.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#18181B] border-t border-[#3F3F46] py-12 px-4 md:px-8 mt-auto" id="faq">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-xl text-[#d2bbff] font-bold tracking-tight mb-4 block">BackRoom</span>
            <p className="text-sm text-[#ccc3d8] max-w-sm">
              Infraestructura segura para la gestin documental jerrquica corporativa.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-[#e2e2e2] mb-4 uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2">
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#features">Características</Link></li>
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#">Seguridad</Link></li>
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#">API</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium text-[#e2e2e2] mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#">Privacidad</Link></li>
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#">Términos</Link></li>
              <li><Link className="text-sm text-[#ccc3d8] hover:text-[#d2bbff] transition-colors" href="#">Contacto</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto mt-12 pt-8 border-t border-[#3F3F46] flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-[#ccc3d8]"> {new Date().getFullYear()} BackRoom Systems. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

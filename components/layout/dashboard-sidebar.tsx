"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useLimits } from "@/components/providers/limits-provider"
import { useSidebar } from "@/components/providers/sidebar-provider"

interface DashboardSidebarProps {
  orgName: string | null
  orgLogo: string | null
  orgUpdatedAt: string | null
  esPropietario: boolean
  isSuperAdmin?: boolean
  isOrgAdmin?: boolean
}

const NAV_ITEMS = [
  { label: "Inicio", icon: "home", href: "/dashboard" },
  { label: "Jerarquía", icon: "account_tree", href: "/dashboard/hierarchy" },
  { label: "Almacenamiento", icon: "folder", href: "/dashboard/storage" },
  { label: "Mis Pendientes", icon: "inbox", href: "/dashboard/pendientes" },
  { label: "Docs Finalizados", icon: "task_alt", href: "/dashboard/documentos-finales" },
  { label: "Configuración", icon: "settings", href: "/dashboard/configuracion" },
  { label: "Historial", icon: "history", href: "/dashboard/auditoria" },
]

export default function DashboardSidebar({ orgName, orgLogo, orgUpdatedAt, esPropietario, isSuperAdmin, isOrgAdmin }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { canCreateBackroom } = useLimits()
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()

  // Filtramos planes y configuración avanzada si no es propietario ni admin
  let navItems = [...NAV_ITEMS]
  
  const hasAdminRights = esPropietario || isOrgAdmin;

  if (!hasAdminRights) {
      // Es un miembro regular
      navItems = navItems.filter((i) => 
        !["Planes", "Configuración", "Almacenamiento", "Miembros y Permisos", "Historial"].includes(i.label)
      )
  } else if (!esPropietario) {
    // Es un admin (pero no propietario), no puede ver Planes ni Configuración principal
    navItems = navItems.filter((i) => 
      !["Planes", "Configuración"].includes(i.label)
    )
  }
  
  if (isSuperAdmin) {
    if (!navItems.find(i => i.label === "Métricas Globales")) {
      navItems.push({ label: "Métricas Globales", icon: "public", href: "/dashboard/admin" })
    }
  }

  // En móvil, forzamos que no esté colapsado visualmente para los estilos internos
  const isVisuallyCollapsed = collapsed

  return (
    <>
      {/* Overlay para móvil */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden top-16"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <aside className={`fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#1a1c1c] border-r border-[#4a4455] flex-col py-4 gap-2 transition-all duration-300 z-40 flex w-[260px] ${collapsed ? "md:w-[80px]" : "md:w-[260px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* Botón para colapsar (solo escritorio) */}
        <div className={`px-4 items-center ${isVisuallyCollapsed ? "md:justify-center" : "justify-end"} mb-2 hidden md:flex`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
            title={isVisuallyCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isVisuallyCollapsed ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        {/* Header de Org */}
        {orgName && (
          <div className={`px-4 mb-4 flex items-center gap-3 ${isVisuallyCollapsed ? "md:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-lg bg-[#333535] flex items-center justify-center shrink-0 overflow-hidden relative">
              {orgLogo ? (
                <Image src={orgUpdatedAt ? `${orgLogo}?v=${encodeURIComponent(orgUpdatedAt)}` : orgLogo ?? ""} alt={orgName ?? ""} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <span className="material-symbols-outlined text-[#d2bbff]">apartment</span>
              )}
            </div>
            <div className={`min-w-0 ${isVisuallyCollapsed ? "md:hidden" : "block"}`}>
              <h2 className="text-[20px] font-semibold text-[#d2bbff] truncate">{orgName}</h2>
              <p className="text-[12px] text-[#ccc3d8]">
                {esPropietario ? "Propietario" : "Miembro"}
              </p>
            </div>
          </div>
        )}

        <nav className="flex-none flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = item.href.includes('/configuracion') 
              ? pathname.startsWith('/dashboard/configuracion')
              : pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={isVisuallyCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2 transition-all rounded-lg text-[12px] font-medium ${
                  isVisuallyCollapsed ? "md:justify-center px-4 md:px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l-2 border-[#d2bbff] rounded-r-lg"
                    : "text-[#ccc3d8] hover:bg-[#282a2b]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className={`${isVisuallyCollapsed ? "md:hidden" : "block"}`}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

      {esPropietario && (
        <div className={`mt-auto mb-4 ${isVisuallyCollapsed ? "md:px-2 px-4" : "px-4"}`}>
          <button
            onClick={() => {
              if (canCreateBackroom) {
                window.dispatchEvent(new CustomEvent("open-create-backroom"))
              } else {
                window.dispatchEvent(new CustomEvent("show-upsell", { detail: { message: "Has alcanzado el límite de BackRooms de tu plan actual." } }))
              }
            }}
            title={isVisuallyCollapsed ? "Nuevo BackRoom" : undefined}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-[12px] font-medium transition-colors ${
              canCreateBackroom 
                ? "bg-[#7c3aed] text-white hover:bg-[#8b5cf6]" 
                : "bg-[#333535] text-[#ccc3d8] hover:bg-[#4a4455] opacity-80"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{canCreateBackroom ? "add" : "lock"}</span>
            <span className={`${isVisuallyCollapsed ? "md:hidden" : "block"}`}>Nuevo BackRoom</span>
          </button>
        </div>
      )}

      <div className={`border-t border-[#4a4455] pt-2 px-2 flex flex-col gap-1 flex-none ${!esPropietario ? "mt-auto" : ""}`}>
        <Link
          href="/dashboard/support"
          onClick={() => setMobileOpen(false)}
          title={isVisuallyCollapsed ? "Soporte" : undefined}
          className={`flex items-center gap-3 text-[#ccc3d8] py-2 text-[12px] hover:bg-[#282a2b] rounded-lg transition-all ${
            isVisuallyCollapsed ? "md:justify-center px-4 md:px-0" : "px-4"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          <span className={`${isVisuallyCollapsed ? "md:hidden" : "block"}`}>Soporte</span>
        </Link>
      </div>
    </aside>
    </>
  )
}

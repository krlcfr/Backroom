"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLimits } from "@/components/providers/limits-provider"
import { useSidebar } from "@/components/providers/sidebar-provider"

interface DashboardSidebarProps {
  orgName: string | null
  orgLogo: string | null
  orgUpdatedAt: string | null
  esPropietario: boolean
  isSuperAdmin?: boolean
}

const NAV_ITEMS = [
  { label: "Inicio", icon: "home", href: "/dashboard" },
  { label: "Jerarquía", icon: "account_tree", href: "/dashboard/hierarchy" },
  { label: "Almacenamiento", icon: "folder", href: "/dashboard/storage" },
  { label: "Permisos", icon: "key", href: "/dashboard/miembros" },
  { label: "Historial", icon: "history", href: "/dashboard/auditoria" },
  { label: "Configuración", icon: "settings", href: "/dashboard/configuracion" },
  { label: "Planes", icon: "credit_card", href: "/dashboard/configuracion/planes" },
]

export default function DashboardSidebar({ orgName, orgLogo, orgUpdatedAt, esPropietario, isSuperAdmin }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { canCreateBackroom } = useLimits()
  const { collapsed, setCollapsed } = useSidebar()

  // Filtramos planes si no es propietario
  let navItems = esPropietario ? [...NAV_ITEMS] : NAV_ITEMS.filter((i) => i.label !== "Planes")
  
  if (isSuperAdmin) {
    if (!navItems.find(i => i.label === "Métricas Globales")) {
      navItems.push({ label: "Métricas Globales", icon: "public", href: "/dashboard/admin" })
    }
  }

  return (
    <aside className={`hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] bg-[#1a1c1c] border-r border-[#4a4455] flex-col py-4 gap-2 transition-all duration-300 ${collapsed ? "w-[80px]" : "w-[260px]"}`}>
      
      {/* Botón para colapsar */}
      <div className={`px-4 flex items-center ${collapsed ? "justify-center" : "justify-end"} mb-2`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#333535] text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors"
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {collapsed ? "menu_open" : "menu"}
          </span>
        </button>
      </div>

      {orgName && (
        <div className={`px-4 mb-4 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-lg bg-[#333535] flex items-center justify-center shrink-0 overflow-hidden">
            {orgLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={orgUpdatedAt ? `${orgLogo}?v=${encodeURIComponent(orgUpdatedAt)}` : orgLogo ?? ""} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[#d2bbff]">apartment</span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold text-[#d2bbff] truncate">{orgName}</h2>
              <p className="text-[12px] text-[#ccc3d8]">
                {esPropietario ? "Propietario" : "Miembro"}
              </p>
            </div>
          )}
        </div>
      )}

      <nav className="flex-none flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 py-2 transition-all rounded-lg text-[12px] font-medium ${
                collapsed ? "justify-center px-0" : "px-4"
              } ${
                isActive
                  ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l-2 border-[#d2bbff] rounded-r-lg"
                  : "text-[#ccc3d8] hover:bg-[#282a2b]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={`mt-auto mb-4 ${collapsed ? "px-2" : "px-4"}`}>
        <button
          onClick={() => {
            if (canCreateBackroom) {
              window.dispatchEvent(new CustomEvent("open-create-backroom"))
            } else {
              window.dispatchEvent(new CustomEvent("show-upsell", { detail: { message: "Has alcanzado el límite de BackRooms de tu plan actual." } }))
            }
          }}
          title={collapsed ? "Nuevo BackRoom" : undefined}
          className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-[12px] font-medium transition-colors ${
            canCreateBackroom 
              ? "bg-[#7c3aed] text-white hover:bg-[#8b5cf6]" 
              : "bg-[#333535] text-[#ccc3d8] hover:bg-[#4a4455] opacity-80"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{canCreateBackroom ? "add" : "lock"}</span>
          {!collapsed && <span>Nuevo BackRoom</span>}
        </button>
      </div>

      <div className="border-t border-[#4a4455] pt-2 px-2 flex flex-col gap-1 flex-none">
        <Link
          href="/dashboard"
          title={collapsed ? "Documentación" : undefined}
          className={`flex items-center gap-3 text-[#ccc3d8] py-2 text-[12px] hover:bg-[#282a2b] rounded-lg transition-all ${
            collapsed ? "justify-center px-0" : "px-4"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          {!collapsed && <span>Documentación</span>}
        </Link>
        <Link
          href="/dashboard"
          title={collapsed ? "Soporte" : undefined}
          className={`flex items-center gap-3 text-[#ccc3d8] py-2 text-[12px] hover:bg-[#282a2b] rounded-lg transition-all ${
            collapsed ? "justify-center px-0" : "px-4"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          {!collapsed && <span>Soporte</span>}
        </Link>
      </div>
    </aside>
  )
}

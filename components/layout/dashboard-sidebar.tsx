"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

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

  // Filtramos planes si no es propietario
  let navItems = esPropietario ? [...NAV_ITEMS] : NAV_ITEMS.filter((i) => i.label !== "Planes")
  
  if (isSuperAdmin) {
    // Evitar añadirlo duplicado por mutaciones accidentales si se hace spread
    if (!navItems.find(i => i.label === "Métricas Globales")) {
      navItems.push({ label: "Métricas Globales", icon: "public", href: "/dashboard/admin" })
    }
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-64px)] w-[260px] bg-[#1a1c1c] border-r border-[#4a4455] flex-col py-4 gap-2">
      {orgName && (
        <div className="px-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#333535] flex items-center justify-center shrink-0 overflow-hidden">
            {orgLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={orgUpdatedAt ? `${orgLogo}?v=${encodeURIComponent(orgUpdatedAt)}` : orgLogo ?? ""} alt={orgName} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[#d2bbff]">apartment</span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-[20px] font-semibold text-[#d2bbff] truncate">{orgName}</h2>
            <p className="text-[12px] text-[#ccc3d8]">
              {esPropietario ? "Propietario" : "Miembro"}
            </p>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 transition-all rounded-lg text-[12px] font-medium ${
                isActive
                  ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l-2 border-[#d2bbff] rounded-r-lg"
                  : "text-[#ccc3d8] hover:bg-[#282a2b]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-auto mb-4">
        <Link
          href="/dashboard"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-create-backroom"))
          }}
          className="w-full bg-[#7c3aed] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-[12px] font-medium hover:bg-[#8b5cf6] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo BackRoom
        </Link>
      </div>

      <div className="border-t border-[#4a4455] pt-2 px-2 flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 text-[#ccc3d8] px-4 py-2 text-[12px] hover:bg-[#282a2b] rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          <span>Documentación</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 text-[#ccc3d8] px-4 py-2 text-[12px] hover:bg-[#282a2b] rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">contact_support</span>
          <span>Soporte</span>
        </Link>
      </div>
    </aside>
  )
}

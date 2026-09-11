"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ConfigTabs({ esPropietario }: { esPropietario: boolean }) {
  const pathname = usePathname()

  const tabs = [
    { label: "Miembros y Permisos", href: "/dashboard/configuracion/miembros", icon: "group" },
    ...(esPropietario ? [
      { label: "Perfil", href: "/dashboard/configuracion", icon: "apartment" },
      { label: "Planes", href: "/dashboard/configuracion/planes", icon: "credit_card" }
    ] : [])
  ]

  return (
    <div className="flex border-b border-[#3f3f46]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors flex items-center gap-2 ${
              isActive ? 'border-[#a78bfa] text-[#a78bfa]' : 'border-transparent text-[#958da1] hover:text-[#ccc3d8]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

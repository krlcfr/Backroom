"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { NotificationBell } from "./NotificationBell"
import { useSidebar } from "@/components/providers/sidebar-provider"

interface DashboardHeaderProps {
  userName: string
  userAvatar: string | null
  esPropietario: boolean
  isOrgAdmin: boolean
}

export default function DashboardHeader({ userName, userAvatar, esPropietario, isOrgAdmin }: DashboardHeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { mobileOpen, setMobileOpen } = useSidebar()

  async function handleLogout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="fixed top-0 w-full z-50 h-16 bg-[#121414]/80 backdrop-blur-md border-b border-[#4a4455] flex justify-between items-center px-4 md:px-8">
      <div className="flex items-center gap-4 md:gap-6">
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -ml-2 text-[#ccc3d8] hover:text-[#e2e2e2] transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
        <span className="text-[20px] font-semibold text-[#d2bbff]">BackRoom</span>
        <nav className="hidden md:flex gap-6 h-full items-center">
          <Link href="/dashboard" className="text-[#d2bbff] font-medium border-b-2 border-[#d2bbff] pb-1">
            Dashboard
          </Link>
          {(esPropietario || isOrgAdmin) && (
            <Link href="/dashboard/auditoria" className="text-[#ccc3d8] text-[14px] hover:text-[#d2bbff] transition-colors pb-1">
              Registros
            </Link>
          )}
          {esPropietario && (
            <Link href="/dashboard/configuracion" className="text-[#ccc3d8] text-[14px] hover:text-[#d2bbff] transition-colors pb-1">
              Configuración
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        
        <NotificationBell />

        <Link 
          href="/dashboard/perfil" 
          className="relative p-2 rounded-full text-[#ccc3d8] hover:text-[#e2e2e2] hover:bg-[#27272a] transition-colors flex items-center justify-center hidden sm:flex"
          title="Mi Perfil"
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
        </Link>

        <Link 
          href="/dashboard/support" 
          className="relative p-2 rounded-full text-[#ccc3d8] hover:text-[#e2e2e2] hover:bg-[#27272a] transition-colors flex items-center justify-center hidden sm:flex"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </Link>
        
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-[13px] text-[#ccc3d8] hover:text-[#d2bbff] transition-colors disabled:opacity-50 hidden sm:block"
        >
          {loading ? "Saliendo…" : "Cerrar sesión"}
        </button>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="p-2 text-[#ccc3d8] hover:text-[#d2bbff] transition-colors disabled:opacity-50 sm:hidden flex items-center justify-center"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
        
        <div className="w-8 h-8 rounded-full border border-[#4a4455] bg-[#282a2b] flex items-center justify-center overflow-hidden relative ml-1">
          {userAvatar ? (
            <Image src={userAvatar} alt={userName} width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            <span className="text-[12px] font-medium text-[#d2bbff]">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

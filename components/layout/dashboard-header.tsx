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
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
          {esPropietario && (
            <Link href="/dashboard/configuracion" className="text-[#ccc3d8] text-[14px] hover:text-[#d2bbff] transition-colors pb-1">
              Configuración
            </Link>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        
        <NotificationBell />

        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full border border-[#4a4455] bg-[#282a2b] flex items-center justify-center overflow-hidden relative ml-1 hover:border-[#d2bbff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#121414]"
            title="Opciones de perfil"
          >
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <span className="text-[14px] font-medium text-[#d2bbff]">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#4a4455] bg-[#1a1c1c] shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-50 overflow-hidden py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-[#4a4455]/50 mb-1">
                  <p className="text-[13px] font-medium text-[#e2e2e2] truncate">{userName}</p>
                </div>
                
                <Link 
                  href="/dashboard/perfil" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ccc3d8] hover:text-[#e2e2e2] hover:bg-[#27272a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Mi Perfil
                </Link>
                
                <Link 
                  href="/dashboard/support" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#ccc3d8] hover:text-[#e2e2e2] hover:bg-[#27272a] transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">help_outline</span>
                  Soporte y Ayuda
                </Link>
                
                <div className="border-t border-[#4a4455]/50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={loading}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#ffb4ab] hover:bg-[#93000a]/20 hover:text-[#ffdad6] transition-colors disabled:opacity-50 text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    {loading ? "Saliendo…" : "Cerrar sesión"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

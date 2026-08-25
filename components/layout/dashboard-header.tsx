"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  userName: string
  userAvatar: string | null
}

export default function DashboardHeader({ userName, userAvatar }: DashboardHeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="fixed top-0 w-full z-50 h-16 bg-[#121414]/80 backdrop-blur-md border-b border-[#4a4455] flex justify-between items-center px-4 md:px-8">
      <div className="flex items-center gap-6">
        <span className="text-[20px] font-semibold text-[#d2bbff]">BackRoom</span>
        <nav className="hidden md:flex gap-6 h-full items-center">
          <Link href="/dashboard" className="text-[#d2bbff] font-medium border-b-2 border-[#d2bbff] pb-1">
            Dashboard
          </Link>
          <Link href="/dashboard" className="text-[#ccc3d8] text-[14px] hover:text-[#d2bbff] transition-colors pb-1">
            Registros
          </Link>
          <Link href="/dashboard/configuracion" className="text-[#ccc3d8] text-[14px] hover:text-[#d2bbff] transition-colors pb-1">
            Configuración
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="text-[13px] text-[#ccc3d8] hover:text-[#d2bbff] transition-colors disabled:opacity-50"
        >
          {loading ? "Saliendo…" : "Cerrar sesión"}
        </button>
        <div className="w-8 h-8 rounded-full border border-[#4a4455] bg-[#282a2b] flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
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

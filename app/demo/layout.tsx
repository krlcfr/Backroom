"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) setEmail(data.email)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-[#121414] text-[#e2e2e2] antialiased"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 h-16 bg-[#121414]/80 backdrop-blur-md border-b border-[#4a4455] flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="text-[20px] font-bold text-[#d2bbff]">BackRoom</div>
          <span className="bg-amber-900/30 text-amber-500 border border-amber-500/50 px-2 py-0.5 rounded-full text-[12px] font-medium ml-2">
            Modo Demo
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-[14px]">
            <a href="#" className="text-[#d2bbff] font-bold border-b-2 border-[#d2bbff] pb-1">Dashboard</a>
            <a href="#" className="text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">Logs</a>
            <a href="#" className="text-[#ccc3d8] hover:text-[#d2bbff] transition-colors">Settings</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-[#7c3aed] text-white px-4 py-2 rounded-lg text-[12px] font-medium hover:bg-[#8B5CF6] transition-colors flex items-center gap-2"
            >
              Crear mi organización
            </Link>
            <span className="material-symbols-outlined text-[#ccc3d8] cursor-pointer hover:text-[#d2bbff] transition-colors text-[20px]">
              notifications
            </span>
            <span className="material-symbols-outlined text-[#ccc3d8] cursor-pointer hover:text-[#d2bbff] transition-colors text-[20px]">
              help_outline
            </span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-[#282a2b] border border-[#4a4455] overflow-hidden flex items-center justify-center text-[#e2e2e2] text-[14px] font-semibold"
              >
                {email ? email.charAt(0).toUpperCase() : <span className="material-symbols-outlined text-[18px]">person</span>}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-[#1e2020] border border-[#4a4455] rounded-lg p-2 shadow-xl z-50">
                  <p className="px-3 py-2 text-[12px] text-[#ccc3d8] truncate">{email ?? "Usuario Demo"}</p>
                  <div className="border-t border-[#4a4455] my-1" />
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full text-left px-3 py-2 rounded-md text-[13px] text-[#ffb4ab] hover:bg-[#282a2b] transition-colors disabled:opacity-50"
                  >
                    {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-[260px] bg-[#1a1c1c] border-r border-[#4a4455] flex flex-col py-4 gap-2 z-40">
        <div className="px-4 pb-4 mb-2 border-b border-[#4a4455] flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#282a2b] border border-[#4a4455] overflow-hidden flex items-center justify-center text-[#d2bbff]">
            <span className="material-symbols-outlined">app_registration</span>
          </div>
          <div>
            <div className="text-[#d2bbff] font-semibold truncate">BackRoom Demo</div>
            <div className="text-[#ccc3d8] text-[12px]">Cuenta Demo</div>
          </div>
        </div>
        <div className="px-4 mb-4">
          <button
            type="button"
            className="w-full py-2 px-4 rounded-lg bg-[#7c3aed] text-white text-[12px] font-medium hover:bg-[#8B5CF6] transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
            title="Disponible al crear tu organización"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Room
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {[
            { icon: "home", label: "Home", active: false },
            { icon: "account_tree", label: "Hierarchy", active: true },
            { icon: "folder", label: "Storage", active: false },
            { icon: "key", label: "Permissions", active: false },
            { icon: "history", label: "History", active: false },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-4 py-2 hover:bg-[#282a2b] transition-all rounded-lg text-[12px] font-medium ${
                item.active
                  ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l-2 border-[#d2bbff] rounded-r-lg"
                  : "text-[#ccc3d8]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-2 space-y-1 border-t border-[#4a4455] pt-4">
          {[
            { icon: "description", label: "Docs" },
            { icon: "contact_support", label: "Support" },
          ].map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-3 text-[#ccc3d8] px-4 py-2 hover:bg-[#282a2b] transition-all rounded-lg text-[12px] font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </aside>

      <main className="ml-[260px] pt-16 min-h-screen">{children}</main>
    </div>
  )
}

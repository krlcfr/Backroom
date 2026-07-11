"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="flex h-14 items-center justify-between border-b px-6">
      <span className="font-semibold">BackRoom</span>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
      >
        {loading ? "Saliendo…" : "Cerrar sesión"}
      </button>
    </nav>
  )
}

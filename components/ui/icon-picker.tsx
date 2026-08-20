"use client"

import { useState, useRef, useEffect } from "react"

export const ICONS = [
  "domain", "apartment", "tag", "grid_view", "rocket_launch", 
  "group", "shield", "lock", "star", "dashboard", 
  "folder", "description", "analytics", "design_services", "campaign",
  "inventory_2", "hub", "dataset", "api", "monitoring",
  "science", "gavel", "balance", "receipt", "local_shipping",
  "support_agent", "verified", "handshake", "lightbulb", "explore",
  "public", "language", "translate", "storefront", "shopping_cart",
  "work", "school", "emoji_events", "sports_esports", "flight"
]

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex items-center justify-center rounded-lg border border-[#4a4455] bg-[#1e2020] text-[#e2e2e2] hover:bg-[#333535] hover:border-[#a78bfa]/50 transition-all focus:outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/20"
        title="Cambiar icono"
      >
        <span className="material-symbols-outlined text-[24px]">{value}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-[#27272a] border border-[#4a4455] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)] z-[100] w-[260px]">
          <h4 className="text-[11px] font-medium text-[#958da1] uppercase tracking-wider mb-2 px-2">
            Elige un icono
          </h4>
          <div className="grid grid-cols-5 gap-1 max-h-[220px] overflow-y-auto p-1 custom-scrollbar">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  onChange(icon)
                  setIsOpen(false)
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                  value === icon
                    ? "bg-[#7c3aed] text-white shadow-sm"
                    : "text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import InviteMemberModal from "@/components/modals/invite-member-modal"
import { useRouter } from "next/navigation"
import { useLimits } from "@/components/providers/limits-provider"

export default function InviteButton({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { canInviteMember } = useLimits()

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (canInviteMember) {
            setIsOpen(true)
          } else {
            window.dispatchEvent(new CustomEvent("show-upsell", { detail: { message: "Has alcanzado el límite de miembros de tu plan actual." } }))
          }
        }}
        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          canInviteMember 
            ? "border-[#3f3f46] text-[#ccc3d8] hover:bg-[#18181b] hover:text-[#e2e2e2]" 
            : "border-[#4a4455] text-[#ccc3d8] opacity-60 bg-[#333535] cursor-not-allowed"
        }`}
      >
        {canInviteMember ? "+ Invitar miembro" : "🔒 Invitar miembro"}
      </button>

      {isOpen && (
        <InviteMemberModal
          orgId={orgId}
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            setIsOpen(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

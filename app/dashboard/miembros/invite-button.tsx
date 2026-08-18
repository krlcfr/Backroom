"use client"

import { useState } from "react"
import InviteMemberModal from "@/components/modals/invite-member-modal"
import { useRouter } from "next/navigation"

export default function InviteButton({ orgId }: { orgId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-[#3f3f46] px-4 py-2 text-sm font-medium text-[#ccc3d8] hover:bg-[#18181b] hover:text-[#e2e2e2] transition-colors"
      >
        + Invitar miembro
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

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Organigrama" };
export default function HierarchyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-[#333535] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#958da1] text-[32px]">account_tree</span>
      </div>
      <h2 className="text-[20px] font-semibold text-[#e2e2e2] mb-2">Hierarchy</h2>
      <p className="text-[#ccc3d8] max-w-md">
        Gestión de jerarquías de organizaciones y salas. Próximamente.
      </p>
    </div>
  )
}


import { getSession } from "@/lib/auth/session";
import { BackroomsService } from "@/lib/services/backrooms.service";
import HierarchyPageClient from "@/components/hierarchy/hierarchy-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Jerarquía | BackRoom" };

export default async function HierarchyPage() {
  const session = await getSession();
  if (!session) return null;

  // Obtenemos los backrooms del usuario para permitirle seleccionar cuál jerarquía ver
  const backrooms = await BackroomsService.getByUser(session.user.id);

  return (
    <div className="w-full h-full p-6">
      <HierarchyPageClient backrooms={backrooms} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Sala {
  id: string;
  nombre: string;
  parent_id: string | null;
  icono?: string;
}

interface TreeNode extends Sala {
  children: TreeNode[];
}

function buildTree(salas: Sala[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  salas.forEach((s) => {
    map.set(s.id, { ...s, children: [] });
  });

  salas.forEach((s) => {
    const node = map.get(s.id)!;
    if (s.parent_id && map.has(s.parent_id)) {
      map.get(s.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function RenderTree({ nodes, backroomId, level = 0 }: { nodes: TreeNode[]; backroomId: string; level?: number }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5 w-full">
      {nodes.map((node) => {
        const isActive = pathname === `/dashboard/backrooms/${backroomId}/salas/${node.id}`;
        // Para la raíz a veces la URL es el backroom en sí
        const isRootActive = !node.parent_id && pathname === `/dashboard/backrooms/${backroomId}`;
        const active = isActive || isRootActive;
        const hasChildren = node.children.length > 0;

        return (
          <li key={node.id} className="w-full">
            <div className="flex items-center gap-1 w-full">
              {/* Spacer for indentation */}
              {Array.from({ length: level }).map((_, i) => (
                <div key={i} className="w-3 border-l border-[#4a4455] h-full opacity-30 ml-2" />
              ))}
              
              {hasChildren ? (
                <details className="w-full group" open>
                  <summary className={`flex items-center gap-2 px-2 py-1.5 transition-all rounded-lg text-[12px] font-medium cursor-pointer ${
                    active ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l border-[#d2bbff]" : "text-[#ccc3d8] hover:bg-[#282a2b]"
                  }`}>
                    <span className="material-symbols-outlined text-[14px] transition-transform group-open:rotate-90 text-[#958da1]">
                      chevron_right
                    </span>
                    <span className="material-symbols-outlined text-[16px]">{node.icono || "folder"}</span>
                    <Link href={`/dashboard/backrooms/${backroomId}/salas/${node.id}`} className="truncate hover:underline" onClick={(e) => e.stopPropagation()}>
                      {node.nombre}
                    </Link>
                  </summary>
                  <div className="mt-0.5">
                    <RenderTree nodes={node.children} backroomId={backroomId} level={level + 1} />
                  </div>
                </details>
              ) : (
                <Link
                  href={`/dashboard/backrooms/${backroomId}/salas/${node.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 ml-5 transition-all rounded-lg text-[12px] font-medium w-full ${
                    active ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l border-[#d2bbff]" : "text-[#ccc3d8] hover:bg-[#282a2b]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{node.icono || "folder"}</span>
                  <span className="truncate">{node.nombre}</span>
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function SidebarTree({ backroomId }: { backroomId: string }) {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadSalas() {
      const { data } = await supabase
        .from("salas")
        .select("id, nombre, parent_id, icono")
        .eq("backroom_id", backroomId)
        .order("created_at", { ascending: true });

      if (data) {
        setTree(buildTree(data));
      }
      setLoading(false);
    }
    loadSalas();
  }, [backroomId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4 animate-pulse">
        <div className="h-4 bg-[#333535] rounded w-3/4"></div>
        <div className="h-4 bg-[#333535] rounded w-1/2 ml-4"></div>
        <div className="h-4 bg-[#333535] rounded w-2/3 ml-4"></div>
      </div>
    );
  }

  if (tree.length === 0) return null;

  return (
    <div className="flex-1 overflow-y-auto px-2 mt-2 pt-2 border-t border-[#4a4455]">
      <div className="text-[10px] font-medium text-[#958da1] uppercase tracking-wider mb-2 px-2">
        Navegación del Backroom
      </div>
      <RenderTree nodes={tree} backroomId={backroomId} />
    </div>
  );
}

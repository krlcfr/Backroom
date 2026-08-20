"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Breadcrumb from "@/components/ui/breadcrumb"
import { createBrowserClient } from "@supabase/ssr"
import RoomGraphModal from "@/components/salas/room-graph-modal"

interface RoomNode {
  id: string;
  nombre: string;
  depth: number;
  icono?: string;
  hasAccess?: boolean;
  children?: RoomNode[];
}

interface Member {
  usuario_id: string
  permiso: "admin" | "contribuir" | "solo_visualizar"
  asignado_por: string | null
  created_at: string
  usuarios: {
    id: string
    username: string
    correo: string
    nombre_completo: string
  }
}

interface Backroom {
  id: string
  name: string
  ownerId: string
}

export default function MiembrosPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  
  const [backroom, setBackroom] = useState<Backroom | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const [auditUserId, setAuditUserId] = useState<string | null>(null)
  const [auditPermissions, setAuditPermissions] = useState<any[]>([])
  const [auditTree, setAuditTree] = useState<RoomNode[]>([])
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: user } = await supabase.from("usuarios").select("id").eq("auth_id", session.user.id).single()
          if (user) setCurrentUserId(user.id)
        }

        const [brRes, memRes] = await Promise.all([
          fetch(`/api/backrooms/${id}`),
          fetch(`/api/backrooms/${id}/members`)
        ])
        
        if (brRes.ok) {
          const brData = await brRes.json()
          setBackroom(brData)
        }
        
        if (memRes.ok) {
          const memData = await memRes.json()
          setMembers(memData.data.members)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const esPropietario = currentUserId !== null && backroom?.ownerId === currentUserId

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/backrooms/${id}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permiso: newRole })
      })
      if (res.ok) {
        setMembers(prev => prev.map(m => m.usuario_id === userId ? { ...m, permiso: newRole as any } : m))
      } else {
        alert("Error al cambiar rol")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm("¿Seguro que deseas expulsar a este miembro?")) return
    try {
      const res = await fetch(`/api/backrooms/${id}/members/${userId}`, { method: "DELETE" })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.usuario_id !== userId))
      } else {
        alert("Error al remover miembro")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openAudit = async (userId: string) => {
    setAuditLoading(true)
    try {
      const [roomsRes, permsRes] = await Promise.all([
        fetch(`/api/backrooms/${id}/rooms`),
        fetch(`/api/backrooms/${id}/members/${userId}/permissions`)
      ])
      
      let treeData: RoomNode[] = []
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json()
        const rootRoom = roomsData.find((r: any) => r.depth === 0)
        if (rootRoom) {
          const tRes = await fetch(`/api/rooms/${rootRoom.id}/tree`)
          if (tRes.ok) {
            const t = await tRes.json()
            treeData = t.data.room
          }
        }
      }
      
      if (permsRes.ok) {
        const pData = await permsRes.json()
        setAuditPermissions(pData.data)
      }
      
      setAuditTree(treeData)
      setAuditUserId(userId)
      setIsAuditing(true)
    } catch (e) {
      console.error(e)
    } finally {
      setAuditLoading(false)
    }
  }

  const handleNodeAuditClick = (roomId: string) => {
    // Fase 4 opcional: Abrir panel para editar los permisos específicos de este usuario en esta sala directamente.
    // Por ahora redirigiremos a la página de la matriz de la sala.
    router.push(`/dashboard/backrooms/${id}/salas/${roomId}/permisos`)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-[#ccc3d8] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
      </div>
    )
  }

  if (!backroom) {
    return (
      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-[#e2e2e2]">BackRoom no encontrada</h2>
        <Link href="/dashboard" className="mt-4 text-[#a78bfa] hover:underline">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: backroom.name, href: `/dashboard/backrooms/${backroom.id}` },
          { label: "Miembros" }
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#e2e2e2]">Miembros del Backroom</h1>
          <p className="text-[#958da1] text-[14px] mt-1">Gestiona los accesos y roles globales de los usuarios en este proyecto.</p>
        </div>
        {esPropietario && (
          <button className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-lg transition-colors text-[14px] font-medium">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invitar Miembro
          </button>
        )}
      </div>

      <div className="bg-[#1e2020] border border-[#3f3f46] rounded-xl overflow-hidden mt-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#27272a] border-b border-[#3f3f46] text-[#958da1] text-[12px] uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Usuario</th>
              <th className="px-6 py-4 font-medium">Rol Global</th>
              <th className="px-6 py-4 font-medium">Se unió el</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {members.map((member) => {
              const u = Array.isArray(member.usuarios) ? member.usuarios[0] : member.usuarios;
              const nombre = u?.nombre_completo || "Usuario Desconocido";
              const correo = u?.correo || "Sin correo";
              const inicial = nombre.charAt(0).toUpperCase();

              return (
                <tr key={member.usuario_id} className="hover:bg-[#2a2a2e]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] font-semibold text-[16px]">
                        {inicial}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#e2e2e2] flex items-center gap-2">
                          {nombre}
                          {member.usuario_id === backroom.ownerId && (
                            <span className="bg-[#7c3aed]/20 text-[#d2bbff] text-[10px] px-2 py-0.5 rounded-full border border-[#7c3aed]/30 uppercase tracking-wider">Propietario</span>
                          )}
                        </div>
                        <div className="text-[12px] text-[#958da1]">{correo}</div>
                      </div>
                    </div>
                  </td>
                <td className="px-6 py-4">
                  {esPropietario && member.usuario_id !== backroom.ownerId ? (
                    <select
                      value={member.permiso}
                      onChange={(e) => handleRoleChange(member.usuario_id, e.target.value)}
                      className="bg-[#333535] border border-[#4a4455] text-[#e2e2e2] text-[13px] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#a78bfa] transition-colors"
                    >
                      <option value="solo_visualizar">Solo visualizar (Lector)</option>
                      <option value="contribuir">Contribuir (Editor)</option>
                      <option value="admin">Administrador (Gestor)</option>
                    </select>
                  ) : (
                    <span className="text-[13px] text-[#ccc3d8] bg-[#333535] px-3 py-1.5 rounded-lg border border-[#3f3f46]">
                      {member.permiso === "solo_visualizar" ? "Solo visualizar" : member.permiso === "contribuir" ? "Contribuir" : "Administrador"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-[13px] text-[#958da1]">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openAudit(member.usuario_id)}
                      disabled={auditLoading}
                      className="flex items-center gap-1 bg-[#333535] hover:bg-[#4a4455] text-[#ccc3d8] px-3 py-1.5 rounded-lg transition-colors text-[12px] font-medium border border-[#3f3f46] disabled:opacity-50"
                      title="Ver flujograma de acceso"
                    >
                      <span className="material-symbols-outlined text-[16px]">account_tree</span>
                      Ver Flujo
                    </button>
                    {esPropietario && member.usuario_id !== backroom.ownerId && (
                      <button
                        onClick={() => handleRemove(member.usuario_id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-500/10 text-[#958da1] hover:text-red-400 transition-colors"
                        title="Expulsar miembro"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_remove</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#958da1] text-[14px]">
                  No hay miembros en esta BackRoom todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAuditing && (
        <RoomGraphModal
          tree={auditTree}
          backroomId={backroom.id}
          backroomName={backroom.name}
          onClose={() => setIsAuditing(false)}
          auditMode={true}
          userPermissions={auditPermissions}
          onNodeAuditClick={handleNodeAuditClick}
        />
      )}
    </div>
  )
}

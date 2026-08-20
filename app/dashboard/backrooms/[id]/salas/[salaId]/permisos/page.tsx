"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Breadcrumb from "@/components/ui/breadcrumb"
import { createBrowserClient } from "@supabase/ssr"

interface Permisos {
  salas_ver: boolean
  salas_acceder: boolean
  salas_crear: boolean
  salas_editar: boolean
  salas_eliminar: boolean
  archivos_subir: boolean
  archivos_editar: boolean
  archivos_eliminar: boolean
}

interface MemberMatrix {
  usuario_id: string
  username: string
  nombre_completo: string
  correo: string
  rol_general: string
  permisos_especificos: Permisos | null
}

export default function PermisosSalaPage() {
  const { id, salaId } = useParams<{ id: string; salaId: string }>()
  const router = useRouter()
  
  const [backroom, setBackroom] = useState<any>(null)
  const [sala, setSala] = useState<any>(null)
  const [matriz, setMatriz] = useState<MemberMatrix[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // Para mostrar loader por fila
  
  useEffect(() => {
    async function loadData() {
      try {
        const [brRes, salaRes, permRes] = await Promise.all([
          fetch(`/api/backrooms/${id}`),
          fetch(`/api/rooms/${salaId}`), // Necesitamos saber si tiene parent_id (quizás tengamos que crear este endpoint si no existe)
          fetch(`/api/rooms/${salaId}/permissions`)
        ])
        
        if (brRes.ok) setBackroom(await brRes.json())
        
        // El endpoint GET /api/rooms/[roomId] quizás no exista aislado, usamos /api/rooms/[roomId]/tree?
        // En realidad la respuesta de tree devuelve rootSala. Lo más seguro es usar /api/rooms/${salaId}/tree o similar.
        // Pero intentemos /api/rooms/${salaId} primero
        if (salaRes.ok) {
          const sData = await salaRes.json()
          setSala(sData.data ? sData.data : sData)
        } else {
          // Fallback en caso de que no exista el GET único de sala
          const tRes = await fetch(`/api/rooms/${salaId}/tree`)
          if (tRes.ok) {
            const tData = await tRes.json()
            setSala(tData.data.room)
          }
        }
        
        if (permRes.ok) {
          const pData = await permRes.json()
          setMatriz(pData.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, salaId])

  const handleToggle = async (usuario_id: string, field: keyof Permisos, currentValue: boolean) => {
    setSaving(usuario_id)
    
    // Obtener los permisos actuales o defaults
    const miembro = matriz.find(m => m.usuario_id === usuario_id)
    if (!miembro) return
    
    const currentPerms = miembro.permisos_especificos || {
      salas_ver: false,
      salas_acceder: false,
      salas_crear: false,
      salas_editar: false,
      salas_eliminar: false,
      archivos_subir: false,
      archivos_editar: false,
      archivos_eliminar: false,
    }
    
    const newPerms = {
      ...currentPerms,
      [field]: !currentValue
    }

    try {
      const res = await fetch(`/api/rooms/${salaId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          permisos: newPerms
        })
      })
      
      if (res.ok) {
        setMatriz(prev => prev.map(m => m.usuario_id === usuario_id ? { ...m, permisos_especificos: newPerms } : m))
      } else {
        alert("Error al actualizar permiso")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  const handleHeredar = async (usuario_id: string) => {
    if (!sala?.parent_id) return
    
    setSaving(usuario_id)
    try {
      const res = await fetch(`/api/rooms/${salaId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          heredar_de_padre: true,
          permisos: {} // Se ignorará pero para que pase validación inicial
        })
      })
      
      if (res.ok) {
        const { data } = await res.json()
        setMatriz(prev => prev.map(m => m.usuario_id === usuario_id ? { ...m, permisos_especificos: data } : m))
      } else {
        alert("Error al heredar permisos")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 text-[#ccc3d8] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-[32px]">progress_activity</span>
      </div>
    )
  }

  const permisosList: { key: keyof Permisos, label: string }[] = [
    { key: "salas_ver", label: "Ver Sala" },
    { key: "salas_acceder", label: "Entrar" },
    { key: "salas_crear", label: "Crear Subsalas" },
    { key: "salas_editar", label: "Editar Sala" },
    { key: "salas_eliminar", label: "Eliminar Sala" },
    { key: "archivos_subir", label: "Subir Recursos" },
    { key: "archivos_editar", label: "Editar Recursos" },
    { key: "archivos_eliminar", label: "Eliminar Recursos" }
  ]

  return (
    <div className="min-h-screen p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col gap-6 overflow-x-hidden">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: backroom?.name || "Backroom", href: `/dashboard/backrooms/${id}` },
          { label: sala?.nombre || "Sala", href: `/dashboard/backrooms/${id}/salas/${salaId}` },
          { label: "Matriz de Permisos" }
        ]}
      />

      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-[28px] font-bold text-[#e2e2e2] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#a78bfa] text-3xl">admin_panel_settings</span>
            Matriz de Permisos
          </h1>
          <p className="text-[#958da1] text-[14px] mt-1">Configura granularmente lo que cada miembro puede hacer en esta sala.</p>
        </div>
      </div>

      <div className="bg-[#1e2020] border border-[#3f3f46] rounded-xl overflow-x-auto mt-4 w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-[#27272a] border-b border-[#3f3f46] text-[#958da1] text-[11px] uppercase tracking-wider">
              <th className="px-6 py-4 font-medium sticky left-0 bg-[#27272a] z-10 border-r border-[#3f3f46]">Miembro</th>
              {permisosList.map(p => (
                <th key={p.key} className="px-4 py-4 font-medium text-center border-r border-[#3f3f46]/50 last:border-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-[#ccc3d8]">
                      {p.key.includes("archivos") ? "description" : "meeting_room"}
                    </span>
                    {p.label}
                  </div>
                </th>
              ))}
              {sala?.parent_id && (
                <th className="px-6 py-4 font-medium text-center">Heredar</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {matriz.map((member) => {
              const p = member.permisos_especificos || {
                salas_ver: false,
                salas_acceder: false,
                salas_crear: false,
                salas_editar: false,
                salas_eliminar: false,
                archivos_subir: false,
                archivos_editar: false,
                archivos_eliminar: false,
              }

              return (
                <tr key={member.usuario_id} className={`hover:bg-[#2a2a2e]/50 transition-colors ${saving === member.usuario_id ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 sticky left-0 bg-[#1e2020] z-10 border-r border-[#3f3f46]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] font-semibold text-[14px]">
                        {member.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-[#e2e2e2] truncate max-w-[150px]">
                          {member.nombre_completo}
                        </div>
                        <div className="text-[11px] text-[#958da1] uppercase tracking-wider">
                          {member.rol_general}
                        </div>
                      </div>
                    </div>
                  </td>
                  {permisosList.map(perm => (
                    <td key={perm.key} className="px-4 py-4 text-center border-r border-[#3f3f46]/50 last:border-0">
                      <button
                        onClick={() => handleToggle(member.usuario_id, perm.key, p[perm.key])}
                        disabled={saving !== null}
                        className={`w-10 h-6 rounded-full transition-colors relative inline-flex items-center justify-center ${
                          p[perm.key] ? 'bg-[#7c3aed]' : 'bg-[#4a4455]'
                        } ${saving !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`w-4 h-4 bg-white rounded-full transition-transform absolute shadow-sm ${
                          p[perm.key] ? 'translate-x-2' : '-translate-x-2'
                        }`} />
                      </button>
                    </td>
                  ))}
                  {sala?.parent_id && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleHeredar(member.usuario_id)}
                        disabled={saving !== null}
                        className="p-1.5 bg-[#333535] hover:bg-[#4a4455] text-[#ccc3d8] rounded transition-colors"
                        title="Heredar permisos de sala padre"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"

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

interface SalaPermissionsProps {
  salaId: string
  salaParentId: string | null
}

export function SalaPermissions({ salaId, salaParentId }: SalaPermissionsProps) {
  const [matriz, setMatriz] = useState<MemberMatrix[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadData() {
      try {
        const permRes = await fetch(`/api/rooms/${salaId}/permissions`)
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
  }, [salaId])

  const handleToggle = async (usuario_id: string, field: keyof Permisos, currentValue: boolean) => {
    setSaving(usuario_id)
    
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
    if (!salaParentId) return
    
    setSaving(usuario_id)
    try {
      const res = await fetch(`/api/rooms/${salaId}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id,
          heredar_de_padre: true,
          permisos: {}
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
      <div className="py-16 text-[#ccc3d8] flex items-center justify-center">
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
    <div className="flex flex-col w-full">
      <div className="bg-[#1e2020] border border-[#3f3f46] rounded-xl w-full overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-[#27272a] border-b border-[#3f3f46] text-[#958da1] text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-medium sticky left-0 bg-[#27272a] z-20 border-r border-[#3f3f46] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)]">
                  Miembro
                </th>
                {permisosList.map(p => (
                  <th key={p.key} className="px-4 py-4 font-medium text-center border-r border-[#3f3f46]/50 last:border-0 min-w-[95px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#ccc3d8]">
                        {p.key.includes("archivos") ? "description" : "meeting_room"}
                      </span>
                      <span className="text-[10px] leading-tight text-center">{p.label}</span>
                    </div>
                  </th>
                ))}
                {salaParentId && (
                  <th className="px-6 py-4 font-medium text-center min-w-[80px]">Heredar</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f3f46]">
              {matriz.map((member) => {
                const displayName = member.nombre_completo || member.username || member.correo || "Usuario";
                const initial = displayName.charAt(0).toUpperCase();
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
                    <td className="px-6 py-4 sticky left-0 bg-[#1e2020] z-10 border-r border-[#3f3f46] shadow-[2px_0_6px_-2px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff] font-semibold text-[14px] shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[#e2e2e2] truncate max-w-[170px]" title={displayName}>
                            {displayName}
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
                          aria-label={`${perm.label} para ${displayName}`}
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
                    {salaParentId && (
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
    </div>
  )
}

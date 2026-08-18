"use client"

import { useState } from "react"
import Link from "next/link"

interface RoomNode {
  id: string
  nombre: string
  depth: number
  children?: RoomNode[]
}

interface RoomTreeProps {
  rooms: RoomNode[]
  backroomId: string
  activeRoomId?: string
}

function TreeNode({
  node,
  backroomId,
  activeRoomId,
  level,
}: {
  node: RoomNode
  backroomId: string
  activeRoomId?: string
  level: number
}) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0
  const isActive = node.id === activeRoomId

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
          isActive
            ? "bg-[#7c3aed]/10 text-[#d2bbff] border-l-2 border-[#7c3aed]"
            : "text-[#ccc3d8] hover:bg-[#333535] hover:text-[#e2e2e2]"
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              setExpanded(!expanded)
            }}
            className="w-4 h-4 flex items-center justify-center shrink-0"
          >
            <span
              className={`material-symbols-outlined text-[16px] transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            >
              chevron_right
            </span>
          </button>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}
        <Link
          href={`/dashboard/backrooms/${backroomId}/salas/${node.id}`}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${
              isActive ? "text-[#d2bbff]" : "text-[#958da1]"
            }`}
          >
            {isActive ? "folder_open" : "folder"}
          </span>
          <span className="text-[13px] truncate">{node.nombre}</span>
        </Link>
        <button
          onClick={(e) => e.preventDefault()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="material-symbols-outlined text-[14px] text-[#958da1] hover:text-[#e2e2e2]">
            add
          </span>
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              backroomId={backroomId}
              activeRoomId={activeRoomId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoomTree({ rooms, backroomId, activeRoomId }: RoomTreeProps) {
  if (rooms.length === 0) return null

  return (
    <div className="py-2">
      {rooms.map((room) => (
        <TreeNode
          key={room.id}
          node={room}
          backroomId={backroomId}
          activeRoomId={activeRoomId}
          level={0}
        />
      ))}
    </div>
  )
}

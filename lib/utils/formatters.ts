
export const getIconAndColor = (tipo: string) => {
  switch (tipo) {
    case 'doc': return { icon: 'description', color: 'text-blue-400', bg: 'bg-blue-400/10' }
    case 'pdf': return { icon: 'picture_as_pdf', color: 'text-red-400', bg: 'bg-red-400/10' }
    case 'image': return { icon: 'image', color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
    case 'video':
    case 'media': return { icon: 'play_circle', color: 'text-purple-400', bg: 'bg-purple-400/10' }
    case 'link': return { icon: 'link', color: 'text-indigo-400', bg: 'bg-indigo-400/10' }
    default: return { icon: 'insert_drive_file', color: 'text-gray-400', bg: 'bg-gray-400/10' }
  }
}

export const formatSize = (bytes: number | null) => {
  if (!bytes) return null
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}


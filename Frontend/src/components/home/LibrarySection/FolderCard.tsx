/**
 * 폴더 카드 (드래그 가능)
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Draggable } from '@/components/common/Draggable'
import type { Folder } from '@/types'
import { formatDate } from '@/utils'

interface FolderCardProps {
  folder: Folder
}

// 폴더별 색상 팔레트
const folderColors = [
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-yellow-400 to-yellow-600',
  'from-red-400 to-red-600',
  'from-pink-400 to-pink-600',
  'from-purple-400 to-purple-600',
  'from-indigo-400 to-indigo-600',
  'from-teal-400 to-teal-600',
]

// 폴더 ID를 기반으로 색상 선택
const getColorClass = (id: string | undefined) => {
  if (!id) return folderColors[0] // 기본 색상 (파란색)
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return folderColors[hash % folderColors.length]
}

export function FolderCard({ folder }: FolderCardProps) {
  const navigate = useNavigate()
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY })
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 드래그 중이거나 마우스가 많이 움직였으면 클릭으로 처리하지 않음
    if (mouseDownPos) {
      const moved = Math.abs(e.clientX - mouseDownPos.x) + Math.abs(e.clientY - mouseDownPos.y)
      if (moved > 5) {
        // 5px 이상 움직였으면 드래그로 간주
        return
      }
    }

    // 폴더 ID가 없으면 클릭 무시
    if (!folder._id) {
      console.warn('폴더 ID가 없습니다:', folder)
      alert('폴더 정보가 올바르지 않습니다. 백엔드 서버를 확인해주세요.')
      return
    }

    console.log('폴더 클릭:', folder._id, folder.name)
    // 폴더 클릭 시 대시보드로 이동
    navigate(`/dashboard/${folder._id}`)
  }

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    // TODO: 컨텍스트 메뉴 (편집, 삭제 등)
    console.log('폴더 우클릭:', folder.name)
  }

  const colorClass = getColorClass(folder._id)

  return (
    <Draggable id={folder._id} type="folder">
      <div
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`folder-card group relative w-full aspect-square bg-gradient-to-br ${colorClass} rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all hover:scale-105`}
      >
        {/* Folder Icon */}
        <div className="absolute top-4 left-4">
          <svg
            className="w-8 h-8 text-white opacity-80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>

        {/* Folder Name */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-base mb-1 truncate drop-shadow-md">
            {folder.name || '이름 없음'}
          </h3>
          <p className="text-white/80 text-xs drop-shadow-sm">
            {folder.document_count || 0} 문서
          </p>
          <p className="text-white/60 text-xs mt-1 drop-shadow-sm">
            {formatDate(folder.created_at)}
          </p>
        </div>

        {/* Drag Indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-5 h-5 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      </div>
    </Draggable>
  )
}

/**
 * 휴지통 드롭존
 */
import { Droppable } from '@/components/common/Droppable'

interface TrashZoneProps {
  onDeleteFolder: (folderId: string) => void
}

export function TrashZone({ onDeleteFolder }: TrashZoneProps) {
  const handleDrop = (item: any) => {
    console.log('폴더 드롭:', item)
    if (item.id) {
      onDeleteFolder(item.id)
    }
  }

  return (
    <Droppable accept="folder" onDrop={handleDrop}>
      <div className="trash-can-dropzone mt-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-red-400 hover:text-red-400 dark:hover:border-red-500 dark:hover:text-red-500 transition-colors">
        <svg
          className="trash-icon w-12 h-12 mb-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
        <div className="trash-text text-sm text-center">
          여기에 드롭하여
          <br />
          폴더 삭제
        </div>
      </div>
    </Droppable>
  )
}

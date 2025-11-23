/**
 * 라이브러리 그리드 - 폴더 목록 표시
 */
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FolderCard } from './FolderCard'
import type { Folder } from '@/types'

interface LibraryGridProps {
  folders: Folder[]
  loading: boolean
  onCreateFolder: (name: string, category?: string) => Promise<Folder>
}

export function LibraryGrid({ folders, loading, onCreateFolder }: LibraryGridProps) {
  const handleCreateFolder = async () => {
    const folderName = prompt('새 폴더 이름을 입력하세요:')
    if (folderName?.trim()) {
      try {
        await onCreateFolder(folderName.trim())
      } catch (err) {
        console.error('폴더 생성 실패:', err)
        alert('폴더 생성에 실패했습니다.')
      }
    }
  }

  if (loading) {
    return (
      <div className="library-grid-container mb-6">
        <div className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="library-grid-container mb-6">
      {/* 좌우 스크롤 가능한 그리드 */}
      <div className="library-grid overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {/* Folder Cards */}
          {folders.map((folder, index) => (
            <div key={folder._id || `folder-${index}`} className="flex-shrink-0 w-48">
              <FolderCard folder={folder} />
            </div>
          ))}

          {/* Add Button */}
          <button
            onClick={handleCreateFolder}
            className="add-button flex-shrink-0 w-48 aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-5xl text-gray-400 dark:text-gray-500 hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Empty State */}
      {folders.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          폴더가 없습니다. + 버튼을 눌러 새 폴더를 만드세요.
        </div>
      )}
    </div>
  )
}

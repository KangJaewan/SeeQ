/**
 * 라이브러리 섹션 - 폴더 관리
 */
import { useEffect, useState } from 'react'
import { useFolders } from '@/hooks'
import { CategoryTabs } from './CategoryTabs'
import { LibraryGrid } from './LibraryGrid'
import { TrashZone } from './TrashZone'

export function LibrarySection() {
  const {
    filteredFolders,
    selectedCategory,
    loading,
    error,
    fetchFolders,
    createFolder,
    deleteFolder,
    setSelectedCategory,
  } = useFolders()

  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest' | 'name'>('latest')

  // 컴포넌트 마운트 시 폴더 목록 가져오기
  useEffect(() => {
    fetchFolders()
  }, [])

  // 카테고리 추가
  const handleAddCategory = async () => {
    const categoryName = prompt('새 카테고리 이름을 입력하세요:')
    if (categoryName?.trim()) {
      const folderName = prompt('이 카테고리에 생성할 폴더 이름을 입력하세요:', '새 폴더')
      if (folderName?.trim()) {
        try {
          await createFolder(folderName.trim(), categoryName.trim())
          // 생성된 카테고리로 자동 전환
          setSelectedCategory(categoryName.trim())
        } catch (err) {
          console.error('카테고리 추가 실패:', err)
          alert('카테고리 추가에 실패했습니다.')
        }
      }
    }
  }

  // 정렬 변경
  const handleSortChange = () => {
    const orders: Array<'latest' | 'oldest' | 'name'> = ['latest', 'oldest', 'name']
    const currentIndex = orders.indexOf(sortOrder)
    const nextIndex = (currentIndex + 1) % orders.length
    setSortOrder(orders[nextIndex])
  }

  const sortLabels = {
    latest: '최신순',
    oldest: '오래된순',
    name: '이름순',
  }

  // 정렬된 폴더 목록
  const sortedFolders = [...filteredFolders].sort((a, b) => {
    if (sortOrder === 'latest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else {
      return a.name.localeCompare(b.name)
    }
  })

  // 휴지통에 폴더 드롭
  const handleDeleteFolder = async (folderId: string) => {
    if (window.confirm('정말 이 폴더를 삭제하시겠습니까?')) {
      try {
        await deleteFolder(folderId)
      } catch (err) {
        console.error('폴더 삭제 실패:', err)
      }
    }
  }

  return (
    <div className="library-section-main bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors">
      {/* Header */}
      <div className="library-header-main flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="library-title-main flex items-center gap-2">
          <div className="library-icon-main w-6 h-6 bg-indigo-600 rounded" />
          <span className="library-text text-lg font-semibold text-gray-900 dark:text-white">
            라이브러리
          </span>
        </div>

        <div className="library-controls flex items-center gap-3">
          <button
            onClick={handleAddCategory}
            className="add-category-btn px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + 카테고리 추가
          </button>
          <button
            onClick={handleSortChange}
            className="sort-button px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <span>{sortLabels[sortOrder]}</span>
            <div className="chevron-icon">▼</div>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Library Grid + Trash Zone */}
      <div className="library-with-trash">
        <LibraryGrid
          folders={sortedFolders}
          loading={loading}
          onCreateFolder={createFolder}
        />

        <TrashZone onDeleteFolder={handleDeleteFolder} />
      </div>
    </div>
  )
}

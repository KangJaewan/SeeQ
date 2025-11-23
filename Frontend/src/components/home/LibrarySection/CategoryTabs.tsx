/**
 * 카테고리 탭
 */
import { useFolderStore } from '@/store'

interface CategoryTabsProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const { folders } = useFolderStore()

  // 폴더들로부터 고유한 카테고리 추출
  const uniqueCategories = new Set(folders.map((f) => f.category).filter(Boolean))
  const categories = ['all', ...Array.from(uniqueCategories)] as string[]

  const categoryLabels: Record<string, string> = {
    all: '전체',
  }

  return (
    <div className="category-tabs-container mb-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }
            `}
          >
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>
    </div>
  )
}

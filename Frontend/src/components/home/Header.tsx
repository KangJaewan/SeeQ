/**
 * Home 페이지 헤더
 */
import { DarkModeToggle } from '@/components/common/DarkModeToggle'
import { SearchBar } from '@/components/common/SearchBar'

export function Header() {
  const handleSearch = (query: string) => {
    console.log('검색:', query)
    // TODO: 검색 기능 구현
  }

  return (
    <header className="header flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
      {/* Welcome Message */}
      <div className="welcome-message text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
        Hello 수림 👋🏼
      </div>

      {/* Search + Dark Mode */}
      <div className="user-greeting-search flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          placeholder="Search..."
          onSearch={handleSearch}
          className="w-full sm:w-80"
        />
        <DarkModeToggle />
      </div>
    </header>
  )
}

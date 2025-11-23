/**
 * Home 페이지 (home.html 변환)
 */
import { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useUIStore } from '@/store'
import { Header } from '@/components/home/Header'
import { VideoBanner } from '@/components/home/VideoBanner'
import { LibrarySection } from '@/components/home/LibrarySection'
import { UserProfileBox } from '@/components/home/UserProfileBox'
import { Calendar } from '@/components/home/Calendar'
import { TodoList } from '@/components/home/TodoList'
import { BannerButtons } from '@/components/home/BannerButtons'

export default function HomePage() {
  const { darkMode } = useUIStore()

  useEffect(() => {
    // 다크모드 클래스 적용
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#EFF4FB] dark:bg-gray-900 transition-colors">
        <div className="layout w-full">
          {/* Main Content */}
          <div className="main-content px-4 sm:px-6 lg:px-8 py-6">
            {/* Video Banner */}
            <VideoBanner />

            {/* Header */}
            <Header />

            {/* Content Area */}
            <div className="content-area mt-8">
              {/* Top Section: Library + User Box */}
              <div className="top-section grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Library Section (2/3) */}
                <div className="lg:col-span-2">
                  <LibrarySection />
                </div>

                {/* User Profile Box (1/3) */}
                <div className="lg:col-span-1">
                  <UserProfileBox />
                </div>
              </div>

              {/* Calendar + Todo + Banner Buttons Section */}
              <div className="memo-calendar-quizmate-section">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <Calendar />
                  <TodoList />
                  <div className="md:col-span-2 xl:col-span-1">
                    <BannerButtons />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

/**
 * Dashboard Page - 문서 관리 및 분석 대시보드
 */
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useUIStore, useFolderStore, useDocumentStore } from '@/store'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FileSection } from '@/components/dashboard/FileSection'
import { WidgetPalette } from '@/components/dashboard/widgets/WidgetPalette'
import { WidgetGrid } from '@/components/dashboard/widgets/WidgetGrid'

export default function DashboardPage() {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const { darkMode, sidebarOpen, rightSidebarOpen, toggleRightSidebar } = useUIStore()
  const { folders } = useFolderStore()
  const { documents, loading, fetchDocumentsByFolder } = useDocumentStore()

  // 폴더 정보 가져오기
  const currentFolder = folders.find((f) => f._id === folderId)

  useEffect(() => {
    console.log('[DashboardPage] folderId 변경됨:', folderId)
    if (folderId) {
      console.log('[DashboardPage] fetchDocumentsByFolder 호출 전')
      fetchDocumentsByFolder(folderId)
    }
  }, [folderId, fetchDocumentsByFolder])

  useEffect(() => {
    console.log('[DashboardPage] documents 업데이트됨:', documents)
    console.log('[DashboardPage] documents.length:', documents.length)
    console.log('[DashboardPage] loading:', loading)
  }, [documents, loading])

  // 폴더가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (folderId && !currentFolder && !loading) {
      navigate('/home')
    }
  }, [folderId, currentFolder, loading, navigate])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
        {/* 좌측 사이드바 */}
        <DashboardSidebar />

        {/* 메인 콘텐츠 */}
        <div
          className="flex-1 bg-[#EFF4FB] dark:bg-gray-900 transition-all"
          style={{
            marginRight: rightSidebarOpen ? '360px' : '0',
          }}
        >
          <div className="p-6">
            {/* 헤더 */}
            <DashboardHeader
              folderName={currentFolder?.name || '폴더를 선택하세요'}
              folderId={folderId}
            />

            {/* 메인 컨테이너 */}
            <div className="mt-6 space-y-6">
              {/* 파일 목록 섹션 */}
              <FileSection
                documents={documents}
                loading={loading}
                folderId={folderId || ''}
                onDocumentDeleted={() => {
                  if (folderId) {
                    fetchDocumentsByFolder(folderId)
                  }
                }}
              />

              {/* 위젯 그리드 */}
              <WidgetGrid />
            </div>
          </div>
        </div>

        {/* 우측 사이드바 - Widget Palette */}
        <WidgetPalette />

        {/* 우측 사이드바 토글 버튼 */}
        <button
          onClick={toggleRightSidebar}
          className={`fixed top-1/2 -translate-y-1/2 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg px-2 py-4 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all ${
            rightSidebarOpen ? 'right-[360px]' : 'right-0'
          }`}
        >
          <svg
            className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${
              rightSidebarOpen ? '' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </DndProvider>
  )
}

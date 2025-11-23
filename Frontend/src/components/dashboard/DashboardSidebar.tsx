/**
 * Dashboard 좌측 사이드바
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Home, Folder, Settings, Bell } from 'lucide-react'

export function DashboardSidebar() {
  const navigate = useNavigate()

  return (
    <div className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 space-y-6">
      {/* 프로필 이미지 */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
        <img
          src="/KakaoTalk_20250610_101249994.png"
          alt="프로필"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 검색 아이콘 */}
      <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 홈 아이콘 */}
      <button
        onClick={() => navigate('/home')}
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="홈으로 이동"
      >
        <Home className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 폴더 아이콘 */}
      <button className="w-12 h-12 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 transition-colors">
        <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* 설정 아이콘 */}
      <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 벨 아이콘 */}
      <button className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  )
}

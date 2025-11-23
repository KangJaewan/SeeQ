/**
 * 사용자 프로필 박스
 */
import { useState } from 'react'
import { useFolderStore } from '@/store'
import { UploadModal } from '@/components/common/UploadModal'

export function UserProfileBox() {
  const { folders } = useFolderStore()
  const folderCount = folders.length
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // 마지막 접속일 계산 (임시로 0일)
  const lastAccessDays = 0

  const handleLogout = () => {
    console.log('로그아웃')
    // TODO: 로그아웃 기능 구현
  }

  const handleAddPDF = () => {
    setIsUploadModalOpen(true)
  }

  const handleUploadSuccess = () => {
    console.log('업로드 성공!')
    // TODO: 문서 목록 새로고침
  }

  return (
    <>
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <div className="user-box bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors">
      {/* Profile Avatar */}
      <img
        src="/KakaoTalk_20250610_101249994.png"
        alt="Profile Avatar"
        className="profile-avatar w-20 h-20 mx-auto mb-4 rounded-full object-cover"
      />

      {/* User Email */}
      <div className="user-email text-center text-gray-700 dark:text-gray-300 text-sm mb-1">
        surim01@gmail.com
      </div>

      {/* User Role */}
      <div className="user-role text-center text-indigo-600 dark:text-indigo-400 font-semibold mb-6">
        Premium User
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-2 gap-4 mb-6">
        <div className="stat-item text-center">
          <div className="stat-value folder-count text-3xl font-bold text-gray-900 dark:text-white">
            {folderCount}
          </div>
          <div className="stat-label text-sm text-gray-500 dark:text-gray-400">
            Folders
          </div>
        </div>
        <div className="stat-item text-center">
          <div className="stat-value last-access-date text-3xl font-bold text-gray-900 dark:text-white">
            {lastAccessDays}
          </div>
          <div className="stat-label text-sm text-gray-500 dark:text-gray-400">
            Days Ago
          </div>
        </div>
      </div>

      {/* User Actions */}
      <div className="user-actions flex flex-col gap-3">
        <button
          onClick={handleLogout}
          className="logout-btn w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Logout
        </button>
        <button
          onClick={handleAddPDF}
          className="pdf-add-btn w-full py-2 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          PDF 추가
        </button>
      </div>
      </div>
    </>
  )
}

/**
 * 우측 사이드바 - 모듈 컴포넌트들
 */
import React from 'react'
import { useUIStore } from '@/store'
import { FontSizeControl } from './modules/FontSizeControl'
import { ChatModule } from './modules/ChatModule'
import { QuizModule } from './modules/QuizModule'
import { KeywordsModule } from './modules/KeywordsModule'
import { SummaryModule } from './modules/SummaryModule'
import { ReportModule } from './modules/ReportModule'

export function RightSidebar() {
  const { rightSidebarOpen } = useUIStore()

  return (
    <div
      className={`fixed top-0 right-0 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 z-30 ${
        rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '320px' }}
    >
      <div className="p-4 space-y-4">
        {/* Font Size Control */}
        <FontSizeControl />

        {/* Chat Module */}
        <ChatModule />

        {/* Quiz Module */}
        <QuizModule />

        {/* Keywords Module */}
        <KeywordsModule />

        {/* Summary Module */}
        <SummaryModule />

        {/* Report Module */}
        <ReportModule />
      </div>
    </div>
  )
}

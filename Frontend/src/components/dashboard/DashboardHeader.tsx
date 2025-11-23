/**
 * Dashboard 헤더
 */
import React from 'react'
import { DarkModeToggle } from '@/components/common/DarkModeToggle'

interface DashboardHeaderProps {
  folderName: string
  folderId?: string
}

export function DashboardHeader({ folderName }: DashboardHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{folderName}</h1>
        </div>
        <DarkModeToggle />
      </div>
    </div>
  )
}

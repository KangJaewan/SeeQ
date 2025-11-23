/**
 * 글꼴 크기 조절 모듈
 */
import React from 'react'
import { Type, RotateCcw } from 'lucide-react'
import { useUIStore } from '@/store'

interface FontSizeControlProps {
  isPreview?: boolean
}

export function FontSizeControl({ isPreview = false }: FontSizeControlProps) {
  const { fontSize, setFontSize, resetFontSize } = useUIStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(parseInt(e.target.value))
  }

  const handleReset = () => {
    resetFontSize()
  }

  // 팔레트에서는 실제 동작하는 컨트롤 표시 (미리보기 제거)
  return (
    <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg ${isPreview ? 'p-2 h-full' : 'rounded-xl p-4'} flex flex-col`}>
      <div className={`flex items-center justify-between ${isPreview ? 'mb-2' : 'mb-4'}`}>
        <h3 className={`${isPreview ? 'text-[10px]' : 'text-sm'} font-semibold text-gray-900 dark:text-white`}>
          글꼴 크기
        </h3>
        <Type className={`${isPreview ? 'w-3 h-3' : 'w-5 h-5'} text-gray-500 dark:text-gray-400`} />
      </div>

      <div className={isPreview ? 'space-y-1' : 'space-y-4'}>
        <div>
          {!isPreview && (
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">크기 조절</label>
          )}
          <div className={`flex items-center ${isPreview ? 'gap-1' : 'gap-2'}`}>
            <span className={`${isPreview ? 'text-[8px]' : 'text-xs'} text-gray-500`}>A</span>
            <input
              type="range"
              min="75"
              max="133"
              step="1"
              value={fontSize}
              onChange={handleChange}
              className={`flex-1 ${isPreview ? 'h-1' : 'h-2'} bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-600`}
            />
            <span className={`${isPreview ? 'text-[9px]' : 'text-sm'} text-gray-500`}>A</span>
          </div>
          <div className={`text-center ${isPreview ? 'mt-1' : 'mt-2'}`}>
            <span className={`${isPreview ? 'text-[8px]' : 'text-sm'} font-medium text-indigo-600 dark:text-indigo-400`}>
              {fontSize}%
            </span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className={`w-full flex items-center justify-center ${isPreview ? 'gap-1 px-2 py-1 text-[8px]' : 'gap-2 px-3 py-2 text-sm'} text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
        >
          <RotateCcw className={isPreview ? 'w-2 h-2' : 'w-3 h-3'} />
          초기화
        </button>
      </div>
    </div>
  )
}

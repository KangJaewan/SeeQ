/**
 * Quiz 모듈
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, Zap } from 'lucide-react'

interface QuizModuleProps {
  isPreview?: boolean
}

export function QuizModule({ isPreview = false }: QuizModuleProps) {
  const navigate = useNavigate()

  const handleQuizMate = () => {
    navigate('/quiz')
  }

  if (isPreview) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-2 border border-indigo-200 dark:border-indigo-800 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white">Quiz</h3>
          <HelpCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        </div>
        <button className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-600 text-white rounded text-[8px] font-medium">
          <Zap className="w-2.5 h-2.5" />
          Quiz Mate
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quiz</h3>
        <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      <button
        onClick={handleQuizMate}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
      >
        <Zap className="w-4 h-4" />
        Quiz Mate 만나기
      </button>
    </div>
  )
}

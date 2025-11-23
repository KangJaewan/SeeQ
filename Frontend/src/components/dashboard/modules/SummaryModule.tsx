/**
 * Summary 모듈
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react'

interface SummaryModuleProps {
  isPreview?: boolean
}

type SummaryType = 'brief' | 'detailed' | 'bullets'

interface SummaryResponse {
  summary: string
  document_count: number
  summary_type: string
  from_cache?: boolean
  cache_created_at?: string
}

export function SummaryModule({ isPreview = false }: SummaryModuleProps) {
  const { folderId } = useParams<{ folderId: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [summaryType, setSummaryType] = useState<SummaryType>('brief')

  const handleGenerateSummary = async () => {
    if (!folderId || isPreview) return

    setLoading(true)
    setError(null)

    try {
      console.log('요약 생성:', folderId, summaryType)

      const response = await fetch('http://localhost:8000/summary/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_id: folderId,
          summary_type: summaryType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `요약 생성 실패: ${response.status}`)
      }

      const data: SummaryResponse = await response.json()
      console.log('요약 생성 완료:', data)

      setSummary(data)
    } catch (err) {
      console.error('요약 생성 실패:', err)
      setError(err instanceof Error ? err.message : '요약을 생성할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  if (isPreview) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white">요약</h3>
          <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        </div>
        <p className="text-[8px] text-gray-700 dark:text-gray-300 leading-tight mb-2">
          문서의 AI 기반 요약을 생성합니다.
        </p>
        <button className="w-full px-2 py-1 text-[8px] font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded">
          요약 생성
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">요약</h3>
        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      <div className="space-y-3">
        {/* 요약 타입 선택 */}
        {!summary && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              요약 타입
            </label>
            <select
              value={summaryType}
              onChange={(e) => setSummaryType(e.target.value as SummaryType)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white disabled:opacity-50"
            >
              <option value="brief">간단 요약</option>
              <option value="detailed">상세 요약</option>
              <option value="bullets">불렛 포인트</option>
            </select>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 요약 표시 */}
        {summary && !error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div className="flex-1 text-xs text-indigo-700 dark:text-indigo-300">
                {summary.document_count}개 문서 요약 완료
                {summary.from_cache && ' (캐시됨)'}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {summary.summary}
              </p>
            </div>

            <button
              onClick={() => setSummary(null)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              새로 생성
            </button>
          </div>
        )}

        {/* 생성 버튼 */}
        {!summary && (
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                요약 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                요약 생성
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

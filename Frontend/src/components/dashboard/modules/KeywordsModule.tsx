/**
 * Keywords 모듈
 */
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Tag, Loader2, AlertCircle } from 'lucide-react'

interface KeywordsModuleProps {
  isPreview?: boolean
}

interface KeywordsResponse {
  keywords: string[]
  count: number
  source_info?: {
    folder_id: string
    total_chunks: number
    total_files: number
  }
}

export function KeywordsModule({ isPreview = false }: KeywordsModuleProps) {
  const { folderId } = useParams<{ folderId: string }>()
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 미리보기 모드이거나 folderId가 없으면 mock 데이터 사용
    if (isPreview || !folderId) {
      setKeywords(['경영학', '마케팅', '재무관리', '인사관리', '전략경영'])
      return
    }

    // API에서 키워드 가져오기
    const fetchKeywords = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('http://localhost:8000/keywords/from-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folder_id: folderId,
            max_keywords: 10,
            use_chunks: true,
          }),
        })

        if (!response.ok) {
          throw new Error(`API 오류: ${response.status}`)
        }

        const data: KeywordsResponse = await response.json()
        setKeywords(data.keywords || [])
      } catch (err) {
        console.error('키워드 가져오기 실패:', err)
        setError(err instanceof Error ? err.message : '키워드를 불러올 수 없습니다')
        // 에러 시 빈 배열로 설정
        setKeywords([])
      } finally {
        setLoading(false)
      }
    }

    fetchKeywords()
  }, [folderId, isPreview])

  const previewKeywords = keywords.slice(0, 3)

  if (isPreview) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white">Keyword</h3>
          <Tag className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex flex-wrap gap-1">
          {previewKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Keyword</h3>
        <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">키워드 추출 중...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 키워드 표시 */}
      {!loading && !error && keywords.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300"
              >
                {keyword}
              </span>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            문서에서 추출된 주요 키워드입니다.
          </p>
        </>
      )}

      {/* 키워드 없음 */}
      {!loading && !error && keywords.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            추출된 키워드가 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}

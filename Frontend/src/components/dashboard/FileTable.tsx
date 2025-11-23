/**
 * 파일 테이블
 */
import React, { useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Trash2 } from 'lucide-react'
import { formatDate } from '@/utils'
import type { Document } from '@/types'

interface FileTableProps {
  documents: Document[]
  selectedDocuments: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectDocument: (documentId: string, checked: boolean) => void
  onDocumentDeleted?: () => void
}

type SortField = 'name' | 'char_count' | 'created_at'
type SortOrder = 'asc' | 'desc'

export function FileTable({
  documents,
  selectedDocuments,
  onSelectAll,
  onSelectDocument,
  onDocumentDeleted,
}: FileTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null)
  const [rawTextCache, setRawTextCache] = useState<Record<string, string>>({})
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleDocumentClick = async (doc: Document) => {
    // 이미 펼쳐진 문서를 다시 클릭하면 접기
    if (expandedDocId === doc._id) {
      setExpandedDocId(null)
      return
    }

    // 새로운 문서 펼치기
    setExpandedDocId(doc._id)

    // 이미 캐시에 있으면 API 호출하지 않음
    if (rawTextCache[doc._id]) {
      return
    }

    // raw_text 로드
    setLoadingDocId(doc._id)
    try {
      const response = await fetch(`http://localhost:8000/documents/single/${doc._id}/content`)
      const data = await response.json()
      setRawTextCache(prev => ({
        ...prev,
        [doc._id]: data.raw_text || '내용이 없습니다.'
      }))
    } catch (error) {
      console.error('raw_text 로드 실패:', error)
      setRawTextCache(prev => ({
        ...prev,
        [doc._id]: '내용을 불러오는데 실패했습니다.'
      }))
    } finally {
      setLoadingDocId(null)
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!window.confirm(`"${doc.title || doc.filename}" 파일을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeletingDocId(doc._id)

    try {
      const response = await fetch(`http://localhost:8000/documents/${doc._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`삭제 실패: ${response.status}`)
      }

      const result = await response.json()
      console.log('삭제 완료:', result)

      // 성공 알림
      alert(`✅ "${doc.title || doc.filename}" 파일이 삭제되었습니다.\n\n삭제된 청크: ${result.deleted_chunks}개\n삭제된 벡터: ${result.deleted_vectors}개`)

      // 부모 컴포넌트에 삭제 알림
      if (onDocumentDeleted) {
        onDocumentDeleted()
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('파일 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeletingDocId(null)
    }
  }

  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'name':
        aValue = a.title || a.filename
        bValue = b.title || b.filename
        break
      case 'char_count':
        aValue = a.char_count || 0
        bValue = b.char_count || 0
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const allSelected = documents.length > 0 && selectedDocuments.size === documents.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                이름
                {sortField === 'name' &&
                  (sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => handleSort('char_count')}
            >
              <div className="flex items-center gap-2">
                글자수
                {sortField === 'char_count' &&
                  (sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => handleSort('created_at')}
            >
              <div className="flex items-center gap-2">
                생성일
                {sortField === 'created_at' &&
                  (sortOrder === 'asc' ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              유형
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
              작업
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDocuments.map((doc) => (
            <React.Fragment key={doc._id}>
              <tr
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.has(doc._id)}
                    onChange={(e) => onSelectDocument(doc._id, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {doc.title || doc.filename}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {(doc.char_count || 0).toLocaleString()}자
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {doc.file_type?.toUpperCase() || 'PDF'}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={deletingDocId === doc._id}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="삭제"
                  >
                    {deletingDocId === doc._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
              {expandedDocId === doc._id && (
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">문서 내용</h3>
                        <button
                          onClick={() => setExpandedDocId(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {loadingDocId === doc._id ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed max-h-[600px] overflow-y-auto text-center p-4">
                          {rawTextCache[doc._id] || ''}
                        </pre>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * 파일 목록 섹션
 */
import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FileTable } from './FileTable'
import type { Document } from '@/types'

interface FileSectionProps {
  documents: Document[]
  loading: boolean
  folderId: string
  onDocumentDeleted?: () => void
}

export function FileSection({ documents, loading, folderId, onDocumentDeleted }: FileSectionProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)

  console.log('[FileSection] 렌더링, documents:', documents)
  console.log('[FileSection] documents.length:', documents.length)
  console.log('[FileSection] loading:', loading)
  console.log('[FileSection] folderId:', folderId)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(new Set(documents.map((doc) => doc._id)))
    } else {
      setSelectedDocuments(new Set())
    }
  }

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    const newSelected = new Set(selectedDocuments)
    if (checked) {
      newSelected.add(documentId)
    } else {
      newSelected.delete(documentId)
    }
    setSelectedDocuments(newSelected)
  }

  const handleClearAll = () => {
    setSelectedDocuments(new Set())
  }

  const handleDownloadSelected = async () => {
    if (selectedDocuments.size === 0) return

    setDownloading(true)

    try {
      // 선택된 문서들의 내용을 가져와서 다운로드
      const selectedDocs = documents.filter(doc => selectedDocuments.has(doc._id))

      for (const doc of selectedDocs) {
        // 각 문서의 raw_text 가져오기
        const response = await fetch(`http://localhost:8000/documents/single/${doc._id}/content`)
        const data = await response.json()

        // 텍스트 파일로 다운로드
        const content = data.raw_text || ''
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${(doc.title || doc.filename).replace(/[^a-zA-Z0-9가-힣]/g, '_')}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        // 연속 다운로드를 위한 짧은 딜레이
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setSelectedDocuments(new Set())
    } catch (error) {
      console.error('다운로드 실패:', error)
      alert('파일 다운로드 중 오류가 발생했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">파일 목록</h2>
        <div className="flex items-center gap-3">
          {selectedDocuments.size > 0 && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedDocuments.size}개 선택됨
              </span>
              <button
                onClick={handleDownloadSelected}
                disabled={downloading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {downloading ? '다운로드 중...' : '다운로드'}
              </button>
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 border border-gray-300 dark:border-gray-600 rounded"
              >
                전체 해제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 파일 목록 */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p>문서가 없습니다.</p>
            <p className="text-sm mt-2">PDF 파일을 업로드하여 시작하세요.</p>
          </div>
        ) : (
          <FileTable
            documents={documents}
            selectedDocuments={selectedDocuments}
            onSelectAll={handleSelectAll}
            onSelectDocument={handleSelectDocument}
            onDocumentDeleted={onDocumentDeleted}
          />
        )}
      </div>
    </div>
  )
}

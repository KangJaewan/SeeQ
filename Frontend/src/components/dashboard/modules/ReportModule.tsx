/**
 * Report 모듈
 */
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileDown, BarChart3, Loader2, AlertCircle, CheckCircle, Eye } from 'lucide-react'
import { ReportViewModal } from '../modals/ReportViewModal'

interface ReportModuleProps {
  isPreview?: boolean
}

interface FileSelection {
  file_id: string
  filename: string
  file_type: string
  selected: boolean
}

interface ReportGenerationResponse {
  message: string
  report_id: string
  status: string
  background_generation: boolean
  title?: string
  subtitle?: string
}

interface ReportDetail {
  report_id: string
  title: string
  subtitle: string
  formatted_text: string
  created_at: string
}

export function ReportModule({ isPreview = false }: ReportModuleProps) {
  const { folderId } = useParams<{ folderId: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedReport, setGeneratedReport] = useState<ReportGenerationResponse | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [reportDetail, setReportDetail] = useState<ReportDetail | null>(null)
  const [loadingReport, setLoadingReport] = useState(false)

  const handleGenerateReport = async () => {
    if (!folderId || isPreview) return

    setLoading(true)
    setError(null)
    setGeneratedReport(null)

    try {
      // 1단계: 폴더의 모든 파일 가져오기
      console.log('폴더 파일 목록 조회:', folderId)
      const filesResponse = await fetch(`http://localhost:8000/reports/files/${folderId}`)

      if (!filesResponse.ok) {
        throw new Error(`파일 목록 조회 실패: ${filesResponse.status}`)
      }

      const files = await filesResponse.json()
      console.log('조회된 파일:', files)

      if (!files || files.length === 0) {
        throw new Error('폴더에 파일이 없습니다')
      }

      // 2단계: 모든 파일을 선택 상태로 설정
      const selectedFiles: FileSelection[] = files.map((file: any) => ({
        file_id: file.file_id,
        filename: file.filename,
        file_type: file.file_type,
        selected: true, // 모든 파일 자동 선택
      }))

      console.log('선택된 파일:', selectedFiles.length)

      // 3단계: 레포트 생성 API 호출
      const generateResponse = await fetch('http://localhost:8000/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_id: folderId,
          selected_files: selectedFiles,
          custom_title: null,
          background_generation: false, // 동기 처리
        }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.detail || `레포트 생성 실패: ${generateResponse.status}`)
      }

      const reportData: ReportGenerationResponse = await generateResponse.json()
      console.log('레포트 생성 완료:', reportData)

      setGeneratedReport(reportData)
    } catch (err) {
      console.error('레포트 생성 실패:', err)
      setError(err instanceof Error ? err.message : '레포트를 생성할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = async () => {
    if (!generatedReport?.report_id) return

    setLoadingReport(true)

    try {
      // 레포트 상세 조회
      const response = await fetch(`http://localhost:8000/reports/${generatedReport.report_id}`)

      if (!response.ok) {
        throw new Error(`레포트 조회 실패: ${response.status}`)
      }

      const detail = await response.json()
      console.log('레포트 상세:', detail)

      setReportDetail(detail)
      setShowModal(true)
    } catch (err) {
      console.error('레포트 조회 실패:', err)
      setError(err instanceof Error ? err.message : '레포트를 조회할 수 없습니다')
    } finally {
      setLoadingReport(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setReportDetail(null)
  }

  if (isPreview) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-2 border border-emerald-200 dark:border-emerald-800 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white">리포트</h3>
          <BarChart3 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p className="text-[8px] text-gray-600 dark:text-gray-400 mb-2">
          학습 분석 리포트 생성
        </p>
        <button className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded text-[8px] font-medium">
          <FileDown className="w-2.5 h-2.5" />
          생성
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">리포트</h3>
        <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          현재 폴더의 모든 문서를 분석하여 학습 리포트를 생성합니다.
        </p>

        {/* 에러 표시 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 성공 표시 */}
        {generatedReport && !error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  {generatedReport.title || '리포트 생성 완료'}
                </p>
                {generatedReport.subtitle && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {generatedReport.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* 리포트 보기 버튼 */}
            <button
              onClick={handleViewReport}
              disabled={loadingReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로딩 중...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  리포트 보기
                </>
              )}
            </button>
          </div>
        )}

        {/* 생성 버튼 */}
        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              리포트 생성
            </>
          )}
        </button>
      </div>

      {/* 레포트 보기 모달 */}
      <ReportViewModal
        isOpen={showModal}
        onClose={closeModal}
        reportDetail={reportDetail}
      />
    </div>
  )
}

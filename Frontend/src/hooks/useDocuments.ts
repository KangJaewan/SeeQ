/**
 * Documents 관련 Custom Hook
 */
import { documentsApi } from '@/api'
import { useDocumentStore } from '@/store'

export function useDocuments() {
  const {
    documents,
    selectedDocuments,
    loading,
    error,
    setDocuments,
    addDocument,
    removeDocument,
    toggleSelectDocument,
    selectAllDocuments,
    clearSelection,
    setLoading,
    setError,
  } = useDocumentStore()

  // 특정 폴더의 문서 가져오기
  const fetchDocuments = async (folderId: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentsApi.getByFolder(folderId)
      setDocuments(data.documents || [])
    } catch (err: any) {
      setError(err.message || '문서를 불러오는데 실패했습니다.')
      console.error('문서 조회 에러:', err)
    } finally {
      setLoading(false)
    }
  }

  // 파일 업로드
  const uploadDocument = async (file: File, folderId: string) => {
    setLoading(true)
    try {
      const newDoc = await documentsApi.upload(file, folderId)
      addDocument(newDoc)
      return newDoc
    } catch (err: any) {
      setError(err.message || '파일 업로드에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 문서 삭제
  const deleteDocument = async (id: string) => {
    try {
      await documentsApi.delete(id)
      removeDocument(id)
    } catch (err: any) {
      setError(err.message || '문서 삭제에 실패했습니다.')
      throw err
    }
  }

  // 요약 생성
  const generateSummary = async () => {
    if (selectedDocuments.length === 0) {
      throw new Error('선택된 문서가 없습니다.')
    }
    try {
      const summary = await documentsApi.getSummary(selectedDocuments)
      return summary
    } catch (err: any) {
      setError(err.message || '요약 생성에 실패했습니다.')
      throw err
    }
  }

  // 키워드 추출
  const extractKeywords = async () => {
    if (selectedDocuments.length === 0) {
      throw new Error('선택된 문서가 없습니다.')
    }
    try {
      const keywords = await documentsApi.getKeywords(selectedDocuments)
      return keywords
    } catch (err: any) {
      setError(err.message || '키워드 추출에 실패했습니다.')
      throw err
    }
  }

  return {
    documents,
    selectedDocuments,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    toggleSelectDocument,
    selectAllDocuments,
    clearSelection,
    generateSummary,
    extractKeywords,
  }
}

/**
 * Documents API
 */
import { apiClient } from './client'
import type { Document, DocumentsResponse } from '@/types'

// 백엔드 응답을 프론트엔드 포맷으로 변환
const normalizeDocument = (doc: any): Document => {
  return {
    _id: doc.file_id || doc._id,
    filename: doc.file_name || doc.filename || 'Unknown',
    title: doc.file_name || doc.title || 'Unknown',
    folder_id: doc.folder_id,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    file_size: doc.file_size,
    page_count: doc.page_count,
    file_type: doc.file_type,
    status: 'ready' as const,
    char_count: doc.file_size || doc.page_count || 0, // 글자수는 file_size에 매핑
  }
}

export const documentsApi = {
  /**
   * 특정 폴더의 문서 조회
   */
  getByFolder: async (folderId: string) => {
    console.log('[documentsApi.getByFolder] 호출됨, folderId:', folderId)
    const endpoint = `/folders/${folderId}/documents`
    console.log('[documentsApi.getByFolder] 엔드포인트:', endpoint)

    const response = await apiClient.get<any>(endpoint)
    console.log('[documentsApi.getByFolder] 응답 데이터:', response.data)
    const data = response.data

    // 백엔드가 document_groups로 보내는 경우 변환
    const rawDocuments = data.document_groups || data.documents || []
    console.log('[documentsApi.getByFolder] 원본 문서 배열:', rawDocuments)
    const documents = rawDocuments.map(normalizeDocument)
    console.log('[documentsApi.getByFolder] 정규화된 문서 배열:', documents)

    return {
      documents,
      total_count: data.total_count || documents.length
    } as DocumentsResponse
  },

  /**
   * 문서 업로드
   */
  upload: async (file: File, folderId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder_id', folderId)

    const response = await apiClient.post<Document>('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  /**
   * 문서 삭제
   */
  delete: async (documentId: string) => {
    const response = await apiClient.delete(`/documents/${documentId}`)
    return response.data
  },

  /**
   * 요약 생성
   */
  getSummary: async (documentIds: string[]) => {
    const response = await apiClient.post('/summary/', { document_ids: documentIds })
    return response.data
  },

  /**
   * 키워드 추출
   */
  getKeywords: async (documentIds: string[]) => {
    const response = await apiClient.post('/keywords/', { document_ids: documentIds })
    return response.data
  },
}

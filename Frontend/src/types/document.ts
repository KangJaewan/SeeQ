/**
 * 문서 관련 타입 정의
 */

export interface Document {
  _id: string
  filename: string
  title?: string
  folder_id: string
  created_at: string
  updated_at?: string
  file_size?: number
  page_count?: number
  word_count?: number
  char_count?: number
  status?: 'processing' | 'ready' | 'error'
  file_type?: string
}

export interface DocumentsResponse {
  documents: Document[]
  total_count: number
}

export interface UploadDocumentRequest {
  file: File
  folder_id: string
}

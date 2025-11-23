/**
 * 폴더 관련 타입 정의
 */

export interface Folder {
  _id: string
  name: string
  category?: string
  created_at: string
  updated_at?: string
  document_count?: number
  color?: string
  // 백엔드 호환성
  folder_id?: string
  title?: string
  folder_type?: string
  last_accessed_at?: string
}

export interface CreateFolderRequest {
  name: string
  category?: string
  color?: string
}

export interface UpdateFolderRequest {
  name?: string
  category?: string
  color?: string
}

export interface FoldersResponse {
  folders: Folder[]
  total_count: number
}

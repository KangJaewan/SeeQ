/**
 * Folders API
 */
import { apiClient } from './client'
import type { Folder, CreateFolderRequest, UpdateFolderRequest, FoldersResponse } from '@/types'

// 백엔드 응답을 프론트엔드 포맷으로 변환
const normalizeFolder = (folder: any): Folder => {
  return {
    _id: folder._id || folder.folder_id,
    name: folder.name || folder.title,
    category: folder.category || folder.folder_type,
    created_at: folder.created_at,
    updated_at: folder.updated_at || folder.last_accessed_at,
    document_count: folder.document_count,
    color: folder.color,
  }
}

export const foldersApi = {
  /**
   * 모든 폴더 조회
   */
  getAll: async (limit = 100) => {
    const response = await apiClient.get<any>(`/folders/?limit=${limit}`)
    const data = response.data

    // 폴더 데이터 정규화
    if (data.folders && Array.isArray(data.folders)) {
      data.folders = data.folders.map(normalizeFolder)
    }

    return data as FoldersResponse
  },

  /**
   * 특정 폴더 조회
   */
  getById: async (id: string) => {
    const response = await apiClient.get<any>(`/folders/${id}`)
    return normalizeFolder(response.data)
  },

  /**
   * 폴더 생성
   */
  create: async (data: CreateFolderRequest) => {
    const response = await apiClient.post<any>('/folders/', data)
    return normalizeFolder(response.data)
  },

  /**
   * 폴더 수정
   */
  update: async (id: string, data: UpdateFolderRequest) => {
    const response = await apiClient.put<any>(`/folders/${id}`, data)
    return normalizeFolder(response.data)
  },

  /**
   * 폴더 삭제
   */
  delete: async (id: string) => {
    const response = await apiClient.delete(`/folders/${id}`)
    return response.data
  },
}

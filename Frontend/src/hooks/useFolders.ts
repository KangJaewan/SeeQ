/**
 * Folders 관련 Custom Hook
 */
import { useEffect } from 'react'
import { foldersApi } from '@/api'
import { useFolderStore } from '@/store'
import type { Folder } from '@/types'

export function useFolders() {
  const {
    folders,
    selectedCategory,
    selectedFolderId,
    loading,
    error,
    setFolders,
    addFolder,
    updateFolder,
    removeFolder,
    setSelectedCategory,
    setSelectedFolderId,
    setLoading,
    setError,
  } = useFolderStore()

  // 폴더 목록 가져오기
  const fetchFolders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await foldersApi.getAll()
      setFolders(data.folders || [])
    } catch (err: any) {
      setError(err.message || '폴더를 불러오는데 실패했습니다.')
      console.error('폴더 조회 에러:', err)
    } finally {
      setLoading(false)
    }
  }

  // 폴더 생성
  const createFolder = async (name: string, category?: string) => {
    try {
      const newFolder = await foldersApi.create({ name, category })
      addFolder(newFolder)
      return newFolder
    } catch (err: any) {
      setError(err.message || '폴더 생성에 실패했습니다.')
      throw err
    }
  }

  // 폴더 삭제
  const deleteFolder = async (id: string) => {
    try {
      await foldersApi.delete(id)
      removeFolder(id)
    } catch (err: any) {
      setError(err.message || '폴더 삭제에 실패했습니다.')
      throw err
    }
  }

  // 카테고리별 필터링된 폴더
  const filteredFolders =
    selectedCategory === 'all'
      ? folders
      : folders.filter((folder: Folder) => folder.category === selectedCategory)

  return {
    folders,
    filteredFolders,
    selectedCategory,
    selectedFolderId,
    loading,
    error,
    fetchFolders,
    createFolder,
    deleteFolder,
    setSelectedCategory,
    setSelectedFolderId,
  }
}

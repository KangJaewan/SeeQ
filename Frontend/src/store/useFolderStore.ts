/**
 * Folder 상태 관리 Store
 */
import { create } from 'zustand'
import type { Folder } from '@/types'

interface FolderState {
  folders: Folder[]
  selectedCategory: string
  selectedFolderId: string | null
  loading: boolean
  error: string | null

  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  updateFolder: (id: string, data: Partial<Folder>) => void
  removeFolder: (id: string) => void
  setSelectedCategory: (category: string) => void
  setSelectedFolderId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  folders: [],
  selectedCategory: 'all',
  selectedFolderId: null,
  loading: false,
  error: null,
}

export const useFolderStore = create<FolderState>((set) => ({
  ...initialState,

  setFolders: (folders) => set({ folders }),

  addFolder: (folder) => set((state) => ({
    folders: [...state.folders, folder],
  })),

  updateFolder: (id, data) => set((state) => ({
    folders: state.folders.map((folder) =>
      folder._id === id ? { ...folder, ...data } : folder
    ),
  })),

  removeFolder: (id) => set((state) => ({
    folders: state.folders.filter((folder) => folder._id !== id),
  })),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

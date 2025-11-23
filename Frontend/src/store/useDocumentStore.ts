/**
 * Document 상태 관리 Store
 */
import { create } from 'zustand'
import { documentsApi } from '@/api/documents'
import type { Document } from '@/types'

interface DocumentState {
  documents: Document[]
  selectedDocuments: string[]
  loading: boolean
  error: string | null

  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  removeDocument: (id: string) => void
  toggleSelectDocument: (id: string) => void
  selectAllDocuments: () => void
  clearSelection: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchDocumentsByFolder: (folderId: string) => Promise<void>
  reset: () => void
}

const initialState = {
  documents: [],
  selectedDocuments: [],
  loading: false,
  error: null,
}

export const useDocumentStore = create<DocumentState>((set) => ({
  ...initialState,

  setDocuments: (documents) => set({ documents }),

  addDocument: (document) => set((state) => ({
    documents: [...state.documents, document],
  })),

  removeDocument: (id) => set((state) => ({
    documents: state.documents.filter((doc) => doc._id !== id),
    selectedDocuments: state.selectedDocuments.filter((docId) => docId !== id),
  })),

  toggleSelectDocument: (id) => set((state) => {
    const isSelected = state.selectedDocuments.includes(id)
    return {
      selectedDocuments: isSelected
        ? state.selectedDocuments.filter((docId) => docId !== id)
        : [...state.selectedDocuments, id],
    }
  }),

  selectAllDocuments: () => set((state) => ({
    selectedDocuments: state.documents.map((doc) => doc._id),
  })),

  clearSelection: () => set({ selectedDocuments: [] }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  fetchDocumentsByFolder: async (folderId) => {
    console.log('[useDocumentStore] fetchDocumentsByFolder 호출, folderId:', folderId)
    set({ loading: true, error: null })
    try {
      const data = await documentsApi.getByFolder(folderId)
      console.log('[useDocumentStore] API 응답 받음:', data)
      console.log('[useDocumentStore] 문서 개수:', data.documents?.length || 0)
      set({ documents: data.documents || [] })
      console.log('[useDocumentStore] Store 업데이트 완료')
    } catch (err: any) {
      const errorMessage = err.response?.status === 404
        ? '문서 API 엔드포인트를 찾을 수 없습니다. 백엔드 서버를 확인해주세요.'
        : err.message || '문서를 불러오는데 실패했습니다.'
      console.error('[useDocumentStore] 문서 조회 실패:', err)
      console.error('[useDocumentStore] 에러 응답:', err.response?.data)
      set({ error: errorMessage, documents: [] })
    } finally {
      set({ loading: false })
    }
  },

  reset: () => set(initialState),
}))

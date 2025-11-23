/**
 * UI 상태 관리 Store (다크모드, 사이드바, 글자 크기 등)
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  rightSidebarOpen: boolean
  fontSize: number
  toggleDarkMode: () => void
  toggleSidebar: () => void
  toggleRightSidebar: () => void
  setDarkMode: (value: boolean) => void
  setSidebarOpen: (value: boolean) => void
  setRightSidebarOpen: (value: boolean) => void
  setFontSize: (value: number) => void
  resetFontSize: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,
      rightSidebarOpen: false,
      fontSize: 100,

      toggleDarkMode: () => set((state) => {
        const newDarkMode = !state.darkMode
        console.log('Toggling dark mode:', newDarkMode)
        // HTML 요소에 dark 클래스 토글
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        return { darkMode: newDarkMode }
      }),

      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      toggleRightSidebar: () => set((state) => ({
        rightSidebarOpen: !state.rightSidebarOpen
      })),

      setDarkMode: (value) => set({ darkMode: value }),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      setRightSidebarOpen: (value) => set({ rightSidebarOpen: value }),

      setFontSize: (value) => {
        // HTML 요소에 글자 크기 적용
        document.documentElement.style.fontSize = `${value}%`
        set({ fontSize: value })
      },

      resetFontSize: () => {
        document.documentElement.style.fontSize = '100%'
        set({ fontSize: 100 })
      },
    }),
    {
      name: 'ui-storage', // localStorage key
      partialize: (state) => ({
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        rightSidebarOpen: state.rightSidebarOpen,
        fontSize: state.fontSize,
      }),
    }
  )
)

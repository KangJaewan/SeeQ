/**
 * Dashboard Module 레이아웃 상태 관리 Store
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Module, ModuleLayout, ModuleType, ModulePosition } from '@/types'

interface ModuleState {
  modules: ModuleLayout
  initializeModules: () => void
  moveModule: (moduleId: string, newPosition: ModulePosition) => void
  toggleModuleVisibility: (moduleId: string) => void
  reorderModules: (moduleId: string, newOrder: number) => void
  resetLayout: () => void
}

const defaultModules: ModuleLayout = {
  'font-size': {
    id: 'font-size',
    type: 'font-size',
    position: 'right',
    order: 0,
    visible: true,
  },
  'chat': {
    id: 'chat',
    type: 'chat',
    position: 'right',
    order: 1,
    visible: true,
  },
  'quiz': {
    id: 'quiz',
    type: 'quiz',
    position: 'right',
    order: 2,
    visible: true,
  },
  'keywords': {
    id: 'keywords',
    type: 'keywords',
    position: 'right',
    order: 3,
    visible: true,
  },
  'summary': {
    id: 'summary',
    type: 'summary',
    position: 'right',
    order: 4,
    visible: true,
  },
  'report': {
    id: 'report',
    type: 'report',
    position: 'bottom',
    order: 0,
    visible: true,
  },
}

export const useModuleStore = create<ModuleState>()(
  persist(
    (set) => ({
      modules: {},

      initializeModules: () => set({ modules: defaultModules }),

      moveModule: (moduleId, newPosition) => set((state) => ({
        modules: {
          ...state.modules,
          [moduleId]: {
            ...state.modules[moduleId],
            position: newPosition,
          },
        },
      })),

      toggleModuleVisibility: (moduleId) => set((state) => ({
        modules: {
          ...state.modules,
          [moduleId]: {
            ...state.modules[moduleId],
            visible: !state.modules[moduleId].visible,
          },
        },
      })),

      reorderModules: (moduleId, newOrder) => set((state) => ({
        modules: {
          ...state.modules,
          [moduleId]: {
            ...state.modules[moduleId],
            order: newOrder,
          },
        },
      })),

      resetLayout: () => set({ modules: defaultModules }),
    }),
    {
      name: 'module-layout-storage',
    }
  )
)

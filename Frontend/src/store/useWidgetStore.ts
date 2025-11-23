/**
 * Widget 상태 관리 Store
 */
import { create } from 'zustand'
import type { Widget, WidgetType } from '@/types/widget'
import { WIDGET_METADATA } from '@/types/widget'
import type { Layout } from 'react-grid-layout'

interface WidgetState {
  widgets: Widget[]
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
  updateLayout: (layout: Layout[]) => void
  loadLayout: () => void
  saveLayout: () => void
}

const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 빈 공간 찾기 (단순화된 버전)
const findEmptyPosition = (widgets: Widget[]): { x: number; y: number } => {
  // 가장 아래쪽 위젯 찾기
  const maxY = widgets.reduce((max, w) => Math.max(max, w.position.y + w.size.h), 0)
  return { x: 0, y: maxY }
}

export const useWidgetStore = create<WidgetState>((set, get) => ({
  widgets: [],

  addWidget: (type: WidgetType) => {
    const metadata = WIDGET_METADATA[type]
    const position = findEmptyPosition(get().widgets)

    const newWidget: Widget = {
      id: generateId(),
      type,
      position,
      size: metadata.defaultSize,
    }

    set(state => ({
      widgets: [...state.widgets, newWidget]
    }))

    // 자동 저장
    setTimeout(() => get().saveLayout(), 100)
  },

  removeWidget: (id: string) => {
    set(state => ({
      widgets: state.widgets.filter(w => w.id !== id)
    }))

    // 자동 저장
    setTimeout(() => get().saveLayout(), 100)
  },

  updateLayout: (layout) => {
    set(state => ({
      widgets: state.widgets.map(widget => {
        const layoutItem = layout.find(item => item.i === widget.id)
        if (!layoutItem) return widget

        return {
          ...widget,
          position: { x: layoutItem.x, y: layoutItem.y },
          size: { w: layoutItem.w, h: layoutItem.h },
        }
      })
    }))

    // 자동 저장
    setTimeout(() => get().saveLayout(), 100)
  },

  loadLayout: () => {
    try {
      const saved = localStorage.getItem('dashboard-widgets')
      if (saved) {
        const widgets = JSON.parse(saved)
        set({ widgets })
      }
    } catch (error) {
      console.error('Failed to load widget layout:', error)
    }
  },

  saveLayout: () => {
    try {
      const { widgets } = get()
      localStorage.setItem('dashboard-widgets', JSON.stringify(widgets))
    } catch (error) {
      console.error('Failed to save widget layout:', error)
    }
  },
}))

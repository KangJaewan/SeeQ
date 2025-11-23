/**
 * Widget 타입 정의
 */

export type WidgetType =
  | 'chat'
  | 'quiz'
  | 'keywords'
  | 'summary'
  | 'report'
  | 'fontsize'

export interface Widget {
  id: string
  type: WidgetType
  position: { x: number; y: number }
  size: { w: number; h: number }
}

export interface WidgetMetadata {
  type: WidgetType
  name: string
  icon: string
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
}

export const WIDGET_METADATA: Record<WidgetType, Omit<WidgetMetadata, 'type'>> = {
  chat: {
    name: '채팅',
    icon: '💬',
    defaultSize: { w: 4, h: 6 },
    minSize: { w: 3, h: 4 },
  },
  quiz: {
    name: '퀴즈',
    icon: '📝',
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  keywords: {
    name: '키워드',
    icon: '🔑',
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
  },
  summary: {
    name: '요약',
    icon: '📄',
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  report: {
    name: '리포트',
    icon: '📊',
    defaultSize: { w: 4, h: 5 },
    minSize: { w: 3, h: 4 },
  },
  fontsize: {
    name: '글자 크기',
    icon: '🔤',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
  },
}

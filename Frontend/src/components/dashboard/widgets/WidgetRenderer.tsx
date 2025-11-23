/**
 * Widget Renderer - 위젯 타입별 렌더링
 */
import React from 'react'
import type { WidgetType } from '@/types/widget'
import { FontSizeControl } from '../modules/FontSizeControl'
import { ChatModule } from '../modules/ChatModule'
import { QuizModule } from '../modules/QuizModule'
import { KeywordsModule } from '../modules/KeywordsModule'
import { SummaryModule } from '../modules/SummaryModule'
import { ReportModule } from '../modules/ReportModule'

interface WidgetRendererProps {
  type: WidgetType
  isPreview?: boolean
}

export function WidgetRenderer({ type, isPreview = false }: WidgetRendererProps) {
  switch (type) {
    case 'chat':
      return <ChatModule isPreview={isPreview} />
    case 'quiz':
      return <QuizModule isPreview={isPreview} />
    case 'keywords':
      return <KeywordsModule isPreview={isPreview} />
    case 'summary':
      return <SummaryModule isPreview={isPreview} />
    case 'report':
      return <ReportModule isPreview={isPreview} />
    case 'fontsize':
      return <FontSizeControl isPreview={isPreview} />
    default:
      return <div className="text-gray-500">Unknown widget type</div>
  }
}

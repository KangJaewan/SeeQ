/**
 * Widget Wrapper - 개별 위젯 래퍼
 */
import React from 'react'
import { X, GripVertical } from 'lucide-react'
import type { Widget } from '@/types/widget'
import { WIDGET_METADATA } from '@/types/widget'
import { useWidgetStore } from '@/store/useWidgetStore'
import { WidgetRenderer } from './WidgetRenderer'

interface WidgetWrapperProps {
  widget: Widget
}

export function WidgetWrapper({ widget }: WidgetWrapperProps) {
  const { removeWidget } = useWidgetStore()
  const metadata = WIDGET_METADATA[widget.type]

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* 위젯 헤더 */}
      <div className="widget-drag-handle flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-move">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {metadata.icon} {metadata.name}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeWidget(widget.id)
          }}
          className="widget-remove-button text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          title="위젯 제거"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 위젯 내용 */}
      <div className="flex-1 overflow-auto p-3">
        <WidgetRenderer type={widget.type} />
      </div>
    </div>
  )
}

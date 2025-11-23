/**
 * Widget Palette - 위젯 추가 패널 (우측 사이드바)
 */
import React from 'react'
import { Plus } from 'lucide-react'
import { useDrag } from 'react-dnd'
import { useUIStore } from '@/store'
import { useWidgetStore } from '@/store/useWidgetStore'
import { WIDGET_METADATA, type WidgetType } from '@/types/widget'
import { WidgetRenderer } from './WidgetRenderer'

interface WidgetPaletteItemProps {
  type: WidgetType
}

function WidgetPaletteItem({ type }: WidgetPaletteItemProps) {
  const { addWidget } = useWidgetStore()
  const metadata = WIDGET_METADATA[type]

  // fontsize 위젯은 드래그 비활성화
  const isDraggable = type !== 'fontsize'

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'WIDGET',
    item: { widgetType: type },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [isDraggable])

  const handleClick = () => {
    // fontsize 위젯은 클릭으로 추가하지 않음 (팔레트에서 바로 사용)
    if (type !== 'fontsize') {
      addWidget(type)
    }
  }

  return (
    <div
      ref={isDraggable ? drag : null}
      onClick={handleClick}
      className={`group ${isDraggable ? 'cursor-pointer' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {/* 위젯 헤더 */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{metadata.icon}</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metadata.name}
          </span>
        </div>
        {isDraggable && (
          <Plus className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
        )}
      </div>

      {/* 위젯 미리보기 */}
      <div className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-gray-200 dark:border-gray-600 ${isDraggable ? 'group-hover:border-indigo-400 dark:group-hover:border-indigo-500' : ''} transition-all overflow-hidden`}>
        {/* 위젯 내용 미리보기 */}
        <div className="p-2 h-40 flex flex-col">
          {type === 'fontsize' ? (
            <div className="text-[10px] text-gray-400 mb-1 text-center">실시간 조절</div>
          ) : (
            <div className="text-[10px] text-gray-400 mb-1 text-right">미리보기</div>
          )}
          <div className="flex-1 overflow-hidden">
            <WidgetRenderer type={type} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function WidgetPalette() {
  const { rightSidebarOpen } = useUIStore()

  // fontsize는 맨 마지막에 배치 (고정 위젯)
  const widgetTypes: WidgetType[] = ['chat', 'quiz', 'keywords', 'summary', 'report', 'fontsize']

  return (
    <div
      className={`fixed top-0 right-0 h-screen bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto transition-transform duration-300 z-30 ${
        rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: '360px' }}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          위젯 추가
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          위젯을 드래그하거나 클릭하여 대시보드에 추가하세요
        </p>

        <div className="space-y-4">
          {widgetTypes.map(type => (
            <WidgetPaletteItem key={type} type={type} />
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            💡 사용 팁
          </h3>
          <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <li>• 위젯을 클릭 또는 드래그하여 추가</li>
            <li>• 대시보드에서 드래그로 이동</li>
            <li>• 모서리를 드래그하여 크기 조절</li>
            <li>• X 버튼으로 위젯 제거</li>
            <li>• 글꼴 크기는 여기서 바로 조절</li>
            <li>• 레이아웃은 자동 저장됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

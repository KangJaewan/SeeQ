/**
 * Widget Grid - 메인 대시보드 위젯 그리드
 */
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import GridLayout, { Layout } from 'react-grid-layout'
import { useWidgetStore } from '@/store/useWidgetStore'
import { WidgetWrapper } from './WidgetWrapper'
import type { WidgetType } from '@/types/widget'
import 'react-grid-layout/css/styles.css'

export function WidgetGrid() {
  const { widgets, updateLayout, loadLayout, addWidget } = useWidgetStore()
  const [gridWidth, setGridWidth] = useState(1600)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 레이아웃 로드
  useEffect(() => {
    loadLayout()
  }, [loadLayout])

  // 컨테이너 너비 감지
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setGridWidth(width - 48) // padding 제외
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)

    // 우측 사이드바 토글 감지를 위한 추가 업데이트
    const observer = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateWidth)
      observer.disconnect()
    }
  }, [])

  // 드롭 영역 설정
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WIDGET',
    drop: (item: { widgetType: WidgetType }) => {
      addWidget(item.widgetType)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  const layout = widgets.map(w => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.size.w,
    h: w.size.h,
  }))

  // drop과 containerRef를 동시에 처리하는 callback ref
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      drop(node)
      containerRef.current = node
    },
    [drop]
  )

  return (
    <div
      ref={setRefs}
      className="widget-grid-container p-6 min-h-screen"
    >
      {widgets.length === 0 ? (
        <div className={`flex items-center justify-center min-h-[600px] border-2 border-dashed rounded-lg transition-colors ${
          isOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {isOver ? '여기에 드롭하세요!' : '위젯이 없습니다'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              우측 사이드바에서 위젯을 드래그하거나 클릭하여 추가하세요
            </p>
          </div>
        </div>
      ) : (
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={gridWidth}
          isDraggable={true}
          isResizable={true}
          draggableHandle=".widget-drag-handle"
          draggableCancel=".widget-remove-button"
          compactType="vertical"
          preventCollision={false}
          onLayoutChange={(newLayout: Layout[]) => {
            updateLayout(newLayout)
          }}
        >
          {widgets.map(widget => (
            <div key={widget.id}>
              <WidgetWrapper widget={widget} />
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  )
}

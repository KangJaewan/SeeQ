/**
 * 그래프 모달 컴포넌트 (D3.js)
 */
import { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface GraphModalProps {
  isOpen: boolean
  onClose: () => void
}

interface GraphNode {
  id: string
  title: string
  type: 'folder' | 'document' | 'tag'
  size: number
  color: string
  level: number
  parent_id?: string
  metadata?: Record<string, any>
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphEdge {
  source: string | GraphNode
  target: string | GraphNode
  weight: number
  type: 'hierarchy' | 'similarity'
  metadata?: Record<string, any>
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  metadata: Record<string, any>
}

export function GraphModal({ isOpen, onClose }: GraphModalProps) {
  const [loading, setLoading] = useState(false)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // 그래프 데이터 로드
  useEffect(() => {
    if (!isOpen) return

    const fetchGraphData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('http://localhost:8000/graph-hierarchical/graph')
        if (!response.ok) {
          throw new Error('그래프 데이터를 불러오는데 실패했습니다.')
        }
        const data = await response.json()
        setGraphData(data)
      } catch (err) {
        console.error('그래프 로드 실패:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchGraphData()
  }, [isOpen])

  // D3.js 그래프 렌더링
  useEffect(() => {
    if (!graphData || !svgRef.current || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // 기존 내용 제거

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // 노드 색상 맵핑 (그라데이션)
    const getNodeColor = (type: string) => {
      switch(type) {
        case 'folder': return '#3b82f6' // blue-500
        case 'document': return '#10b981' // green-500
        case 'tag': return '#a855f7' // purple-500
        default: return '#64748b' // slate-500
      }
    }

    // 노드 크기 계산 (타입별 차별화)
    const getNodeRadius = (node: GraphNode) => {
      const baseSize = node.size || 1
      switch(node.type) {
        case 'folder': return baseSize * 20 + 15
        case 'document': return baseSize * 12 + 8
        case 'tag': return baseSize * 10 + 6
        default: return 10
      }
    }

    // 시뮬레이션 설정 (더 넓은 간격)
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(graphData.edges)
        .id(d => d.id)
        .distance(d => 200))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => getNodeRadius(d as GraphNode) + 30))

    // 줌 기능
    const g = svg.append('g')
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // 그라데이션 정의
    const defs = svg.append('defs')

    // 폴더용 그라데이션
    const folderGradient = defs.append('radialGradient')
      .attr('id', 'folder-gradient')
    folderGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#60a5fa')
    folderGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#2563eb')

    // 문서용 그라데이션
    const docGradient = defs.append('radialGradient')
      .attr('id', 'doc-gradient')
    docGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#34d399')
    docGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')

    // 태그용 그라데이션
    const tagGradient = defs.append('radialGradient')
      .attr('id', 'tag-gradient')
    tagGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#c084fc')
    tagGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#7c3aed')

    // 그림자 필터
    const filter = defs.append('filter')
      .attr('id', 'shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
    filter.append('feOffset')
      .attr('dx', 0)
      .attr('dy', 2)
      .attr('result', 'offsetblur')
    filter.append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.3)
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode')
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic')

    // 엣지 그리기 (더 연하게)
    const link = g.append('g')
      .selectAll('line')
      .data(graphData.edges)
      .join('line')
      .attr('stroke', d => d.type === 'hierarchy' ? '#cbd5e1' : '#e2e8f0')
      .attr('stroke-width', d => Math.sqrt(d.weight) * 1.5)
      .attr('stroke-opacity', 0.3)

    // 드래그 동작 정의
    const dragBehavior = d3.drag<SVGCircleElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      })

    // 노드 그리기 (그라데이션 + 그림자)
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => {
        switch(d.type) {
          case 'folder': return 'url(#folder-gradient)'
          case 'document': return 'url(#doc-gradient)'
          case 'tag': return 'url(#tag-gradient)'
          default: return getNodeColor(d.type)
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#shadow)')
      .attr('cursor', 'grab')
      .call(dragBehavior as any)

    // 노드 안에 텍스트 넣기
    const nodeText = g.append('g')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .text(d => {
        // 노드 타입에 따라 텍스트 길이 조정
        const maxLength = d.type === 'folder' ? 6 : d.type === 'document' ? 5 : 3
        return d.title.length > maxLength ? d.title.substring(0, maxLength) + '...' : d.title
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => {
        switch(d.type) {
          case 'folder': return '45px'
          case 'document': return '36px'
          case 'tag': return '28px'
          default: return '32px'
        }
      })
      .attr('font-weight', 900)
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .style('user-select', 'none')
      .style('text-shadow', '0 3px 6px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.8)')

    // SVG 툴팁 (title 요소)
    node.append('title')
      .text(d => `${d.title}\n타입: ${d.type}\n레벨: ${d.level}`)

    // 시뮬레이션 업데이트
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x || 0)
        .attr('y1', d => (d.source as GraphNode).y || 0)
        .attr('x2', d => (d.target as GraphNode).x || 0)
        .attr('y2', d => (d.target as GraphNode).y || 0)

      node
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0)

      nodeText
        .attr('x', d => d.x || 0)
        .attr('y', d => d.y || 0)
    })

    return () => {
      simulation.stop()
    }
  }, [graphData, loading])

  const handleClose = (e?: React.MouseEvent) => {
    if (e && e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="graph-popup-overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="graph-popup bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95vw] max-w-[1600px] h-[90vh] relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="graph-popup-close absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-4xl font-light hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
          title="그래프 닫기"
        >
          ×
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Second Brain - 지식 그래프
          </h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
            폴더, 문서, 태그의 관계를 시각화합니다. 노드를 드래그하거나 스크롤로 줌할 수 있습니다.
          </p>
        </div>

        {/* Graph Container */}
        <div className="graph-container flex-1 p-8 overflow-hidden">
          {loading ? (
            <div className="graph-loading flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">그래프를 로딩 중...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-red-600 dark:text-red-400 text-lg">⚠️ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <svg ref={svgRef} className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg" />
          )}
        </div>

        {/* Legend */}
        {graphData && !loading && !error && (
          <div className="px-8 pb-8 flex items-center gap-8 text-base border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">폴더</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">문서</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">태그</span>
            </div>
            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              💡 노드를 드래그하여 위치를 조정하세요
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Draggable 래퍼 컴포넌트
 */
import { useDraggable } from '@/hooks'
import { cn } from '@/utils'

interface DraggableProps {
  id: string
  type: string
  children: React.ReactNode
  className?: string
  onDrop?: (item: any) => void
}

export function Draggable({ id, type, children, className, onDrop }: DraggableProps) {
  const { isDragging, drag } = useDraggable({ id, type, onDrop })

  return (
    <div
      ref={drag}
      className={cn(
        'draggable',
        isDragging && 'opacity-50 cursor-grabbing',
        !isDragging && 'cursor-grab',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Droppable 래퍼 컴포넌트
 */
import { useDroppable } from '@/hooks'
import { cn } from '@/utils'

interface DroppableProps {
  accept: string | string[]
  onDrop: (item: any) => void
  children: React.ReactNode
  className?: string
}

export function Droppable({ accept, onDrop, children, className }: DroppableProps) {
  const { isOver, canDrop, drop } = useDroppable({ accept, onDrop })

  return (
    <div
      ref={drop}
      className={cn(
        'droppable',
        isOver && canDrop && 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400',
        canDrop && !isOver && 'border-2 border-dashed border-gray-300',
        className
      )}
    >
      {children}
    </div>
  )
}

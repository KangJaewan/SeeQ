/**
 * Drag and Drop 관련 Custom Hook
 */
import { useDrag, useDrop } from 'react-dnd'

interface DragItem {
  id: string
  type: string
}

interface UseDraggableOptions {
  id: string
  type: string
  onDrop?: (item: DragItem) => void
}

export function useDraggable({ id, type, onDrop }: UseDraggableOptions) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return { isDragging, drag }
}

interface UseDroppableOptions {
  accept: string | string[]
  onDrop: (item: DragItem) => void
}

export function useDroppable({ accept, onDrop }: UseDroppableOptions) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept,
    drop: (item: DragItem) => {
      onDrop(item)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))

  return { isOver, canDrop, drop }
}

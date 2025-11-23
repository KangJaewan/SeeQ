/**
 * Todo 아이템 컴포넌트
 */
import { useTodoStore } from '@/store'
import type { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, removeTodo } = useTodoStore()

  return (
    <div className="todo-item flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-indigo-500 cursor-pointer"
      />

      {/* Content */}
      <span
        className={`flex-1 text-sm ${
          todo.completed
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {todo.content}
      </span>

      {/* Delete Button */}
      <button
        onClick={() => removeTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-opacity"
        title="삭제"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

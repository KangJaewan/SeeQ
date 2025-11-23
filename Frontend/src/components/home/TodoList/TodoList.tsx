/**
 * Todo 리스트 컴포넌트
 */
import { useTodoStore } from '@/store'
import { TodoItem } from './TodoItem'
import { ProgressBar } from './ProgressBar'

export function TodoList() {
  const { todos, addTodo, getStats } = useTodoStore()
  const stats = getStats()

  const handleAddTodo = () => {
    const content = prompt('할 일을 입력하세요:')
    if (content?.trim()) {
      addTodo(content.trim())
    }
  }

  return (
    <div className="todo-card-wrapper bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors">
      {/* Todo Header */}
      <div className="todo-header flex justify-between items-center mb-4">
        <span className="todo-title flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <div className="todo-icon w-6 h-6 bg-indigo-600 rounded" />
          Todo list
        </span>
        <button
          onClick={handleAddTodo}
          className="todo-add-btn w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          title="새 할 일 추가"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
      </div>

      {/* Todo List Container */}
      <div className="todo-list-container max-h-64 overflow-y-auto">
        <div id="todo-list" className="space-y-2 mb-4">
          {todos.length === 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 py-8">
              할 일이 없습니다
            </div>
          ) : (
            todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
          )}
        </div>

        {/* Add Todo Button */}
        <button
          onClick={handleAddTodo}
          className="add-todo-button w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <span className="add-todo-plus text-xl">+</span>
          <span className="add-todo-text">새 할 일 추가</span>
        </button>
      </div>

      {/* Progress Bar */}
      <ProgressBar percentage={stats.percentage} />
    </div>
  )
}

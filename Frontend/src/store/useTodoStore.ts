/**
 * Todo 상태 관리 Store
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Todo } from '@/types'

interface TodoState {
  todos: Todo[]
  addTodo: (content: string) => void
  toggleTodo: (id: string) => void
  updateTodo: (id: string, content: string) => void
  removeTodo: (id: string) => void
  getStats: () => { total: number; completed: number; percentage: number }
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],

      addTodo: (content) => {
        const newTodo: Todo = {
          id: Date.now().toString(),
          content,
          completed: false,
          created_at: new Date().toISOString(),
        }
        set((state) => ({ todos: [...state.todos, newTodo] }))
      },

      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      })),

      updateTodo: (id, content) => set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, content, updated_at: new Date().toISOString() } : todo
        ),
      })),

      removeTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),

      getStats: () => {
        const { todos } = get()
        const total = todos.length
        const completed = todos.filter((todo) => todo.completed).length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        return { total, completed, percentage }
      },
    }),
    {
      name: 'todo-storage',
    }
  )
)

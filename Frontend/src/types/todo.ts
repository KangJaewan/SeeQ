/**
 * Todo 관련 타입 정의
 */

export interface Todo {
  id: string
  content: string
  completed: boolean
  created_at: string
  updated_at?: string
}

export interface TodoStats {
  total: number
  completed: number
  percentage: number
}

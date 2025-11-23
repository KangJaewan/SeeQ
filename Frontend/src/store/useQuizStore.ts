/**
 * Quiz 상태 관리 Store
 */
import { create } from 'zustand'
import { quizApi, quizQAApi } from '@/api/quiz'
import type {
  Quiz,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizSubmissionRequest,
  QuizSessionResult,
  QuizRecord,
  QuizStats,
} from '@/types'

interface QuizState {
  // 현재 퀴즈 세션
  currentQuizzes: Quiz[]
  currentAnswers: Map<string, any>
  currentSession: QuizSessionResult | null

  // 퀴즈 목록
  quizList: Quiz[]
  quizListPage: number
  quizListHasNext: boolean

  // 통계 및 기록
  stats: QuizStats | null
  records: QuizRecord[]

  // UI 상태
  loading: boolean
  error: string | null
  currentQuizIndex: number
  startTime: number | null

  // Actions - Quiz Generation
  generateQuiz: (request: QuizGenerateRequest) => Promise<QuizGenerateResponse | null>
  setCurrentQuizzes: (quizzes: Quiz[]) => void

  // Actions - Quiz Taking
  setCurrentAnswer: (questionId: string, answer: any) => void
  getCurrentAnswer: (questionId: string) => any
  nextQuiz: () => void
  prevQuiz: () => void
  goToQuiz: (index: number) => void
  startQuizSession: () => void

  // Actions - Submit & Results
  submitQuiz: (request: QuizSubmissionRequest) => Promise<QuizSessionResult | null>
  fetchSessionResult: (sessionId: string) => Promise<void>

  // Actions - Records & Stats
  fetchRecords: (folderId?: string, limit?: number, offset?: number) => Promise<void>
  fetchStats: (folderId?: string) => Promise<void>

  // Actions - Quiz List
  fetchQuizList: (params?: any) => Promise<void>

  // Utility
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  resetSession: () => void
}

const initialState = {
  currentQuizzes: [],
  currentAnswers: new Map(),
  currentSession: null,
  quizList: [],
  quizListPage: 1,
  quizListHasNext: false,
  stats: null,
  records: [],
  loading: false,
  error: null,
  currentQuizIndex: 0,
  startTime: null,
}

export const useQuizStore = create<QuizState>((set, get) => ({
  ...initialState,

  // Quiz Generation
  generateQuiz: async (request: QuizGenerateRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await quizApi.generate(request)

      // 생성된 퀴즈를 Quiz[] 형태로 변환
      const quizzes: Quiz[] = response.quizzes.map((q, index) => ({
        quiz_id: `temp_${Date.now()}_${index}`,
        question: q.question,
        quiz_type: q.quiz_type,
        quiz_options: q.options,
        correct_option: q.correct_option,
        correct_answer: q.correct_answer,
        answer: q.explanation,
        difficulty: q.difficulty,
        topic: response.topic,
      }))

      set({
        currentQuizzes: quizzes,
        currentAnswers: new Map(),
        currentQuizIndex: 0,
        loading: false,
      })

      return response
    } catch (err: any) {
      set({ error: err.message || 'Failed to generate quiz', loading: false })
      return null
    }
  },

  setCurrentQuizzes: (quizzes) => set({
    currentQuizzes: quizzes,
    currentAnswers: new Map(),
    currentQuizIndex: 0,
  }),

  // Quiz Taking
  setCurrentAnswer: (questionId, answer) => {
    const { currentAnswers } = get()
    const newAnswers = new Map(currentAnswers)
    newAnswers.set(questionId, answer)
    set({ currentAnswers: newAnswers })
  },

  getCurrentAnswer: (questionId) => {
    const { currentAnswers } = get()
    return currentAnswers.get(questionId)
  },

  nextQuiz: () => {
    const { currentQuizIndex, currentQuizzes } = get()
    if (currentQuizIndex < currentQuizzes.length - 1) {
      set({ currentQuizIndex: currentQuizIndex + 1 })
    }
  },

  prevQuiz: () => {
    const { currentQuizIndex } = get()
    if (currentQuizIndex > 0) {
      set({ currentQuizIndex: currentQuizIndex - 1 })
    }
  },

  goToQuiz: (index) => {
    const { currentQuizzes } = get()
    if (index >= 0 && index < currentQuizzes.length) {
      set({ currentQuizIndex: index })
    }
  },

  startQuizSession: () => {
    set({
      startTime: Date.now(),
      currentAnswers: new Map(),
      currentQuizIndex: 0,
    })
  },

  // Submit & Results
  submitQuiz: async (request: QuizSubmissionRequest) => {
    set({ loading: true, error: null })
    try {
      const result = await quizQAApi.submit(request)
      set({
        currentSession: result,
        loading: false,
      })
      return result
    } catch (err: any) {
      set({ error: err.message || 'Failed to submit quiz', loading: false })
      return null
    }
  },

  fetchSessionResult: async (sessionId: string) => {
    set({ loading: true, error: null })
    try {
      const result = await quizQAApi.getSession(sessionId)
      set({ currentSession: result, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch session result', loading: false })
    }
  },

  // Records & Stats
  fetchRecords: async (folderId?: string, limit = 20, offset = 0) => {
    set({ loading: true, error: null })
    try {
      const records = await quizQAApi.getRecords(folderId, limit, offset)
      set({ records, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch records', loading: false })
    }
  },

  fetchStats: async (folderId?: string) => {
    set({ loading: true, error: null })
    try {
      const stats = await quizQAApi.getStats(folderId)
      set({ stats, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch stats', loading: false })
    }
  },

  // Quiz List
  fetchQuizList: async (params?: any) => {
    set({ loading: true, error: null })
    try {
      const response = await quizApi.getList(params)
      set({
        quizList: response.quizzes,
        quizListPage: response.page,
        quizListHasNext: response.has_next,
        loading: false,
      })
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch quiz list', loading: false })
    }
  },

  // Utility
  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),

  resetSession: () => set({
    currentQuizzes: [],
    currentAnswers: new Map(),
    currentSession: null,
    currentQuizIndex: 0,
    startTime: null,
  }),
}))

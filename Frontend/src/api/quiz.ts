/**
 * Quiz API
 */
import { apiClient } from './client'
import type {
  Quiz,
  QuizGenerateRequest,
  QuizGenerateResponse,
  QuizListResponse,
  QuizSubmissionRequest,
  QuizSessionResult,
  QuizRecord,
  QuizStats,
} from '@/types'

export const quizApi = {
  /**
   * 퀴즈 생성
   */
  generate: async (params: QuizGenerateRequest) => {
    const response = await apiClient.post<QuizGenerateResponse>('/quiz/', params)
    return response.data
  },

  /**
   * 퀴즈 목록 조회
   */
  getList: async (params?: {
    folder_id?: string
    topic?: string
    difficulty?: string
    quiz_type?: string
    page?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.folder_id) queryParams.append('folder_id', params.folder_id)
    if (params?.topic) queryParams.append('topic', params.topic)
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty)
    if (params?.quiz_type) queryParams.append('quiz_type', params.quiz_type)
    queryParams.append('page', String(params?.page || 1))
    queryParams.append('limit', String(params?.limit || 20))

    const response = await apiClient.get<QuizListResponse>(`/quiz/list?${queryParams.toString()}`)
    return response.data
  },

  /**
   * 퀴즈 상세 조회
   */
  getDetail: async (quizId: string) => {
    const response = await apiClient.get<Quiz>(`/quiz/${quizId}`)
    return response.data
  },

  /**
   * 퀴즈 히스토리 조회
   */
  getHistory: async (folderId?: string, limit?: number) => {
    const params = new URLSearchParams()
    if (folderId) params.append('folder_id', folderId)
    if (limit) params.append('limit', String(limit))

    const response = await apiClient.get(`/quiz/history?${params.toString()}`)
    return response.data
  },

  /**
   * 퀴즈 통계 조회
   */
  getStats: async (folderId?: string) => {
    const params = folderId ? `?folder_id=${folderId}` : ''
    const response = await apiClient.get(`/quiz/stats${params}`)
    return response.data
  },

  /**
   * 퀴즈 삭제
   */
  delete: async (quizId: string) => {
    const response = await apiClient.delete(`/quiz/${quizId}`)
    return response.data
  },
}

/**
 * Quiz QA API (제출 및 채점)
 */
export const quizQAApi = {
  /**
   * 퀴즈 제출 및 자동 채점
   */
  submit: async (submission: QuizSubmissionRequest) => {
    const response = await apiClient.post<QuizSessionResult>('/quiz-qa/submit', submission)
    return response.data
  },

  /**
   * 퀴즈 세션 결과 조회
   */
  getSession: async (sessionId: string) => {
    const response = await apiClient.get<QuizSessionResult>(`/quiz-qa/sessions/${sessionId}`)
    return response.data
  },

  /**
   * 퀴즈 기록 조회
   */
  getRecords: async (folderId?: string, limit = 20, offset = 0) => {
    const params = new URLSearchParams()
    if (folderId) params.append('folder_id', folderId)
    params.append('limit', String(limit))
    params.append('offset', String(offset))

    const response = await apiClient.get<QuizRecord[]>(`/quiz-qa/records?${params.toString()}`)
    return response.data
  },

  /**
   * 개인 퀴즈 통계
   */
  getStats: async (folderId?: string) => {
    const params = folderId ? `?folder_id=${folderId}` : ''
    const response = await apiClient.get<QuizStats>(`/quiz-qa/stats${params}`)
    return response.data
  },

  /**
   * 퀴즈 세션 삭제
   */
  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/quiz-qa/sessions/${sessionId}`)
    return response.data
  },
}

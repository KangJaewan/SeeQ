/**
 * 퀴즈 관련 타입 정의
 */

// 퀴즈 타입
export type QuizType = 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_in_blank'

// 난이도
export type Difficulty = 'easy' | 'medium' | 'hard'

// 등급
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'

/**
 * 퀴즈 항목
 */
export interface Quiz {
  quiz_id: string
  question: string
  quiz_type: QuizType
  quiz_options?: string[]
  correct_option?: number
  correct_answer?: string
  answer?: string
  difficulty: Difficulty
  topic?: string
  folder_id?: string
  source_document_id?: string
  created_at?: string
}

/**
 * 퀴즈 생성 요청
 */
export interface QuizGenerateRequest {
  topic?: string
  folder_id?: string
  difficulty: Difficulty
  count: number
  quiz_type: QuizType
}

/**
 * 퀴즈 생성 응답
 */
export interface QuizGenerateResponse {
  quizzes: Array<{
    question: string
    quiz_type: QuizType
    options?: string[]
    correct_option?: number
    correct_answer?: string
    difficulty: Difficulty
    explanation?: string
    from_existing?: boolean
  }>
  topic?: string
  total_count: number
  generated_new?: number
  used_existing?: number
}

/**
 * 퀴즈 목록 조회 응답
 */
export interface QuizListResponse {
  quizzes: Quiz[]
  total_count: number
  page: number
  limit: number
  has_next: boolean
}

/**
 * 답안 제출 (개별 문제)
 */
export interface QuizAnswer {
  question_id: string
  question_text: string
  quiz_type: QuizType
  user_answer: any
  correct_answer: any
  options?: string[]
  time_spent?: number
}

/**
 * 퀴즈 세션 제출 요청
 */
export interface QuizSubmissionRequest {
  session_id?: string
  folder_id?: string
  quiz_topic?: string
  answers: QuizAnswer[]
  total_time?: number
  submitted_at?: string
}

/**
 * 채점 결과 (개별 문제)
 */
export interface QuizResult {
  question_id: string
  question_text: string
  quiz_type: QuizType
  user_answer: any
  correct_answer: any
  is_correct: boolean
  score: number
  options?: string[]
}

/**
 * 퀴즈 세션 결과
 */
export interface QuizSessionResult {
  session_id: string
  total_questions: number
  correct_answers: number
  wrong_answers: number
  total_score: number
  percentage: number
  total_time?: number
  folder_id?: string
  quiz_topic?: string
  results: QuizResult[]
  submitted_at: string
  grade: Grade
}

/**
 * 퀴즈 기록 항목
 */
export interface QuizRecord {
  session_id: string
  folder_id?: string
  quiz_topic?: string
  total_questions: number
  score: number
  percentage: number
  grade: Grade
  time_spent?: number
  submitted_at: string
}

/**
 * 개인 퀴즈 통계
 */
export interface QuizStats {
  total_quizzes: number
  total_questions: number
  average_score: number
  highest_score: number
  lowest_score: number
  total_time_spent: number
  favorite_topics: string[]
  weak_areas: string[]
  recent_performance: number[]
}

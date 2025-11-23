/**
 * 대시보드 모듈 관련 타입 정의
 */

export type ModuleType =
  | 'font-size'
  | 'chat'
  | 'quiz'
  | 'keywords'
  | 'summary'
  | 'report'

export type ModulePosition = 'right' | 'bottom'

export interface Module {
  id: string
  type: ModuleType
  position: ModulePosition
  order: number
  visible: boolean
}

export interface ModuleLayout {
  [key: string]: Module
}

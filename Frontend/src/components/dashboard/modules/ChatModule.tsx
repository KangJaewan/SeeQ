/**
 * Chat 모듈
 */
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, Send, Loader2, AlertCircle, Bot, User } from 'lucide-react'

interface ChatModuleProps {
  isPreview?: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: Date
}

interface QueryResponse {
  answer: string
  sources?: Array<{ file_name: string; chunk_index: number }>
  confidence?: number
  agent_type?: string
  session_id: string
  strategy?: string
}

export function ChatModule({ isPreview = false }: ChatModuleProps) {
  const { folderId } = useParams<{ folderId: string }>()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지가 업데이트되면 스크롤을 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || loading || isPreview) return

    const userMessage = message.trim()
    setMessage('')
    setError(null)

    // 사용자 메시지 추가
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])

    setLoading(true)

    // folderId 확인용 로그
    console.log('현재 folderId:', folderId)
    console.log('folderId가 undefined인가?', folderId === undefined)
    console.log('folderId가 빈 문자열인가?', folderId === '')

    const requestBody = {
      query: userMessage,
      folder_id: folderId || null,
      top_k: 5,
      include_sources: true,
      session_id: sessionId,
    }
    console.log('API 요청 body:', requestBody)

    try {
      const response = await fetch('http://localhost:8000/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`)
      }

      const data: QueryResponse = await response.json()

      // 세션 ID 저장
      if (data.session_id) {
        setSessionId(data.session_id)
      }

      // 실제 sources 구조 확인을 위한 로그
      console.log('API 응답 전체:', data)
      console.log('sources 데이터:', data.sources)

      // AI 응답 메시지 추가
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources?.map((s: any) => {
          // sources의 다양한 구조에 대응
          if (typeof s === 'string') {
            return s
          } else if (s.filename) {
            // 백엔드 응답 구조: { filename, chunk_id, file_id, score, text }
            return s.filename
          } else if (s.file_name || s.fileName) {
            const fileName = s.file_name || s.fileName
            const chunkIndex = s.chunk_index ?? s.chunkIndex ?? s.chunk_id ?? s.chunk ?? ''
            return chunkIndex !== '' ? `${fileName} (청크 ${chunkIndex})` : fileName
          } else if (s.source) {
            return s.source
          } else {
            return JSON.stringify(s)
          }
        }) || [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error('채팅 API 호출 실패:', err)
      setError(err instanceof Error ? err.message : '응답을 가져올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isPreview) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-gray-900 dark:text-white">SeeQ Chat</h3>
          <MessageSquare className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 mb-1 space-y-1">
          <div className="flex justify-end">
            <div className="bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[8px]">안녕하세요?</div>
          </div>
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 rounded px-1.5 py-0.5 text-[8px]">무엇을 도와드릴까요?</div>
          </div>
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="질문을 입력하세요..."
            className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-[9px] dark:text-white"
            disabled
          />
          <button className="px-2 py-1 bg-indigo-600 text-white rounded">
            <Send className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SeeQ Chat</h3>
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>

      {/* 메시지 표시 영역 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            <div className="text-center">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>대화를 시작해보세요</p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* 아이콘 */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* 메시지 내용 */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* 출처 표시 (AI 메시지만) - 간략하게 */}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    📄 {msg.sources.length}개 문서 참조
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 표시 */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                <Bot className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
                <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="질문을 입력하세요..."
          disabled={loading}
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

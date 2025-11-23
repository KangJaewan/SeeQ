/**
 * Axios API 클라이언트
 */
import axios, { AxiosError } from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 필요시 토큰 추가
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 에러 핸들링
    if (error.response?.status === 401) {
      // 로그아웃 처리
      console.error('인증 에러: 로그인이 필요합니다.')
    } else if (error.response?.status === 500) {
      console.error('서버 에러:', error.message)
    } else if (error.code === 'ECONNABORTED') {
      console.error('요청 타임아웃')
    }

    return Promise.reject(error)
  }
)

export default apiClient

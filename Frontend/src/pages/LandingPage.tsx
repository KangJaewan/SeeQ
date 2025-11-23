/**
 * Landing Page - SEEQ MATE 소개 페이지
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DragDropCustomizer } from '@/components/ui/DragDropCustomizer'
import SeeqHeroSection from '@/components/ui/SeeqHeroSection'
import { ImageWithFallback } from '@/components/figma/ImageWithFallback'
import {
  Glasses,
  Scan,
  Brain,
  Target,
  Eye,
  Settings,
  Download,
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleTryClick = () => {
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Glasses className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
              <span className="text-xl font-bold text-gray-900">SEEQ MATE</span>
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-to-use" className="text-gray-700 hover:text-indigo-600 transition-colors font-semibold">이용방법</a>
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition-colors font-semibold">기능</a>
              <Button
                size="sm"
                onClick={handleTryClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                체험하기
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SeeqHeroSection />
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99%</div>
              <div className="text-sm text-gray-300">인식 정확도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">3초</div>
              <div className="text-sm text-gray-300">평균 처리 시간</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-sm text-gray-300">지원 언어</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">초고속</div>
              <div className="text-sm text-gray-300">AI 처리 성능</div>
            </div>
          </div>
        </div>
      </section>

      {/* 제품 소개 섹션 */}
      <section id="how-to-use" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              혁신적인 스마트 학습 경험
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-medium">
              SEEQ MATE는 첨단 스마트 기술과 AI를 결합하여 읽기와 학습을 혁신합니다
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                실시간 텍스트 인식 및 분석
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Scan className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">즉시 텍스트 캡처</h4>
                    <p className="text-gray-700 text-sm font-medium">고해상도 카메라로 책, 문서, 화면의 텍스트를 실시간으로 인식</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">AI 기반 분석</h4>
                    <p className="text-gray-700 text-sm font-medium">고급 자연어 처리로 내용을 이해하고 핵심 정보를 추출</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">개인화된 학습</h4>
                    <p className="text-gray-700 text-sm font-medium">사용자의 학습 패턴에 맞춰 최적화된 콘텐츠 제공</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop&crop=center"
                alt="학생들이 스마트 기술로 학습하는 모습"
                className="rounded-lg shadow-xl w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
            </div>
          </div>

          {/* 4단계 프로세스 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative p-6 bg-white border-2 border-indigo-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-6">
                <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">STEP 1</span>
              </div>
              <div className="pt-4">
                <Glasses className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">스마트안경 착용</h3>
                <p className="text-sm text-gray-700 font-medium">
                  가벼운 스마트 안경을 착용하고 전원을 켜면 시스템이 자동으로 활성화됩니다
                </p>
              </div>
            </div>

            <div className="relative p-6 bg-white border-2 border-emerald-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-6">
                <span className="bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">STEP 2</span>
              </div>
              <div className="pt-4">
                <Eye className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">자연스럽게 읽기</h3>
                <p className="text-sm text-gray-700 font-medium">
                  평소처럼 책이나 문서를 읽으면 시선 추적으로 자동 텍스트 인식이 시작됩니다
                </p>
              </div>
            </div>

            <div className="relative p-6 bg-white border-2 border-purple-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-6">
                <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">STEP 3</span>
              </div>
              <div className="pt-4">
                <Settings className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">실시간 AI 처리</h3>
                <p className="text-sm text-gray-700 font-medium">
                  클라우드 AI가 내용을 분석하여 요약, 질문, 연관 정보를 즉시 생성합니다
                </p>
              </div>
            </div>

            <div className="relative p-6 bg-white border-2 border-orange-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-3 left-6">
                <span className="bg-orange-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">STEP 4</span>
              </div>
              <div className="pt-4">
                <Download className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">학습 자료 활용</h3>
                <p className="text-sm text-gray-700 font-medium">
                  모바일 앱에서 생성된 학습 자료를 확인하고 복습 계획을 세워보세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 커스터마이징 섹션 */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 border-indigo-200 font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 기능 체험
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              나만의 학습 워크플로우 설계
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-medium">
              SEEQ MATE의 다양한 AI 기능을 조합해 개인 맞춤형 학습 경험을 만들어보세요.
              <br />
              아래에서 직접 드래그 앤 드롭으로 워크플로우를 구성해볼 수 있습니다.
            </p>
          </div>

          <DragDropCustomizer />
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed font-medium">
            SEEQ MATE와 함께 읽기를 넘어선 진정한 학습 혁신을 경험해보세요.
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <a href="#" className="flex items-center space-x-3 mb-4">
                <Glasses className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                <span className="text-lg font-bold text-gray-900">SEEQ MATE</span>
              </a>
              <p className="text-gray-700 mb-4 max-w-md font-medium">
                첨단 스마트 기술과 AI를 결합하여 모든 사람의 학습과 읽기 경험을 혁신하는 솔루션입니다.
              </p>
              <div className="text-sm text-gray-600 font-medium">
                © 2025 SEEQ MATE. All rights reserved.
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">제품</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">기능 소개</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">가격 정보</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">시스템 요구사항</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">API 문서</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3">지원</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">고객 지원</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">이용약관</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors font-medium">접근성 정책</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

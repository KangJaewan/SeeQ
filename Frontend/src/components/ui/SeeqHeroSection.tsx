import React, { useState, useRef } from 'react';
import { Zap, Brain, Target, Star } from 'lucide-react';

function FeatureCard({ icon: Icon, title, description, color, iconColor }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className={`flex items-start space-x-4 p-5 rounded-lg bg-white border-2 shadow-lg hover:shadow-xl transition-all duration-200 ${color}`}>
      <div className={`flex-shrink-0 w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-700 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

export default function SeeqHeroSection() {
  const [showEndMessage, setShowEndMessage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnded = () => {
    setShowEndMessage(true);
    // 3초 후 메시지 숨기고 영상 다시 재생
    setTimeout(() => {
      setShowEndMessage(false);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 3000);
  };

  return (
    <div className="relative w-full min-h-[700px] bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-3xl overflow-hidden border-2 border-indigo-200">
      
      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center min-h-[700px] px-8 lg:px-16 py-16">
        
        {/* 왼쪽: 텍스트 콘텐츠 */}
        <div className="flex-1 max-w-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-indigo-200 mb-6 shadow-lg">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-bold text-gray-900">베타 테스터 만족도 4.8/5.0</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight mb-6">
              AI와 함께하는<br />
              <span className="text-indigo-600">스마트 독서</span>의<br />
              새로운 시작
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-800 leading-relaxed mb-8 font-semibold">
              읽는 순간 AI가 분석하고, 학습이 완성됩니다.<br />
              SEEQ MATE로 경험하는 혁신적인 지식 습득의 미래
            </p>
          </div>
          
          {/* 핵심 기능 미리보기 */}
          <div className="space-y-4 mb-8">
            <FeatureCard
              icon={Zap}
              title="실시간 텍스트 인식"
              description="고정밀 OCR 기술로 어떤 텍스트든 99% 정확도로 즉시 인식"
              color="border-indigo-200"
              iconColor="bg-indigo-600"
            />
            <FeatureCard
              icon={Brain}
              title="GPT-4 기반 분석"
              description="최신 AI 모델이 내용을 이해하고 핵심을 추출하여 학습 자료로 변환"
              color="border-emerald-200"
              iconColor="bg-emerald-600"
            />
            <FeatureCard
              icon={Target}
              title="개인화 학습 경로"
              description="학습 패턴을 분석해 개인 맞춤형 복습 스케줄과 퀴즈를 자동 생성"
              color="border-purple-200"
              iconColor="bg-purple-600"
            />
          </div>
        </div>
        
        {/* 오른쪽: 전문적인 AI 이미지 */}
        <div className="flex-1 lg:max-w-lg mt-12 lg:mt-0">
          <div className="relative">
            {/* 메인 홍보 영상 */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-4 transform hover:scale-105 transition-transform duration-500 border-2 border-gray-200 overflow-hidden">
              <div className="relative">
                <video
                  ref={videoRef}
                  src="/promo-video.mp4"
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-96 object-cover rounded-lg scale-[2] origin-center"
                  onError={(e) => {
                    console.error('Video loading error:', e);
                  }}
                  onEnded={handleVideoEnded}
                >
                  <p className="text-gray-500 text-center py-8">
                    브라우저에서 비디오를 지원하지 않습니다.
                  </p>
                </video>
                
                {/* 영상 종료 후 메시지 오버레이 */}
                {showEndMessage && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-500 ease-in-out">
                    <div className="text-center animate-fade-in">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        스마트한 독서
                      </h3>
                      <p className="text-xl text-indigo-600 font-semibold">
                        SEEQ와 함께하세요
                      </p>
                      <div className="mt-4 flex justify-center">
                        <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 플로팅 기능 카드들 */}
            <div className="absolute -left-4 top-16 bg-white rounded-lg shadow-xl p-3 transform -rotate-6 hover:rotate-0 transition-transform duration-300 border-2 border-indigo-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">실시간 인식</div>
                  <div className="text-xs text-gray-700 font-semibold">0.3초 반응</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-6 bottom-20 bg-white rounded-lg shadow-xl p-3 transform rotate-6 hover:rotate-0 transition-transform duration-300 border-2 border-purple-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">AI 분석</div>
                  <div className="text-xs text-gray-700 font-semibold">GPT-4 엔진</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
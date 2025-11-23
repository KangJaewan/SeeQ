import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Separator } from './separator';
import { Glasses, ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 구현에서는 여기서 API 호출을 하겠지만, 현재는 mock 처리
    console.log('Form submitted:', formData);

    if (isLogin) {
      // 로그인 성공 시 home 페이지로 이동
      alert('로그인 성공!');
      navigate('/home');
    } else {
      // 회원가입 성공 시
      alert('회원가입 성공!');
      setIsLogin(true); // 회원가입 후 로그인 모드로 전환
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      {/* 뒤로가기 버튼 */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="fixed top-4 left-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        메인으로
      </Button>

      <div className="w-full max-w-md">
        {/* 브랜드 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Glasses className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SEEQ MATE</h1>
          </div>
          <p className="text-gray-600 font-medium">
            {isLogin ? '스마트 학습의 시작' : '함께 시작해보세요'}
          </p>
        </div>

        {/* 로그인/회원가입 카드 */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-center text-xl">
              {isLogin ? '로그인' : '회원가입'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'SEEQ MATE 계정으로 로그인하세요' 
                : '새로운 계정을 만들어보세요'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 필드 (회원가입 시에만) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>이름</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* 이메일 필드 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>이메일</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              {/* 비밀번호 필드 */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span>비밀번호</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자리 이상 입력해주세요"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* 비밀번호 확인 필드 (회원가입 시에만) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span>비밀번호 확인</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* 로그인 시 추가 옵션 */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-gray-600">로그인 상태 유지</span>
                  </label>
                  <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    비밀번호 찾기
                  </a>
                </div>
              )}

              {/* 제출 버튼 */}
              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg"
              >
                {isLogin ? '로그인' : '회원가입'}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">또는</span>
              </div>
            </div>

            {/* 소셜 로그인 버튼들 */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  alert('Google 로그인 성공!');
                  navigate('/home');
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 {isLogin ? '로그인' : '가입하기'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  alert('Facebook 로그인 성공!');
                  navigate('/home');
                }}
              >
                <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook으로 {isLogin ? '로그인' : '가입하기'}
              </Button>
            </div>

            {/* 모드 전환 */}
            <div className="text-center pt-4">
              <span className="text-gray-600">
                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
              </span>
              <Button
                type="button"
                variant="link"
                onClick={toggleMode}
                className="ml-2 p-0 h-auto text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {isLogin ? '회원가입' : '로그인'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 추가 정보 */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            {isLogin ? '로그인' : '가입'}하시면{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">이용약관</a>과{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
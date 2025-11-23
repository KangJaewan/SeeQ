import { ArrowRightIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import QuizChoiceMultiple from "./QuizCard/QuizChoiceMultiple";
import QuizChoiceShortAnswer from "./QuizCard/QuizChoiceShortAnswer";
import QuizChoiceTrueFalse from "./QuizCard/QuizChoiceTrueFalse";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ScorePopupA from "../../../../components/Popup/ScorePopupA";
import QuizLoadingScreen from "./QuizLoadingScreen";
import QuizStartScreen from "./QuizStartScreen";
import QuizSolveScreen from "./QuizSolveScreen";

interface QuizListSectionProps {
  onQuizSubmitted?: () => void;
}

export const QuizListSection = ({ onQuizSubmitted }: QuizListSectionProps): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const fallbackFolderId = "683e8fd3a7d860028b795845"; // TODO: Replace with real folderId from props or router
  const location = useLocation();
  const state = location.state || {};
  const count = typeof state.quizCount === "number" ? state.quizCount : 10;
  const folderId = state.folderId || fallbackFolderId;
  const quizzes = state.quizzes || [];
  const [quizList, setQuizList] = useState(quizzes);
  const [answers, setAnswers] = useState<any[]>([]);
  const [startQuiz, setStartQuiz] = useState(false);
  
  const checkAnswer = (quiz: any, selected: string | number | null): boolean => {
    if (!quiz || selected === null || selected === undefined) return false;

    switch (quiz.quiz_type) {
      case "multiple_choice":
      case "true_false":
        return selected === quiz.correct_option;

      case "short_answer":
        return (
          typeof selected === "string" &&
          selected.trim().toLowerCase() === quiz.correct_answer.trim().toLowerCase()
        );

      default:
        return false;
    }
  };

  useEffect(() => {
    // 오직 state로 전달된 새 퀴즈만 사용 (기존 퀴즈 조회 안 함)
    if (state.quizzes && Array.isArray(state.quizzes) && state.quizzes.length > 0) {
      const isValid = state.quizzes.every((q: any) => q.question && q.quiz_type);
      if (isValid) {
        console.log("✅ 새로 생성된 퀴즈 로드 완료:", state.quizzes.length);
        setQuizList(state.quizzes);
        setLoading(false);
        return;
      } else {
        console.warn("⚠️ 전달된 state.quizzes에 유효하지 않은 항목이 있습니다.");
        setQuizList([]);
        setLoading(false);
      }
    } else {
      // state.quizzes가 없으면 빈 배열 (기존 퀴즈 불러오지 않음)
      console.log("⚠️ 전달된 퀴즈가 없습니다. 먼저 퀴즈를 생성해주세요.");
      setQuizList([]);
      setLoading(false);
    }
  }, [state.quizzes]);
  
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startTime !== null) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTime]);
  
  // 퀴즈 시작 버튼 눌렀을 때
  const handleStartQuiz = () => {
    setStartTime(Date.now());
  };

  // Dynamic quiz header info
  const totalQuizzes = quizList.length;

  const submitAnswers = async (submissionPayload: any) => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setFinalTime(elapsedTime); // capture final time before submitting
      const response = await axios.post("http://localhost:8000/quiz-qa/submit", submissionPayload);
      console.log("제출 결과:", response.data);
      setShowPopup(true);

      // 제출 성공 시 퀴즈 히스토리 자동 새로고침
      if (onQuizSubmitted) {
        onQuizSubmitted();
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        console.error("❗️422 오류 - 유효성 검증 실패:", error.response.data.detail);
      } else {
        console.error("제출 오류:", error);
      }
    }
  };

  if (loading) {
    return <QuizLoadingScreen />;
  }

  // 퀴즈가 없으면 생성 안내 화면 표시
  if (!quizList || quizList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6 relative">
            {/* 왼쪽 화살표 애니메이션 */}
            <div className="absolute -left-24 top-1/2 -translate-y-1/2">
              <svg
                className="w-16 h-16 text-indigo-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </div>

            <svg
              className="w-20 h-20 mx-auto text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-700 mb-3">퀴즈를 생성해주세요</h2>
          <p className="text-gray-500 text-sm mb-2">
            왼쪽 패널에서 원하는 설정을 선택하고
          </p>
          <p className="text-gray-500 text-sm mb-6">
            <span className="font-semibold text-indigo-600">"퀴즈 생성하기"</span> 버튼을 눌러주세요
          </p>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-xs text-indigo-700">
              💡 <span className="font-semibold">Tip:</span> 출제 범위를 선택하면 더 정확한 퀴즈가 생성됩니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!startQuiz) {
    return <QuizStartScreen onStart={() => {
      setStartTime(Date.now());
      setStartQuiz(true);
    }} />;
  }

  return (
    <>
      <QuizSolveScreen
        quizList={quizList}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        checkAnswer={checkAnswer}
        answers={answers}
        setAnswers={setAnswers}
        elapsedTime={elapsedTime}
        submitAnswers={submitAnswers}
        startTime={startTime}
        setStartTime={setStartTime}
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        isSubmitted={isSubmitted}
        setIsSubmitted={setIsSubmitted}
        folderId={folderId}
        state={state}
        setFinalTime={setFinalTime}
      />
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 hover:cursor-pointer">
          <ScorePopupA
            correctCount={answers.filter((a) => a.user_answer === a.correct_answer).length}
            totalCount={answers.length}
            elapsedTime={finalTime}
            onClose={() => setShowPopup(false)}
          />
        </div>
      )}
    </>
  );
};

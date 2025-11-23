import React, { useEffect } from "react";
import QuizChoiceMultiple from "./QuizCard/QuizChoiceMultiple";
import QuizChoiceTrueFalse from "./QuizCard/QuizChoiceTrueFalse";
import QuizChoiceShortAnswer from "./QuizCard/QuizChoiceShortAnswer";
import { Button } from "../../../../components/ui/button";

interface QuizSolveScreenProps {
  quizList: any[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  selectedOption: any;
  setSelectedOption: (option: any) => void;
  checkAnswer: (quiz: any, selected: any) => boolean;
  answers: any[];
  setAnswers: (answers: any[]) => void;
  elapsedTime: number;
  submitAnswers: (payload: any) => void;
  startTime: number | null;
  setStartTime: (time: number) => void;
  showPopup: boolean;
  setShowPopup: (show: boolean) => void;
  isSubmitted: boolean;
  setIsSubmitted: (v: boolean) => void;
  folderId: string;
  state: any;
  setFinalTime: (time: number) => void;
}

const QuizSolveScreen: React.FC<QuizSolveScreenProps> = ({
  quizList,
  currentIndex,
  setCurrentIndex,
  selectedOption,
  setSelectedOption,
  checkAnswer,
  answers,
  setAnswers,
  elapsedTime,
  submitAnswers,
  startTime,
  setStartTime,
  showPopup,
  setShowPopup,
  isSubmitted,
  setIsSubmitted,
  folderId,
  state,
  setFinalTime,
}) => {
  const currentQuiz = quizList[currentIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime !== null) {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        setFinalTime(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, setFinalTime]);

  const handleAnswer = () => {
    const answerRecord = {
      question_id: currentQuiz.quiz_id ?? currentQuiz.id ?? currentQuiz.question_id ?? `quiz-${currentIndex}`,
      question_text: currentQuiz.question ?? "질문 없음",
      quiz_type: currentQuiz.quiz_type,
      selected_option: selectedOption,
      timestamp: new Date().toISOString(),
      is_correct: checkAnswer(currentQuiz, selectedOption),
      user_answer:
        currentQuiz.quiz_type === "multiple_choice" || currentQuiz.quiz_type === "true_false"
          ? currentQuiz.options?.[selectedOption]
          : selectedOption,
      correct_answer:
        currentQuiz.quiz_type === "multiple_choice" || currentQuiz.quiz_type === "true_false"
          ? currentQuiz.options?.[currentQuiz.correct_option]
          : currentQuiz.correct_answer ?? "정답 없음",
      options: currentQuiz.options || [],
      quiz_options: currentQuiz.options || [],
    };
    const updatedAnswers = [...answers, answerRecord];
    setAnswers(updatedAnswers);
    setSelectedOption(null);
    if (currentIndex + 1 < quizList.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAnswers({
        answers: updatedAnswers,
        folder_id : folderId ,
        quiz_topic: currentQuiz.quiz_topic ?? currentQuiz.quizTopic ?? state.topic ?? "default"
      });
      setShowPopup(true);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 text-sm text-gray-500">
        경과 시간: {elapsedTime}초
      </div>

      <div className="w-full max-w-2xl bg-white p-6 rounded shadow">
        <div className="text-base font-medium text-gray-800 mb-4">
          문제 {currentIndex + 1} / {quizList.length}
        </div>
        <p className="text-lg font-semibold mb-4">
          {currentQuiz.question ?? "⚠️ 문제 없음"}
        </p>

        {currentQuiz.quiz_type === "multiple_choice" && (
          <QuizChoiceMultiple quiz={currentQuiz} onSelect={setSelectedOption} />
        )}
        {currentQuiz.quiz_type === "true_false" && (
          <QuizChoiceTrueFalse quiz={currentQuiz} onSubmitAnswer={setSelectedOption} />
        )}
        {currentQuiz.quiz_type === "short_answer" && (
          <QuizChoiceShortAnswer quiz={currentQuiz} onSubmitAnswer={setSelectedOption} />
        )}

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => {
              // For short answer, ensure selectedOption is not empty string or null
              if (
                selectedOption === null ||
                (currentQuiz.quiz_type === "short_answer" &&
                  (selectedOption === "" || selectedOption == null))
              ) {
                return;
              }
              handleAnswer();
            }}
            disabled={
              isSubmitted ||
              selectedOption === null ||
              (currentQuiz.quiz_type === "short_answer" &&
                (selectedOption === "" || selectedOption == null))
            }
          >
            {isSubmitted ? "제출 완료" : currentIndex + 1 === quizList.length ? "제출하기" : "다음"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizSolveScreen;

import React, { useState, useEffect } from "react";

interface QuizChoiceShortAnswerProps {
  quiz: {
    correct_answer?: string;
    explanation?: string;
  };
  onSubmitAnswer: (answer: string) => void;
}

const QuizChoiceShortAnswer: React.FC<QuizChoiceShortAnswerProps> = ({ quiz, onSubmitAnswer }) => {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [quiz]);

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="여기에 답을 입력하세요"
        value={answer}
        onChange={(e) => {
          const newValue = e.target.value;
          setAnswer(newValue);
          onSubmitAnswer(newValue);
        }}
        className="p-2 border rounded"
      />
    </div>
  );
};

export default QuizChoiceShortAnswer;
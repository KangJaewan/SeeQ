import React, { useState, useEffect } from "react";

interface QuizChoiceTrueFalseProps {
  quiz: {
    correct_option?: number; // 0 for O, 1 for X
    explanation?: string;
  };
  onSubmitAnswer: (value: number) => void;
}

const QuizChoiceTrueFalse: React.FC<QuizChoiceTrueFalseProps> = ({ quiz, onSubmitAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [quiz]);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <button
          className={`p-2 border rounded ${selected === 0 ? "bg-blue-200" : ""}`}
          onClick={() => {
            setSelected(0);
            onSubmitAnswer(0);
          }}
        >
          O (참)
        </button>
        <button
          className={`p-2 border rounded ${selected === 1 ? "bg-blue-200" : ""}`}
          onClick={() => {
            setSelected(1);
            onSubmitAnswer(1);
          }}
        >
          X (거짓)
        </button>
      </div>
      {quiz.correct_option !== undefined && (
        <div className="mt-2 text-sm text-green-700">

        </div>
      )}
      {quiz.explanation && (
        <div className="text-sm text-gray-600"></div>
      )}
    </div>
  );
};

export default QuizChoiceTrueFalse;
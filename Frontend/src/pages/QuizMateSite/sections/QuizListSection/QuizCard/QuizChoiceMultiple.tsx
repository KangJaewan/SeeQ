import React, { useEffect, useState } from "react";

interface QuizChoiceMultipleProps {
  quiz: {
    quiz_options?: string[];
    options?: string[];
    correct_option?: number;
    explanation?: string;
    document_id?: string;
    topic?: string;
  };
  onSelect?: (index: number) => void;
  showAnswer?: boolean;
}

const QuizChoiceMultiple: React.FC<QuizChoiceMultipleProps> = ({ quiz, onSelect, showAnswer }) => {
  const options = quiz.quiz_options || quiz.options || [];
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [quiz]);

  const handleSelect = (index: number) => {
    setSelected(index);
    onSelect?.(index);
  };

  return (
    <div className="flex flex-col gap-2">
      {options?.map((option, index) => (
        <div
          key={index}
          onClick={() => handleSelect(index)}
          className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
            selected === index ? "bg-indigo-100 border-indigo-500" : ""
          }`}
        >
          <span className="font-semibold">{index + 1}.</span>
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
};

export default QuizChoiceMultiple;
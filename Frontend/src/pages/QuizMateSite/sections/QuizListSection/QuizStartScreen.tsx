import React from "react";
import { Button } from "../../../../components/ui/button";

interface QuizStartScreenProps {
  onStart: () => void;
}

const QuizStartScreen: React.FC<QuizStartScreenProps> = ({ onStart }) => {
  return (
    <div className="text-center mt-10">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">퀴즈를 시작할 준비가 되셨나요?</h2>
      <Button
        className="h-11 px-6 font-normal text-sm text-white bg-indigo-600 rounded-lg"
        onClick={onStart}
      >
        퀴즈 시작하기
      </Button>
    </div>
  );
};

export default QuizStartScreen;
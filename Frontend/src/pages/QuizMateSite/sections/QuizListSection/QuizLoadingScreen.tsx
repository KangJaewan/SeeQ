import React from "react";

const QuizLoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[300px] space-y-4">
      <img
        src="/seeq_doll_good.png"
        alt="SeeQ Doll"
        className="w-24 h-24 animate-spin-slow"
      />
      <p className="text-gray-500 text-lg animate-pulse">퀴즈를 생성 중입니다...</p>
    </div>
  );
};

export default QuizLoadingScreen;
import { MoreHorizontalIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../../../components/ui/card";
import Quizpopup from "../../../../components/Popup/Quizpopup";

interface QuizRecord {
  session_id: string;
  folder_id?: string;
  quiz_topic: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  total_score: number;
  percentage: number;
  submitted_at: string;
}

interface QuizSubmission {
  question_id: string;
  question_text: string;
  quiz_type: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  score: number;
  options?: string[] | null;
  time_spent?: number | null;
  question_order: number;
  created_at: string;
}

type QuizResultItem = {
  question_id: string;
  question_text?: string;
  quiz_type?: string;
  user_answer?: string;
  correct_answer?: string;
  is_correct?: boolean;
  score?: number;
  options?: string[] | null;
  quiz_options?: string[] | null;
  quizOptions?: string[] | null;
  time_spent?: number | null;
  question_order?: number;
  created_at?: string;
  [k: string]: any;
};

type QuizSessionPayload = {
  session_id?: string;
  folder_id?: string;
  quiz_topic?: string;
  total_questions?: number;
  correct_answers?: number;
  wrong_answers?: number;
  total_score?: number;
  percentage?: number;
  submitted_at?: string;
  results?: QuizResultItem[];
  [k: string]: any;
};

const normalizeOptions = (sub: QuizResultItem): QuizResultItem => {
  const opts = sub.options ?? sub.quiz_options ?? sub.quizOptions ?? [];
  return {
    ...sub,
    options: Array.isArray(opts) ? opts : [],
  };
};

const normalizeRecord = (raw: Partial<QuizRecord> & Partial<QuizSessionPayload>): QuizRecord => {
  const total_questions = Number(raw.total_questions ?? 0);
  const wrong_answers = Number(raw.wrong_answers ?? 0);
  const correct_answers =
    raw.correct_answers !== undefined
      ? Number(raw.correct_answers)
      : Math.max(0, total_questions - wrong_answers);
  const percentage =
    raw.percentage !== undefined
      ? Number(raw.percentage)
      : total_questions > 0
        ? Math.round((correct_answers / total_questions) * 100)
        : 0;

  return {
    session_id: String(raw.session_id ?? ""),
    folder_id: raw.folder_id,
    quiz_topic: String(raw.quiz_topic ?? ""),
    total_questions,
    correct_answers,
    wrong_answers,
    total_score: Number(raw.total_score ?? 0),
    percentage,
    submitted_at: String(raw.submitted_at ?? ""),
  };
};

interface QuizViewSectionProps {
  refreshTrigger?: number;
}

export const QuizViewSection = ({ refreshTrigger }: QuizViewSectionProps): JSX.Element => {
  const [quizHistoryData, setQuizHistoryData] = useState<QuizRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizSubmission[] | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const fetchQuizDetails = async (sessionId: string) => {
    try {
      setLoading(true);
      const res = await axios.get<QuizSessionPayload | QuizResultItem[]>(
        `http://localhost:8000/quiz-qa/sessions/${sessionId}`
      );
      console.log("✅ 세션 상세 응답 데이터:", res.data);

      // 응답 형태 정규화 (객체/배열 모두 허용)
      const payload: QuizSessionPayload = Array.isArray(res.data)
        ? { session_id: sessionId, results: res.data as QuizResultItem[] }
        : (res.data as QuizSessionPayload);

      const rawResults = Array.isArray(payload.results) ? payload.results : [];
      const normalizedResults: QuizSubmission[] = rawResults.map((sub: any) => {
        const withOptions = normalizeOptions(sub);
        return {
          question_id: String(withOptions.question_id),
          question_text: String(withOptions.question_text ?? ""),
          quiz_type: String(withOptions.quiz_type ?? ""),
          user_answer: String(withOptions.user_answer ?? ""),
          correct_answer: String(withOptions.correct_answer ?? ""),
          is_correct:
            withOptions.is_correct !== undefined
              ? Boolean(withOptions.is_correct)
              : withOptions.user_answer === withOptions.correct_answer,
          score: Number(withOptions.score ?? 0),
          options: withOptions.options ?? [],
          time_spent: withOptions.time_spent ?? null,
          question_order: Number(withOptions.question_order ?? 0),
          created_at: String(withOptions.created_at ?? ""),
        };
      });

      setSelectedSessionId(payload.session_id ?? sessionId);
      setQuizDetails(normalizedResults);
      setShowPopup(true);
    } catch (error) {
      console.error("❌ 퀴즈 세션 상세 내역 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/quiz-qa/records", {
          params: { offset, limit }
        });
        const normalized = (Array.isArray(res.data) ? res.data : []).map((r: any) => normalizeRecord(r));
        setQuizHistoryData((prev) => {
          const newRecords = normalized.filter(
            (newItem) => !prev.some((item) => item.session_id === newItem.session_id)
          );
          return [...prev, ...newRecords];
        });
        setLoading(false);
      } catch (error) {
        console.error("퀴즈 기록 불러오기 실패:", error);
        setLoading(false);
      }
    };
    fetchHistory();
  }, [offset]);

  // refreshTrigger 변경 시 자동 새로고침
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      const autoRefresh = async () => {
        try {
          setLoading(true);
          const res = await axios.get("http://localhost:8000/quiz-qa/records", {
            params: { offset: 0, limit }
          });
          const normalized = (Array.isArray(res.data) ? res.data : []).map((r: any) => normalizeRecord(r));
          setQuizHistoryData(normalized);
          setOffset(0);
        } catch (error) {
          console.error("❌ 자동 새로고침 실패:", error);
        } finally {
          setLoading(false);
        }
      };
      autoRefresh();
    }
  }, [refreshTrigger]);

  return (
    <Card className="w-80 bg-white rounded-2xl shadow-[0px_8px_32px_#00000020]">
      <div className="relative pt-[13px] pb-4 flex flex-col items-center">
        <img
          className="w-6 h-6 mb-4"
          alt="Quiz history icon"
          src="/image-47.png"
        />
        <div className="text-center">
          <p className="font-normal text-sm text-black leading-[16.8px] font-['Inter',Helvetica]">
            이전 퀴즈 기록
          </p>
        </div>
      </div>

      <CardContent
        className="p-3.5 max-h-[500px] overflow-auto"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
            setOffset((prev) => prev + limit);
          }
        }}
      >
        {quizHistoryData.map((quiz) => (
          <div
            key={quiz.session_id}
            className="w-full bg-gray-50 rounded-md p-3 relative"
            onClick={() => fetchQuizDetails(quiz.session_id)}
          >
            <div className="flex">
              <img
                className="w-[27px] h-[27px] object-cover"
                alt="Quiz thumbnail"
                src="/image-48.png"
              />
              <div className="flex flex-col ml-[22px] gap-1 w-[198px]">
                <p className="font-normal text-sm text-gray-900 leading-[19.6px] font-['Inter',Helvetica]">
                  {quiz.quiz_topic}
                </p>
                <p className="font-normal text-xs text-gray-400 leading-[14.4px] font-['Inter',Helvetica]">
                  {new Date(quiz.submitted_at).toLocaleDateString("ko-KR")}
                </p>
                <p className="font-normal text-xs text-gray-600 leading-[14.4px] font-['Inter',Helvetica]">
                  문제 수: {quiz.total_questions} / 정답: {quiz.correct_answers} / 오답: {quiz.wrong_answers}
                </p>
                <p className="font-normal text-xs text-gray-600 leading-[14.4px] font-['Inter',Helvetica]">
                  정답률 : ({quiz.percentage}%)
                </p>
              </div>
            </div>
            <button className="absolute top-3 right-3">
              <MoreHorizontalIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </CardContent>
      {showPopup && quizDetails && (
        <Quizpopup
          quizResults={quizDetails}
          onClose={() => {
            setShowPopup(false);
            setQuizDetails(null);
          }}
        />
      )}
    </Card>
  );
};

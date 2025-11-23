import { ZapIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

interface QuizSelectionSectionProps {
  folderId?: string;
  folderTitle?: string; 
}

export const QuizSelectionSection = ({ folderId }: QuizSelectionSectionProps): JSX.Element => {
  const [selectedQuizType, setSelectedQuizType] = useState("multiple_choice");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [selectedCount, setSelectedCount] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [folderTitle, setFolderTitle] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ file_id: string; created_time: string }[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showDocuments, setShowDocuments] = useState(true); // 기본으로 펼쳐두기

  const navigate = useNavigate();
  const location = useLocation();
  const documentIds = selectedDocs;

  useEffect(() => {
    if (!folderId) {
      console.log("folderId 없음")
      return;
    }

    const fetchFolderTitle = async () => {
      try {
        console.log("요청 시작:", folderId)
        const res = await axios.get(`http://localhost:8000/folders/${folderId}`);
        setFolderTitle(res.data?.title || "제목 없음");
        setTopic(res.data?.topic || "");
      } catch (err) {
        console.error("폴더 제목 불러오기 실패:", err);
        setFolderTitle("알 수 없음");
      }
    };

    fetchFolderTitle();
  }, [folderId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get("http://localhost:8000/documents/documents", {
          params: { folder_id: folderId }
        });

        res.data.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setDocuments(res.data.map((doc: any) => ({
          file_id: doc.file_metadata.file_id,
          created_time: doc.created_at
        })));
      } catch (err) {
        console.error("문서 목록 불러오기 실패:", err);
      }
    };
    fetchDocuments();
  }, [folderId]);

  useEffect(() => {
    const fetchTopicFromLabels = async () => {
      if (documentIds.length === 0) {
        console.log("문서 선택 안됨. 요청 스킵됨");
        return;
      }
      try {
        console.log("토픽 요청 중... 선택된 문서:", documentIds);
        const res = await axios.get("http://localhost:8000/labels/labels/topic", {
          params: { document_ids: documentIds },
          paramsSerializer: (params) =>
            params.document_ids.map((id: string) => `document_ids=${id}`).join("&")
        });
        console.log("토픽 응답:", res.data);
        setTopic(res.data.topic || "");
      } catch (err) {
        console.error("topic 조회 실패", err);
      }
    };
  
    fetchTopicFromLabels();
  }, [documentIds]);

  // Quiz type options data
  const quizTypes = [
    {
      id: "multiple_choice",
      title: "객관식",
      description: "4개 선택지 중 정답 선택",
    },
    {
      id: "short_answer",
      title: "단답형",
      description: "짧은 답안 직접 입력",
    },
    {
      id: "true_false",
      title: "OX 퀴즈",
      description: "참/거짓 판단 문제",
    },
  ];

  // Difficulty options
  const difficultyOptions = [
    { id: "easy", label: "쉬움", color: "bg-emerald-500" },
    { id: "medium", label: "보통", color: "bg-[#2600ff]" },
    { id: "hard", label: "어려움", color: "bg-[#ff3c3cc4]" },
  ];

  const handleGenerateQuiz = async () => {
    try {
      setIsLoading(true);
      
      // folder_id는 selectedScope가 'folder'일 때만 전송
      const effectiveFolderId = folderId ?? "683e9a9a324d04898ae63f63";
      const requestData = {
        quiz_type: selectedQuizType,
        difficulty: selectedDifficulty,
        count: parseInt(selectedCount),
        folder_id: effectiveFolderId,
        document_ids: documentIds,
        topic,
        source_document_id: documents[0]?.file_id,
        force_regenerate: true, // ✅ Always generate new quizzes
      };

      console.log('Sending quiz request:', requestData);  // 요청 데이터 로깅
      
      // FastAPI 서버 URL로 수정
      const response = await axios.post("http://localhost:8000/quiz", requestData);
      console.log("Generated quiz:", response.data);
      navigate("/quiz", {
        state: {
          start: true,
          quizCount: parseInt(selectedCount),
          folderId: folderId,
          quizType: selectedQuizType,
          difficulty: selectedDifficulty,
          quizzes: response.data.quizzes,
          topic,  // ✅ add topic here
        },
      });
      
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      // TODO: 에러 처리
    } finally {
      setIsLoading(false);
    }
  };

  if (!folderId) {
    return <div className="p-5 text-center text-gray-500">❗ 폴더가 선택되지 않았습니다.</div>;
  }

  return (
    <div className="flex w-full items-start gap-6 py-5">
      <Card className="w-full border border-slate-200 rounded-xl">
        <CardContent>
          <div className="flex flex-col items-start gap-5 p-5">
          <h2 className="font-bold text-slate-800 text-lg leading-[21.6px] [font-family:'Inter',Helvetica] tracking-[0]">
            퀴즈 유형 선택
          </h2>

          <div className="w-full space-y-3">
            {quizTypes.map((type) => (
              <div
                key={type.id}
                className={`flex h-12 items-center gap-3 p-3 relative w-full rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedQuizType === type.id
                    ? "bg-indigo-50 border-2 border-indigo-600 shadow-sm ring-2 ring-offset-2 ring-indigo-300"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 opacity-60 hover:opacity-80"
                }`}
                onClick={() => setSelectedQuizType(type.id)}
              >
                <div className="flex flex-col items-start gap-0.5 flex-1">
                  <span className="self-stretch font-normal text-slate-800 [font-family:'Inter',Helvetica] text-sm tracking-[0] leading-[16.8px]">
                    {type.title}
                  </span>
                  <span className="self-stretch [font-family:'Inter',Helvetica] font-normal text-gray-500 text-xs tracking-[0] leading-[14.4px]">
                    {type.description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="font-bold text-slate-800 text-lg tracking-[0] leading-[21.6px] [font-family:'Inter',Helvetica]">
            퀴즈 설정
          </h2>

          <div className="flex flex-col items-start gap-3 w-full">
            <div className="flex flex-col items-start gap-2 w-full">
              <label className="font-normal text-gray-700 text-sm tracking-[0] leading-[16.8px] [font-family:'Inter',Helvetica]">
                문제 개수
              </label>
              <Select value={selectedCount} onValueChange={setSelectedCount}>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-lg">
                  <SelectValue placeholder="5개" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5개</SelectItem>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="15">15개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-start gap-2 w-full">
              <label className="font-normal text-gray-700 text-sm tracking-[0] leading-[16.8px] [font-family:'Inter',Helvetica]">
                난이도
              </label>
              <div className="flex items-center gap-1 w-full">
                {difficultyOptions.map((option) => (
                  <Badge
                    key={option.id}
                    className={`h-8 px-3 py-1.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedDifficulty === option.id
                        ? `${option.color} hover:${option.color} ring-2 ring-offset-2 ring-indigo-300`
                        : `${option.color} hover:${option.color} opacity-60 hover:opacity-80`
                    }`}
                    onClick={() => setSelectedDifficulty(option.id)}
                  >
                    <span className="font-medium text-white text-xs leading-[14.4px] [font-family:'Inter',Helvetica] tracking-[0]">
                      {option.label}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 w-full">
              <div
                className="flex items-center justify-between w-full cursor-pointer"
                onClick={() => setShowDocuments(!showDocuments)}
              >
                <label className="font-normal text-gray-700 text-sm leading-[16.8px] [font-family:'Inter',Helvetica]">
                  출제 범위 {showDocuments ? "▲" : "▼"}
                </label>
              </div>

              {showDocuments && (
                <ul className="border rounded-md p-2 max-h-60 overflow-auto bg-white w-full shadow-sm text-sm text-gray-700">
                  {documents.map((doc) => {
                    const createdTime = doc.created_time ? new Date(doc.created_time) : null;
                    return (
                      <li
                        key={doc.file_id}
                        className={`py-2 px-3 border-b cursor-pointer transition-all duration-150 ${
                          selectedDocs.includes(doc.file_id)
                            ? "bg-indigo-100 text-indigo-700 font-semibold"
                            : "hover:bg-slate-100"
                        }`}
                        onClick={() =>
                          setSelectedDocs((prev) =>
                            prev.includes(doc.file_id)
                              ? prev.filter((id) => id !== doc.file_id)
                              : [...prev, doc.file_id]
                          )
                        }
                      >
                        {createdTime ? createdTime.toLocaleString("ko-KR") : "날짜 없음"}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          </div>
          {/* 출제 범위 미선택 경고 */}
          {selectedDocs.length === 0 && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 font-medium">
                ⚠️ 출제 범위를 최소 1개 이상 선택해주세요
              </p>
            </div>
          )}

          <Button
            className="h-12 w-full bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGenerateQuiz}
            disabled={isLoading || !folderId || selectedDocs.length === 0}
          >
            <ZapIcon className="w-5 h-5 mr-2" />
            <span className="font-normal text-white text-base tracking-[0] leading-[19.2px] [font-family:'Inter',Helvetica]">
              {isLoading ? "생성 중..." : "퀴즈 생성하기"}
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
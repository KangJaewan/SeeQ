"""
보고서 생성 모듈
AI 기반 학술적 보고서 자동 생성
CREATED 2024-12-20: 폴더 기반 문서 분석 및 구조화된 보고서 생성
MODIFIED 2024-12-20: JSON 파싱 안정성 개선 - Markdown 코드블럭 처리 추가
"""
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import uuid
import asyncio
from openai import AsyncOpenAI
from config.settings import settings
from utils.logger import get_logger
from utils.json_parser import safe_json_loads

logger = get_logger(__name__)

class ReportGenerator:
    """학술적 보고서 자동 생성 클래스"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o-mini"
    
    async def generate_report(
        self,
        folder_id: str,
        selected_files: List[Dict],
        documents_content: List[str],
        custom_title: Optional[str] = None
    ) -> Dict:
        """
        선택된 문서들을 기반으로 학술적 보고서 생성
        
        Args:
            folder_id: 폴더 ID
            selected_files: 선택된 파일 정보 리스트
            documents_content: 문서 내용 리스트
            custom_title: 사용자 지정 제목 (선택사항)
        
        Returns:
            구조화된 보고서 데이터
        """
        try:
            logger.info(f"보고서 생성 시작 - 폴더: {folder_id}, 파일 수: {len(selected_files)}")
            
            # 1. 문서 내용 통합 및 분석
            combined_content = await self._combine_documents(documents_content)
            
            # 2. 주요 키워드 및 주제 분석
            analysis_result = await self._analyze_content(combined_content)
            
            # 3. 보고서 구조 생성
            if custom_title:
                title = custom_title
                subtitle = await self._generate_subtitle(title, analysis_result)
            else:
                title, subtitle = await self._generate_title_and_subtitle(analysis_result)
            
            # 4. 각 섹션 생성 (비동기 병렬 처리)
            tasks = [
                self._generate_introduction(analysis_result, title),
                self._generate_main_content(combined_content, analysis_result),
                self._generate_conclusion(analysis_result, title)
            ]
            
            introduction, main_content, conclusion = await asyncio.gather(*tasks)
            
            # 5. 보고서 메타데이터 생성
            metadata = await self._generate_metadata(
                selected_files, combined_content, introduction, main_content, conclusion
            )
            
            # 6. 최종 보고서 구조 생성
            report_data = {
                "report_id": str(uuid.uuid4()),
                "folder_id": folder_id,
                "title": title,
                "subtitle": subtitle,
                "selected_files": selected_files,
                "report_structure": {
                    "introduction": introduction,
                    "main_content": main_content,
                    "conclusion": conclusion
                },
                "analysis_summary": analysis_result,
                "metadata": metadata,
                "visual_format": {
                    "layout_type": "academic",
                    "include_charts": False,
                    "include_images": False,
                    "color_scheme": "professional"
                },
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            logger.info(f"보고서 생성 완료 - ID: {report_data['report_id']}")
            return report_data
            
        except Exception as e:
            logger.error(f"보고서 생성 실패: {e}")
            raise
    
    async def _combine_documents(self, documents_content: List[str]) -> str:
        """문서 내용들을 효율적으로 결합"""
        try:
            # 각 문서 내용을 구분자로 분리하여 결합
            combined = "\n\n=== 문서 구분 ===\n\n".join(documents_content)
            
            # 너무 긴 경우 요약 처리
            if len(combined) > 15000:  # 약 15K 문자 제한
                combined = await self._summarize_long_content(combined)
            
            return combined
            
        except Exception as e:
            logger.error(f"문서 결합 실패: {e}")
            raise
    
    async def _summarize_long_content(self, content: str) -> str:
        """긴 내용을 요약하여 처리 가능한 크기로 축소"""
        try:
            prompt = f"""
            다음 문서들의 내용을 주요 핵심 내용만 포함하여 요약해주세요.
            학술적 보고서 작성에 필요한 중요한 정보들을 중심으로 정리하세요.
            
            문서 내용:
            {content[:10000]}  # 첫 10K 문자만 사용
            
            요약 요구사항:
            - 주요 개념과 핵심 내용 보존
            - 데이터, 통계, 사실 정보 우선 보존
            - 학술적 맥락과 논리적 구조 유지
            - 5000자 이내로 요약
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"긴 내용 요약 실패: {e}")
            return content[:10000]  # 실패 시 첫 10K 문자만 반환
    
    async def _analyze_content(self, content: str) -> Dict:
        """문서 내용 분석 및 주요 주제 추출"""
        try:
            prompt = f"""
            다음 문서 내용을 분석하여 학술적 보고서 작성에 필요한 정보를 추출해주세요.
            
            문서 내용:
            {content}
            
            분석 항목:
            1. 주요 주제 (메인 주제 1개)
            2. 핵심 키워드 (5-10개)
            3. 주요 개념들 (3-5개)
            4. 문서의 전체적인 성격 (설명적, 분석적, 비교적 등)
            5. 학문 분야 또는 도메인
            
            JSON 형태로 답변해주세요:
            {{
                "main_topic": "주요 주제",
                "keywords": ["키워드1", "키워드2", ...],
                "key_concepts": ["개념1", "개념2", ...],
                "document_nature": "문서 성격",
                "academic_domain": "학문 분야"
            }}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000
            )
            
            result = safe_json_loads(response.choices[0].message.content, default={})
            if not result:
                logger.warning("내용 분석 JSON 파싱 실패")
                logger.error(f"LLM 응답: {response.choices[0].message.content}")
                return {
                    "main_topic": "종합 분석",
                    "keywords": ["분석", "연구", "내용"],
                    "key_concepts": ["주요 개념"],
                    "document_nature": "종합적",
                    "academic_domain": "일반"
                }
            return result
            
        except Exception as e:
            logger.error(f"내용 분석 실패: {e}")
            # 기본값 반환
            return {
                "main_topic": "종합 분석",
                "keywords": ["분석", "연구", "내용"],
                "key_concepts": ["주요 개념"],
                "document_nature": "종합적",
                "academic_domain": "일반"
            }
    
    async def _generate_title_and_subtitle(self, analysis: Dict) -> Tuple[str, str]:
        """제목과 부제목 생성"""
        try:
            prompt = f"""
            다음 분석 결과를 바탕으로 학술적 보고서의 제목과 부제목을 생성해주세요.
            
            분석 결과:
            - 주요 주제: {analysis['main_topic']}
            - 키워드: {', '.join(analysis['keywords'])}
            - 학문 분야: {analysis['academic_domain']}
            
            요구사항:
            - 제목: 간결하고 학술적이며 내용을 잘 표현하는 제목
            - 부제목: 제목을 보완하고 구체적인 내용을 암시하는 부제목
            - 한국어로 작성
            
            JSON 형태로 답변:
            {{
                "title": "보고서 제목",
                "subtitle": "보고서 부제목"
            }}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=500
            )
            
            result = safe_json_loads(response.choices[0].message.content, default={})
            if not result or "title" not in result or "subtitle" not in result:
                logger.warning("제목 생성 JSON 파싱 실패")
                logger.error(f"LLM 응답: {response.choices[0].message.content}")
                return f"{analysis['main_topic']} 분석 보고서", "종합적 연구 및 분석"
            return result["title"], result["subtitle"]
            
        except Exception as e:
            logger.error(f"제목 생성 실패: {e}")
            return f"{analysis['main_topic']} 분석 보고서", "종합적 연구 및 분석"
    
    async def _generate_subtitle(self, title: str, analysis: Dict) -> str:
        """사용자 지정 제목에 대한 부제목 생성"""
        try:
            prompt = f"""
            다음 제목에 어울리는 학술적 부제목을 생성해주세요.
            
            제목: {title}
            주요 주제: {analysis['main_topic']}
            키워드: {', '.join(analysis['keywords'])}
            
            부제목 요구사항:
            - 제목을 보완하고 구체화
            - 학술적 표현 사용
            - 한국어로 작성
            - 20자 내외
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"부제목 생성 실패: {e}")
            return "종합적 연구 및 분석"
    
    async def _generate_introduction(self, analysis: Dict, title: str) -> str:
        """서론 생성"""
        try:
            prompt = f"""
            다음 정보를 바탕으로 학술적 보고서의 서론을 작성해주세요.
            
            보고서 제목: {title}
            주요 주제: {analysis['main_topic']}
            키워드: {', '.join(analysis['keywords'])}
            학문 분야: {analysis['academic_domain']}
            
            서론 작성 요구사항:
            - 연구의 배경과 목적 제시
            - 주요 주제의 중요성 설명
            - 보고서의 구성과 범위 안내
            - 학술적 톤앤매너 유지
            - 3-4 문단, 300-500자 내외
            - 한국어로 작성
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=800
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"서론 생성 실패: {e}")
            return f"본 보고서는 {analysis['main_topic']}에 관한 종합적 분석을 제시합니다."
    
    async def _generate_main_content(self, content: str, analysis: Dict) -> Dict:
        """본론 생성 (여러 섹션으로 구성)"""
        try:
            prompt = f"""
            다음 문서 내용과 분석 결과를 바탕으로 학술적 보고서의 본론을 3개 섹션으로 구성해주세요.
            
            문서 내용:
            {content[:8000]}  # 토큰 제한 고려
            
            분석 결과:
            - 주요 주제: {analysis['main_topic']}
            - 핵심 개념: {', '.join(analysis['key_concepts'])}
            - 문서 성격: {analysis['document_nature']}
            
            본론 구성 요구사항:
            - 섹션 1: 현황 및 배경 분석
            - 섹션 2: 핵심 내용 및 주요 발견사항
            - 섹션 3: 시사점 및 의미 해석
            - 각 섹션별 500-800자 내외
            - 논리적 흐름과 연결성 유지
            - 구체적 내용과 예시 포함
            - 학술적 표현 사용
            
            JSON 형태로 답변:
            {{
                "section_1": {{
                    "title": "섹션1 제목",
                    "content": "섹션1 내용"
                }},
                "section_2": {{
                    "title": "섹션2 제목", 
                    "content": "섹션2 내용"
                }},
                "section_3": {{
                    "title": "섹션3 제목",
                    "content": "섹션3 내용"
                }}
            }}
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=2500
            )
            
            result = safe_json_loads(response.choices[0].message.content, default={})
            if not result or not all(f"section_{i}" in result for i in range(1, 4)):
                logger.warning("본론 생성 JSON 파싱 실패")
                logger.error(f"LLM 응답: {response.choices[0].message.content}")
                return {
                    "section_1": {
                        "title": "현황 분석",
                        "content": f"{analysis['main_topic']}의 현재 상황과 배경을 분석합니다."
                    },
                    "section_2": {
                        "title": "주요 내용",
                        "content": "핵심 내용과 주요 발견사항을 정리합니다."
                    },
                    "section_3": {
                        "title": "시사점",
                        "content": "분석 결과의 의미와 시사점을 제시합니다."
                    }
                }
            return result
            
        except Exception as e:
            logger.error(f"본론 생성 실패: {e}")
            # 기본 본론 구조 반환
            return {
                "section_1": {
                    "title": "현황 분석",
                    "content": f"{analysis['main_topic']}의 현재 상황과 배경을 분석합니다."
                },
                "section_2": {
                    "title": "주요 내용",
                    "content": "핵심 내용과 주요 발견사항을 정리합니다."
                },
                "section_3": {
                    "title": "시사점",
                    "content": "분석 결과의 의미와 시사점을 제시합니다."
                }
            }
    
    async def _generate_conclusion(self, analysis: Dict, title: str) -> str:
        """결론 생성"""
        try:
            prompt = f"""
            다음 정보를 바탕으로 학술적 보고서의 결론을 작성해주세요.
            
            보고서 제목: {title}
            주요 주제: {analysis['main_topic']}
            핵심 개념: {', '.join(analysis['key_concepts'])}
            
            결론 작성 요구사항:
            - 주요 발견사항 요약
            - 핵심 메시지 강조
            - 향후 과제나 제언 포함
            - 보고서의 의의와 기여도 언급
            - 3-4 문단, 300-500자 내외
            - 학술적 톤앤매너 유지
            - 한국어로 작성
            """
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=800
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"결론 생성 실패: {e}")
            return f"본 보고서를 통해 {analysis['main_topic']}에 대한 종합적 이해를 도모할 수 있었습니다."
    
    async def _generate_metadata(
        self,
        selected_files: List[Dict],
        content: str,
        introduction: str,
        main_content: Dict,
        conclusion: str
    ) -> Dict:
        """보고서 메타데이터 생성"""
        try:
            # 전체 보고서 길이 계산
            total_content = introduction + " ".join([
                section["content"] for section in main_content.values()
            ]) + conclusion
            
            word_count = len(total_content.replace(" ", ""))
            
            # 예상 페이지 수 계산 (한국어 기준 약 800자/페이지)
            estimated_pages = max(1, word_count // 800)
            
            return {
                "total_files": len(selected_files),
                "selected_files_count": len(selected_files),
                "total_pages": estimated_pages,
                "word_count": word_count,
                "character_count": len(total_content),
                "generation_model": self.model,
                "sections_count": len(main_content) + 2  # 서론 + 본론섹션들 + 결론
            }
            
        except Exception as e:
            logger.error(f"메타데이터 생성 실패: {e}")
            return {
                "total_files": len(selected_files),
                "selected_files_count": len(selected_files),
                "total_pages": 1,
                "word_count": 1000,
                "character_count": 1000,
                "generation_model": self.model,
                "sections_count": 5
            }
    
    async def generate_academic_report(
        self,
        file_contents: List[Dict],
        folder_title: str,
        custom_title: Optional[str] = None
    ) -> Dict:
        """
        새로운 학술적 보고서 생성 메서드 (reports.py에서 호출)
        
        Args:
            file_contents: 파일 내용 리스트 [{"file_id", "filename", "content", "file_type"}]
            folder_title: 폴더 제목
            custom_title: 사용자 지정 제목 (선택사항)
        
        Returns:
            구조화된 보고서 데이터
        """
        try:
            logger.info(f"학술적 보고서 생성 시작 - 폴더: {folder_title}, 파일 수: {len(file_contents)}")
            
            # 1. 문서 내용 통합
            documents_content = [file_data["content"] for file_data in file_contents]
            combined_content = await self._combine_documents(documents_content)
            
            # 2. 내용 분석
            analysis_result = await self._analyze_content(combined_content)
            
            # 3. 제목 및 부제목 생성
            if custom_title:
                title = custom_title
                subtitle = await self._generate_subtitle(title, analysis_result)
            else:
                title, subtitle = await self._generate_title_and_subtitle(analysis_result)
            
            # 4. 각 섹션 생성 (병렬 처리)
            tasks = [
                self._generate_introduction(analysis_result, title),
                self._generate_main_content(combined_content, analysis_result),
                self._generate_conclusion(analysis_result, title)
            ]
            
            introduction, main_content, conclusion = await asyncio.gather(*tasks)
            
            # 5. 메타데이터 생성
            selected_files = [
                {
                    "file_id": file_data["file_id"],
                    "filename": file_data["filename"],
                    "file_type": file_data["file_type"]
                }
                for file_data in file_contents
            ]
            
            metadata = await self._generate_metadata(
                selected_files, combined_content, introduction, main_content, conclusion
            )
            
            # 6. 최종 보고서 구조 생성
            report_data = {
                "title": title,
                "subtitle": subtitle,
                "structure": {
                    "introduction": introduction,
                    "main_content": main_content,
                    "conclusion": conclusion
                },
                "analysis_summary": analysis_result,
                "metadata": metadata
            }
            
            logger.info(f"학술적 보고서 생성 완료 - 제목: {title}")
            return report_data
            
        except Exception as e:
            import traceback
            logger.error(f"학술적 보고서 생성 실패: {e}")
            logger.error(f"상세 오류: {traceback.format_exc()}")
            raise

    async def format_report_text(self, report_data: Dict) -> str:
        """보고서를 읽기 쉬운 텍스트 형태로 포맷팅"""
        try:
            formatted_text = f"""
# {report_data['title']}
## {report_data['subtitle']}

---

### 📋 보고서 정보
- **생성일**: {report_data['created_at'].strftime('%Y년 %m월 %d일')}
- **대상 파일 수**: {report_data['metadata']['selected_files_count']}개
- **예상 페이지**: {report_data['metadata']['total_pages']}페이지
- **총 문자 수**: {report_data['metadata']['character_count']:,}자

---

## 1. 서론

{report_data['report_structure']['introduction']}

---

## 2. 본론

### 2.1 {report_data['report_structure']['main_content']['section_1']['title']}

{report_data['report_structure']['main_content']['section_1']['content']}

### 2.2 {report_data['report_structure']['main_content']['section_2']['title']}

{report_data['report_structure']['main_content']['section_2']['content']}

### 2.3 {report_data['report_structure']['main_content']['section_3']['title']}

{report_data['report_structure']['main_content']['section_3']['content']}

---

## 3. 결론

{report_data['report_structure']['conclusion']}

---

### 📊 분석 요약
- **주요 주제**: {report_data['analysis_summary']['main_topic']}
- **핵심 키워드**: {', '.join(report_data['analysis_summary']['keywords'])}
- **학문 분야**: {report_data['analysis_summary']['academic_domain']}

### 📁 참조 파일 목록
"""
            
            for i, file_info in enumerate(report_data['selected_files'], 1):
                formatted_text += f"{i}. {file_info['filename']} ({file_info['file_type'].upper()})\n"
            
            return formatted_text
            
        except Exception as e:
            logger.error(f"보고서 텍스트 포맷팅 실패: {e}")
            return "보고서 포맷팅 중 오류가 발생했습니다." 
# SEEQ - AI 기반 학습 플랫폼

SEEQ는 RAG(Retrieval-Augmented Generation) 기술을 활용한 AI 학습 플랫폼입니다. 문서 업로드, 퀴즈 생성, 요약, 키워드 추출, 마인드맵 생성 등의 기능을 제공합니다.

## 프로젝트 구조

```
SEEQ/
├── Backend/          # FastAPI 기반 RAG 백엔드
├── Frontend/         # React + TypeScript 프론트엔드
├── OCR/             # 책 OCR 시스템 (선택)
└── README.md        # 이 파일
```

## 사전 요구사항

### 공통
- **MongoDB**: 로컬 또는 클라우드 (MongoDB Atlas 권장)
- **Git**: 코드 클론용

### Backend
- **Python**: 3.11 이상
- **OpenAI API Key**: GPT-4o-mini 사용
- **YouTube API Key** (선택): 영상 관련 기능 사용 시

### Frontend
- **Node.js**: 16.x 이상
- **npm** 또는 **yarn**

### OCR (선택)
- **Google Cloud Vision API Key**: OCR 텍스트 인식용
- **웹캠**: 책 페이지 스캔용
- **YOLO 모델**: yolo11n.pt (자동 다운로드)

---

## 설치 및 실행 가이드

### 1. 저장소 클론

```bash
git clone <repository-url>
cd SEEQ
```

---

### 2. Backend 설정 및 실행

#### 2.1 가상환경 생성 (권장)

**Windows:**
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 의존성 설치

```bash
pip install -r requirements.txt
```

#### 2.3 환경 변수 설정

`Backend/.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
# OpenAI 설정
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=rag_database

# OCR 데이터베이스 설정 (선택)
OCR_MONGODB_URI=mongodb://localhost:27017
OCR_DB_NAME=ocr_db

# YouTube API 설정 (선택)
YOUTUBE_API_KEY=your_youtube_api_key_here

# API 설정
API_HOST=0.0.0.0
API_PORT=8000

# 청킹 설정
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# 검색 설정
DEFAULT_TOP_K=5

# 로깅 설정
LOG_LEVEL=INFO
```

**필수 설정:**
- `OPENAI_API_KEY`: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
- `MONGODB_URI`: MongoDB 연결 문자열

**선택 설정:**
- `YOUTUBE_API_KEY`: [Google Cloud Console](https://console.cloud.google.com/)에서 발급
- `OCR_MONGODB_URI`: OCR 기능 사용 시 설정

#### 2.4 MongoDB 준비

**로컬 MongoDB 사용:**
```bash
# MongoDB 설치 후 실행
mongod
```

**MongoDB Atlas 사용 (권장):**
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 가입
2. 무료 클러스터 생성
3. 연결 문자열 복사
4. `.env` 파일의 `MONGODB_URI`에 입력

#### 2.5 서버 실행

```bash
python main.py
```

서버가 `http://localhost:8000`에서 실행됩니다.

**API 문서 확인:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

### 3. Frontend 설정 및 실행

새 터미널을 열고:

#### 3.1 의존성 설치

```bash
cd Frontend
npm install
```

#### 3.2 환경 변수 설정 (선택)

`Frontend/.env` 파일이 이미 있다면 확인하고, 없다면 생성합니다:

```env
REACT_APP_API_URL=http://localhost:8000
```

**참고:** 현재 많은 컴포넌트가 `localhost:8000`을 하드코딩하고 있어, 환경 변수 없이도 작동합니다.

#### 3.3 개발 서버 실행

```bash
npm start
```

브라우저가 자동으로 열리며 `http://localhost:3000`에서 실행됩니다.

#### 3.4 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `Frontend/build/` 폴더에 생성됩니다.

---

### 4. OCR 시스템 설정 및 실행 (선택)

책 페이지를 자동으로 스캔하여 텍스트를 추출하는 기능입니다.

#### 4.1 의존성 설치

```bash
cd OCR
pip install ultralytics opencv-python pillow gtts pygame pymongo python-dotenv google-cloud-vision
```

#### 4.2 환경 변수 설정

`OCR/.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
GOOGLE_API_KEY=your_google_cloud_vision_api_key_here
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=ocr_db
MONGO_COLLECTION_NAME=books
```

**Google Cloud Vision API Key 발급:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. Cloud Vision API 활성화
4. API 키 생성
5. `.env` 파일에 입력

#### 4.3 YOLO 모델 다운로드

처음 실행 시 자동으로 다운로드됩니다. 수동 다운로드가 필요하면:

```bash
# Python에서
from ultralytics import YOLO
model = YOLO('yolo11n.pt')
```

#### 4.4 웹캠 설정

`ocr.py` 파일에서 웹캠 인덱스를 확인/수정:

```python
cap = cv2.VideoCapture(2)  # 0, 1, 2 등으로 변경
```

#### 4.5 실행

```bash
python ocr.py
```

프롬프트가 나타나면 책 제목을 입력합니다.

**사용 방법:**
- 책을 펼쳐서 웹캠에 비춥니다
- 5초간 감지되면 자동으로 OCR 수행
- "읽어": 마지막 페이지 내용 음성 출력
- "그만": 종료
- `ESC` 키: 종료

**결과물:**
- `book_pages/<책제목>/`: 스캔된 이미지
- `book_pages/<책제목>/<책제목>.txt`: 추출된 텍스트
- `<책제목>_녹화본.mp4`: 녹화 영상
- MongoDB에 자동 저장

---

## 주요 기능

### Backend API
- **문서 업로드**: PDF, DOCX 등 다양한 포맷 지원
- **폴더/라벨 관리**: 문서 조직화
- **질의응답**: RAG 기반 자연어 질문
- **퀴즈 생성**: 자동 문제 생성 및 채점
- **요약**: 문서 요약
- **키워드 추출**: 핵심 키워드 추출
- **마인드맵**: 개념 시각화
- **그래프 분석**: 문서 간 관계 분석
- **하이라이트/메모**: 문서 주석 기능

### Frontend
- **대시보드**: 문서 관리 및 AI 모듈
- **퀴즈메이트**: 퀴즈 생성, 풀이, 결과 확인
- **반응형 디자인**: Tailwind CSS 사용

### OCR
- **자동 페이지 감지**: YOLO11 객체 인식
- **텍스트 추출**: Google Cloud Vision API
- **중복 페이지 제거**: 페이지 전환 자동 감지
- **음성 출력**: gTTS 활용
- **MongoDB 연동**: 자동 데이터 저장

---

## 환경별 실행 확인 사항

### Windows
- Python 경로 확인: `python --version`
- pip 업그레이드: `python -m pip install --upgrade pip`
- OCR 한글 폰트 경로: `C:/Windows/Fonts/malgun.ttf` (기본값)

### macOS
- Python 경로: `python3` 사용
- 한글 폰트 경로 수정 필요 (`ocr.py:63`)
  ```python
  font_path = "/System/Library/Fonts/AppleSDGothicNeo.ttc"
  ```
- 웹캠 권한 허용 필요

### Linux
- 한글 폰트 설치:
  ```bash
  sudo apt-get install fonts-nanum
  ```
- 폰트 경로 수정 (`ocr.py:63`)
  ```python
  font_path = "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"
  ```

---

## 문제 해결

### Backend 실행 오류

**MongoDB 연결 실패:**
```
pymongo.errors.ServerSelectionTimeoutError
```
- MongoDB가 실행 중인지 확인
- `.env`의 `MONGODB_URI` 확인

**OpenAI API 오류:**
```
openai.error.AuthenticationError
```
- API 키 확인
- 계정 잔액 확인

### Frontend 실행 오류

**의존성 설치 실패:**
```bash
npm cache clean --force
npm install
```

**포트 충돌:**
- 다른 포트 사용: `PORT=3001 npm start`

### OCR 실행 오류

**웹캠 열기 실패:**
- 웹캠 인덱스 변경 (0, 1, 2 등)
- 다른 앱이 웹캠 사용 중인지 확인

**Google Vision API 오류:**
- API 키 확인
- Cloud Vision API가 활성화되었는지 확인
- 결제 정보 등록 확인 (무료 한도 있음)

**한글 폰트 오류:**
- 운영체제에 맞는 폰트 경로로 수정

---

## 개발 팀

프로젝트에 기여하거나 문의사항이 있으시면 이슈를 등록해주세요.

---

## 라이선스

이 프로젝트의 라이선스는 별도로 명시되지 않았습니다.

---

## 추가 참고사항

- **보안**: `.env` 파일은 절대 Git에 커밋하지 마세요 (.gitignore에 포함됨)
- **API 비용**: OpenAI 및 Google Cloud Vision API는 사용량에 따라 과금됩니다
- **성능**: MongoDB 인덱싱으로 검색 속도 향상 가능
- **배포**: Frontend는 빌드 후 정적 호스팅 가능 (Vercel, Netlify 등)
- **Backend 배포**: Docker 컨테이너화 권장

---

**즐거운 학습 되세요!**

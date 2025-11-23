// ===== 백엔드 API 연결 설정 =====
        
// API 기본 설정
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    TIMEOUT: 60000, // 60초로 증가 (채팅 응답 시간 고려)
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// API 호출 유틸리티 클래스
class ApiService {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const config = {
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                ...API_CONFIG.HEADERS,
                ...options.headers
            },
            ...options
        };
        
        try {
            console.log(`🌐 API 요청: ${config.method || 'GET'} ${url}`);
            console.log(`⏱️ 타임아웃 설정: ${config.timeout}ms`);
            
            const controller = new AbortController();
            const signal = controller.signal;
            
            // 타임아웃 설정 (명확한 abort 이유 포함)
            const timeoutId = setTimeout(() => {
                console.warn(`⏰ 타임아웃 발생: ${config.timeout}ms 초과`);
                console.warn(`🔄 요청 중단: ${url}`);
                controller.abort(new DOMException(`요청 타임아웃 (${config.timeout}ms 초과)`, "TimeoutError"));
            }, config.timeout);
            
            console.log(`🚀 Fetch 시작: ${url}`);
            const response = await fetch(url, {
                ...config,
                signal: signal
            });
            
            clearTimeout(timeoutId);
            console.log(`📡 응답 수신: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                // 서버 오류 응답의 상세 내용 확인
                let errorDetails = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorBody = await response.text();
                    console.error(`🔥 서버 오류 응답:`, errorBody);
                    errorDetails += `\n응답 내용: ${errorBody}`;
                } catch (e) {
                    console.error(`🔥 오류 응답 파싱 실패:`, e);
                }
                throw new Error(errorDetails);
            }
            
            const data = await response.json();
            console.log(`✅ API 응답 성공:`, data);
            return data;
            
        } catch (error) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                console.error(`🚫 요청 중단됨: ${url}`);
                console.error(`⏰ 타임아웃: ${config.timeout}ms`);
                console.error(`📝 중단 이유: ${error.message}`);
                console.error(`💡 해결책: 타임아웃을 늘리거나 서버 응답 시간을 확인하세요`);
                
                // 사용자에게 명확한 피드백 제공
                if (typeof showNotification === 'function') {
                    showNotification('요청 시간이 초과되었습니다. 서버 상태를 확인해주세요.', 'warning');
                }
            } else {
                console.error(`❌ API 요청 실패:`, error);
            }
            console.error(`🔍 요청 URL:`, url);
            console.error(`🔍 요청 설정:`, config);
            throw error;
        }
    }
    
    // GET 요청
    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    // POST 요청
    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // 긴 작업용 POST 요청 (보고서 생성 등)
    static async postLongTask(endpoint, data = {}, timeoutMs = 120000) {
        console.log(`🔄 긴 작업 시작: ${endpoint}`);
        console.log(`⏱️ 타임아웃: ${timeoutMs}ms (${timeoutMs/1000}초)`);
        console.log(`📊 요청 데이터 크기: ${JSON.stringify(data).length} 문자`);
        
        const startTime = Date.now();
        
        try {
            const result = await this.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                timeout: timeoutMs
            });
            
            const duration = Date.now() - startTime;
            console.log(`✅ 긴 작업 완료: ${duration}ms (${(duration/1000).toFixed(1)}초)`);
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ 긴 작업 실패: ${duration}ms (${(duration/1000).toFixed(1)}초)`);
            throw error;
        }
    }
    
    // PUT 요청
    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE 요청
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
    
    // 파일 업로드 (FormData)
    static async uploadFile(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            headers: {}, // Content-Type을 자동으로 설정하도록 비움
            body: formData
        });
    }
}

// ===== Chat API 연동 함수들 =====

// 전역 세션 관리
let currentChatSession = null;
let isChatRequestInProgress = false; // 중복 요청 방지 플래그

// 채팅 메시지 전송 API 호출
async function sendChatMessage(message, folderId = null) {
    // 중복 요청 방지
    if (isChatRequestInProgress) {
        console.warn('🚫 이미 채팅 요청이 진행 중입니다.');
        showNotification('이전 요청이 처리 중입니다. 잠시만 기다려주세요.', 'warning');
        return {
            answer: '이전 요청이 처리 중입니다. 잠시만 기다려주세요.',
            sources: null,
            confidence: 0,
            agent_type: 'warning',
            session_id: currentChatSession,
            strategy: 'duplicate_request'
        };
    }
    
    try {
        isChatRequestInProgress = true; // 요청 시작 플래그 설정
        console.log('💬 채팅 메시지 전송:', message);
        showNotification('AI가 응답을 생성하는 중...', 'info');
        
        // 요청 데이터 구성
        const requestData = {
            query: message,
            folder_id: folderId || (currentFolder ? currentFolder.id : null),
            top_k: 5,
            include_sources: true,
            session_id: currentChatSession
        };
        
        // API 호출 (채팅 요청은 더 긴 타임아웃 적용)
        const response = await ApiService.postLongTask('/query/', requestData, 90000); // 90초
        
        // 세션 ID 업데이트
        if (response.session_id) {
            currentChatSession = response.session_id;
        }
        
        console.log('🤖 AI 응답 수신:', response);
        
        // 성공 알림
        showNotification('AI 응답을 받았습니다.', 'success');
        
        return {
            answer: response.answer,
            sources: response.sources,
            confidence: response.confidence,
            agent_type: response.agent_type,
            session_id: response.session_id,
            strategy: response.strategy
        };
        
    } catch (error) {
        console.error('❌ 채팅 메시지 전송 실패:', error);
        
        // 에러 타입에 따른 상세 처리
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            showNotification('응답 시간이 초과되었습니다. 서버 상태를 확인해주세요.', 'error');
        } else if (error.message.includes('Failed to fetch')) {
            showNotification('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.', 'error');
        } else {
            showNotification('AI 응답 생성에 실패했습니다. 다시 시도해주세요.', 'error');
        }
        
        // 에러 시 기본 응답 반환
        return {
            answer: '죄송합니다. 현재 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
            sources: null,
            confidence: 0,
            agent_type: 'error',
            session_id: currentChatSession,
            strategy: 'error'
        };
    } finally {
        isChatRequestInProgress = false; // 요청 완료 플래그 해제
    }
}

// 채팅 세션 정보 조회
async function getChatSessionInfo(sessionId) {
    try {
        if (!sessionId) return null;
        
        const response = await ApiService.get(`/query/sessions/${sessionId}`);
        return response;
        
    } catch (error) {
        console.error('❌ 채팅 세션 정보 조회 실패:', error);
        return null;
    }
}

// 채팅 세션 초기화
async function clearChatSession(sessionId = null) {
    try {
        const targetSessionId = sessionId || currentChatSession;
        if (!targetSessionId) return;
        
        await ApiService.delete(`/query/sessions/${targetSessionId}`);
        
        if (!sessionId) {
            currentChatSession = null;
        }
        
        console.log('🗑️ 채팅 세션이 초기화되었습니다.');
        showNotification('채팅 기록이 초기화되었습니다.', 'info');
        
    } catch (error) {
        console.error('❌ 채팅 세션 초기화 실패:', error);
        showNotification('채팅 기록 초기화에 실패했습니다.', 'error');
    }
}

// 에이전트 정보 조회
async function getChatAgentInfo() {
    try {
        const response = await ApiService.get('/query/agent-info');
        return response;
        
    } catch (error) {
        console.error('❌ 에이전트 정보 조회 실패:', error);
        return { status: 'error', message: '에이전트 정보를 가져올 수 없습니다.' };
    }
}

// 채팅 메시지를 UI에 표시하는 함수
function displayChatMessage(message, type, sources = null, metadata = null) {
    const chatMessages = document.getElementById('chatBarMessages');
    if (!chatMessages) return;
    
    // 메시지 컨테이너 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';
    
    // 메시지 버블 생성
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = type === 'user' ? 'message-bubble user-bubble' : 'message-bubble ai-bubble';
    
    // 메시지 내용 설정
    bubbleDiv.innerHTML = message;
    // 글꼴 크기 스케일링 적용
    bubbleDiv.style.fontSize = 'calc(1em * var(--font-scale))';
    bubbleDiv.style.lineHeight = 'calc(1.5 * var(--font-scale))';
    
    // AI 메시지인 경우 추가 정보 표시
    if (type === 'ai' && metadata) {
        // 메타데이터 표시 (에이전트 타입, 신뢰도 등)
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-metadata';
        metaDiv.style.cssText = 'font-size: calc(11px * var(--font-scale)); color: #6b7280; margin-top: 4px; opacity: 0.8;';
        
        let metaText = '';
        if (metadata.agent_type) {
            metaText += `🤖 ${metadata.agent_type}`;
        }
        if (metadata.confidence) {
            metaText += ` | 신뢰도: ${Math.round(metadata.confidence * 100)}%`;
        }
        if (metadata.strategy) {
            metaText += ` | ${metadata.strategy}`;
        }
        
        metaDiv.textContent = metaText;
        bubbleDiv.appendChild(metaDiv);
    }
    
    // 소스 정보 표시 (AI 메시지인 경우)
    if (type === 'ai' && sources && sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'message-sources';
        sourcesDiv.style.cssText = 'margin-top: 8px; padding: 8px; background: rgba(0,0,0,0.05); border-radius: 6px; font-size: calc(12px * var(--font-scale));';
        
        const sourcesTitle = document.createElement('div');
        sourcesTitle.textContent = '📚 참고 문서:';
        sourcesTitle.style.cssText = 'font-weight: 600; margin-bottom: 4px; color: #374151; font-size: calc(12px * var(--font-scale));';
        sourcesDiv.appendChild(sourcesTitle);
        
        sources.slice(0, 3).forEach((source, index) => {
            const sourceItem = document.createElement('div');
            sourceItem.style.cssText = 'margin: 2px 0; color: #6b7280; font-size: calc(11px * var(--font-scale));';
            sourceItem.textContent = `${index + 1}. ${source.filename || source.title || '문서'}`;
            sourcesDiv.appendChild(sourceItem);
        });
        
        bubbleDiv.appendChild(sourcesDiv);
    }
    
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // 스크롤을 맨 아래로
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== Keywords & Summary API 연동 함수들 =====

// 키워드 추출 API 호출
async function extractKeywords() {
    // 폴더 정보 확인
    if (!currentFolder || !currentFolder.id) {
        showNotification('폴더 정보를 찾을 수 없습니다!', 'warning');
        return;
    }
    
    try {
        console.log('🔑 키워드 추출 시작 - 폴더:', currentFolder.id);
        showNotification('키워드를 추출하는 중...', 'info');
        
        // 폴더 전체에서 키워드 추출
        const response = await ApiService.post('/keywords/from-file', {
            folder_id: currentFolder.id,
            max_keywords: 15,
            use_chunks: true
        });
        
        console.log('🎯 키워드 추출 완료:', response);
        
        // 대시보드 Keywords 모듈에 직접 결과 표시
        displayKeywordsInModules(response.keywords || []);
        
        showNotification(`키워드 추출 완료! ${response.keywords?.length || 0}개의 키워드를 찾았습니다.`, 'success');
        
    } catch (error) {
        console.error('❌ 키워드 추출 실패:', error);
        showNotification('키워드 추출에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 문서 요약 API 호출
async function generateSummary() {
    // 폴더 정보 확인
    if (!currentFolder || !currentFolder.id) {
        showNotification('폴더 정보를 찾을 수 없습니다!', 'warning');
        return;
    }
    
    try {
        console.log('📄 문서 요약 시작 - 폴더:', currentFolder.id);
        showNotification('문서를 요약하는 중...', 'info');
        
        // 폴더 전체 요약
        const response = await ApiService.post('/summary/', {
            folder_id: currentFolder.id,
            summary_type: "detailed"
        });
        
        console.log('📝 문서 요약 완료:', response);
        
        // 대시보드 Summary 모듈에 직접 결과 표시
        displaySummaryInModules(response.summary, response.document_count, response.from_cache);
        
        showNotification(`문서 요약 완료! ${response.document_count}개 문서를 요약했습니다.`, 'success');
        
    } catch (error) {
        console.error('❌ 문서 요약 실패:', error);
        showNotification('문서 요약에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

// 폴더 요약 생성 (모듈용)
async function generateFolderSummary(folderId) {
    try {
        console.log('📄 폴더 요약 생성 시작 - 폴더 ID:', folderId);
        
        // 폴더 전체 요약 API 호출
        const response = await ApiService.post('/summary/', {
            folder_id: folderId,
            summary_type: "detailed"
        });
        
        console.log('📝 폴더 요약 생성 완료:', response);
        
        // 모듈에서 사용할 수 있는 형태로 데이터 반환
        return {
            summary_text: response.summary || '',
            title: `${currentFolder?.name || '폴더'} 요약`,
            processed_files: response.document_count ? 
                Array.from({length: response.document_count}, (_, i) => ({id: i + 1})) : [],
            created_at: new Date().toISOString(),
            from_cache: response.from_cache || false,
            metadata: {
                document_count: response.document_count || 0,
                folder_id: folderId,
                summary_type: "detailed"
            }
        };
        
    } catch (error) {
        console.error('❌ 폴더 요약 생성 실패:', error);
        throw new Error(error.message || '폴더 요약 생성에 실패했습니다.');
    }
}

// 대시보드 Keywords 모듈에 키워드 결과 표시
function displayKeywordsInModules(keywords) {
    // 모든 Keywords 모듈 찾기
    const keywordModules = document.querySelectorAll('.dashboard-module.module-keywords');
    
    keywordModules.forEach(module => {
        const keywordsDisplay = module.querySelector('.keywords-display');
        if (keywordsDisplay) {
            keywordsDisplay.innerHTML = '';
            
            if (keywords.length === 0) {
                keywordsDisplay.innerHTML = '<div class="no-keywords">키워드를 찾을 수 없습니다.</div>';
                return;
            }
            
            // 키워드를 행으로 나누어 표시 (한 행에 3개씩)
            const rows = [];
            for (let i = 0; i < keywords.length; i += 3) {
                rows.push(keywords.slice(i, i + 3));
            }
            
            rows.forEach(row => {
                const rowElement = document.createElement('div');
                rowElement.className = 'keywords-row';
                
                row.forEach(keyword => {
                    const keywordTag = document.createElement('span');
                    keywordTag.className = 'keyword-tag';
                    keywordTag.textContent = keyword;
                    // 글꼴 크기 스케일링 적용
                    keywordTag.style.fontSize = 'calc(1em * var(--font-scale))';
                    rowElement.appendChild(keywordTag);
                });
                
                keywordsDisplay.appendChild(rowElement);
            });
        }
    });
}

// 대시보드 Summary 모듈에 요약 결과 표시
function displaySummaryInModules(summary, documentCount, fromCache) {
    // 모든 Summary 모듈 찾기
    const summaryModules = document.querySelectorAll('.dashboard-module.module-summary');
    
    summaryModules.forEach(module => {
        const summaryDisplayArea = module.querySelector('.summary-display-area');
        if (summaryDisplayArea) {
            if (!summary || summary.trim() === '') {
                summaryDisplayArea.innerHTML = `
                    <div class="summary-placeholder">
                        <div class="placeholder-text">요약을 생성할 수 없습니다</div>
                        <div class="placeholder-subtext">문서가 없거나 요약 생성에 실패했습니다</div>
                    </div>
                `;
                return;
            }
            
            summaryDisplayArea.innerHTML = `
                <div class="summary-result-container">
                    <div class="summary-result-header">
                        📄 ${documentCount}개 문서 요약 ${fromCache ? '(캐시됨)' : '(새로 생성됨)'}
                    </div>
                    <div class="summary-result-text" style="font-size: calc(1em * var(--font-scale)); line-height: calc(1.5 * var(--font-scale));">${summary}</div>
                </div>
            `;
        }
    });
}

// 백엔드 연결 상태 확인
async function checkBackendConnection() {
    try {
        const response = await ApiService.get('/');
        console.log('🚀 백엔드 연결 성공:', response);
        showNotification('백엔드 서버에 성공적으로 연결되었습니다!', 'success');
        return true;
    } catch (error) {
        console.error('🔌 백엔드 연결 실패:', error);
        showNotification('백엔드 서버 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.', 'error');
        return false;
    }
}

// 폴더 내 문서 목록 로드
async function loadFolderDocuments() {
    if (!currentFolder || !currentFolder.id) {
        console.error('폴더 정보가 없습니다.');
        return;
    }
    
    try {
        console.log('폴더 문서 로드 시작:', currentFolder.id);
        
        const pileContainer = document.querySelector('.pile-container');
        if (!pileContainer) {
            console.error('pile-container를 찾을 수 없습니다.');
            return;
        }
        
        // 로딩 표시
        pileContainer.innerHTML = `
            <div class="document-status-container">
                <div class="spinner"></div>
                문서 목록을 불러오는 중...
            </div>
        `;
        
        // API에서 폴더 문서 목록 가져오기
        const response = await ApiService.get(`/folders/${currentFolder.id}/documents`);
        
        console.log('문서 목록 응답:', response);
        
        // 문서 목록 렌더링
        
        const docs = (response.document_groups || []).map(d => ({
            id: d.file_id || '',
        // 파일명이 Unknown/빈 값이면 생성일로 대체
            title: (() => {
                const name = d.file_name?.trim();
                if (!name || name === 'Unknown Document') {
                const dt = new Date(d.created_at);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                const day = String(dt.getDate()).padStart(2, '0');
                return `문서_${y}-${m}-${day}`;
            }
            return name;
        })(),
        file_type: d.file_type,
        file_size: d.file_size ?? d.page_count, // 기존 로직 유지
        created_at: d.created_at,
        page_count: d.page_count,
        low_text: d.low_text,
        folder_id: d.folder_id,
    }));

        renderDocuments(docs);
        
        // 선택 상태 업데이트
        updateSelectionStatus();
        
    } catch (error) {
        console.error('폴더 문서 로드 실패:', error);
        
        const pileContainer = document.querySelector('.pile-container');
        if (pileContainer) {
            pileContainer.innerHTML = `
                <div class="document-status-container error">
                    <svg class="error-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    문서 목록을 불러올 수 없습니다.<br>
                    <small class="error-details">백엔드 서버 연결을 확인해주세요.</small>
                </div>
            `;
        }
    }
}

// 문서 전체보기 (확장 모드 토글)
async function viewFullDocument(fileId) {
    try {
        console.log('문서 전체보기:', fileId);
        
        // data-file-id가 있는 .pile-low-text 요소를 직접 선택
        const pileLowTextElement = document.querySelector(`.pile-low-text[data-file-id="${file_id}"]`);
        
        if (pileLowTextElement) {
            const contentArea = pileLowTextElement.querySelector('.text-content-area');
            
            if (contentArea) {
                // 현재 확장 모드인지 확인
                const isExpanded = contentArea.classList.contains('expanded');
                
                if (isExpanded) {
                    // 축소 모드로 전환
                    contentArea.classList.remove('expanded');
                    document.body.style.overflow = ''; // body 스크롤 복원
                    
                    // 전체보기 버튼 텍스트 원래대로 복원
                    const fullBtn = pileLowTextElement.querySelector('.full-btn');
                    if (fullBtn) {
                        fullBtn.textContent = '전체보기';
                        fullBtn.style.background = ''; // 원래 색상으로 복원
                    }
                    
                    console.log('✅ 축소 모드로 전환 완료');
                    showNotification('일반 보기로 전환했습니다.', 'success');
                    
                } else {
                    // 확장 모드로 전환
                    showNotification('전체 문서 내용을 로드하는 중...', 'info');
                    
                    // 🔧 문서 확장 상태 확인 및 자동 확장
                    if (!pileLowTextElement.classList.contains('expanded')) {
                        console.log('📂 문서가 접혀있음, 자동으로 확장합니다.');
                        
                        const pileItem = pileLowTextElement.closest('.pile-item');
                        const expandButton = pileItem?.querySelector('.expand-btn');
                        if (expandButton) {
                            expandButton.click();
                            console.log('✅ 문서 확장 완료');
                        }
                    }
                    
                    // 문서 전체 내용 로드 (항상 최신 전체 텍스트 로드)
                    const contentTextElement = contentArea.querySelector('.content-text');
                    const hasRawContent = contentTextElement?.getAttribute('data-raw-content');
                    
                    // 전체 텍스트가 없거나 요약된 텍스트인 경우 전체 내용 로드
                    if (!hasRawContent || contentTextElement.innerHTML.length < 1000) {
                        console.log('📄 전체 텍스트 로드 중...');
                        
                        // 문서 내용 로드
                        const response = await ApiService.get(`/documents/single/${fileId}/content`);
                        
                        if (contentTextElement && response.raw_text) {
                            contentTextElement.innerHTML = response.raw_text;
                            contentTextElement.setAttribute('data-raw-content', encodeURIComponent(response.raw_text));
                            console.log('✅ 전체 텍스트 로드 완료');
                        }
                    } else {
                        // 이미 로드된 전체 텍스트가 있는 경우 디코딩하여 표시
                        try {
                            const decodedContent = decodeURIComponent(hasRawContent);
                            if (decodedContent && decodedContent !== contentTextElement.innerHTML) {
                                contentTextElement.innerHTML = decodedContent;
                                console.log('✅ 캐시된 전체 텍스트 표시');
                            }
                        } catch (e) {
                            console.warn('캐시된 텍스트 디코딩 실패, 새로 로드합니다.');
                            const response = await ApiService.get(`/documents/single/${fileId}/content`);
                            if (contentTextElement && response.raw_text) {
                                contentTextElement.innerHTML = response.raw_text;
                                contentTextElement.setAttribute('data-raw-content', encodeURIComponent(response.raw_text));
                            }
                        }
                    }
                    
                    // 확장 모드 활성화
                    contentArea.classList.add('expanded');
                    document.body.style.overflow = 'hidden'; // body 스크롤 비활성화
                    
                    // 전체보기 버튼을 축소 버튼으로 변경
                    const fullBtn = pileLowTextElement.querySelector('.full-btn');
                    if (fullBtn) {
                        fullBtn.textContent = '축소';
                    }
                    
                    // 스크롤을 맨 위로 이동
                    contentArea.scrollTop = 0;
                    
                    // 닫기 버튼 및 배경 클릭 이벤트 추가
                    const closeHandler = (e) => {
                        // 닫기 버튼 영역 클릭 확인 (오른쪽 상단 32x32px 영역)
                        const rect = contentArea.getBoundingClientRect();
                        const closeButtonArea = {
                            left: rect.right - 48, // 16px margin + 32px button
                            right: rect.right - 16,
                            top: rect.top + 16,
                            bottom: rect.top + 48
                        };
                        
                        const isCloseButtonClick = (
                            e.clientX >= closeButtonArea.left &&
                            e.clientX <= closeButtonArea.right &&
                            e.clientY >= closeButtonArea.top &&
                            e.clientY <= closeButtonArea.bottom
                        );
                        
                        // 닫기 버튼 클릭 또는 배경 직접 클릭 시 닫기
                        if (isCloseButtonClick || (e.target === contentArea && e.target.classList.contains('expanded'))) {
                            viewFullDocument(fileId); // 토글 (축소)
                        }
                    };
                    
                    // 기존 이벤트 리스너 제거 후 새로 추가
                    contentArea.removeEventListener('click', contentArea._closeHandler);
                    contentArea._closeHandler = closeHandler;
                    contentArea.addEventListener('click', closeHandler);
                    
                    console.log('✅ 확장 모드로 전환 완료');
                    showNotification('전체 문서 내용을 로드했습니다. ESC 키나 배경 클릭으로 닫을 수 있습니다.', 'success');
                }
                
            } else {
                console.error('❌ text-content-area를 찾을 수 없습니다.');
            }
        } else {
            console.error('❌ pile-low-text 요소를 찾을 수 없습니다. fileId:', fileId);
        }
        
    } catch (error) {
        console.error('문서 전체보기 실패:', error);
        showNotification('문서 내용을 불러올 수 없습니다.', 'error');
    }
}

// ===== Recommendation API 연동 함수들 =====

// 폴더 기반 자동 추천 API 호출
async function generateFolderRecommendations(folderId = null) {
    try {
        // 폴더 정보 확인
        if (!folderId && (!currentFolder || !currentFolder.id)) {
            throw new Error('폴더를 먼저 선택해주세요.');
        }
        
        const targetFolderId = folderId || currentFolder.id;
        
        console.log('🎯 추천 생성 시작:', {
            folderId: targetFolderId,
            folderTitle: currentFolder ? currentFolder.title : '알 수 없음'
        });
        
        showNotification('AI가 추천을 생성하는 중...', 'info');
        
        // 요청 데이터 구성
        const requestData = {
            folder_id: targetFolderId,
            content_types: ["book", "movie", "youtube_video"],
            max_items: 9,  // 3x3 그리드에 맞춤
            include_youtube: true,
            youtube_max_per_keyword: 2,
            max_keywords: 5
        };
        
        console.log('📤 추천 요청 데이터:', requestData);
        
        // API 호출 (긴 작업용 - 2분 타임아웃)
        console.log('🔄 추천 생성 API 호출 시작...');
        const response = await ApiService.postLongTask('/recommend/from-file', requestData, 120000); // 2분 타임아웃
        
        console.log('🎯 추천 응답 수신:', response);
        
        // 성공 알림
        showNotification(`${response.total_count}개의 추천을 받았습니다.`, 'success');
        
        return {
            recommendations: response.recommendations,
            total_count: response.total_count,
            youtube_included: response.youtube_included,
            extracted_keywords: response.extracted_keywords,
            from_cache: response.from_cache
        };
        
    } catch (error) {
        console.error('❌ 추천 생성 실패:', error);
        
        let errorMessage = '추천 생성에 실패했습니다.';
        
        if (error.name === 'AbortError') {
            console.warn('⏰ 추천 생성 타임아웃 발생 (2분 초과)');
            errorMessage = '⏰ 추천 생성 시간이 초과되었습니다. 폴더의 문서 수가 많거나 서버가 바쁠 수 있습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('Failed to fetch')) {
            console.warn('🔌 백엔드 서버 연결 실패');
            errorMessage = '🔌 백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
        } else if (error.message.includes('500')) {
            console.warn('🔥 서버 내부 오류');
            errorMessage = '🔥 서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        showNotification(errorMessage, 'error');
        
        // 에러 시 빈 결과 반환 (UI 오류 방지)
        return {
            recommendations: [],
            total_count: 0,
            youtube_included: false,
            extracted_keywords: [],
            from_cache: false,
            error: error.message
        };
    }
}

// 대시보드 Recommendation 모듈에 추천 결과 표시
function displayRecommendationsInModules(recommendations, metadata = {}) {
    // 모든 Recommendation 모듈 찾기
    const recommendationModules = document.querySelectorAll('.dashboard-module[data-module-type="recommendation"]');
    
    recommendationModules.forEach(moduleElement => {
        displayRecommendationInModule(moduleElement, recommendations, metadata);
    });
}

// 개별 Recommendation 모듈에 추천 결과 표시
function displayRecommendationInModule(moduleElement, recommendations, metadata = {}) {
    try {
        // YouTube 추천과 도서/영화 추천 분리
        const youtubeRecs = recommendations.filter(item => item.content_type === 'youtube_video').slice(0, 3);
        const bookMovieRecs = recommendations.filter(item => 
            item.content_type === 'book' || item.content_type === 'movie'
        ).slice(0, 3);
        
        // YouTube 섹션 업데이트
        const youtubeGrid = moduleElement.querySelector('.recommendation-youtube-grid');
        if (youtubeGrid) {
            updateYouTubeSection(youtubeGrid, youtubeRecs);
        }
        
        // 도서/영화 섹션 업데이트
        const bookMovieList = moduleElement.querySelector('.book-movie-list');
        if (bookMovieList) {
            updateBookMovieSection(bookMovieList, bookMovieRecs);
        }
        
        // 추천 메타데이터 저장 (클릭 이벤트용)
        moduleElement.recommendationData = {
            recommendations: recommendations,
            metadata: metadata
        };
        
        console.log('✅ 추천 모듈 업데이트 완료:', {
            youtube: youtubeRecs.length,
            bookMovie: bookMovieRecs.length,
            total: recommendations.length
        });
        
    } catch (error) {
        console.error('❌ 추천 모듈 표시 실패:', error);
        // 에러 발생 시 기본 UI 유지 (디자인 변형 방지)
    }
}

// YouTube 섹션 업데이트
function updateYouTubeSection(youtubeGrid, youtubeRecs) {
    const youtubeItems = youtubeGrid.querySelectorAll('.youtube-item');
    
    youtubeItems.forEach((item, index) => {
        if (index < youtubeRecs.length) {
            const rec = youtubeRecs[index];
            
            // 제목 업데이트
            const titleElement = item.querySelector('.youtube-title');
            if (titleElement) {
                titleElement.textContent = rec.title || '관련 영상';
                titleElement.style.fontSize = 'calc(1em * var(--font-scale))';
            }
            
            // 채널명 업데이트
            const channelElement = item.querySelector('.youtube-channel');
            if (channelElement) {
                channelElement.textContent = rec.metadata?.channel || '채널명';
                channelElement.style.fontSize = 'calc(0.9em * var(--font-scale))';
            }
            
            // 썸네일 업데이트 (배경 이미지로)
            const thumbnailElement = item.querySelector('.youtube-thumbnail');
            if (thumbnailElement && rec.metadata?.thumbnail) {
                thumbnailElement.style.backgroundImage = `url(${rec.metadata.thumbnail})`;
                thumbnailElement.style.backgroundSize = 'cover';
                thumbnailElement.style.backgroundPosition = 'center';
            }
            
            // YouTube URL 저장 (클릭 이벤트용)
            item.dataset.youtubeUrl = rec.source || rec.metadata?.url || '';
            item.dataset.videoId = rec.metadata?.video_id || '';
            
        } else {
            // 추천이 부족한 경우 기본값 유지
            const titleElement = item.querySelector('.youtube-title');
            const channelElement = item.querySelector('.youtube-channel');
            
            if (titleElement) titleElement.textContent = '관련 영상';
            if (channelElement) channelElement.textContent = '채널명';
            
            // 데이터 초기화
            item.dataset.youtubeUrl = '';
            item.dataset.videoId = '';
        }
    });
}

// 도서/영화 섹션 업데이트
function updateBookMovieSection(bookMovieList, bookMovieRecs) {
    const bookMovieItems = bookMovieList.querySelectorAll('.book-movie-item');
    
    bookMovieItems.forEach((item, index) => {
        if (index < bookMovieRecs.length) {
            const rec = bookMovieRecs[index];
            
            // 제목 업데이트
            const titleElement = item.querySelector('.book-movie-title');
            if (titleElement) {
                titleElement.textContent = rec.title || '추천 도서/영화';
                titleElement.style.fontSize = 'calc(1em * var(--font-scale))';
            }
            
            // 설명 업데이트
            const descElement = item.querySelector('.book-movie-description');
            if (descElement) {
                descElement.textContent = rec.description || '설명 텍스트가 여기에 표시됩니다.';
                descElement.style.fontSize = 'calc(0.9em * var(--font-scale))';
                descElement.style.lineHeight = 'calc(1.4 * var(--font-scale))';
            }
            
            // 썸네일 업데이트
            const thumbnailElement = item.querySelector('.book-movie-thumbnail');
            if (thumbnailElement && rec.metadata?.thumbnail) {
                thumbnailElement.style.backgroundImage = `url(${rec.metadata.thumbnail})`;
                thumbnailElement.style.backgroundSize = 'cover';
                thumbnailElement.style.backgroundPosition = 'center';
            }
            
            // 외부 링크 및 콘텐츠 타입 저장 (클릭 이벤트용)
            item.dataset.externalUrl = rec.source || rec.metadata?.url || '';
            item.dataset.contentType = rec.content_type || 'unknown';
            
        } else {
            // 추천이 부족한 경우 기본값 유지
            const titleElement = item.querySelector('.book-movie-title');
            const descElement = item.querySelector('.book-movie-description');
            
            if (titleElement) titleElement.textContent = '추천 도서/영화';
            if (descElement) descElement.textContent = '설명 텍스트가 여기에 표시됩니다.';
            
            // 데이터 초기화
            item.dataset.externalUrl = '';
            item.dataset.contentType = '';
        }
    });
}

// 폴더 변경 시 추천 모듈 새로고침
function refreshRecommendationModulesOnFolderChange() {
    const recommendationModules = document.querySelectorAll('.dashboard-module[data-module-type="recommendation"]');
    
    recommendationModules.forEach(moduleElement => {
        // 기존 추천 데이터 초기화
        if (moduleElement.recommendationData) {
            moduleElement.recommendationData = null;
        }
        
        // 빈 상태로 초기화
        showRecommendationEmptyState(moduleElement);
    });
}

// YouTube 영상 재생 함수
function playYouTubeVideo(videoUrl, videoId) {
    try {
        let finalUrl = videoUrl;
        
        // video_id가 있으면 YouTube URL 생성
        if (videoId && !finalUrl) {
            finalUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        
        // URL이 있으면 새 탭에서 열기
        if (finalUrl) {
            console.log('🎥 YouTube 영상 재생:', finalUrl);
            window.open(finalUrl, '_blank');
        } else {
            console.warn('⚠️ YouTube URL이 없습니다.');
            showNotification('YouTube 링크를 찾을 수 없습니다.', 'warning');
        }
        
    } catch (error) {
        console.error('❌ YouTube 영상 재생 실패:', error);
        showNotification('YouTube 영상을 재생할 수 없습니다.', 'error');
    }
}

// 외부 링크 열기 함수
function openExternalLink(url, contentType) {
    try {
        if (url) {
            console.log(`🔗 외부 링크 열기 (${contentType}):`, url);
            window.open(url, '_blank');
        } else {
            console.warn('⚠️ 외부 링크가 없습니다.');
            showNotification('링크를 찾을 수 없습니다.', 'warning');
        }
        
    } catch (error) {
        console.error('❌ 외부 링크 열기 실패:', error);
        showNotification('링크를 열 수 없습니다.', 'error');
    }
}

// ===== 메모 API 연동 함수들 =====

// 폴더별 메모 목록 조회
async function getFolderMemos(folderId, limit = 50, skip = 0) {
    try {
        console.log(`📝 폴더 메모 목록 조회: ${folderId}`);
        
        if (!folderId) {
            throw new Error('폴더 ID가 필요합니다.');
        }
        
        const response = await ApiService.get(`/memos/folder/${folderId}`, {
            limit: limit,
            skip: skip
        });
        
        console.log(`✅ 메모 목록 조회 성공: ${response.memos.length}개`);
        return response;
        
    } catch (error) {
        console.error('❌ 메모 목록 조회 실패:', error);
        showNotification('메모 목록을 불러오는데 실패했습니다.', 'error');
        throw error;
    }
}

// 새 메모 생성
async function createMemo(folderId, content, title = null, color = '#fef3c7', tags = []) {
    try {
        console.log(`📝 새 메모 생성: ${folderId}`);
        
        if (!folderId || !content) {
            throw new Error('폴더 ID와 내용이 필요합니다.');
        }
        
        // 내용 길이 제한 (10000자)
        if (content.length > 10000) {
            throw new Error('메모 내용이 너무 깁니다. (최대 10,000자)');
        }
        
        // 제목 길이 제한 (100자)
        if (title && title.length > 100) {
            title = title.substring(0, 97) + '...';
        }
        
        const requestData = {
            folder_id: folderId,
            content: content.trim(),
            title: title ? title.trim() : null,
            color: color,
            tags: tags
        };
        
        const response = await ApiService.post('/memos/', requestData);
        
        console.log('✅ 메모 생성 성공:', response);
        showNotification('메모가 생성되었습니다.', 'success');
        
        return response;
        
    } catch (error) {
        console.error('❌ 메모 생성 실패:', error);
        showNotification(error.message || '메모 생성에 실패했습니다.', 'error');
        throw error;
    }
}

// 메모 수정
async function updateMemo(memoId, updates) {
    try {
        console.log(`📝 메모 수정: ${memoId}`);
        
        if (!memoId) {
            throw new Error('메모 ID가 필요합니다.');
        }
        
        // 데이터 검증
        if (updates.content && updates.content.length > 10000) {
            throw new Error('메모 내용이 너무 깁니다. (최대 10,000자)');
        }
        
        if (updates.title && updates.title.length > 100) {
            updates.title = updates.title.substring(0, 97) + '...';
        }
        
        // 빈 값 제거
        const cleanUpdates = {};
        Object.keys(updates).forEach(key => {
            if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
                cleanUpdates[key] = updates[key];
            }
        });
        
        const response = await ApiService.put(`/memos/${memoId}`, cleanUpdates);
        
        console.log('✅ 메모 수정 성공:', response);
        showNotification('메모가 수정되었습니다.', 'success');
        
        return response;
        
    } catch (error) {
        console.error('❌ 메모 수정 실패:', error);
        showNotification(error.message || '메모 수정에 실패했습니다.', 'error');
        throw error;
    }
}

// 메모 삭제
async function deleteMemo(memoId) {
    try {
        console.log(`📝 메모 삭제: ${memoId}`);
        
        if (!memoId) {
            throw new Error('메모 ID가 필요합니다.');
        }
        
        await ApiService.delete(`/memos/${memoId}`);
        
        console.log('✅ 메모 삭제 성공');
        showNotification('메모가 삭제되었습니다.', 'success');
        
        return true;
        
    } catch (error) {
        console.error('❌ 메모 삭제 실패:', error);
        showNotification('메모 삭제에 실패했습니다.', 'error');
        throw error;
    }
}

// 특정 메모 조회
async function getMemo(memoId) {
    try {
        console.log(`📝 메모 조회: ${memoId}`);
        
        if (!memoId) {
            throw new Error('메모 ID가 필요합니다.');
        }
        
        const response = await ApiService.get(`/memos/${memoId}`);
        
        console.log('✅ 메모 조회 성공:', response);
        return response;
        
    } catch (error) {
        console.error('❌ 메모 조회 실패:', error);
        showNotification('메모를 불러오는데 실패했습니다.', 'error');
        throw error;
    }
}

// ===== 파일 이름 변경 API =====

// 파일 이름 변경
async function updateFileName(fileId, newFileName) {
    try {
        console.log('📄 파일 이름 변경:', { fileId, newFileName });
        
        if (!fileId || !newFileName) {
            throw new Error('파일 ID와 새 파일 이름이 필요합니다.');
        }
        
        const trimmedName = newFileName.trim();
        if (!trimmedName) {
            throw new Error('파일 이름을 입력해주세요.');
        }
        
        if (trimmedName.length > 255) {
            throw new Error('파일 이름이 너무 깁니다. (최대 255자)');
        }
        
        showNotification('파일 이름을 변경하는 중...', 'info');
        
        const response = await ApiService.put(`/documents/${fileId}/name`, {
            new_file_name: trimmedName
        });
        
        console.log('✅ 파일 이름 변경 완료:', response);
        showNotification(`파일 이름이 "${trimmedName}"으로 변경되었습니다.`, 'success');
        
        return response;
        
    } catch (error) {
        console.error('❌ 파일 이름 변경 실패:', error);
        
        let errorMessage = '파일 이름 변경에 실패했습니다.';
        if (error.message.includes('400')) {
            errorMessage = '유효하지 않은 파일 이름입니다.';
        } else if (error.message.includes('404')) {
            errorMessage = '파일을 찾을 수 없습니다.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        throw error;
    }
}
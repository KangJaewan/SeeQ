// ===== 메인 대시보드 로직 =====

// ===== 다크모드 관리 =====

// 다크모드 관리
class DarkModeManager {
    constructor() {
        this.initializeDarkMode();
    }
    
    initializeDarkMode() {
        // 저장된 테마 설정 불러오기
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // 초기 테마 설정 (저장된 설정 > 시스템 설정 > 라이트 모드)
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.setTheme(initialTheme);
        
        // 시스템 테마 변경 감지
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // 다크모드 버튼 아이콘 업데이트
        this.updateToggleButton(theme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        this.setTheme(newTheme);
        
        // 토글 애니메이션 효과
        this.animateToggle();
    }
    
    updateToggleButton(theme) {
        const button = document.querySelector('.dark-mode-toggle');
        if (button) {
            button.setAttribute('aria-label', 
                theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
            );
        }
    }
    
    animateToggle() {
        const button = document.querySelector('.dark-mode-toggle');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        }
    }
}

// 다크모드 매니저 초기화
const darkModeManager = new DarkModeManager();

// 전역 다크모드 토글 함수
function toggleDarkMode() {
    darkModeManager.toggleTheme();
}

// 홈페이지로 이동
function navigateToHome() {
    window.location.href = 'home.html';
}

// ===== 사이드바 및 UI 관리 함수들 =====

function toggleRightSidebar() {
    const sidebar = document.getElementById('rightSidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('with-sidebar');
    toggleButton.classList.toggle('open');
}

function togglePileContent(button) {
    // 버튼이 속한 pile-item 찾기
    const pileItem = button.closest('.pile-item');
    const pileChart = pileItem.querySelector('.pile-chart');
    const pileLowText = pileItem.querySelector('.pile-low-text');
    const expandArrow = button.querySelector('.expand-arrow');
    
    // 드롭다운 토글
    pileLowText.classList.toggle('expanded');
    expandArrow.classList.toggle('rotated');
    
    // pile-chart 스타일 조정 (드롭다운이 열렸을 때 하단 보더 제거)
    if (pileLowText.classList.contains('expanded')) {
        pileChart.style.borderBottom = 'none';
    } else {
        pileChart.style.borderBottom = '1px solid #f1f5f9';
    }
}

async function openChatBar() {
    const chatSectionBar = document.getElementById('chatSectionBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    const chatInput = document.querySelector('.chat-input');
    
    // 다른 바들 닫기
    closeOtherBars('chat');
    
    // 입력된 메시지 가져오기
    const message = chatInput.value.trim();
    
    // 메시지가 있다면 채팅바에 추가하고 API 호출
    if (message) {
        // 사용자 메시지 UI에 표시
        displayChatMessage(message, 'user');
        // 입력 필드 클리어
        chatInput.value = '';
        
        // AI 응답 요청
        try {
            const response = await sendChatMessage(message);
            
            // AI 응답 UI에 표시
            displayChatMessage(
                response.answer, 
                'ai', 
                response.sources,
                {
                    agent_type: response.agent_type,
                    confidence: response.confidence,
                    strategy: response.strategy
                }
            );
        } catch (error) {
            console.error('채팅 응답 처리 실패:', error);
            displayChatMessage(
                '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
                'ai'
            );
        }
    }
    
    // 채팅바 열기 및 메인 콘텐츠 축소
    chatSectionBar.classList.add('open');
    mainContent.classList.add('with-chat-bar');
    toggleButton.classList.add('with-chat-bar');
}

function closeChatBar() {
    const chatSectionBar = document.getElementById('chatSectionBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    chatSectionBar.classList.remove('open');
    mainContent.classList.remove('with-chat-bar');
    toggleButton.classList.remove('with-chat-bar');
}

async function sendChatBarMessage() {
    const chatBarInputField = document.getElementById('chatBarInputField');
    const sendButton = document.querySelector('.chat-bar-send-button');
    const message = chatBarInputField.value.trim();
    
    if (message) {
        // 입력 필드와 버튼 비활성화 (중복 요청 방지)
        chatBarInputField.disabled = true;
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.5';
            sendButton.style.cursor = 'not-allowed';
        }
        
        // 사용자 메시지 UI에 표시
        displayChatMessage(message, 'user');
        chatBarInputField.value = '';
        
        // AI 응답 요청
        try {
            const response = await sendChatMessage(message);
            
            // AI 응답 UI에 표시
            displayChatMessage(
                response.answer, 
                'ai', 
                response.sources,
                {
                    agent_type: response.agent_type,
                    confidence: response.confidence,
                    strategy: response.strategy
                }
            );
        } catch (error) {
            console.error('채팅 응답 처리 실패:', error);
            displayChatMessage(
                '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
                'ai'
            );
        } finally {
            // 입력 필드와 버튼 재활성화
            chatBarInputField.disabled = false;
            if (sendButton) {
                sendButton.disabled = false;
                sendButton.style.opacity = '1';
                sendButton.style.cursor = 'pointer';
            }
            chatBarInputField.focus(); // 포커스 복원
        }
    }
}

// 기존 addMessageToChatBar 함수는 dashboard-api.js의 displayChatMessage로 대체됨

// 채팅 세션 초기화 버튼 기능
function clearChatHistory() {
    if (confirm('채팅 기록을 모두 삭제하시겠습니까?')) {
        // UI에서 메시지 제거
        const chatMessages = document.getElementById('chatBarMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        // 백엔드 세션 초기화
        clearChatSession();
        
        console.log('채팅 기록이 초기화되었습니다.');
    }
}

// 채팅 상태 표시 함수
function updateChatStatus(status, message = '') {
    const statusElement = document.getElementById('chatStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `chat-status ${status}`;
    }
}

// 백엔드 연결 상태 확인
async function checkBackendConnection() {
    try {
        console.log('🔍 백엔드 연결 상태 확인 중...');
        updateChatStatus('loading', '서버 연결 확인 중...');
        
        // 에이전트 정보 조회로 연결 테스트 (짧은 타임아웃)
        const agentInfo = await getChatAgentInfo();
        
        if (agentInfo && agentInfo.status !== 'error') {
            console.log('✅ 백엔드 연결 성공:', agentInfo);
            updateChatStatus('success', `서버 연결됨 (${agentInfo.status})`);
            
            // 연결 성공 시 환영 메시지 업데이트
            setTimeout(() => {
                updateChatStatus('', 'AI와 대화를 시작해보세요');
            }, 2000);
        } else {
            throw new Error('에이전트 정보 조회 실패');
        }
        
    } catch (error) {
        console.error('❌ 백엔드 연결 실패:', error);
        
        // 에러 타입에 따른 상세 안내
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            updateChatStatus('error', '서버 응답 시간 초과 - 서버 상태 확인 필요');
        } else if (error.message.includes('Failed to fetch')) {
            updateChatStatus('error', '서버 연결 실패 - 백엔드가 실행 중인지 확인하세요');
        } else {
            updateChatStatus('error', '서버 연결 실패 - 오프라인 모드');
        }
        
        // 재연결 안내
        setTimeout(() => {
            updateChatStatus('error', '백엔드 서버를 시작해주세요 (localhost:8000)');
        }, 3000);
    }
}

// 서버 재연결 시도 함수
async function retryBackendConnection() {
    console.log('🔄 서버 재연결 시도...');
    await checkBackendConnection();
}

function openSummaryBar() {
    const summaryFrameBar = document.getElementById('summaryFrameBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    // 다른 바들 닫기
    closeOtherBars('summary');
    
    // 요약 바 열기 및 메인 콘텐츠 축소
    summaryFrameBar.classList.add('open');
    mainContent.classList.add('with-chat-bar');
    toggleButton.classList.add('with-chat-bar');
}

function closeSummaryBar() {
    const summaryFrameBar = document.getElementById('summaryFrameBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    summaryFrameBar.classList.remove('open');
    mainContent.classList.remove('with-chat-bar');
    toggleButton.classList.remove('with-chat-bar');
}

function openKeywordsBar() {
    const keywordsToolBar = document.getElementById('keywordsToolBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    // 다른 바들 닫기
    closeOtherBars('keywords');
    
    // 키워드 바 열기 및 메인 콘텐츠 축소
    keywordsToolBar.classList.add('open');
    mainContent.classList.add('with-chat-bar');
    toggleButton.classList.add('with-chat-bar');
}

function closeKeywordsBar() {
    const keywordsToolBar = document.getElementById('keywordsToolBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    keywordsToolBar.classList.remove('open');
    mainContent.classList.remove('with-chat-bar');
    toggleButton.classList.remove('with-chat-bar');
}

function closeOtherBars(currentBar) {
    if (currentBar !== 'summary') {
        const summaryBar = document.getElementById('summaryFrameBar');
        summaryBar.classList.remove('open');
    }
    
    if (currentBar !== 'keywords') {
        const keywordsBar = document.getElementById('keywordsToolBar');
        keywordsBar.classList.remove('open');
    }
    
    if (currentBar !== 'chat') {
        const chatBar = document.getElementById('chatSectionBar');
        chatBar.classList.remove('open');
    }
    
    if (currentBar !== 'memo') {
        const memoBar = document.getElementById('stickyMemoBar');
        if (memoBar) {
            memoBar.classList.remove('open');
        }
    }
    
    if (currentBar !== 'newreport') {
        const newReportBar = document.getElementById('newReportBar');
        if (newReportBar) {
            newReportBar.classList.remove('open');
        }
    }
    

    
    // Report bar removed - no longer needed
}

// Report Bar Functions Removed - Awaiting New Design

// Memo Bar Functions
function openMemoBar() {
    const memoBar = document.getElementById('stickyMemoBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    if (!memoBar) {
        console.warn('Memo bar element not found');
        return;
    }
    
    // 다른 바들 닫기
    closeOtherBars('memo');
    
    // 메모 바 열기 및 메인 콘텐츠 축소
    memoBar.classList.add('open');
    mainContent.classList.add('with-chat-bar');
    toggleButton.classList.add('with-chat-bar');
}

function closeMemoBar() {
    const memoBar = document.getElementById('stickyMemoBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    if (!memoBar) return;
    
    memoBar.classList.remove('open');
    mainContent.classList.remove('with-chat-bar');
    toggleButton.classList.remove('with-chat-bar');
}

function minimizeMemoBar() {
    // 메모 바 최소화 기능 (향후 구현)
    console.log('메모 바 최소화');
}

// New Report Bar Functions
function openNewReportBar() {
    const reportBar = document.getElementById('newReportBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    if (!reportBar) {
        console.warn('New report bar element not found');
        return;
    }
    
    // 다른 바들 닫기
    closeOtherBars('newreport');
    
    // 레포트 바 열기 및 메인 콘텐츠 축소
    reportBar.classList.add('open');
    mainContent.classList.add('with-chat-bar');
    toggleButton.classList.add('with-chat-bar');
}

function closeNewReportBar() {
    const reportBar = document.getElementById('newReportBar');
    const mainContent = document.getElementById('mainContent');
    const toggleButton = document.getElementById('sidebarToggle');
    
    if (!reportBar) return;
    
    reportBar.classList.remove('open');
    mainContent.classList.remove('with-chat-bar');
    toggleButton.classList.remove('with-chat-bar');
}



// Memo Management Functions
function addNewMemo() {
    console.log('새 메모 추가');
    // 향후 백엔드 연동 시 구현
}

function editMemo(memoId) {
    console.log('메모 편집:', memoId);
    // 향후 구현
}

function deleteMemo(memoId) {
    console.log('메모 삭제:', memoId);
    // 향후 구현
}

function previousPage() {
    // 이전 페이지 로직 (백엔드 연동 시 구현)
    console.log('이전 페이지로 이동');
}

function nextPage() {
    // 다음 페이지 로직 (백엔드 연동 시 구현)
    console.log('다음 페이지로 이동');
}

// Enter 키로 메시지 전송 및 페이지 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 선택된 폴더 정보 로드
    loadSelectedFolder();
    
    // 백엔드 연결 확인 및 문서 로드
    setTimeout(() => {
        checkBackendConnection();
        if (currentFolder) {
            loadFolderDocuments();
        }
    }, 1000);
    
    const chatBarInputField = document.getElementById('chatBarInputField');
    const chatInput = document.querySelector('.chat-input');
    
    if (chatBarInputField) {
        chatBarInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatBarMessage();
            }
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                openChatBar();
            }
        });
    }
    
    // 드래그 앤 드롭 초기화
    initializeDragAndDrop();
    updateDashboardModulesState();
    
    // 저장된 대시보드 상태 로드
    loadDashboardState();
    
    // 이벤트 리스너 바인딩
    bindEventListeners();
    
    // 파일 이름 편집 핸들러 초기화
    setupFileNameEditHandlers();
});

// 이벤트 리스너 바인딩 함수
function bindEventListeners() {
    // 네비게이션
    document.getElementById('home-icon')?.addEventListener('click', navigateToHome);

    // 사이드바 토글
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleRightSidebar);

    // 기능 버튼
    document.getElementById('extract-keywords-btn')?.addEventListener('click', extractKeywords);
    document.getElementById('generate-summary-btn')?.addEventListener('click', generateSummary);
    document.getElementById('open-chat-bar-btn')?.addEventListener('click', openChatBar);

    // Report bar event listener removed
    document.getElementById('open-memo-bar-btn')?.addEventListener('click', openMemoBar);

    // 닫기 버튼
    document.getElementById('close-summary-bar-btn')?.addEventListener('click', closeSummaryBar);
    document.getElementById('hide-summary-bar-btn')?.addEventListener('click', closeSummaryBar);
    document.getElementById('close-keywords-bar-btn')?.addEventListener('click', closeKeywordsBar);
    document.getElementById('hide-keywords-bar-btn')?.addEventListener('click', closeKeywordsBar);
    document.getElementById('close-chat-bar-btn')?.addEventListener('click', closeChatBar);

    // Report bar close event listeners removed
    document.getElementById('close-memo-bar-btn')?.addEventListener('click', closeMemoBar);
    document.getElementById('minimize-memo-bar-btn')?.addEventListener('click', minimizeMemoBar);
    
    // 메모 관련 버튼들
    document.getElementById('add-new-memo-btn')?.addEventListener('click', addNewMemo);
    
    // 새 리포트 바 버튼들 (기존 Report Tool에서 열리도록)
    document.getElementById('open-report-bar-btn')?.addEventListener('click', openNewReportBar);

    // 보고서 네비게이션
    document.getElementById('prev-page-btn')?.addEventListener('click', previousPage);
    document.getElementById('next-page-btn')?.addEventListener('click', nextPage);

    // 동적 컨텐츠에 대한 이벤트 위임 (문서 목록)
    const pileContainer = document.querySelector('.pile-container');
    if (pileContainer) {
        pileContainer.addEventListener('click', function(e) {
            const target = e.target;
            const pileItem = target.closest('.pile-item');
            if (!pileItem) return;

            // fileId를 pile-chart에서 찾기 (수정됨)
            const pileChart = pileItem.querySelector('.pile-chart');
            const fileId = pileChart?.dataset.fileId;
            if (!fileId) return;

            // 1. 체크박스 또는 라벨 클릭 시
            if (target.matches('.document-checkbox, .checkbox-label')) {
                // 체크박스 직접 클릭한 경우는 onchange 이벤트가 처리
                // 라벨 클릭한 경우만 수동으로 처리
                if (target.classList.contains('checkbox-label')) {
                    const checkbox = pileItem.querySelector(`#doc-${fileId}`);
                    // 라벨 클릭 시 체크박스 상태 토글 (브라우저가 자동으로 해주지만 명시적으로)
                    checkbox.checked = !checkbox.checked;
                    // 선택 상태 업데이트 (onchange가 호출되지 않으므로 수동 호출)
                    toggleDocumentSelection(fileId);
                }
                // 체크박스 직접 클릭은 onchange 이벤트에서 처리되므로 여기서는 추가 처리 안함
                return; // 다른 클릭 이벤트와 중첩되지 않도록 여기서 종료
            }

            // 2. 각종 버튼 클릭 시 (이벤트 위임)
            const button = target.closest('button');
            if (button) {
                if (button.classList.contains('download-btn')) {
                    downloadDocument(fileId);
                } else if (button.classList.contains('more-btn')) {
                    showMoreOptions(fileId);
                } else if (button.classList.contains('expand-btn')) {
                    togglePileContent(button);
                } else if (button.classList.contains('preview-btn')) {
                    previewDocument(fileId);
                } else if (button.classList.contains('full-btn')) {
                    viewFullDocument(fileId);
                }
                return; // 버튼 클릭 후 다른 이벤트 방지
            }

            // 3. 파일 이름 클릭 시 (편집 모드) - 체크박스 토글 방지
            if (target.classList.contains('file-name') && !target.classList.contains('editing')) {
                // 파일 이름 편집은 setupFileNameEditHandlers에서 처리
                return;
            }

            // 4. 버튼이나 체크박스, 파일 이름이 아닌, 파일 행 자체를 클릭했을 때
            if (target.closest('.pile-chart')) {
                const checkbox = pileItem.querySelector(`#doc-${fileId}`);
                checkbox.checked = !checkbox.checked;
                toggleDocumentSelection(fileId);
            }
        });
    }

    // 모듈 제거에 대한 이벤트 위임
    const mainContainer = document.getElementById('mainContainer');
    if(mainContainer) {
        mainContainer.addEventListener('click', function(e){
            const deleteButton = e.target.closest('.delete-btn');
            if(deleteButton) {
                const moduleId = deleteButton.closest('.dashboard-module')?.id;
                if(moduleId) {
                    removeModule(moduleId);
                }
            }
        });
    }

    // 채팅 입력
    document.getElementById('chat-bar-send-btn')?.addEventListener('click', sendChatBarMessage);
    
    // 글꼴 크기 컨트롤 이벤트
    initializeFontSizeControl();
    
    // 전체보기 확장 모드 키보드 이벤트 초기화
    initializeExpandedModeKeyboardEvents();
    
    // 백엔드 연결 상태 확인 (페이지 로드 시)
    setTimeout(() => {
        checkBackendConnection();
    }, 1000); // 1초 후 연결 확인
}

// 대시보드 상태 관리
let dashboardModules = {
    right: [],
    bottom: []
};
let moduleIdCounter = 0;

// 드래그 앤 드롭 초기화
function initializeDragAndDrop() {
    const draggableItems = document.querySelectorAll('[draggable="true"]');
    const dropZones = document.querySelectorAll('.dashboard-modules');
    
    // 드래그 가능한 아이템들에 이벤트 리스너 추가
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
    
    // 드롭 존들에 이벤트 리스너 추가
    dropZones.forEach(dropZone => {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragenter', handleDragEnter);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    const componentType = e.target.getAttribute('data-component');
    e.dataTransfer.setData('text/plain', componentType);
    e.target.classList.add('dragging');
    
    // 모든 드롭 존 표시
    showAllDropZones();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    
    // 모든 드롭 존 숨김
    hideAllDropZones();
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
    const dropZone = e.currentTarget;
    const rect = dropZone.getBoundingClientRect();
    
    // 마우스가 드롭 존을 완전히 벗어났는지 확인
    if (e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top || e.clientY > rect.bottom) {
        dropZone.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');
    
    const componentType = e.dataTransfer.getData('text/plain');
    if (componentType) {
        // 드롭 존 구분
        const isRightZone = dropZone.classList.contains('right-modules');
        const isBottomZone = dropZone.classList.contains('bottom-modules');
        
        addModuleToDashboard(componentType, isRightZone ? 'right' : 'bottom');
    }
    
    // 모든 드롭 존 숨김
    hideAllDropZones();
}

// 대시보드에 모듈 추가
function addModuleToDashboard(componentType, zone) {
    console.log('Adding module:', componentType, 'to zone:', zone); // 디버깅용
    
    const moduleId = `module-${++moduleIdCounter}`;
    const module = {
        id: moduleId,
        type: componentType,
        zone: zone,
        createdAt: new Date()
    };
    
    dashboardModules[zone].push(module);
    renderDashboardModule(module, zone);
    updateDashboardModulesState();
    
    // 로컬 스토리지에 저장
    saveDashboardState();
    
    console.log('Module added successfully:', module); // 디버깅용
}

// 모듈 렌더링
function renderDashboardModule(module, zone) {
    const dashboardModulesContainer = document.getElementById(
        zone === 'right' ? 'dashboardModulesRight' : 'dashboardModulesBottom'
    );
    const moduleElement = createModuleElement(module);
    dashboardModulesContainer.appendChild(moduleElement);
    
    // 드롭된 모듈의 이벤트 리스너 바인딩
    bindModuleEventListeners(moduleElement, module);
}

// 모듈 요소 생성
function createModuleElement(module) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = `dashboard-module module-${module.type}`;
    moduleDiv.id = module.id;
    
    let moduleContent = '';
    
    switch (module.type) {
        case 'chat':
            moduleContent = createChatModuleContent();
            break;
        case 'quiz':
            moduleContent = createQuizModuleContent();
            break;
        case 'keywords':
            moduleContent = createKeywordsModuleContent();
            break;
        case 'summary':
            moduleContent = createSummaryModuleContent();
            break;

        case 'report':
            moduleContent = createReportModuleContent();
            break;
        case 'memo':
            moduleContent = createMemoModuleContent();
            break;
        case 'recommendation':
            moduleContent = createRecommendationModuleContent();
            break;
        default:
            moduleContent = '<p>알 수 없는 모듈 유형입니다.</p>';
    }
    
    moduleDiv.innerHTML = `
        <div class="module-header">
            <h3 class="module-title">${getModuleTitle(module.type)}</h3>
            <div class="module-actions">
                <button class="module-action-btn delete-btn" onclick="removeModule('${module.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                    </svg>
                </button>
            </div>
        </div>
        <div class="module-content">
            ${moduleContent}
        </div>
    `;
    
    return moduleDiv;
}

// 모듈 제목 반환
function getModuleTitle(type) {
    const moduleTypeMap = {
        chat: 'SeeQ Chat',
        quiz: 'Quiz',
        keywords: 'Keywords',
        summary: 'Summary',
        report: 'Report',
        memo: 'Memo',
        recommendation: 'Recommendation'
    };
    return moduleTypeMap[type] || '알 수 없는 모듈';
}

// 각 모듈 타입별 콘텐츠 생성 함수들
function createChatModuleContent() {
    return `
        <div class="chat-input-container">
            <input type="text" class="chat-input module-chat-input" placeholder="질문을 입력하세요...">
            <button class="send-button module-chat-send">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
            </button>
        </div>
        <div class="chat-messages module-chat-messages">
            <div class="welcome-message" style="color: #6b7280; font-size: 14px; text-align: center; margin: auto;">
                💬 AI와 대화를 시작해보세요
            </div>
        </div>
    `;
}

function createQuizModuleContent() {
    return `
        <button class="action-button quiz-mate-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
            </svg>
            Quiz Mate 만나기
        </button>
    `;
}

function createKeywordsModuleContent() {
    return `
        <div class="keywords-display" style="margin-bottom: 16px; min-height: 80px;">
            <div class="keywords-placeholder">
                <div class="placeholder-text">키워드 추출 버튼을 클릭하세요</div>
            </div>
        </div>
        <button class="action-button extract-button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
            </svg>
            키워드 추출
        </button>
    `;
}

function createSummaryModuleContent() {
    return `
        <div class="summary-display-area">
            <div class="summary-placeholder" id="summaryPlaceholder">
                <div class="placeholder-text">요약 생성 버튼을 클릭하세요</div>
                <div class="placeholder-subtext">폴더 내 모든 문서를 요약합니다</div>
            </div>
            
            <!-- 요약 결과 표시 영역 -->
            <div class="summary-result-simple" id="summaryResultArea" style="display: none;">
                <div class="summary-result-header">
                    <div class="summary-result-title" id="summaryResultTitle">요약 결과</div>
                    <button class="summary-expand-btn" id="summaryExpandBtn" title="전체화면으로 보기">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                        확대
                    </button>
                </div>
                <div class="summary-result-meta" id="summaryResultMeta">
                    📋 요약 완료 | 3개 파일 분석
                </div>
                <div class="summary-result-content" id="summaryResultContent">
                    <!-- 요약 내용이 여기에 표시됩니다 -->
                </div>
                <button class="summary-new-btn" id="summaryNewBtn">
                    🔄 새 요약 생성
                </button>
            </div>
        </div>
        <button class="action-button summary-button" id="summaryGenerateBtn" style="margin-top: 16px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            요약 생성
        </button>
    `;
}

function createRecommendationModuleContent() {
    return `
        <div class="recommendation-module-container">
            <div class="recommendation-module-header">
                <h3 class="recommendation-module-title">Recommendation</h3>
                <button class="recommendation-generate-btn" id="recommendationGenerateBtn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                    </svg>
                    추천 생성
                </button>
                </div>
            
            <!-- 로딩 상태 -->
            <div class="recommendation-loading" id="recommendationLoading" style="display: none;">
                <div class="recommendation-loading-content">
                    <div class="recommendation-loading-spinner"></div>
                    <span>AI가 추천을 생성하는 중...</span>
            </div>
                </div>
            
            <!-- 추천 콘텐츠 -->
            <div class="recommendation-content" id="recommendationContent">
                <!-- YouTube 추천 섹션 -->
                <div class="recommendation-section">
                    <div class="recommendation-youtube-grid">
                        <div class="youtube-item">
                            <div class="youtube-thumbnail"></div>
                            <div class="youtube-info">
                                <h4 class="youtube-title">관련 영상 1</h4>
                                <p class="youtube-channel">채널명</p>
            </div>
                </div>
                        <div class="youtube-item">
                            <div class="youtube-thumbnail"></div>
                            <div class="youtube-info">
                                <h4 class="youtube-title">관련 영상 2</h4>
                                <p class="youtube-channel">채널명</p>
                            </div>
                        </div>
                        <div class="youtube-item">
                            <div class="youtube-thumbnail"></div>
                            <div class="youtube-info">
                                <h4 class="youtube-title">관련 영상 3</h4>
                                <p class="youtube-channel">채널명</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 도서/영화 추천 섹션 -->
                <div class="recommendation-section">
                    <div class="book-movie-list">
                        <div class="book-movie-item">
                            <div class="book-movie-thumbnail"></div>
                            <div class="book-movie-info">
                                <h4 class="book-movie-title">추천 도서/영화 1</h4>
                                <p class="book-movie-description">설명 텍스트가 여기에 표시됩니다.</p>
                            </div>
                        </div>
                        <div class="book-movie-item">
                            <div class="book-movie-thumbnail"></div>
                            <div class="book-movie-info">
                                <h4 class="book-movie-title">추천 도서/영화 2</h4>
                                <p class="book-movie-description">설명 텍스트가 여기에 표시됩니다.</p>
                            </div>
                        </div>
                        <div class="book-movie-item">
                            <div class="book-movie-thumbnail"></div>
                            <div class="book-movie-info">
                                <h4 class="book-movie-title">추천 도서/영화 3</h4>
                                <p class="book-movie-description">설명 텍스트가 여기에 표시됩니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 빈 상태 -->
            <div class="recommendation-empty" id="recommendationEmpty" style="display: none;">
                <div class="recommendation-empty-icon">🎯</div>
                <div class="recommendation-empty-text">아직 추천이 없습니다</div>
                <div class="recommendation-empty-subtext">추천 생성 버튼을 눌러 AI 추천을 받아보세요</div>
            </div>
        </div>
    `;
}

function createMemoModuleContent() {
    return `
        <div class="memo-module-container">
            <div class="memo-module-header">
                <div class="memo-module-title-section">
                    <div class="memo-module-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fef3c7" stroke-width="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                    </div>
                    <h3 class="memo-module-title">Memo</h3>
                    <div class="memo-module-count" id="memoCount">(0)</div>
                </div>
                <button class="memo-module-add-btn" id="memoAddBtn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
            
            <!-- 새 메모 작성 폼 (숨김 상태) -->
            <div class="memo-module-new-form" id="memoNewForm" style="display: none;">
                <input type="text" class="memo-new-title" id="memoNewTitle" placeholder="제목 (선택사항)">
                <textarea class="memo-new-content" id="memoNewContent" placeholder="메모 내용을 입력하세요..." rows="3"></textarea>
                <div class="memo-new-actions">
                    <div class="memo-color-picker">
                        <button class="memo-color-btn active" data-color="#fef3c7" style="background: #fef3c7;"></button>
                        <button class="memo-color-btn" data-color="#d9d9d9" style="background: #d9d9d9;"></button>
                        <button class="memo-color-btn" data-color="#fecaca" style="background: #fecaca;"></button>
                        <button class="memo-color-btn" data-color="#bfdbfe" style="background: #bfdbfe;"></button>
                        <button class="memo-color-btn" data-color="#bbf7d0" style="background: #bbf7d0;"></button>
                    </div>
                    <div class="memo-form-buttons">
                        <button class="memo-cancel-btn" id="memoCancelBtn">취소</button>
                        <button class="memo-save-btn" id="memoSaveBtn">저장</button>
                    </div>
                </div>
                </div>
                
            <!-- 로딩 상태 -->
            <div class="memo-module-loading" id="memoLoading" style="display: none;">
                <div class="memo-loading-spinner"></div>
                <span>메모를 불러오는 중...</span>
                    </div>
            
            <!-- 메모 목록 -->
            <div class="memo-module-list" id="memoList">
                <!-- 동적으로 메모가 추가됩니다 -->
                </div>
            
            <!-- 빈 상태 -->
            <div class="memo-module-empty" id="memoEmpty" style="display: none;">
                <div class="memo-empty-icon">📝</div>
                <div class="memo-empty-text">아직 메모가 없습니다</div>
                <div class="memo-empty-subtext">+ 버튼을 눌러 첫 메모를 작성해보세요</div>
            </div>
            
            <div class="memo-module-footer">
                <button class="memo-module-view-all" id="memoViewAll">전체 보기</button>
            </div>
        </div>
        
        <!-- 전체 보기 모달 -->
        <div class="memo-modal-overlay" id="memoModalOverlay" style="display: none;">
            <div class="memo-modal">
                <div class="memo-modal-header">
                    <h3>전체 메모</h3>
                    <button class="memo-modal-close" id="memoModalClose">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                </button>
                </div>
                <div class="memo-modal-content" id="memoModalContent">
                    <!-- 전체 메모 목록이 여기에 표시됩니다 -->
                </div>
            </div>
        </div>
        
        <!-- 메모 편집 모달 -->
        <div class="memo-edit-modal-overlay" id="memoEditModalOverlay" style="display: none;">
            <div class="memo-edit-modal">
                <div class="memo-edit-modal-header">
                    <h3>메모 편집</h3>
                    <button class="memo-edit-modal-close" id="memoEditModalClose">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="memo-edit-modal-content">
                    <input type="text" class="memo-edit-title" id="memoEditTitle" placeholder="제목">
                    <textarea class="memo-edit-content" id="memoEditContent" placeholder="메모 내용" rows="10"></textarea>
                    <div class="memo-edit-actions">
                        <div class="memo-color-picker">
                            <button class="memo-color-btn" data-color="#fef3c7" style="background: #fef3c7;"></button>
                            <button class="memo-color-btn" data-color="#d9d9d9" style="background: #d9d9d9;"></button>
                            <button class="memo-color-btn" data-color="#fecaca" style="background: #fecaca;"></button>
                            <button class="memo-color-btn" data-color="#bfdbfe" style="background: #bfdbfe;"></button>
                            <button class="memo-color-btn" data-color="#bbf7d0" style="background: #bbf7d0;"></button>
                        </div>
                        <div class="memo-edit-buttons">
                            <button class="memo-edit-delete-btn" id="memoEditDeleteBtn">삭제</button>
                            <button class="memo-edit-cancel-btn" id="memoEditCancelBtn">취소</button>
                            <button class="memo-edit-save-btn" id="memoEditSaveBtn">저장</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function createReportModuleContent() {
    return `
        <div class="report-module-container">
            <!-- 초기 화면: 보고서 생성 및 기존 보고서 목록 -->
            <div class="report-initial-screen">
                <!-- 새 보고서 생성 섹션 -->
                <div class="report-new-section">
                    <div class="report-section-title">📝 새 보고서 생성</div>
                    
                    <div class="report-folder-info">
                        <div class="report-folder-label">📁 현재 폴더:</div>
                        <div class="report-folder-name" id="reportCurrentFolder">폴더를 선택해주세요</div>
                    </div>
                    
                    <div class="report-title-input-section">
                        <label class="report-input-label">📝 제목 (주제):</label>
                        <input type="text" 
                               class="report-title-input" 
                               id="reportTitleInput"
                               placeholder="보고서 주제를 입력하세요 (선택사항)">
                    </div>
                    
                    <button class="report-generate-btn" id="reportGenerateBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        🚀 보고서 생성
                    </button>
                </div>
                
                <!-- 기존 보고서 목록 섹션 -->
                <div class="report-history-section">
                    <div class="report-section-title">
                        📚 기존 보고서
                        <button class="report-refresh-btn" id="reportRefreshBtn" title="새로고침">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <polyline points="1 20 1 14 7 14"></polyline>
                                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="report-history-list" id="reportHistoryList">
                        <div class="report-history-loading">
                            <div class="report-loading-spinner"></div>
                            <span>보고서 목록을 불러오는 중...</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 생성 중 화면 -->
            <div class="report-generating-screen" style="display: none;">
                <div class="report-generating-content">
                    <div class="report-generating-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" class="report-spinner">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                    </div>
                    <div class="report-generating-text">🔄 보고서 생성 중...</div>
                    <div class="report-progress-bar">
                        <div class="report-progress-fill" id="reportProgressFill"></div>
                    </div>
                    <div class="report-generating-status" id="reportGeneratingStatus">
                        📝 문서 분석 중...
                    </div>
                    <div class="report-estimated-time">⏱️ 예상 시간: 1-2분</div>
                </div>
            </div>
            
            <!-- 완성된 보고서 화면 -->
            <div class="report-completed-screen" style="display: none;">
                <div class="report-header-info">
                    <div class="report-title-display" id="reportTitleDisplay">보고서 제목</div>
                    <div class="report-subtitle-display" id="reportSubtitleDisplay">보고서 부제목</div>
                </div>
                
                <div class="report-actions">
                    <button class="report-action-btn report-view-btn" id="reportViewBtn">
                        📖 전체 보기
                    </button>
                    <button class="report-action-btn report-save-btn" id="reportSaveBtn">
                        💾 저장
                    </button>
                    <button class="report-action-btn report-share-btn" id="reportShareBtn">
                        🔗 공유
                    </button>
                </div>
                
                <div class="report-summary-info">
                    <div class="report-summary-title">📊 요약:</div>
                    <div class="report-summary-stats" id="reportSummaryStats">
                        <div class="report-stat">• 페이지: <span id="reportPages">-</span>페이지</div>
                        <div class="report-stat">• 문자: <span id="reportChars">-</span>자</div>
                        <div class="report-stat">• 파일: <span id="reportFiles">-</span>개</div>
                    </div>
                </div>
                
                <button class="report-new-btn" id="reportNewBtn">
                    ➕ 새 보고서 생성
                </button>
            </div>
            
            <!-- 보고서 상세 보기 화면 (모듈 내부) -->
            <div class="report-detail-screen" id="reportDetailScreen" style="display: none;">
                <div class="report-detail-header">
                    <div class="report-detail-title" id="reportDetailTitle">보고서 제목</div>
                    <div class="report-detail-actions">
                        <button class="report-expand-btn" id="reportExpandBtn" title="전체화면으로 보기">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                            </svg>
                            확대
                        </button>
                        <button class="report-detail-close" id="reportDetailClose">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                            돌아가기
                        </button>
                    </div>
                </div>
                <div class="report-detail-subtitle" id="reportDetailSubtitle">보고서 부제목</div>
                <div class="report-detail-meta" id="reportDetailMeta">
                    📋 2024년 12월 20일 | 3페이지 | 3파일
                </div>
                
                <div class="report-detail-body" id="reportDetailBody">
                    <div class="report-section">
                        <h3>1. 서론</h3>
                        <div class="report-section-content" id="reportIntroduction">
                            서론 내용이 여기에 표시됩니다...
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <h3>2. 본론</h3>
                        <div class="report-subsection" id="reportMainContent">
                            본론 내용이 여기에 표시됩니다...
                        </div>
                    </div>
                    
                    <div class="report-section">
                        <h3>3. 결론</h3>
                        <div class="report-section-content" id="reportConclusion">
                            결론 내용이 여기에 표시됩니다...
                        </div>
                    </div>
                </div>
                
                <div class="report-detail-actions">
                    <button class="report-detail-action-btn">📥 다운로드</button>
                    <button class="report-detail-action-btn">📧 이메일</button>
                    <button class="report-detail-action-btn">🖨️ 인쇄</button>
                </div>
            </div>
        </div>
    `;
}

// 모듈 제거
function removeModule(moduleId) {
    // 어느 존에서 제거할지 찾기
    let targetZone = null;
    let moduleIndex = -1;
    
    ['right', 'bottom'].forEach(zone => {
        const index = dashboardModules[zone].findIndex(module => module.id === moduleId);
        if (index !== -1) {
            targetZone = zone;
            moduleIndex = index;
        }
    });
    
    if (targetZone) {
        // 상태에서 제거
        dashboardModules[targetZone].splice(moduleIndex, 1);
        
        // DOM에서 제거
        const moduleElement = document.getElementById(moduleId);
        if (moduleElement) {
            moduleElement.remove();
        }
        
        // 상태 업데이트
        updateDashboardModulesState();
        saveDashboardState();
    }
}

// 대시보드 모듈 상태 업데이트
function updateDashboardModulesState() {
    const rightContainer = document.getElementById('dashboardModulesRight');
    const bottomContainer = document.getElementById('dashboardModulesBottom');
    
    // 우측 영역 상태 업데이트
    if (dashboardModules.right.length === 0) {
        rightContainer.classList.add('empty');
        rightContainer.classList.remove('has-modules');
    } else {
        rightContainer.classList.remove('empty');
        rightContainer.classList.add('has-modules');
    }
    
    // 하단 영역 상태 업데이트
    if (dashboardModules.bottom.length === 0) {
        bottomContainer.classList.add('empty');
        bottomContainer.classList.remove('has-modules');
    } else {
        bottomContainer.classList.remove('empty');
        bottomContainer.classList.add('has-modules');
    }
}

// 대시보드 상태 저장
function saveDashboardState() {
    localStorage.setItem('dashboardModules', JSON.stringify(dashboardModules));
}

// 대시보드 상태 로드
function loadDashboardState() {
    const saved = localStorage.getItem('dashboardModules');
    if (saved) {
        const loadedModules = JSON.parse(saved);
        
        // 기존 구조 호환성 처리
        if (Array.isArray(loadedModules)) {
            dashboardModules = { right: [], bottom: [] };
        } else {
            dashboardModules = loadedModules;
        }
        
        // 모듈 카운터 초기화 - 기존 모듈들의 최대 ID를 찾아서 설정
        let maxId = 0;
        ['right', 'bottom'].forEach(zone => {
            if (dashboardModules[zone]) {
                dashboardModules[zone].forEach(module => {
                    // module-123에서 숫자 부분 추출
                    const idNumber = parseInt(module.id.replace('module-', ''));
                    if (idNumber > maxId) {
                        maxId = idNumber;
                    }
                    renderDashboardModule(module, zone);
                });
            }
        });
        
        // 다음 모듈 ID를 위한 카운터 설정
        moduleIdCounter = maxId;
        
        updateDashboardModulesState();
    }
}

// 모든 드롭 존 표시
function showAllDropZones() {
    const dropZones = document.querySelectorAll('.dashboard-modules');
    dropZones.forEach(zone => {
        zone.classList.add('drop-zone-visible');
    });
}

// 모든 드롭 존 숨김
function hideAllDropZones() {
    const dropZones = document.querySelectorAll('.dashboard-modules');
    dropZones.forEach(zone => {
        zone.classList.remove('drop-zone-visible');
        zone.classList.remove('drag-over');
    });
} 

// 드롭된 모듈의 이벤트 리스너 바인딩
function bindModuleEventListeners(moduleElement, module) {
    if (module.type === 'chat') {
        bindChatModuleEvents(moduleElement);
    } else if (module.type === 'keywords') {
        bindKeywordsModuleEvents(moduleElement);
    } else if (module.type === 'summary') {
        bindSummaryModuleEvents(moduleElement);
    } else if (module.type === 'report') {
        bindReportModuleEvents(moduleElement);
    } else if (module.type === 'recommendation') {
        bindRecommendationModuleEvents(moduleElement);
    } else if (module.type === 'memo') {
        bindMemoModuleEvents(moduleElement);
    }
}

// 챗봇 모듈 이벤트 바인딩
function bindChatModuleEvents(moduleElement) {
    const chatInput = moduleElement.querySelector('.module-chat-input');
    const sendButton = moduleElement.querySelector('.module-chat-send');
    const messagesContainer = moduleElement.querySelector('.module-chat-messages');
    
    if (!chatInput || !sendButton || !messagesContainer) return;
    
    // 메시지 전송 함수
    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 입력 필드와 버튼 비활성화 (중복 요청 방지)
        chatInput.disabled = true;
        sendButton.disabled = true;
        sendButton.style.opacity = '0.5';
        sendButton.style.cursor = 'not-allowed';
        
        // 사용자 메시지 표시
        displayModuleChatMessage(messagesContainer, message, 'user');
        chatInput.value = '';
        
        // 로딩 메시지 표시
        const loadingMessage = displayModuleChatMessage(messagesContainer, '응답을 생성하는 중...', 'ai-loading');
        
        try {
            // AI 응답 요청
            const response = await sendChatMessage(message);
            
            // 로딩 메시지 제거
            if (loadingMessage) {
                loadingMessage.remove();
            }
            
            // AI 응답 표시
            displayModuleChatMessage(
                messagesContainer, 
                response.answer, 
                'ai', 
                response.sources,
                {
                    agent_type: response.agent_type,
                    confidence: response.confidence,
                    strategy: response.strategy
                }
            );
        } catch (error) {
            console.error('챗봇 모듈 응답 처리 실패:', error);
            
            // 로딩 메시지 제거
            if (loadingMessage) {
                loadingMessage.remove();
            }
            
            displayModuleChatMessage(
                messagesContainer,
                '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.',
                'ai'
            );
        } finally {
            // 입력 필드와 버튼 재활성화
            chatInput.disabled = false;
            sendButton.disabled = false;
            sendButton.style.opacity = '1';
            sendButton.style.cursor = 'pointer';
            chatInput.focus(); // 포커스 복원
        }
    };
    
    // 이벤트 리스너 추가
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 모듈 채팅 메시지 표시 함수
function displayModuleChatMessage(messagesContainer, message, sender = 'user', sources = null, metadata = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = `message-bubble ${sender}-bubble`;
    
    // 메시지 텍스트 추가
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.textContent = message;
    messageBubble.appendChild(messageText);
    
    // AI 메시지인 경우 추가 정보 표시
    if (sender === 'ai' && (sources || metadata)) {
        // 소스 정보 표시
        if (sources && sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.className = 'message-sources';
            sourcesDiv.innerHTML = `
                <div class="sources-header">📚 참고 문서:</div>
                ${sources.map(source => `
                    <div class="source-item">
                        <span class="source-filename">${source.filename || '문서'}</span>
                        ${source.page ? `<span class="source-page">(${source.page}페이지)</span>` : ''}
                    </div>
                `).join('')}
            `;
            messageBubble.appendChild(sourcesDiv);
        }
        
        // 메타데이터 정보 표시 (개발 모드에서만)
        if (metadata && window.location.hostname === 'localhost') {
            const metadataDiv = document.createElement('div');
            metadataDiv.className = 'message-metadata';
            metadataDiv.innerHTML = `
                <div class="metadata-item">🤖 ${metadata.agent_type || 'AI'}</div>
                ${metadata.confidence ? `<div class="metadata-item">📊 신뢰도: ${Math.round(metadata.confidence * 100)}%</div>` : ''}
                ${metadata.strategy ? `<div class="metadata-item">🎯 전략: ${metadata.strategy}</div>` : ''}
            `;
            messageBubble.appendChild(metadataDiv);
        }
    }
    
    // 타임스탬프 추가
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    messageBubble.appendChild(timestamp);
    
    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    
    // 스크롤을 최신 메시지로 이동
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 로딩 메시지인 경우 제거를 위해 요소 반환
    if (sender === 'ai-loading') {
        return messageDiv;
    }
}

// 키워드 모듈 이벤트 바인딩
function bindKeywordsModuleEvents(moduleElement) {
    const extractButton = moduleElement.querySelector('.extract-button');
    if (extractButton) {
        extractButton.addEventListener('click', extractKeywords);
    }
}

// 요약 모듈 이벤트 바인딩
function bindSummaryModuleEvents(moduleElement) {
    const summaryButton = moduleElement.querySelector('#summaryGenerateBtn');
    if (summaryButton) {
        summaryButton.addEventListener('click', () => generateSummaryForModule(moduleElement));
    }
    
    // 확대 버튼
    const summaryExpandBtn = moduleElement.querySelector('#summaryExpandBtn');
    if (summaryExpandBtn) {
        summaryExpandBtn.addEventListener('click', () => expandSummaryView(moduleElement));
    }
    
    // 새 요약 생성 버튼
    const summaryNewBtn = moduleElement.querySelector('#summaryNewBtn');
    if (summaryNewBtn) {
        summaryNewBtn.addEventListener('click', () => resetSummaryModule(moduleElement));
    }
}

// 보고서 모듈 이벤트 바인딩
function bindReportModuleEvents(moduleElement) {
    // 현재 폴더 정보 표시
    updateReportFolderInfo(moduleElement);
    
    // 보고서 생성 버튼
    const reportGenerateBtn = moduleElement.querySelector('#reportGenerateBtn');
    if (reportGenerateBtn) {
        reportGenerateBtn.addEventListener('click', () => generateReport(moduleElement));
    }
    
    // 보고서 새로고침 버튼
    const reportRefreshBtn = moduleElement.querySelector('#reportRefreshBtn');
    if (reportRefreshBtn) {
        reportRefreshBtn.addEventListener('click', () => loadReportHistory(moduleElement));
    }
    
    // 전체 보기 버튼
    const reportViewBtn = moduleElement.querySelector('#reportViewBtn');
    if (reportViewBtn) {
        reportViewBtn.addEventListener('click', () => showReportDetail(moduleElement));
    }
    
    // 새 보고서 생성 버튼
    const reportNewBtn = moduleElement.querySelector('#reportNewBtn');
    if (reportNewBtn) {
        reportNewBtn.addEventListener('click', () => resetReportModule(moduleElement));
    }
    
    // 상세보기 닫기 버튼
    const reportDetailClose = moduleElement.querySelector('#reportDetailClose');
    if (reportDetailClose) {
        reportDetailClose.addEventListener('click', () => hideReportDetail(moduleElement));
    }
    
    // 확대 버튼
    const reportExpandBtn = moduleElement.querySelector('#reportExpandBtn');
    if (reportExpandBtn) {
        reportExpandBtn.addEventListener('click', () => expandReportView(moduleElement));
    }
    
    // 보고서 목록 로드
    loadReportHistory(moduleElement);
}

// Recommendation 모듈 이벤트 바인딩
function bindRecommendationModuleEvents(moduleElement) {
    // 추천 생성 버튼 이벤트
    const generateBtn = moduleElement.querySelector('#recommendationGenerateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            await generateRecommendationsForModule(moduleElement);
        });
    }
    
    // YouTube 아이템 클릭 이벤트
    bindYouTubeItemEvents(moduleElement);
    
    // 도서/영화 아이템 클릭 이벤트
    bindBookMovieItemEvents(moduleElement);
    
    // 폴더 변경 시 자동 추천 로드 (초기 로드)
    if (typeof currentFolder !== 'undefined' && currentFolder && currentFolder.id) {
        loadRecommendationsForModule(moduleElement, currentFolder.id);
    } else {
        showRecommendationEmptyState(moduleElement);
    }
}

// YouTube 아이템 이벤트 바인딩
function bindYouTubeItemEvents(moduleElement) {
    const youtubeItems = moduleElement.querySelectorAll('.youtube-item');
    youtubeItems.forEach(item => {
        item.addEventListener('click', () => {
            const youtubeUrl = item.dataset.youtubeUrl;
            const videoId = item.dataset.videoId;
            const title = item.querySelector('.youtube-title')?.textContent;
            
            if (youtubeUrl) {
                console.log('YouTube 영상 재생:', title);
                playYouTubeVideo(youtubeUrl, videoId);
            } else {
                console.log('YouTube URL이 없습니다:', title);
            }
        });
    });
}

// 도서/영화 아이템 이벤트 바인딩
function bindBookMovieItemEvents(moduleElement) {
    const bookMovieItems = moduleElement.querySelectorAll('.book-movie-item');
    bookMovieItems.forEach(item => {
        item.addEventListener('click', () => {
            const externalUrl = item.dataset.externalUrl;
            const contentType = item.dataset.contentType;
            const title = item.querySelector('.book-movie-title')?.textContent;
            
            if (externalUrl) {
                console.log(`${contentType} 링크 열기:`, title);
                openExternalLink(externalUrl, contentType);
            } else {
                console.log('외부 링크가 없습니다:', title);
            }
        });
    });
}

// 모듈별 추천 생성
async function generateRecommendationsForModule(moduleElement) {
    try {
        if (!currentFolder || !currentFolder.id) {
            showNotification('폴더를 먼저 선택해주세요.', 'warning');
            return;
        }
        
        // 로딩 상태 표시
        showRecommendationLoading(moduleElement);
        
        // 추천 생성 API 호출
        const result = await generateFolderRecommendations(currentFolder.id);
        
        if (result && result.recommendations && result.recommendations.length > 0) {
            // 추천 결과 표시
            displayRecommendationInModule(moduleElement, result.recommendations, result);
            showRecommendationContent(moduleElement);
        } else {
            // 빈 상태 표시
            showRecommendationEmptyState(moduleElement);
        }
        
    } catch (error) {
        console.error('추천 생성 실패:', error);
        showRecommendationEmptyState(moduleElement);
        showNotification('추천 생성에 실패했습니다.', 'error');
    }
}

// 모듈별 추천 로드 (자동)
async function loadRecommendationsForModule(moduleElement, folderId) {
    try {
        // 기존 추천이 있는지 확인 (캐시된 데이터)
        if (moduleElement.recommendationData && moduleElement.recommendationData.recommendations.length > 0) {
            showRecommendationContent(moduleElement);
            return;
        }
        
        // 자동 생성은 하지 않고 빈 상태만 표시
        showRecommendationEmptyState(moduleElement);
        
    } catch (error) {
        console.error('추천 로드 실패:', error);
        showRecommendationEmptyState(moduleElement);
    }
}

// 추천 로딩 상태 표시
function showRecommendationLoading(moduleElement) {
    const loading = moduleElement.querySelector('#recommendationLoading');
    const content = moduleElement.querySelector('#recommendationContent');
    const empty = moduleElement.querySelector('#recommendationEmpty');
    const generateBtn = moduleElement.querySelector('#recommendationGenerateBtn');
    
    if (loading) loading.style.display = 'flex';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.querySelector('svg').style.animation = 'spin 1s linear infinite';
    }
}

// 추천 콘텐츠 표시
function showRecommendationContent(moduleElement) {
    const loading = moduleElement.querySelector('#recommendationLoading');
    const content = moduleElement.querySelector('#recommendationContent');
    const empty = moduleElement.querySelector('#recommendationEmpty');
    const generateBtn = moduleElement.querySelector('#recommendationGenerateBtn');
    
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.querySelector('svg').style.animation = 'none';
    }
    
    // 이벤트 재바인딩 (동적 콘텐츠용)
    bindYouTubeItemEvents(moduleElement);
    bindBookMovieItemEvents(moduleElement);
}

// 추천 빈 상태 표시
function showRecommendationEmptyState(moduleElement) {
    const loading = moduleElement.querySelector('#recommendationLoading');
    const content = moduleElement.querySelector('#recommendationContent');
    const empty = moduleElement.querySelector('#recommendationEmpty');
    const generateBtn = moduleElement.querySelector('#recommendationGenerateBtn');
    
    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'block';
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.querySelector('svg').style.animation = 'none';
    }
}

// 메모 모듈 이벤트 바인딩
function bindMemoModuleEvents(moduleElement) {
    // 메모 추가 버튼
    const addBtn = moduleElement.querySelector('#memoAddBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showMemoNewForm(moduleElement));
    }
    
    // 새 메모 폼 이벤트
    bindMemoNewFormEvents(moduleElement);
    
    // 전체 보기 버튼
    const viewAllBtn = moduleElement.querySelector('#memoViewAll');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => showMemoModal(moduleElement));
    }
    
    // 모달 이벤트
    bindMemoModalEvents(moduleElement);
    
    // 편집 모달 이벤트
    bindMemoEditModalEvents(moduleElement);
    
    // 폴더 변경 시 메모 목록 새로고침
    if (typeof currentFolder !== 'undefined' && currentFolder) {
        loadMemoList(moduleElement, currentFolder.id);
    }
}

// 현재 폴더 정보 업데이트
function updateReportFolderInfo(moduleElement) {
    const folderNameElement = moduleElement.querySelector('#reportCurrentFolder');
    if (folderNameElement && currentFolder && currentFolder.title) {
        folderNameElement.textContent = currentFolder.title;
    } else if (folderNameElement) {
        folderNameElement.textContent = '폴더를 선택해주세요';
    }
}

// 보고서 생성 함수
async function generateReport(moduleElement) {
    try {
        // 현재 폴더 확인
        if (!currentFolder || !currentFolder.id) {
            showReportError(moduleElement, '폴더를 먼저 선택해주세요.');
            return;
        }
        
        // 사용자 입력 제목 가져오기
        const titleInput = moduleElement.querySelector('#reportTitleInput');
        const customTitle = titleInput ? titleInput.value.trim() : '';
        
        console.log('🚀 보고서 생성 시작:', {
            folderId: currentFolder.id,
            folderTitle: currentFolder.title,
            customTitle: customTitle
        });
        
        // 화면 전환: 초기 → 생성 중
        showReportGeneratingScreen(moduleElement);
        
        // 1단계: 폴더 파일 목록 조회
        updateReportProgress(moduleElement, 20, '📁 폴더 파일 조회 중...');
        const filesResponse = await ApiService.get(`/reports/files/${currentFolder.id}`);
        
        if (!filesResponse || !Array.isArray(filesResponse) || filesResponse.length === 0) {
            throw new Error('폴더에 분석할 파일이 없습니다.');
        }
        
        // 모든 파일 선택 (자동)
        const selectedFiles = filesResponse.map(file => ({
            file_id: file.file_id,
            filename: file.filename,
            file_type: file.file_type,
            selected: true
        }));
        
        console.log('📄 선택된 파일들:', selectedFiles);
        
        // 2단계: 보고서 생성 요청
        updateReportProgress(moduleElement, 50, '🧠 AI 분석 중... (최대 3분 소요)');
        
        const reportRequest = {
            folder_id: currentFolder.id,
            selected_files: selectedFiles,
            custom_title: customTitle || null,
            background_generation: false // 동기 처리
        };
        
        console.log('📤 보고서 생성 요청 데이터:', reportRequest);
        console.log('📁 현재 폴더 정보:', currentFolder);
        console.log('📄 선택된 파일 수:', selectedFiles.length);
        console.log('⏱️ 타임아웃 설정: 3분 (180초)');
        
        const reportResponse = await ApiService.postLongTask('/reports/generate', reportRequest, 180000); // 3분 타임아웃
        
        if (!reportResponse || !reportResponse.report_id) {
            throw new Error('보고서 생성에 실패했습니다.');
        }
        
        // 3단계: 생성된 보고서 조회
        updateReportProgress(moduleElement, 80, '📑 보고서 완성 중...');
        
        const reportData = await ApiService.get(`/reports/${reportResponse.report_id}`);
        
        if (!reportData) {
            throw new Error('생성된 보고서를 불러올 수 없습니다.');
        }
        
        // 4단계: 완성 화면 표시
        updateReportProgress(moduleElement, 100, '✅ 완성!');
        
        setTimeout(() => {
            showReportCompletedScreen(moduleElement, reportData);
            // 보고서 목록 새로고침 (새로 생성된 보고서 반영)
            loadReportHistory(moduleElement);
        }, 1000);
        
        console.log('✅ 보고서 생성 완료:', reportData);
        
    } catch (error) {
        console.error('❌ 보고서 생성 실패:', error);
        
        let errorMessage = '보고서 생성 중 오류가 발생했습니다.';
        
        if (error.name === 'AbortError') {
            errorMessage = '⏰ 보고서 생성 시간이 초과되었습니다. 파일 수를 줄이거나 잠시 후 다시 시도해주세요.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showReportError(moduleElement, errorMessage);
    }
}

// 생성 중 화면 표시
function showReportGeneratingScreen(moduleElement) {
    const initialScreen = moduleElement.querySelector('.report-initial-screen');
    const generatingScreen = moduleElement.querySelector('.report-generating-screen');
    const completedScreen = moduleElement.querySelector('.report-completed-screen');
    
    if (initialScreen) initialScreen.style.display = 'none';
    if (generatingScreen) generatingScreen.style.display = 'block';
    if (completedScreen) completedScreen.style.display = 'none';
    
    // 진행률 초기화
    updateReportProgress(moduleElement, 0, '🔄 시작 중...');
}

// 진행률 업데이트
function updateReportProgress(moduleElement, percentage, status) {
    const progressFill = moduleElement.querySelector('#reportProgressFill');
    const statusElement = moduleElement.querySelector('#reportGeneratingStatus');
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (statusElement) {
        statusElement.textContent = status;
    }
}

// 완성된 보고서 화면 표시
function showReportCompletedScreen(moduleElement, reportData) {
    const initialScreen = moduleElement.querySelector('.report-initial-screen');
    const generatingScreen = moduleElement.querySelector('.report-generating-screen');
    const completedScreen = moduleElement.querySelector('.report-completed-screen');
    
    if (initialScreen) initialScreen.style.display = 'none';
    if (generatingScreen) generatingScreen.style.display = 'none';
    if (completedScreen) completedScreen.style.display = 'block';
    
    // 보고서 정보 표시
    const titleDisplay = moduleElement.querySelector('#reportTitleDisplay');
    const subtitleDisplay = moduleElement.querySelector('#reportSubtitleDisplay');
    const pagesSpan = moduleElement.querySelector('#reportPages');
    const charsSpan = moduleElement.querySelector('#reportChars');
    const filesSpan = moduleElement.querySelector('#reportFiles');
    
    if (titleDisplay) titleDisplay.textContent = reportData.title || '보고서 제목';
    if (subtitleDisplay) subtitleDisplay.textContent = reportData.subtitle || '보고서 부제목';
    if (pagesSpan) pagesSpan.textContent = reportData.metadata?.total_pages || '-';
    if (charsSpan) charsSpan.textContent = reportData.metadata?.character_count?.toLocaleString() || '-';
    if (filesSpan) filesSpan.textContent = reportData.selected_files?.length || '-';
    
    // 보고서 데이터를 모듈에 저장
    moduleElement.reportData = reportData;
}

// 보고서 상세 보기
function showReportDetail(moduleElement) {
    const initialScreen = moduleElement.querySelector('.report-initial-screen');
    const generatingScreen = moduleElement.querySelector('.report-generating-screen');
    const completedScreen = moduleElement.querySelector('.report-completed-screen');
    const detailScreen = moduleElement.querySelector('#reportDetailScreen');
    const reportData = moduleElement.reportData;
    
    if (!detailScreen || !reportData) return;
    
    // 화면 전환
    if (initialScreen) initialScreen.style.display = 'none';
    if (generatingScreen) generatingScreen.style.display = 'none';
    if (completedScreen) completedScreen.style.display = 'none';
    if (detailScreen) detailScreen.style.display = 'block';
    
    // 상세보기 내용 업데이트
    const titleElement = moduleElement.querySelector('#reportDetailTitle');
    const subtitleElement = moduleElement.querySelector('#reportDetailSubtitle');
    const metaElement = moduleElement.querySelector('#reportDetailMeta');
    const introElement = moduleElement.querySelector('#reportIntroduction');
    const mainContentElement = moduleElement.querySelector('#reportMainContent');
    const conclusionElement = moduleElement.querySelector('#reportConclusion');
    
    if (titleElement) titleElement.textContent = reportData.title;
    if (subtitleElement) subtitleElement.textContent = reportData.subtitle;
    
    if (metaElement) {
        const createdDate = new Date(reportData.created_at).toLocaleDateString('ko-KR');
        metaElement.textContent = `📋 ${createdDate} | ${reportData.metadata?.total_pages || 0}페이지 | ${reportData.selected_files?.length || 0}파일`;
    }
    
    // 보고서 내용 표시
    if (introElement && reportData.report_structure?.introduction) {
        introElement.textContent = reportData.report_structure.introduction;
    }
    
    if (mainContentElement && reportData.report_structure?.main_content) {
        const mainContent = reportData.report_structure.main_content;
        let mainHtml = '';
        
        Object.keys(mainContent).forEach((sectionKey, index) => {
            const section = mainContent[sectionKey];
            mainHtml += `
                <div class="report-subsection">
                    <h4>2.${index + 1} ${section.title}</h4>
                    <div class="report-subsection-content">${section.content}</div>
                </div>
            `;
        });
        
        mainContentElement.innerHTML = mainHtml;
    }
    
    if (conclusionElement && reportData.report_structure?.conclusion) {
        conclusionElement.textContent = reportData.report_structure.conclusion;
    }
}

// 보고서 상세 보기 숨기기 (완성된 화면으로 돌아가기)
function hideReportDetail(moduleElement) {
    const initialScreen = moduleElement.querySelector('.report-initial-screen');
    const generatingScreen = moduleElement.querySelector('.report-generating-screen');
    const completedScreen = moduleElement.querySelector('.report-completed-screen');
    const detailScreen = moduleElement.querySelector('#reportDetailScreen');
    
    // 화면 전환 (완성된 화면으로 돌아가기)
    if (initialScreen) initialScreen.style.display = 'none';
    if (generatingScreen) generatingScreen.style.display = 'none';
    if (detailScreen) detailScreen.style.display = 'none';
    if (completedScreen) completedScreen.style.display = 'block';
}

// 보고서 모듈 초기화 (새 보고서 생성)
function resetReportModule(moduleElement) {
    const initialScreen = moduleElement.querySelector('.report-initial-screen');
    const generatingScreen = moduleElement.querySelector('.report-generating-screen');
    const completedScreen = moduleElement.querySelector('.report-completed-screen');
    const titleInput = moduleElement.querySelector('#reportTitleInput');
    
    if (initialScreen) initialScreen.style.display = 'block';
    if (generatingScreen) generatingScreen.style.display = 'none';
    if (completedScreen) completedScreen.style.display = 'none';
    if (titleInput) titleInput.value = '';
    
    // 저장된 보고서 데이터 제거
    delete moduleElement.reportData;
    
    // 폴더 정보 업데이트
    updateReportFolderInfo(moduleElement);
    
    // 보고서 목록 새로고침
    loadReportHistory(moduleElement);
}

// 보고서 오류 표시
function showReportError(moduleElement, message) {
    // 초기 화면으로 돌아가기
    resetReportModule(moduleElement);
    
    // 오류 메시지 표시
    alert(`❌ ${message}`);
}

// 보고서 목록 로드
async function loadReportHistory(moduleElement) {
    const historyList = moduleElement.querySelector('#reportHistoryList');
    if (!historyList) return;
    
    try {
        // 로딩 상태 표시
        historyList.innerHTML = `
            <div class="report-history-loading">
                <div class="report-loading-spinner"></div>
                <span>보고서 목록을 불러오는 중...</span>
            </div>
        `;
        
        console.log('📚 보고서 목록 로드 시작');
        
        // API 호출
        const reports = await ApiService.get('/reports');
        
        console.log('📚 로드된 보고서 목록:', reports);
        
        if (!reports || !Array.isArray(reports) || reports.length === 0) {
            // 빈 목록 표시
            historyList.innerHTML = `
                <div class="report-history-empty">
                    📝 아직 생성된 보고서가 없습니다.<br>
                    새 보고서를 생성해보세요!
                </div>
            `;
            return;
        }
        
        // 보고서 목록 렌더링
        renderReportHistory(moduleElement, reports);
        
    } catch (error) {
        console.error('❌ 보고서 목록 로드 실패:', error);
        
        historyList.innerHTML = `
            <div class="report-history-empty">
                ⚠️ 보고서 목록을 불러올 수 없습니다.<br>
                <button class="report-refresh-btn" onclick="loadReportHistory(this.closest('.dashboard-module'))">
                    다시 시도
                </button>
            </div>
        `;
    }
}

// 보고서 목록 렌더링
function renderReportHistory(moduleElement, reports) {
    const historyList = moduleElement.querySelector('#reportHistoryList');
    if (!historyList) return;
    
    // 최신순으로 정렬
    const sortedReports = reports.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0);
        const dateB = new Date(b.created_at || b.timestamp || 0);
        return dateB - dateA;
    });
    
    // HTML 생성
    const historyHTML = sortedReports.map(report => {
        const createdDate = new Date(report.created_at || report.timestamp);
        const formattedDate = createdDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const formattedTime = createdDate.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 보고서 통계 정보
        const stats = [];
        if (report.file_count) stats.push(`${report.file_count}개 파일`);
        if (report.page_count) stats.push(`${report.page_count}페이지`);
        if (report.char_count) stats.push(`${report.char_count.toLocaleString()}자`);
        
        return `
            <div class="report-history-item" data-report-id="${report.report_id || report.id}">
                <div class="report-history-info">
                    <div class="report-history-title">${escapeHtml(report.title || '제목 없음')}</div>
                    <div class="report-history-meta">
                        <span>📅 ${formattedDate} ${formattedTime}</span>
                        ${stats.length > 0 ? `<span>📊 ${stats.join(', ')}</span>` : ''}
                    </div>
                </div>
                <div class="report-history-actions">
                    <button class="report-history-action-btn view" title="보기" data-action="view">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="report-history-action-btn delete" title="삭제" data-action="delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
    
    // 이벤트 리스너 추가
    bindReportHistoryEvents(moduleElement);
}

// 보고서 목록 이벤트 바인딩
function bindReportHistoryEvents(moduleElement) {
    const historyItems = moduleElement.querySelectorAll('.report-history-item');
    
    historyItems.forEach(item => {
        const reportId = item.dataset.reportId;
        
        // 아이템 클릭 (보기)
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.report-history-actions')) {
                viewReportFromHistory(moduleElement, reportId);
            }
        });
        
        // 액션 버튼들
        const actionBtns = item.querySelectorAll('.report-history-action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                
                if (action === 'view') {
                    viewReportFromHistory(moduleElement, reportId);
                } else if (action === 'delete') {
                    deleteReportFromHistory(moduleElement, reportId);
                }
            });
        });
    });
}

// 기존 보고서 보기
async function viewReportFromHistory(moduleElement, reportId) {
    try {
        console.log('📖 기존 보고서 보기:', reportId);
        
        // 로딩 표시
        const historyList = moduleElement.querySelector('#reportHistoryList');
        const originalHTML = historyList.innerHTML;
        
        historyList.innerHTML = `
            <div class="report-history-loading">
                <div class="report-loading-spinner"></div>
                <span>보고서를 불러오는 중...</span>
            </div>
        `;
        
        // 보고서 데이터 조회
        const reportData = await ApiService.get(`/reports/${reportId}`);
        
        if (!reportData) {
            throw new Error('보고서를 찾을 수 없습니다.');
        }
        
        // 보고서 데이터 저장 후 상세보기 화면으로 이동
        moduleElement.reportData = reportData;
        showReportDetail(moduleElement);
        
        console.log('✅ 기존 보고서 로드 완료:', reportData);
        
    } catch (error) {
        console.error('❌ 기존 보고서 로드 실패:', error);
        
        // 원래 목록 복원
        loadReportHistory(moduleElement);
        
        alert('보고서를 불러올 수 없습니다: ' + (error.message || '알 수 없는 오류'));
    }
}

// 보고서 삭제
async function deleteReportFromHistory(moduleElement, reportId) {
    if (!confirm('이 보고서를 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        console.log('🗑️ 보고서 삭제:', reportId);
        
        await ApiService.delete(`/reports/${reportId}`);
        
        // 목록 새로고침
        loadReportHistory(moduleElement);
        
        console.log('✅ 보고서 삭제 완료');
        
    } catch (error) {
        console.error('❌ 보고서 삭제 실패:', error);
        alert('보고서 삭제에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 메모 모듈 핵심 기능 함수들 =====

// 메모 목록 로드
async function loadMemoList(moduleElement, folderId) {
    if (!folderId) return;
    
    const loadingElement = moduleElement.querySelector('#memoLoading');
    const listElement = moduleElement.querySelector('#memoList');
    const emptyElement = moduleElement.querySelector('#memoEmpty');
    const countElement = moduleElement.querySelector('#memoCount');
    
    try {
        // 로딩 상태 표시
        if (loadingElement) loadingElement.style.display = 'block';
        if (listElement) listElement.style.display = 'none';
        if (emptyElement) emptyElement.style.display = 'none';
        
        // 메모 목록 조회
        const response = await getFolderMemos(folderId, 5); // 최대 5개만 표시
        
        // 로딩 상태 숨김
        if (loadingElement) loadingElement.style.display = 'none';
        
        if (response.memos && response.memos.length > 0) {
            // 메모 목록 표시
            renderMemoList(moduleElement, response.memos);
            if (listElement) listElement.style.display = 'block';
            if (emptyElement) emptyElement.style.display = 'none';
        } else {
            // 빈 상태 표시
            if (listElement) listElement.style.display = 'none';
            if (emptyElement) emptyElement.style.display = 'block';
        }
        
        // 메모 개수 업데이트
        if (countElement) {
            countElement.textContent = `(${response.total_count || 0})`;
        }
        
    } catch (error) {
        console.error('메모 목록 로드 실패:', error);
        
        // 로딩 상태 숨김
        if (loadingElement) loadingElement.style.display = 'none';
        
        // 빈 상태 표시
        if (listElement) listElement.style.display = 'none';
        if (emptyElement) emptyElement.style.display = 'block';
        
        // 에러 메시지 표시
        if (emptyElement) {
            emptyElement.innerHTML = `
                <div class="memo-empty-icon">⚠️</div>
                <div class="memo-empty-text">메모를 불러올 수 없습니다</div>
                <div class="memo-empty-subtext">네트워크 연결을 확인해주세요</div>
            `;
        }
    }
}

// 메모 목록 렌더링
function renderMemoList(moduleElement, memos) {
    const listElement = moduleElement.querySelector('#memoList');
    if (!listElement) return;
    
    listElement.innerHTML = '';
    
    memos.forEach(memo => {
        const memoItem = createMemoItem(memo);
        listElement.appendChild(memoItem);
    });
}

// 메모 아이템 생성
function createMemoItem(memo) {
    const item = document.createElement('div');
    item.className = 'memo-module-item';
    item.style.backgroundColor = memo.color || '#fef3c7';
    item.dataset.memoId = memo.memo_id;
    
    // 제목 클릭 시 인라인 편집
    const titleElement = document.createElement('div');
    titleElement.className = 'memo-module-item-title';
    titleElement.textContent = memo.title || '제목 없음';
    titleElement.style.fontSize = 'calc(1em * var(--font-scale))';
    titleElement.addEventListener('click', (e) => {
        e.stopPropagation();
        startInlineEdit(titleElement, memo.memo_id, 'title');
    });
    
    // 시간 표시
    const timeElement = document.createElement('div');
    timeElement.className = 'memo-module-item-time';
    timeElement.textContent = formatMemoDate(memo.updated_at || memo.created_at);
    timeElement.style.fontSize = 'calc(0.8em * var(--font-scale))';
    
    // 내용 미리보기 (클릭 시 모달 편집)
    const contentElement = document.createElement('div');
    contentElement.className = 'memo-module-item-content';
    contentElement.textContent = memo.content ? memo.content.substring(0, 50) + (memo.content.length > 50 ? '...' : '') : '';
    contentElement.style.fontSize = 'calc(0.9em * var(--font-scale))';
    contentElement.style.lineHeight = 'calc(1.4 * var(--font-scale))';
    contentElement.addEventListener('click', () => {
        openMemoEditModal(memo);
    });
    
    // 헤더 (제목 + 시간)
    const headerElement = document.createElement('div');
    headerElement.className = 'memo-module-item-header';
    headerElement.appendChild(titleElement);
    headerElement.appendChild(timeElement);
    
    item.appendChild(headerElement);
    if (contentElement.textContent) {
        item.appendChild(contentElement);
    }
    
    return item;
}

// 날짜 포맷팅
function formatMemoDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
    } catch (error) {
        return '날짜 오류';
    }
}

// 새 메모 폼 표시
function showMemoNewForm(moduleElement) {
    const formElement = moduleElement.querySelector('#memoNewForm');
    const addBtn = moduleElement.querySelector('#memoAddBtn');
    
    if (formElement && addBtn) {
        formElement.style.display = 'block';
        addBtn.style.display = 'none';
        
        // 내용 입력란에 포커스
        const contentInput = formElement.querySelector('#memoNewContent');
        if (contentInput) {
            contentInput.focus();
        }
    }
}

// 새 메모 폼 숨김
function hideMemoNewForm(moduleElement) {
    const formElement = moduleElement.querySelector('#memoNewForm');
    const addBtn = moduleElement.querySelector('#memoAddBtn');
    
    if (formElement && addBtn) {
        formElement.style.display = 'none';
        addBtn.style.display = 'flex';
        
        // 폼 초기화
        const titleInput = formElement.querySelector('#memoNewTitle');
        const contentInput = formElement.querySelector('#memoNewContent');
        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';
        
        // 색상 초기화
        const colorBtns = formElement.querySelectorAll('.memo-color-btn');
        colorBtns.forEach(btn => btn.classList.remove('active'));
        const defaultColorBtn = formElement.querySelector('.memo-color-btn[data-color="#fef3c7"]');
        if (defaultColorBtn) defaultColorBtn.classList.add('active');
    }
}

// 새 메모 폼 이벤트 바인딩
function bindMemoNewFormEvents(moduleElement) {
    const formElement = moduleElement.querySelector('#memoNewForm');
    if (!formElement) return;
    
    const titleInput = formElement.querySelector('#memoNewTitle');
    const contentInput = formElement.querySelector('#memoNewContent');
    const saveBtn = formElement.querySelector('#memoSaveBtn');
    const cancelBtn = formElement.querySelector('#memoCancelBtn');
    const colorBtns = formElement.querySelectorAll('.memo-color-btn');
    
    // 색상 선택 이벤트
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Enter 키로 저장 (내용 입력란에서)
    if (contentInput) {
        contentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                saveMemoFromForm(moduleElement);
            }
        });
    }
    
    // 저장 버튼
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveMemoFromForm(moduleElement));
    }
    
    // 취소 버튼
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideMemoNewForm(moduleElement));
    }
}

// 폼에서 메모 저장
async function saveMemoFromForm(moduleElement) {
    if (!currentFolder || !currentFolder.id) {
        showNotification('폴더를 먼저 선택해주세요.', 'warning');
        return;
    }
    
    const formElement = moduleElement.querySelector('#memoNewForm');
    if (!formElement) return;
    
    const titleInput = formElement.querySelector('#memoNewTitle');
    const contentInput = formElement.querySelector('#memoNewContent');
    const activeColorBtn = formElement.querySelector('.memo-color-btn.active');
    
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const color = activeColorBtn ? activeColorBtn.dataset.color : '#fef3c7';
    
    if (!content) {
        showNotification('메모 내용을 입력해주세요.', 'warning');
        if (contentInput) contentInput.focus();
        return;
    }
    
    try {
        // 저장 중 상태 표시
        const saveBtn = formElement.querySelector('#memoSaveBtn');
        if (saveBtn) {
            saveBtn.textContent = '저장 중...';
            saveBtn.disabled = true;
        }
        
        // 메모 생성
        await createMemo(currentFolder.id, content, title || null, color);
        
        // 폼 숨김
        hideMemoNewForm(moduleElement);
        
        // 메모 목록 새로고침
        await loadMemoList(moduleElement, currentFolder.id);
        
    } catch (error) {
        console.error('메모 저장 실패:', error);
    } finally {
        // 버튼 상태 복원
        const saveBtn = formElement.querySelector('#memoSaveBtn');
        if (saveBtn) {
            saveBtn.textContent = '저장';
            saveBtn.disabled = false;
        }
    }
}

// 인라인 편집 시작
function startInlineEdit(element, memoId, field) {
    const currentText = element.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'memo-inline-edit';
    input.style.cssText = `
        width: 100%;
        border: 1px solid #3b82f6;
        border-radius: 3px;
        padding: 2px 4px;
        font-size: inherit;
        font-family: inherit;
        background: white;
    `;
    
    // 기존 텍스트 숨김
    element.style.display = 'none';
    element.parentNode.insertBefore(input, element);
    input.focus();
    input.select();
    
    // 저장 함수
    const saveEdit = async () => {
        const newValue = input.value.trim();
        if (newValue && newValue !== currentText) {
            try {
                await updateMemo(memoId, { [field]: newValue });
                element.textContent = newValue;
            } catch (error) {
                console.error('인라인 편집 저장 실패:', error);
                element.textContent = currentText; // 원래 값으로 복원
            }
        }
        
        // 편집 모드 종료
        element.style.display = '';
        input.remove();
    };
    
    // 취소 함수
    const cancelEdit = () => {
        element.style.display = '';
        input.remove();
    };
    
    // 이벤트 리스너
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    });
}

// 메모 편집 모달 열기
function openMemoEditModal(memo) {
    const overlay = document.querySelector('#memoEditModalOverlay');
    if (!overlay) return;
    
    const titleInput = overlay.querySelector('#memoEditTitle');
    const contentInput = overlay.querySelector('#memoEditContent');
    const colorBtns = overlay.querySelectorAll('.memo-color-btn');
    
    // 데이터 설정
    if (titleInput) titleInput.value = memo.title || '';
    if (contentInput) contentInput.value = memo.content || '';
    
    // 색상 설정
    colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === memo.color);
    });
    
    // 메모 ID 저장
    overlay.dataset.editingMemoId = memo.memo_id;
    
    // 모달 표시
    overlay.style.display = 'flex';
    if (contentInput) contentInput.focus();
}

// 메모 편집 모달 닫기
function closeMemoEditModal() {
    const overlay = document.querySelector('#memoEditModalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        delete overlay.dataset.editingMemoId;
    }
}

// 메모 편집 모달 이벤트 바인딩
function bindMemoEditModalEvents(moduleElement) {
    const overlay = moduleElement.querySelector('#memoEditModalOverlay');
    if (!overlay) return;
    
    const closeBtn = overlay.querySelector('#memoEditModalClose');
    const cancelBtn = overlay.querySelector('#memoEditCancelBtn');
    const saveBtn = overlay.querySelector('#memoEditSaveBtn');
    const deleteBtn = overlay.querySelector('#memoEditDeleteBtn');
    const colorBtns = overlay.querySelectorAll('.memo-color-btn');
    
    // 닫기 버튼들
    if (closeBtn) closeBtn.addEventListener('click', closeMemoEditModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeMemoEditModal);
    
    // 오버레이 클릭으로 닫기
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMemoEditModal();
    });
    
    // 색상 선택
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // 저장 버튼
    if (saveBtn) {
        saveBtn.addEventListener('click', () => saveMemoFromEditModal(moduleElement));
    }
    
    // 삭제 버튼
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => deleteMemoFromEditModal(moduleElement));
    }
}

// 편집 모달에서 메모 저장
async function saveMemoFromEditModal(moduleElement) {
    const overlay = document.querySelector('#memoEditModalOverlay');
    if (!overlay) return;
    
    const memoId = overlay.dataset.editingMemoId;
    if (!memoId) return;
    
    const titleInput = overlay.querySelector('#memoEditTitle');
    const contentInput = overlay.querySelector('#memoEditContent');
    const activeColorBtn = overlay.querySelector('.memo-color-btn.active');
    const saveBtn = overlay.querySelector('#memoEditSaveBtn');
    
    const title = titleInput ? titleInput.value.trim() : '';
    const content = contentInput ? contentInput.value.trim() : '';
    const color = activeColorBtn ? activeColorBtn.dataset.color : '#fef3c7';
    
    if (!content) {
        showNotification('메모 내용을 입력해주세요.', 'warning');
        if (contentInput) contentInput.focus();
        return;
    }
    
    try {
        // 저장 중 상태
        if (saveBtn) {
            saveBtn.textContent = '저장 중...';
            saveBtn.disabled = true;
        }
        
        // 메모 업데이트
        await updateMemo(memoId, {
            title: title || null,
            content: content,
            color: color
        });
        
        // 모달 닫기
        closeMemoEditModal();
        
        // 메모 목록 새로고침
        if (currentFolder && currentFolder.id) {
            await loadMemoList(moduleElement, currentFolder.id);
        }
        
    } catch (error) {
        console.error('메모 수정 실패:', error);
    } finally {
        // 버튼 상태 복원
        if (saveBtn) {
            saveBtn.textContent = '저장';
            saveBtn.disabled = false;
        }
    }
}

// 편집 모달에서 메모 삭제
async function deleteMemoFromEditModal(moduleElement) {
    const overlay = document.querySelector('#memoEditModalOverlay');
    if (!overlay) return;
    
    const memoId = overlay.dataset.editingMemoId;
    if (!memoId) return;
    
    if (!confirm('이 메모를 삭제하시겠습니까?')) {
        return;
    }
    
    const deleteBtn = overlay.querySelector('#memoEditDeleteBtn');
    
    try {
        // 삭제 중 상태
        if (deleteBtn) {
            deleteBtn.textContent = '삭제 중...';
            deleteBtn.disabled = true;
        }
        
        // 메모 삭제
        await deleteMemo(memoId);
        
        // 모달 닫기
        closeMemoEditModal();
        
        // 메모 목록 새로고침
        if (currentFolder && currentFolder.id) {
            await loadMemoList(moduleElement, currentFolder.id);
        }
        
    } catch (error) {
        console.error('메모 삭제 실패:', error);
    } finally {
        // 버튼 상태 복원
        if (deleteBtn) {
            deleteBtn.textContent = '삭제';
            deleteBtn.disabled = false;
        }
    }
}

// 전체 보기 모달 표시
function showMemoModal(moduleElement) {
    if (!currentFolder || !currentFolder.id) {
        showNotification('폴더를 먼저 선택해주세요.', 'warning');
        return;
    }
    
    const overlay = moduleElement.querySelector('#memoModalOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        loadAllMemos(moduleElement, currentFolder.id);
    }
}

// 전체 보기 모달 닫기
function closeMemoModal(moduleElement) {
    const overlay = moduleElement.querySelector('#memoModalOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// 전체 보기 모달 이벤트 바인딩
function bindMemoModalEvents(moduleElement) {
    const overlay = moduleElement.querySelector('#memoModalOverlay');
    if (!overlay) return;
    
    const closeBtn = overlay.querySelector('#memoModalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeMemoModal(moduleElement));
    }
    
    // 오버레이 클릭으로 닫기
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMemoModal(moduleElement);
    });
}

// 전체 메모 로드
async function loadAllMemos(moduleElement, folderId) {
    const overlay = moduleElement.querySelector('#memoModalOverlay');
    const contentElement = overlay ? overlay.querySelector('#memoModalContent') : null;
    
    if (!contentElement) return;
    
    try {
        // 로딩 표시
        contentElement.innerHTML = '<div class="memo-loading-spinner"></div><span>전체 메모를 불러오는 중...</span>';
        
        // 전체 메모 조회
        const response = await getFolderMemos(folderId, 100); // 최대 100개
        
        if (response.memos && response.memos.length > 0) {
            // 전체 메모 목록 렌더링
            contentElement.innerHTML = '';
            response.memos.forEach(memo => {
                const memoItem = createMemoItem(memo);
                memoItem.style.marginBottom = '12px';
                contentElement.appendChild(memoItem);
            });
        } else {
            contentElement.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
                    <div style="font-size: 16px; margin-bottom: 8px;">메모가 없습니다</div>
                    <div style="font-size: 14px;">새 메모를 작성해보세요</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('전체 메모 로드 실패:', error);
        contentElement.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #ef4444;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div style="font-size: 16px; margin-bottom: 8px;">메모를 불러올 수 없습니다</div>
                <div style="font-size: 14px;">네트워크 연결을 확인해주세요</div>
            </div>
        `;
    }
}

// 폴더 변경 시 메모 목록 새로고침 (전역 이벤트 리스너)
function refreshMemoModulesOnFolderChange() {
    if (!currentFolder || !currentFolder.id) return;
    
    const memoModules = document.querySelectorAll('.dashboard-module[data-module-type="memo"]');
    memoModules.forEach(moduleElement => {
        loadMemoList(moduleElement, currentFolder.id);
    });
}

// ===== 글꼴 크기 컨트롤 기능 =====

// 글꼴 크기 컨트롤 초기화
function initializeFontSizeControl() {
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontResetBtn = document.getElementById('fontResetBtn');
    
    if (!fontSizeSlider || !fontSizeValue || !fontResetBtn) {
        console.warn('글꼴 크기 컨트롤 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 저장된 글꼴 크기 로드
    loadFontSizeSetting();
    
    // 슬라이더 이벤트
    fontSizeSlider.addEventListener('input', function() {
        const fontSize = parseInt(this.value);
        applyFontSize(fontSize);
        updateFontSizeDisplay(fontSize);
        saveFontSizeSetting(fontSize);
    });
    
    // 초기화 버튼 이벤트
    fontResetBtn.addEventListener('click', function() {
        const defaultSize = 100;
        fontSizeSlider.value = defaultSize;
        applyFontSize(defaultSize);
        updateFontSizeDisplay(defaultSize);
        saveFontSizeSetting(defaultSize);
    });
    
    console.log('✅ 글꼴 크기 컨트롤 초기화 완료');
}

// 글꼴 크기 적용
function applyFontSize(percentage) {
    try {
        // CSS 변수로 글꼴 크기 설정
        const scaleFactor = percentage / 100;
        document.documentElement.style.setProperty('--font-scale', scaleFactor);
        
        // 메인 콘텐츠 영역에 클래스 적용
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.setAttribute('data-font-scale', percentage);
        }
        
        console.log(`📝 글꼴 크기 적용: ${percentage}%`);
        
    } catch (error) {
        console.error('❌ 글꼴 크기 적용 실패:', error);
    }
}

// 글꼴 크기 표시 업데이트
function updateFontSizeDisplay(percentage) {
    const fontSizeValue = document.getElementById('fontSizeValue');
    if (fontSizeValue) {
        fontSizeValue.textContent = `${percentage}%`;
    }
}

// 글꼴 크기 설정 저장
function saveFontSizeSetting(percentage) {
    try {
        localStorage.setItem('dashboardFontSize', percentage.toString());
    } catch (error) {
        console.error('❌ 글꼴 크기 설정 저장 실패:', error);
    }
}

// 글꼴 크기 설정 로드
function loadFontSizeSetting() {
    try {
        const savedSize = localStorage.getItem('dashboardFontSize');
        const fontSize = savedSize ? parseInt(savedSize) : 100;
        
        // 슬라이더 값 설정
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = fontSize;
        }
        
        // 글꼴 크기 적용
        applyFontSize(fontSize);
        updateFontSizeDisplay(fontSize);
        
        console.log(`📝 저장된 글꼴 크기 로드: ${fontSize}%`);
        
    } catch (error) {
        console.error('❌ 글꼴 크기 설정 로드 실패:', error);
        // 기본값 적용
        applyFontSize(100);
        updateFontSizeDisplay(100);
    }
}

// ===== 전체보기 확장 모드 키보드 이벤트 =====

// ESC 키로 확장 모드 닫기
function initializeExpandedModeKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Report 확대 모달 닫기
            const reportModal = document.querySelector('.report-expanded-modal.show');
            if (reportModal) {
                reportModal.classList.remove('show');
                return;
            }
            
            // Summary 확대 모달 닫기
            const summaryModal = document.querySelector('.summary-expanded-modal.show');
            if (summaryModal) {
                summaryModal.classList.remove('show');
                return;
            }
            
            // 배경색 설정 모달 닫기
            const backgroundModal = document.querySelector('.background-color-modal.show');
            if (backgroundModal) {
                closeBackgroundColorSettings();
                return;
            }
        }
    });
}

// 보고서 확대 보기 (전체화면)
function expandReportView(moduleElement) {
    try {
        const reportData = moduleElement.reportData;
        if (!reportData) {
            showNotification('보고서 데이터를 찾을 수 없습니다.', 'error');
            return;
        }
        
        console.log('📖 보고서 확대 보기 시작');
        
        // 확대 모달 생성
        const expandedModal = document.createElement('div');
        expandedModal.className = 'report-expanded-modal';
        expandedModal.innerHTML = `
            <div class="report-expanded-container">
                <div class="report-expanded-header">
                    <div class="report-expanded-title">${reportData.title || '보고서 제목'}</div>
                    <div class="report-expanded-controls">
                        <button class="report-collapse-btn" title="축소">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                            </svg>
                            축소
                        </button>
                        <button class="report-close-btn" title="닫기">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="report-expanded-meta">
                    <div class="report-expanded-subtitle">${reportData.subtitle || ''}</div>
                    <div class="report-expanded-info">
                        📋 ${new Date(reportData.created_at).toLocaleDateString('ko-KR')} | 
                        ${reportData.metadata?.total_pages || 0}페이지 | 
                        ${reportData.selected_files?.length || 0}파일
                    </div>
                </div>
                
                <div class="report-expanded-content">
                    <div class="report-expanded-section">
                        <h2>1. 서론</h2>
                        <div class="report-expanded-section-content">
                            ${reportData.report_structure?.introduction || '서론 내용이 없습니다.'}
                        </div>
                    </div>
                    
                    <div class="report-expanded-section">
                        <h2>2. 본론</h2>
                        <div class="report-expanded-main-content">
                            ${generateExpandedMainContent(reportData.report_structure?.main_content)}
                        </div>
                    </div>
                    
                    <div class="report-expanded-section">
                        <h2>3. 결론</h2>
                        <div class="report-expanded-section-content">
                            ${reportData.report_structure?.conclusion || '결론 내용이 없습니다.'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 모달을 body에 추가
        document.body.appendChild(expandedModal);
        
        // 애니메이션으로 표시
        setTimeout(() => {
            expandedModal.classList.add('show');
        }, 10);
        
        // 이벤트 리스너 추가
        const closeModal = () => {
            expandedModal.classList.remove('show');
            setTimeout(() => {
                if (expandedModal.parentNode) {
                    expandedModal.parentNode.removeChild(expandedModal);
                }
            }, 300);
        };
        
        // 축소/닫기 버튼
        const collapseBtn = expandedModal.querySelector('.report-collapse-btn');
        const closeBtn = expandedModal.querySelector('.report-close-btn');
        
        if (collapseBtn) collapseBtn.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        // ESC 키로 닫기
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // 배경 클릭으로 닫기
        expandedModal.addEventListener('click', (e) => {
            if (e.target === expandedModal) {
                closeModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        });
        
        console.log('✅ 보고서 확대 보기 완료');
        
    } catch (error) {
        console.error('❌ 보고서 확대 보기 실패:', error);
        showNotification('보고서 확대 보기에 실패했습니다.', 'error');
    }
}

// 확대 보기용 본론 콘텐츠 생성
function generateExpandedMainContent(mainContent) {
    if (!mainContent || typeof mainContent !== 'object') {
        return '<p>본론 내용이 없습니다.</p>';
    }
    
    let html = '';
    Object.keys(mainContent).forEach((sectionKey, index) => {
        const section = mainContent[sectionKey];
        html += `
            <div class="report-expanded-subsection">
                <h3>2.${index + 1} ${section.title || `섹션 ${index + 1}`}</h3>
                <div class="report-expanded-subsection-content">
                    ${section.content || '내용이 없습니다.'}
                </div>
            </div>
        `;
    });
    
    return html || '<p>본론 내용이 없습니다.</p>';
}

// ===== Summary 모듈 관련 함수들 =====

// 모듈별 요약 생성
async function generateSummaryForModule(moduleElement) {
    try {
        if (!currentFolder || !currentFolder.id) {
            showNotification('폴더를 먼저 선택해주세요.', 'warning');
            return;
        }
        
        console.log('📝 요약 생성 시작:', currentFolder.name);
        
        // 로딩 상태 표시
        showSummaryLoading(moduleElement);
        
        // 요약 생성 API 호출
        const result = await generateFolderSummary(currentFolder.id);
        
        if (result && result.summary_text) {
            // 요약 결과 표시
            showSummaryResult(moduleElement, result);
            console.log('✅ 요약 생성 완료');
        } else {
            throw new Error('요약 생성 결과가 없습니다.');
        }
        
    } catch (error) {
        console.error('❌ 요약 생성 실패:', error);
        showSummaryError(moduleElement, error.message || '요약 생성에 실패했습니다.');
    }
}

// 요약 로딩 상태 표시
function showSummaryLoading(moduleElement) {
    const placeholder = moduleElement.querySelector('#summaryPlaceholder');
    const resultArea = moduleElement.querySelector('#summaryResultArea');
    const generateBtn = moduleElement.querySelector('#summaryGenerateBtn');
    
    if (placeholder) {
        placeholder.innerHTML = `
            <div class="summary-loading">
                <div class="summary-loading-spinner"></div>
                <div class="summary-loading-text">요약 생성 중...</div>
                <div class="summary-loading-subtext">문서를 분석하고 있습니다</div>
            </div>
        `;
    }
    
    if (resultArea) resultArea.style.display = 'none';
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" class="summary-spinner">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            생성 중...
        `;
    }
}

// 요약 결과 표시
function showSummaryResult(moduleElement, summaryData) {
    const placeholder = moduleElement.querySelector('#summaryPlaceholder');
    const resultArea = moduleElement.querySelector('#summaryResultArea');
    const generateBtn = moduleElement.querySelector('#summaryGenerateBtn');
    
    // 화면 전환
    if (placeholder) placeholder.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';
    
    // 결과 내용 표시
    const titleElement = moduleElement.querySelector('#summaryResultTitle');
    const metaElement = moduleElement.querySelector('#summaryResultMeta');
    const contentElement = moduleElement.querySelector('#summaryResultContent');
    
    if (titleElement) {
        titleElement.textContent = summaryData.title || '폴더 요약';
    }
    
    if (metaElement) {
        const fileCount = summaryData.processed_files?.length || 0;
        const createdDate = new Date().toLocaleDateString('ko-KR');
        metaElement.textContent = `📋 ${createdDate} | ${fileCount}개 파일 분석`;
    }
    
    if (contentElement) {
        contentElement.innerHTML = `
            <div class="summary-content-text">
                ${summaryData.summary_text.replace(/\n/g, '<br>')}
            </div>
        `;
    }
    
    // 요약 데이터를 모듈에 저장
    moduleElement.summaryData = summaryData;
    
    // 버튼 상태 복원
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            요약 생성
        `;
    }
}

// 요약 에러 표시
function showSummaryError(moduleElement, message) {
    const placeholder = moduleElement.querySelector('#summaryPlaceholder');
    const resultArea = moduleElement.querySelector('#summaryResultArea');
    const generateBtn = moduleElement.querySelector('#summaryGenerateBtn');
    
    // 초기 상태로 복원
    if (placeholder) {
        placeholder.style.display = 'block';
        placeholder.innerHTML = `
            <div class="placeholder-text">요약 생성 버튼을 클릭하세요</div>
            <div class="placeholder-subtext">폴더 내 모든 문서를 요약합니다</div>
        `;
    }
    
    if (resultArea) resultArea.style.display = 'none';
    
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            요약 생성
        `;
    }
    
    // 에러 메시지 표시
    showNotification(`❌ ${message}`, 'error');
}

// 요약 모듈 초기화
function resetSummaryModule(moduleElement) {
    const placeholder = moduleElement.querySelector('#summaryPlaceholder');
    const resultArea = moduleElement.querySelector('#summaryResultArea');
    
    if (placeholder) {
        placeholder.style.display = 'block';
        placeholder.innerHTML = `
            <div class="placeholder-text">요약 생성 버튼을 클릭하세요</div>
            <div class="placeholder-subtext">폴더 내 모든 문서를 요약합니다</div>
        `;
    }
    
    if (resultArea) resultArea.style.display = 'none';
    
    // 저장된 요약 데이터 제거
    delete moduleElement.summaryData;
}

// 요약 확대 보기
function expandSummaryView(moduleElement) {
    try {
        const summaryData = moduleElement.summaryData;
        if (!summaryData) {
            showNotification('요약 데이터를 찾을 수 없습니다.', 'error');
            return;
        }
        
        console.log('📖 요약 확대 보기 시작');
        
        // 확대 모달 생성
        const expandedModal = document.createElement('div');
        expandedModal.className = 'summary-expanded-modal';
        expandedModal.innerHTML = `
            <div class="summary-expanded-container">
                <div class="summary-expanded-header">
                    <div class="summary-expanded-title">${summaryData.title || '폴더 요약'}</div>
                    <div class="summary-expanded-controls">
                        <button class="summary-collapse-btn" title="축소">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                            </svg>
                            축소
                        </button>
                        <button class="summary-close-btn" title="닫기">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="summary-expanded-meta">
                    <div class="summary-expanded-info">
                        📋 ${new Date().toLocaleDateString('ko-KR')} | 
                        ${summaryData.processed_files?.length || 0}개 파일 분석 |
                        ${currentFolder?.name || '폴더'}
                    </div>
                </div>
                
                <div class="summary-expanded-content">
                    <div class="summary-expanded-text">
                        ${summaryData.summary_text.replace(/\n/g, '<br>')}
                    </div>
                </div>
            </div>
        `;
        
        // 모달을 body에 추가
        document.body.appendChild(expandedModal);
        
        // 애니메이션으로 표시
        setTimeout(() => {
            expandedModal.classList.add('show');
        }, 10);
        
        // 이벤트 리스너 추가
        const closeModal = () => {
            expandedModal.classList.remove('show');
            setTimeout(() => {
                if (expandedModal.parentNode) {
                    expandedModal.parentNode.removeChild(expandedModal);
                }
            }, 300);
        };
        
        // 축소/닫기 버튼
        const collapseBtn = expandedModal.querySelector('.summary-collapse-btn');
        const closeBtn = expandedModal.querySelector('.summary-close-btn');
        
        if (collapseBtn) collapseBtn.addEventListener('click', closeModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        
        // ESC 키로 닫기
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // 배경 클릭으로 닫기
        expandedModal.addEventListener('click', (e) => {
            if (e.target === expandedModal) {
                closeModal();
                document.removeEventListener('keydown', handleKeyDown);
            }
        });
        
        console.log('✅ 요약 확대 보기 완료');
        
    } catch (error) {
        console.error('❌ 요약 확대 보기 실패:', error);
        showNotification('요약 확대 보기에 실패했습니다.', 'error');
    }
}

// 배경색 설정 관련 함수들
function openBackgroundColorSettings() {
    const modal = document.getElementById('backgroundColorModal');
    if (modal) {
        modal.style.display = 'flex';
        // 애니메이션을 위해 약간의 지연
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // 현재 배경색 확인하고 선택 상태 표시
        updateSelectedColor();
        
        // 색상 옵션 클릭 이벤트 바인딩
        bindColorOptionEvents();
    }
}

function closeBackgroundColorSettings() {
    const modal = document.getElementById('backgroundColorModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function bindColorOptionEvents() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            applyBackgroundColor(color);
            updateSelectedColorOption(this);
        });
    });
}

function updateSelectedColor() {
    const currentBgColor = getComputedStyle(document.body).backgroundColor;
    const mainContent = document.getElementById('mainContent');
    const currentMainBgColor = getComputedStyle(mainContent).backgroundColor;
    
    // RGB를 HEX로 변환하여 현재 색상과 매칭
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        const optionColor = option.getAttribute('data-color');
        const optionRgb = hexToRgb(optionColor);
        
        if (currentMainBgColor === `rgb(${optionRgb.r}, ${optionRgb.g}, ${optionRgb.b})`) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function updateSelectedColorOption(selectedOption) {
    // 모든 옵션에서 선택 상태 제거
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 선택된 옵션에 선택 상태 추가
    selectedOption.classList.add('selected');
}

function applyBackgroundColor(color) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.backgroundColor = color;
        
        // 로컬 스토리지에 저장
        localStorage.setItem('dashboardBackgroundColor', color);
        
        // 다크모드와의 호환성을 위해 body에도 클래스 추가
        document.body.setAttribute('data-custom-bg', 'true');
        document.body.style.setProperty('--custom-bg-color', color);
        
        console.log('배경색이 변경되었습니다:', color);
    }
}

function applyCustomColor() {
    const colorPicker = document.getElementById('customColorPicker');
    if (colorPicker) {
        const color = colorPicker.value;
        applyBackgroundColor(color);
        
        // 프리셋 색상 선택 해제
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        console.log('사용자 정의 색상이 적용되었습니다:', color);
    }
}

function resetBackgroundColor() {
    const defaultColor = '#ffffff';
    applyBackgroundColor(defaultColor);
    
    // 커스텀 배경 속성 제거
    document.body.removeAttribute('data-custom-bg');
    document.body.style.removeProperty('--custom-bg-color');
    
    // 로컬 스토리지에서 제거
    localStorage.removeItem('dashboardBackgroundColor');
    
    // 선택 상태 업데이트
    updateSelectedColor();
    
    console.log('배경색이 기본값으로 초기화되었습니다');
}

function loadSavedBackgroundColor() {
    const savedColor = localStorage.getItem('dashboardBackgroundColor');
    if (savedColor) {
        applyBackgroundColor(savedColor);
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 페이지 로드 시 저장된 배경색 적용
document.addEventListener('DOMContentLoaded', function() {
    loadSavedBackgroundColor();
});
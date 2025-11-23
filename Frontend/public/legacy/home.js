// 홈 페이지 JavaScript

// API 기본 설정
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

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

// API 호출 유틸리티 함수
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error(`❌ API 요청 실패:`, error);
            throw error;
        }
    }
    
    static async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }
    
    static async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    
    static async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(endpoint, options = {}) {
        console.log(`🗑️ DELETE 요청:`, {
            endpoint,
            fullUrl: `${API_CONFIG.BASE_URL}${endpoint}`,
            options
        });
        
        return this.request(endpoint, { 
            method: 'DELETE',
            ...options
        });
    }
}



// 폴더 목록 렌더링
function renderFolders(folders) {
    const foldersContainer = document.querySelector('.library-grid');
    
    if (folders.length === 0) {
        foldersContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                아직 폴더가 없습니다.<br>
                <small style="color: #6b7280;">새 폴더를 생성해보세요.</small>
            </div>
        `;
        return;
    }
    
    // 폴더 아이템들과 Add 버튼 생성
    let foldersHTML = '';
    
    folders.forEach(folder => {
        // 마지막 접근일 포맷팅
        const lastAccessed = new Date(folder.last_accessed_at || folder.created_at);
        const formattedDate = formatDate(lastAccessed);
        
        foldersHTML += `
            <div class="library-item" 
                 draggable="true" 
                 data-folder-id="${folder.folder_id}"
                 onclick="navigateToFolder('${folder.folder_id}', '${folder.title}')"
                 ondragstart="handleDragStart(event, '${folder.folder_id}')">
                <div class="folder-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div class="folder-label">${folder.title}</div>
                <div class="folder-date">${formattedDate}</div>
            </div>
        `;
    });
    
    // Add 버튼 추가
    foldersHTML += `
        <div class="library-item add-button" onclick="createNewFolder()">
            <div class="add-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </div>
        </div>
    `;
    
    foldersContainer.innerHTML = foldersHTML;
}

// 날짜 포맷팅 함수
function formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '어제';
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}주 전`;
    } else {
        const months = Math.floor(diffDays / 30);
        return `${months}개월 전`;
    }
}

// 폴더로 이동
function navigateToFolder(folderId, folderTitle) {
    localStorage.setItem('selectedFolder', JSON.stringify({
        id: folderId,
        title: folderTitle
    }));
    
    // 대시보드로 이동
    window.location.href = 'dashboard.html';
}

// 새 폴더 생성
async function createNewFolder() {
    const folderName = prompt('새 폴더 이름을 입력하세요:');
    if (!folderName || folderName.trim() === '') {
        return;
    }
    
    try {
        // 현재 활성화된 카테고리 가져오기
        const activeTab = document.querySelector('.category-tab.active');
        const categoryType = activeTab ? activeTab.dataset.categoryType : 'general';
        
        // API를 통해 폴더 생성
        const response = await ApiService.post('/folders/', {
            title: folderName.trim(),
            folder_type: categoryType,
            description: `${folderName.trim()} 폴더입니다.`
        });
        
        if (response && response.folder_id) {
            // 달력에 폴더 생성 날짜 추가
            if (calendarManager) {
                calendarManager.addFolderDate(new Date());
            }
            
            // 폴더 목록 새로고침
            await loadUnifiedLibrary();
            await showFoldersForCategory(categoryType);
            
            // 사용자 박스 업데이트
            if (userBoxManager) {
                userBoxManager.refresh();
            }
            
            showSuccessMessage(`폴더 "${folderName}"이 성공적으로 생성되었습니다.`);
        }
        
    } catch (error) {
        console.error('폴더 생성 실패:', error);
        
        // 오프라인 모드 또는 API 오류 시 로컬에 임시 저장
        const tempFolder = {
            folder_id: `temp_${Date.now()}`,
            title: folderName.trim(),
            folder_type: activeTab ? activeTab.dataset.categoryType : 'general',
            created_at: new Date().toISOString(),
            isTemporary: true
        };
        
        // 로컬 스토리지에 임시 폴더 저장
        const tempFolders = JSON.parse(localStorage.getItem('tempFolders') || '[]');
        tempFolders.push(tempFolder);
        localStorage.setItem('tempFolders', JSON.stringify(tempFolders));
        
        // 달력에 폴더 생성 날짜 추가
        if (calendarManager) {
            calendarManager.addFolderDate(new Date());
        }
        
        // 폴더 목록 새로고침
        await loadUnifiedLibrary();
        
        showErrorMessage(`폴더 생성 중 오류가 발생했습니다. 임시로 로컬에 저장되었습니다.`);
    }
}

// 네비게이션 함수들
function navigateToDashboard() {
    window.location.href = 'dashboard.html';
}

// Quiz Mate 바로가기 함수
function navigateToQuizMate() {
    // Quiz Mate 페이지로 이동 (현재는 대시보드로 이동)
    // 추후 Quiz Mate 전용 페이지가 있으면 해당 URL로 변경
    window.location.href = 'dashboard.html';
}

// 로컬 카테고리 관리
function getLocalCategories() {
    const saved = localStorage.getItem('localCategories');
    if (saved) {
        const categories = JSON.parse(saved);
        // "전체" 카테고리가 없으면 맨 앞에 추가
        if (!categories.find(cat => cat.type_id === 'all')) {
            categories.unshift({ type_id: 'all', name: '전체', variant: 0, isDeletable: false });
            saveLocalCategories(categories);
        }
        return categories;
    }
    
    // 기본 카테고리들 ("전체" 카테고리 맨 앞에 추가)
    const defaultCategories = [
        { type_id: 'all', name: '전체', variant: 0, isDeletable: false },
        { type_id: 'general', name: '일반', variant: 1, isDeletable: true },
        { type_id: 'reading', name: '독서', variant: 2, isDeletable: true },
        { type_id: 'project', name: '프로젝트', variant: 3, isDeletable: true },
        { type_id: 'default_2', name: 'default_2', variant: 4, isDeletable: true }
    ];
    
    saveLocalCategories(defaultCategories);
    return defaultCategories;
}

function saveLocalCategories(categories) {
    localStorage.setItem('localCategories', JSON.stringify(categories));
}

function addLocalCategory(name) {
    const categories = getLocalCategories();
    const newCategory = {
        type_id: `custom_${Date.now()}`, // 고유 ID 생성
        name: name,
        variant: ((categories.length % 4) + 1),
        isDeletable: true
    };
    
    categories.push(newCategory);
    saveLocalCategories(categories);
    return newCategory;
}

function updateLocalCategoryName(typeId, newName) {
    const categories = getLocalCategories();
    const category = categories.find(cat => cat.type_id === typeId);
    if (category) {
        category.name = newName;
        saveLocalCategories(categories);
        return true;
    }
    return false;
}

function deleteLocalCategory(typeId) {
    const categories = getLocalCategories();
    const categoryIndex = categories.findIndex(cat => cat.type_id === typeId);
    if (categoryIndex > -1 && categories[categoryIndex].isDeletable !== false) {
        categories.splice(categoryIndex, 1);
        saveLocalCategories(categories);
        return true;
    }
    return false;
}

// 카테고리 로드 및 렌더링 (로컬 기반으로 변경)
async function loadAndRenderCategories() {
    try {
        console.log('로컬 카테고리 목록 로드 중...');
        
        // 로컬 카테고리 가져오기
        let categories = getLocalCategories();
        
        // 기존 폴더들에서 사용 중인 folder_type도 카테고리에 추가
        try {
            const response = await ApiService.get('/folders/', { limit: 100 });
            const folders = response.folders || [];
            
            // 폴더에서 사용 중인 folder_type 추출
            const existingTypes = [...new Set(folders
                        .map(folder => folder.folder_type || folder.type)
                .filter(type => type && type.trim() !== '')
            )];
            
            console.log('폴더에서 발견된 folder_type들:', existingTypes);
            
            // 로컬 카테고리에 없는 타입들을 자동으로 추가
            existingTypes.forEach(type => {
                const exists = categories.find(cat => cat.type_id === type);
                if (!exists) {
                    categories.push({
                            type_id: type,
                            name: type,
                        variant: ((categories.length % 4) + 1)
                    });
                }
            });
            
            // 업데이트된 카테고리 저장
            saveLocalCategories(categories);
            
        } catch (apiError) {
            console.log('폴더 API 호출 실패, 로컬 카테고리만 사용:', apiError);
        }
        
        console.log('최종 카테고리 목록:', categories);
        renderCategoryTabs(categories);
        
        // "전체" 카테고리를 기본으로 활성화합니다.
        if (categories && categories.length > 0) {
            // "전체" 카테고리가 있으면 그것을 기본으로, 없으면 첫 번째 카테고리를 활성화
            const allCategory = categories.find(cat => cat.type_id === 'all');
            const defaultCategoryType = allCategory ? 'all' : categories[0].type_id;
            console.log(`페이지 로드 시 기본 카테고리 활성화: ${defaultCategoryType}`);
            showFoldersForCategory(defaultCategoryType);
        }
        
    } catch (error) {
        console.error('카테고리 로드 실패:', error);
        
        // 오류 시 기본 카테고리 사용
        const defaultCategories = getLocalCategories();
        renderCategoryTabs(defaultCategories);
        
        // 오류 시에도 "전체" 카테고리를 기본으로 활성화합니다.
        if (defaultCategories && defaultCategories.length > 0) {
            // "전체" 카테고리가 있으면 그것을 기본으로, 없으면 첫 번째 카테고리를 활성화
            const allCategory = defaultCategories.find(cat => cat.type_id === 'all');
            const defaultCategoryType = allCategory ? 'all' : defaultCategories[0].type_id;
            console.log(`오류 시 기본 카테고리 활성화: ${defaultCategoryType}`);
            showFoldersForCategory(defaultCategoryType);
        }
    }
}

// 카테고리 탭 렌더링 (소형 태그 스타일)
function renderCategoryTabs(categories) {
    const tabsContainer = document.querySelector('.category-tabs-container');
    
    let tabsHTML = '';
    categories.forEach((category, index) => {
        const variant = category.variant || ((index % 4) + 1);
        const deleteButton = category.isDeletable !== false ? 
            `<button class="category-delete-btn" onclick="event.stopPropagation(); deleteCategoryTab('${category.type_id}')" title="카테고리 삭제">×</button>` : '';
        
        tabsHTML += `
            <div class="category-tab variant-${variant}" 
                 data-category-type="${category.type_id}"
                 onclick="showFoldersForCategory('${category.type_id}')"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDropOnCategory(event, '${category.type_id}')"
                 ondblclick="editCategoryName('${category.type_id}', this)">
                <div class="category-dot"></div>
                <div class="category-name" data-category-id="${category.type_id}">
                    ${category.name}
                </div>
                ${deleteButton}
            </div>
        `;
    });
    
    tabsContainer.innerHTML = tabsHTML;
    
    console.log(`카테고리 ${categories.length}개 렌더링 완료`);
}

// 드래그 시작 처리 - 개선된 버전
function handleDragStart(event, folderId) {
    console.log('🚀 드래그 시작:', folderId);
    
    // 🔍 폴더 ID 유효성 검사
    if (!folderId || typeof folderId !== 'string' || folderId.trim() === '') {
        console.error('❌ 유효하지 않은 폴더 ID:', folderId);
        event.preventDefault();
        return false;
    }
    
    // 폴더 ID 정제 (앞뒤 공백 제거)
    const cleanFolderId = folderId.trim();
    console.log('✅ 정제된 폴더 ID:', cleanFolderId, '(길이:', cleanFolderId.length, ')');
    
    // 🔍 MongoDB ObjectId 형식 검증
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(cleanFolderId)) {
        console.error('❌ 폴더 ID가 유효한 MongoDB ObjectId 형식이 아닙니다:', cleanFolderId);
        event.preventDefault();
        return false;
    }
    
    // 🔄 다양한 방법으로 폴더 ID 저장 (브라우저간 호환성 최대화)
    try {
        event.dataTransfer.setData('text/plain', cleanFolderId);
        event.dataTransfer.setData('folderId', cleanFolderId);
        event.dataTransfer.setData('application/json', JSON.stringify({ 
            folderId: cleanFolderId,
            timestamp: Date.now()
        }));
        
        // HTML5 드래그 데이터도 추가
        event.dataTransfer.setData('text/uri-list', `folder:${cleanFolderId}`);
        
        console.log('📦 드래그 데이터 설정 완료:', {
            'text/plain': cleanFolderId,
            'folderId': cleanFolderId,
            'application/json': JSON.stringify({ folderId: cleanFolderId })
        });
        
    } catch (dragError) {
        console.error('❌ 드래그 데이터 설정 실패:', dragError);
    }
    
    // 드래그 효과 설정
    event.dataTransfer.effectAllowed = 'move';
    
    // 드래그 중인 요소 표시
    event.target.classList.add('dragging');
    
    // 🌍 폴더 정보를 글로벌 변수에도 저장 (백업용)
    window.currentDraggedFolderId = cleanFolderId;
    
    console.log('🎯 글로벌 백업 변수 설정:', window.currentDraggedFolderId);
}

// 드래그 오버 처리 (개선된 버전)
function handleDragOver(event) {
    event.preventDefault();
    
    // 드래그 효과 설정
    event.dataTransfer.dropEffect = 'move';
    
    const categoryTab = event.target.closest('.category-tab');
    if (categoryTab) {
        // 다른 탭들에서 활성 상태 제거
        document.querySelectorAll('.category-tab').forEach(tab => {
            if (tab !== categoryTab) {
                tab.classList.remove('drop-zone-active');
            }
        });
        
        // 현재 탭에 활성 상태 추가
        categoryTab.classList.add('drop-zone-active');
    }
}

// 카테고리에 드롭 처리 (폴더 타입 업데이트)
async function handleDropOnCategory(event, categoryType) {
    event.preventDefault();
    
    // 다양한 방법으로 폴더 ID 추출 시도
    let folderId = event.dataTransfer.getData('text/plain') || 
                   event.dataTransfer.getData('folderId') ||
                   window.currentDraggedFolderId;
    
    // JSON 형태로 저장된 데이터도 시도
    try {
        const jsonData = event.dataTransfer.getData('application/json');
        if (jsonData) {
            const parsed = JSON.parse(jsonData);
            folderId = folderId || parsed.folderId;
        }
    } catch (e) {
        // JSON 파싱 실패 시 무시
    }
    
    const categoryTab = event.target.closest('.category-tab');
    categoryTab?.classList.remove('drop-zone-active');
    
    // 드래그 중 표시 제거
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
    }
    
    if (!folderId) {
        console.error('❌ 폴더 ID를 찾을 수 없습니다.');
        showErrorMessage('폴더 정보를 찾을 수 없습니다.');
        return;
    }
    
    console.log(`📂 폴더 ${folderId}를 카테고리 ${categoryType}로 이동 시도`);
    
    try {
        // 백엔드에 폴더 타입 업데이트 요청
        console.log(`🔄 백엔드 API로 폴더 타입 업데이트 중...`);
        
        let updateSuccess = false;
        let lastError = null;
        
        // 다양한 API 엔드포인트 시도
        const updateMethods = [
            // PATCH 방식들
            async () => await ApiService.patch(`/folders/${folderId}`, { folder_type: categoryType }),
            async () => await ApiService.patch(`/api/folders/${folderId}`, { folder_type: categoryType }),
            async () => await ApiService.patch(`/folders/${folderId}`, { type: categoryType }),
            
            // PUT 방식들
            async () => await ApiService.put(`/folders/${folderId}`, { folder_type: categoryType }),
            async () => await ApiService.put(`/api/folders/${folderId}`, { folder_type: categoryType }),
            async () => await ApiService.put(`/folders/${folderId}`, { type: categoryType }),
        ];
        
        for (const method of updateMethods) {
            try {
                await method();
                updateSuccess = true;
                console.log('✅ 백엔드 폴더 타입 업데이트 성공');
                break;
            } catch (error) {
                console.log(`❌ API 시도 실패:`, error.message);
                lastError = error;
                continue;
            }
        }
        
        if (updateSuccess) {
            // 성공 시 UI 업데이트
            showSuccessMessage(`폴더가 "${getCategoryName(categoryType)}" 카테고리로 이동되었습니다.`);
            
            // 메인 폴더 목록 새로고침
            loadFolders();
            
            // 현재 활성 카테고리가 있으면 해당 카테고리도 새로고침
            const activeTab = document.querySelector('.category-tab.active');
            if (activeTab) {
                const activeCategoryType = activeTab.dataset.categoryType;
                showFoldersForCategory(activeCategoryType);
            }
            
        } else {
            // 모든 API 시도 실패
            console.error(`❌ 모든 폴더 업데이트 API 시도 실패. 마지막 오류:`, lastError);
            showErrorMessage(`폴더 이동에 실패했습니다.\n백엔드 API 확인이 필요합니다.\n(${lastError?.message || '알 수 없는 오류'})`);
        }
        
    } catch (error) {
        console.error('❌ 폴더 카테고리 이동 처리 실패:', error);
        showErrorMessage('폴더 이동에 실패했습니다. 다시 시도해주세요.');
    } finally {
        // 글로벌 변수 정리
        window.currentDraggedFolderId = null;
    }
}

// 카테고리 타입으로 이름 찾기 헬퍼 함수
function getCategoryName(categoryType) {
    const categories = getLocalCategories();
    const category = categories.find(cat => cat.type_id === categoryType);
    return category ? category.name : categoryType;
}

// 특정 카테고리의 폴더들 표시 (통합된 라이브러리)
async function showFoldersForCategory(categoryType) {
    try {
        console.log(`카테고리 ${categoryType}의 폴더 목록 로드 중...`);
        
        // 활성 탭 표시 업데이트
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const selectedTab = document.querySelector(`[data-category-type="${categoryType}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // 통합된 라이브러리 그리드에 로딩 표시
        const libraryGrid = document.getElementById('unified-library-grid');
        libraryGrid.innerHTML = `
            <div class="library-loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <div style="width: 24px; height: 24px; border: 2px solid #e5e7eb; border-top: 2px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
                ${getCategoryName(categoryType)} 폴더를 불러오는 중...
            </div>
            <div class="add-button" onclick="createNewFolder()">+</div>
        `;
        
        let folders = [];
        
        // "전체" 카테고리인 경우 모든 폴더를 표시
        if (categoryType === 'all') {
            try {
                console.log('🔍 전체 폴더 로드 중...');
                const response = await ApiService.get('/folders/', { limit: 100 });
                folders = response.folders || [];
                
                // 로컬 임시 폴더들도 추가
                const tempFolders = JSON.parse(localStorage.getItem('tempFolders') || '[]');
                folders = [...folders, ...tempFolders];
                
                console.log(`📊 전체 폴더 수: ${folders.length}개`);
            } catch (apiError) {
                console.log('❌ 전체 폴더 로드 실패, 로컬 임시 폴더만 표시');
                const tempFolders = JSON.parse(localStorage.getItem('tempFolders') || '[]');
                folders = tempFolders;
            }
        } else {
            // 특정 카테고리인 경우 필터링
        try {
            console.log(`🔍 백엔드 필터링 시도: folder_type=${categoryType}`);
        const response = await ApiService.get('/folders/', {
            folder_type: categoryType,
            limit: 50
        });
        
            folders = response.folders || [];
            
            // 백엔드 필터링이 제대로 되었는지 확인
            const filteredCount = folders.filter(folder => 
                folder.folder_type === categoryType || 
                folder.type === categoryType
            ).length;
            
            console.log(`📊 API 응답: 총 ${folders.length}개, 필터링된 폴더: ${filteredCount}개`);
            
            // 백엔드 필터링이 제대로 안된 경우 (전체 폴더가 온 경우)
            if (folders.length > 0 && filteredCount < folders.length) {
                console.log('⚠️ 백엔드 필터링이 제대로 되지 않음. 프론트엔드에서 필터링 수행');
                folders = folders.filter(folder => 
                    folder.folder_type === categoryType || 
                    folder.type === categoryType
                );
            }
        } catch (apiError) {
            console.log('❌ 백엔드 필터링 실패, 전체 폴더 로드 후 프론트엔드 필터링');
            // 백엔드 필터링 실패 시 전체 폴더 로드 후 프론트엔드에서 필터링
            const response = await ApiService.get('/folders/', { limit: 100 });
            const allFolders = response.folders || [];
            
            folders = allFolders.filter(folder => 
                folder.folder_type === categoryType || 
                folder.type === categoryType
            );
            }
        }
        
        console.log(`✅ 최종 폴더 수: ${folders.length}개`);
        
        // 통합된 라이브러리 그리드에 폴더 표시
        renderUnifiedFolders(folders);
        
        // 전역 상태 업데이트
        window.activeCategoryType = categoryType;
        
    } catch (error) {
        console.error('카테고리 폴더 목록 로드 실패:', error);
        
        // 통합된 라이브러리 그리드에 에러 표시
        const libraryGrid = document.getElementById('unified-library-grid');
        libraryGrid.innerHTML = `
            <div class="library-error" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 12px; display: block;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                ${getCategoryName(categoryType)} 폴더를 불러올 수 없습니다.<br>
                <small style="color: #6b7280;">백엔드 서버가 실행 중인지 확인해주세요.</small>
            </div>
            <div class="add-button" onclick="createNewFolder()">+</div>
        `;
    }
}

// 카테고리 폴더 목록 렌더링
function renderCategoryFolders(folders) {
    const contentArea = document.querySelector('.category-content');
    
    if (folders.length === 0) {
        contentArea.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px; display: block; opacity: 0.5;">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                이 카테고리에는 아직 폴더가 없습니다.<br>
                <small style="color: #6b7280;">폴더를 드래그하여 이 카테고리로 이동해보세요.</small>
            </div>
        `;
        return;
    }
    
    let foldersHTML = '';
    folders.forEach((folder, index) => {
        const lastAccessed = new Date(folder.last_accessed_at || folder.created_at);
        const formattedDate = formatDate(lastAccessed);
        
        foldersHTML += `
            <div class="category-folder-item" onclick="navigateToFolder('${folder.folder_id}', '${folder.title}')" style="--item-index: ${index};">
                <div class="folder-icon" style="margin-bottom: 10px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <div style="font-weight: 600; margin-bottom: 5px;">${folder.title}</div>
                <div style="font-size: 12px; color: #6b7280;">${formattedDate}</div>
            </div>
        `;
    });
    
    contentArea.innerHTML = foldersHTML;
}

// 새 카테고리 추가 (로컬 기반)
async function addNewCategory() {
    const categoryName = prompt('새 카테고리 이름을 입력하세요:');
    if (!categoryName || categoryName.trim() === '') {
        return;
    }
    
    try {
        console.log('새 카테고리 생성 중:', categoryName);
        
        // 로컬에 카테고리 추가
        const newCategory = addLocalCategory(categoryName.trim());
        
        console.log('✅ 로컬 카테고리 추가 완료:', newCategory);
        showSuccessMessage(`새 카테고리 "${categoryName}"이 추가되었습니다.`);
        
        // 카테고리 목록 새로고침
        loadAndRenderCategories();
        
    } catch (error) {
        console.error('카테고리 생성 실패:', error);
        showErrorMessage('카테고리 생성에 실패했습니다. 다시 시도해주세요.');
    }
}

// 카테고리 이름 수정 (소형 태그 스타일)
async function editCategoryName(typeId, tabElement) {
    const nameElement = tabElement.querySelector('.category-name');
    const currentName = nameElement.textContent.trim();
    
    nameElement.innerHTML = `<input type="text" class="category-name-input" value="${currentName}" onblur="saveCategoryName('${typeId}', this)" onkeypress="handleCategoryNameKeypress(event, '${typeId}', this)" style="background: transparent; border: none; font-size: 13px; font-weight: 500; color: inherit; width: 100%; outline: none;">`;
    
    const input = nameElement.querySelector('.category-name-input');
    input.focus();
    input.select();
}

// 카테고리 이름 저장 (로컬 기반)
async function saveCategoryName(typeId, inputElement) {
    const newName = inputElement.value.trim();
    const nameElement = inputElement.parentElement;
    const originalName = inputElement.defaultValue;
    
    if (newName === '') {
        nameElement.textContent = originalName;
        return;
    }
    
    if (newName === originalName) {
        nameElement.textContent = originalName;
        return;
    }
    
    try {
        console.log('카테고리 이름 수정 중:', typeId, newName);
        
        // 로컬에서 카테고리 이름 수정
        const success = updateLocalCategoryName(typeId, newName);
        
        if (success) {
            nameElement.textContent = newName;
            console.log('✅ 로컬 카테고리 이름 수정 완료');
            showSuccessMessage(`카테고리 이름이 "${newName}"로 변경되었습니다.`);
        } else {
            throw new Error('카테고리를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('카테고리 이름 수정 실패:', error);
        showErrorMessage('카테고리 이름 수정에 실패했습니다.');
        
        nameElement.textContent = originalName;
    }
}

// 카테고리 이름 입력 키 처리
function handleCategoryNameKeypress(event, typeId, inputElement) {
    if (event.key === 'Enter') {
        inputElement.blur();
    } else if (event.key === 'Escape') {
        const nameElement = inputElement.parentElement;
        const originalName = inputElement.defaultValue;
        nameElement.textContent = originalName;
    }
}

// 카테고리 탭 삭제
async function deleteCategoryTab(typeId) {
    // "전체" 카테고리는 삭제할 수 없음
    if (typeId === 'all') {
        showErrorMessage('전체 카테고리는 삭제할 수 없습니다.');
        return;
    }
    
    const categories = getLocalCategories();
    const category = categories.find(cat => cat.type_id === typeId);
    
    if (!category) {
        showErrorMessage('카테고리를 찾을 수 없습니다.');
        return;
    }
    
    if (category.isDeletable === false) {
        showErrorMessage('이 카테고리는 삭제할 수 없습니다.');
        return;
    }
    
    const confirmDelete = confirm(`"${category.name}" 카테고리를 정말로 삭제하시겠습니까?\n\n이 카테고리에 속한 폴더들은 "일반" 카테고리로 이동됩니다.`);
    
    if (!confirmDelete) {
        return;
    }
    
    try {
        // 해당 카테고리의 폴더들을 "일반" 카테고리로 이동
        const response = await ApiService.get('/folders/', { limit: 100 });
        const folders = response.folders || [];
        
        const foldersToMove = folders.filter(folder => 
            folder.folder_type === typeId || folder.type === typeId
        );
        
        // 폴더들을 "일반" 카테고리로 이동
        for (const folder of foldersToMove) {
            try {
                await ApiService.patch(`/folders/${folder.folder_id}`, { folder_type: 'general' });
            } catch (error) {
                console.warn(`폴더 ${folder.folder_id} 이동 실패:`, error);
            }
        }
        
        // 로컬에서 카테고리 삭제
        const success = deleteLocalCategory(typeId);
        
        if (success) {
            showSuccessMessage(`"${category.name}" 카테고리가 삭제되었습니다.`);
            
            // 카테고리 목록 새로고침
            loadAndRenderCategories();
            
            // 현재 활성 카테고리가 삭제된 경우 "전체" 카테고리로 이동
            const activeTab = document.querySelector('.category-tab.active');
            if (activeTab && activeTab.dataset.categoryType === typeId) {
                showFoldersForCategory('all');
            }
        } else {
            throw new Error('카테고리 삭제에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('카테고리 삭제 실패:', error);
        showErrorMessage('카테고리 삭제에 실패했습니다. 다시 시도해주세요.');
    }
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

// 에러 메시지 표시
function showErrorMessage(message) {
    showMessage(message, 'error');
}

// 메시지 표시 (토스트 스타일)
function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transition: all 0.3s ease;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b7280'};
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 휴지통 드래그 오버 처리
function handleTrashDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.target.closest('.trash-can-dropzone').classList.add('drag-over');
}

// 휴지통 드래그 떠남 처리
function handleTrashDragLeave(event) {
    event.target.closest('.trash-can-dropzone').classList.remove('drag-over');
}

// 휴지통에 드롭 처리 (폴더 삭제) - 개선된 버전
async function handleDropOnTrash(event) {
    event.preventDefault();
    
    const trashZone = event.target.closest('.trash-can-dropzone');
    trashZone.classList.remove('drag-over');
    
    // 🔍 강화된 폴더 ID 추출 및 검증
    let folderId = null;
    
    // 1. 다양한 방법으로 폴더 ID 검색
    const possibleIds = [
        event.dataTransfer.getData('folderId'),
        event.dataTransfer.getData('text/plain'),
        window.currentDraggedFolderId
    ];
    
    // 2. JSON 데이터 시도
    try {
        const jsonData = event.dataTransfer.getData('application/json');
        if (jsonData) {
            const parsedData = JSON.parse(jsonData);
            possibleIds.push(parsedData.folderId);
        }
    } catch (e) {
        console.log('JSON 데이터 파싱 실패:', e);
    }
    
    // 3. 유효한 폴더 ID 찾기 (undefined, null, 빈 문자열 제외)
    folderId = possibleIds.find(id => id && typeof id === 'string' && id.trim() !== '');
    
    console.log('🔍 폴더 ID 후보들:', possibleIds);
    console.log('✅ 선택된 폴더 ID:', folderId);
    
    // 4. 폴더 ID 유효성 검사 강화
    if (!folderId) {
        console.error('❌ 폴더 ID를 찾을 수 없습니다.');
        showErrorMessage('삭제할 폴더를 찾을 수 없습니다.');
        
        // 드래그 상태 정리
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        return;
    }
    
    // 5. 폴더 ID 길이 및 형식 검증
    if (folderId.length < 8) {
        console.error('❌ 폴더 ID가 너무 짧습니다:', folderId);
        showErrorMessage('올바르지 않은 폴더 ID입니다.');
        
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        return;
    }
    
    console.log('✅ 검증 완료된 폴더 ID:', folderId, '(길이:', folderId.length, ')');
    
    const folderElement = document.querySelector(`.library-item[data-folder-id="${folderId}"]`);
    const folderTitle = folderElement ? 
        folderElement.querySelector('.folder-label')?.textContent || '폴더' : '폴더';
    
    const confirmDelete = confirm(`"${folderTitle}" 폴더를 정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (!confirmDelete) {
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        // 글로벌 변수 정리
        window.currentDraggedFolderId = null;
        return;
    }
    
    try {
        console.log(`🗑️ 폴더 삭제 요청 시작: ${folderId}`);
        console.log(`📍 요청 URL: ${API_CONFIG.BASE_URL}/folders/${folderId}`);
        console.log("삭제할 폴더 ID:", folderId);
        
        // 🔍 폴더 ID 형식 검증 (MongoDB ObjectId 검증)
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(folderId)) {
            console.error('❌ 폴더 ID가 유효한 MongoDB ObjectId 형식이 아닙니다:', folderId);
            throw new Error(`유효하지 않은 폴더 ID 형식입니다: ${folderId}`);
        }
        
        // 🚀 ApiService를 사용한 개선된 DELETE 요청
        await ApiService.delete(`/folders/${folderId}`);
        
        console.log(`✅ 폴더 ${folderId} 삭제 성공`);
        
        if (folderElement) {
            folderElement.style.transition = 'all 0.3s ease';
            folderElement.style.opacity = '0';
            folderElement.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                folderElement.remove();
                showSuccessMessage(`"${folderTitle}" 폴더가 삭제되었습니다.`);
            }, 300);
        } else {
            // 폴더 목록 새로고침
            loadFolders();
            showSuccessMessage('폴더가 삭제되었습니다.');
        }
        
        // 활성 카테고리가 있으면 해당 카테고리 새로고침
        const activeTab = document.querySelector('.category-tab.active');
        if (activeTab) {
            const activeCategoryType = activeTab.dataset.categoryType;
            showFoldersForCategory(activeCategoryType);
        }
        
    } catch (error) {
        console.error('❌ 폴더 삭제 실패:', error);
        
        // 더 구체적인 에러 메시지
        let errorMessage = '폴더 삭제에 실패했습니다.';
        
        if (error.message.includes('400')) {
            errorMessage = `❌ 잘못된 요청입니다.\n폴더 ID: ${folderId}\n백엔드에서 이 ID를 인식하지 못합니다.`;
            console.error('🔧 백엔드 확인 사항:');
            console.error('   1. 폴더 ID 형식이 올바른지 확인');
            console.error('   2. DELETE /folders/:id 라우트가 구현되어 있는지 확인');
            console.error('   3. ID 파라미터 파싱이 정상인지 확인');
        } else if (error.message.includes('404')) {
            errorMessage = '폴더를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.';
        } else if (error.message.includes('403') || error.message.includes('401')) {
            errorMessage = '폴더 삭제 권한이 없습니다.';
        } else if (error.message.includes('500')) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }
        
        showErrorMessage(errorMessage);
        
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
    } finally {
        // 글로벌 변수 정리
        window.currentDraggedFolderId = null;
    }
}



// 통합된 라이브러리 표시 함수
async function loadUnifiedLibrary() {
    try {
        const libraryGrid = document.getElementById('unified-library-grid');
        
        // 로딩 표시
        libraryGrid.innerHTML = `
            <div class="library-loading" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <div style="width: 24px; height: 24px; border: 2px solid #e5e7eb; border-top: 2px solid #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
                폴더 목록을 불러오는 중...
            </div>
            <div class="add-button" onclick="createNewFolder()">+</div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        // API에서 폴더 목록 가져오기
        const response = await ApiService.get('/folders/', { limit: 20 });
        const apiFolders = response.folders || [];
        
        // 로컬 임시 폴더들도 가져오기
        const tempFolders = JSON.parse(localStorage.getItem('tempFolders') || '[]');
        
        // API 폴더와 임시 폴더 합치기
        const allFolders = [...apiFolders, ...tempFolders];
        
        // 통합된 폴더 목록 렌더링
        renderUnifiedFolders(allFolders);
        
    } catch (error) {
        console.error('폴더 목록 로드 실패:', error);
        
        // API 실패 시 로컬 임시 폴더라도 표시
        try {
            const tempFolders = JSON.parse(localStorage.getItem('tempFolders') || '[]');
            if (tempFolders.length > 0) {
                console.log('API 실패, 로컬 임시 폴더 표시:', tempFolders.length, '개');
                renderUnifiedFolders(tempFolders);
                return;
            }
        } catch (localError) {
            console.error('로컬 폴더 로드도 실패:', localError);
        }
        
        const libraryGrid = document.getElementById('unified-library-grid');
        libraryGrid.innerHTML = `
            <div class="library-error" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 12px; display: block;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                폴더 목록을 불러올 수 없습니다.<br>
                <small style="color: #6b7280;">백엔드 서버가 실행 중인지 확인해주세요.</small>
            </div>
            <div class="add-button" onclick="createNewFolder()">+</div>
        `;
    }
}

// 통합된 폴더 렌더링 함수
function renderUnifiedFolders(folders) {
    const libraryGrid = document.getElementById('unified-library-grid');
    
    if (!folders || folders.length === 0) {
        libraryGrid.innerHTML = `
            <div class="library-empty" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto 12px; display: block; opacity: 0.5;">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 2 5-2h6a2 2 0 0 1 2 2v14z"/>
                </svg>
                아직 생성된 폴더가 없습니다.<br>
                <small>+ 버튼을 클릭하여 새 폴더를 만들어보세요.</small>
            </div>
            <div class="add-button" onclick="createNewFolder()">+</div>
        `;
        return;
    }

    // 폴더 아이템들 생성
    const folderItems = folders.map((folder, index) => {
        const createdDate = new Date(folder.created_at);
        const formattedDate = formatDate(createdDate);
        const folderId = folder.id || folder.folder_id;
        const isTemporary = folder.isTemporary || false;
        
        return `
            <div class="library-item ${isTemporary ? 'temporary-folder' : ''}" 
                 onclick="navigateToFolder('${folderId}', '${folder.title}')" 
                 draggable="true" 
                 ondragstart="handleDragStart(event, '${folderId}')"
                 title="${isTemporary ? '임시 폴더 (서버 동기화 대기 중)' : ''}"
                 style="--item-index: ${index};">
                <div class="folder-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${isTemporary ? '#f59e0b' : '#4f46e5'}" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2l5 2 5-2h6a2 2 0 0 1 2 2v14z"/>
                    </svg>
                    ${isTemporary ? '<div class="temp-indicator">!</div>' : ''}
                </div>
                <div class="folder-label">${folder.title}</div>
                <div class="folder-date">${formattedDate}</div>
            </div>
        `;
    }).join('');

    libraryGrid.innerHTML = folderItems + `<div class="add-button" onclick="createNewFolder()">+</div>`;
}

// 기존 loadFolders 함수 (호환성 유지)
async function loadFolders() {
    await loadUnifiedLibrary();
}

// 그래프 시각화 클래스
class GraphVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.svg = null;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.width = 0;
        this.height = 0;
        this.tooltip = null;
        
        // 성능 최적화를 위한 캐시
        this.colorCache = new Map();
        this.sizeCache = new Map();
        this.linkColorCache = [];
        this.strokeWidthCache = [];
        this.galaxyStarColors = null;
        this.galaxyLinkColors = null;
        this.thinWidths = null;
        
        this.init();
    }
    
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // SVG 초기화
        this.svg = d3.select(`#${this.containerId}`)
            .select('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // 툴팁 생성
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'graph-tooltip')
            .style('opacity', 0);
        
        // 줌 기능 추가
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.select('.graph-group')
                    .attr('transform', event.transform);
            });
        
        this.svg.call(zoom);
        
        // 그래프 그룹 생성
        this.svg.append('g').attr('class', 'graph-group');
        
        // 컨트롤 이벤트 설정
        this.setupControls();
    }
    
    setupControls() {
        // 컨트롤 제거됨 - 자동으로 그래프 로드
    }
    
    // 색상 팔레트 및 속성 캐시 초기화
    initColorCache() {
        if (!this.galaxyStarColors) {
            this.galaxyStarColors = {
                'folder': ['#007FFF', '#0047AB', '#2E8B57', '#00FFFF', '#000080', '#4B0082', '#FFFFFF'],
                'document': ['#FFBF00', '#B5651D', '#A0522D', '#B87333', '#F5F5DC', '#F7E7CE', '#FFFFFF'],
                'tag': ['#007FFF', '#00FFFF', '#FFBF00', '#F7E7CE', '#000080', '#A0522D', '#FFFFFF'],
                'concept': ['#0047AB', '#2E8B57', '#B5651D', '#B87333', '#4B0082', '#F5F5DC', '#FFFFFF'],
                'hub': ['#FFFFFF', '#007FFF', '#FFBF00', '#00FFFF', '#A0522D', '#F7E7CE', '#000080']
            };
        }
        
        if (!this.galaxyLinkColors) {
            this.galaxyLinkColors = ['#007FFF', '#00FFFF', '#FFBF00', '#F7E7CE', '#0047AB', '#B87333', '#FFFFFF'];
        }
        
        if (!this.thinWidths) {
            this.thinWidths = [0.5, 0.8, 1.0, 1.2, 1.5];
        }
    }
    
    // 노드 속성 사전 계산
    precomputeNodeProperties() {
        this.nodes.forEach((node, index) => {
            // 색상 캐싱
            const cacheKey = `${node.type}-${index}`;
            if (!this.colorCache.has(cacheKey)) {
                const colors = this.galaxyStarColors[node.type] || this.galaxyStarColors['tag'];
                this.colorCache.set(cacheKey, colors[index % colors.length]);
            }
            node.color = this.colorCache.get(cacheKey);
            
            // 크기 캐싱
            if (!this.sizeCache.has(cacheKey)) {
                let size;
                switch(node.type) {
                    case 'folder':
                        size = Math.random() * 15 + 15; // 15-30
                        break;
                    case 'document':
                        size = Math.random() * 8 + 8; // 8-16
                        break;
                    case 'hub':
                        size = Math.random() * 10 + 25; // 25-35
                        break;
                    case 'concept':
                        size = Math.random() * 4 + 6; // 6-10
                        break;
                    default:
                        size = Math.random() * 6 + 4; // 4-10
                }
                this.sizeCache.set(cacheKey, size);
            }
            node.size = this.sizeCache.get(cacheKey);
        });
        
        // 링크 색상과 두께 사전 계산
        if (this.linkColorCache.length === 0) {
            this.links.forEach((link, index) => {
                this.linkColorCache[index] = this.galaxyLinkColors[Math.floor(Math.random() * this.galaxyLinkColors.length)];
                
                const randomWidth = this.thinWidths[Math.floor(Math.random() * this.thinWidths.length)];
                if (link.metadata?.level === 'document_to_tag') {
                    this.strokeWidthCache[index] = randomWidth;
                } else {
                    this.strokeWidthCache[index] = link.type === 'similarity' ? randomWidth * 1.5 : randomWidth;
                }
            });
        }
    }
    
    async loadGraphData(threshold = 0.05) {
        try {
            this.showLoading(true);
            
            // 더 많은 노드와 더 낮은 임계값으로 신경망 같은 효과
            const response = await fetch(`http://localhost:8000/graph-hierarchical/graph?tag_similarity_threshold=${threshold}&max_nodes=300`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            this.nodes = data.nodes || [];
            this.links = data.edges || [];
            
            this.renderGraph();
            this.showLoading(false);
            
        } catch (error) {
            console.error('그래프 데이터 로드 실패:', error);
            this.showError('그래프 데이터를 불러올 수 없습니다.');
            this.showLoading(false);
        }
    }
    

    

    
    renderGraph() {
        const graphGroup = this.svg.select('.graph-group');
        graphGroup.selectAll('*').remove();
        
        if (this.nodes.length === 0) {
            this.showError('표시할 데이터가 없습니다.');
            return;
        }
        
        // 문서 노드에서 태그 노드들을 가지처럼 배치하기 위한 데이터 준비
        this.prepareTreeLayout();
        
        // 색상 팔레트 캐싱 초기화
        this.initColorCache();
        
        // 노드별 고유 색상 및 속성 사전 계산
        this.precomputeNodeProperties();
        
        // 시뮬레이션 설정 - 신경망처럼 더 유동적으로
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links).id(d => d.id).distance(d => {
                // 거리를 더 다양하게
                const baseDistance = Math.random() * 40 + 30;
                if (d.type === 'hierarchy') {
                    if (d.metadata?.level === 'document_to_tag') return baseDistance * 0.6;
                    return d.metadata?.level === 'folder_to_document' ? baseDistance * 1.2 : baseDistance;
                }
                return baseDistance * 1.5;
            }))
            .force('charge', d3.forceManyBody().strength(d => {
                // 더 강한 척력으로 신경망 효과
                const baseStrength = -100 - Math.random() * 200;
                switch(d.type) {
                    case 'folder': return baseStrength * 2;
                    case 'document': return baseStrength * 1.5;
                    case 'tag': return baseStrength;
                    default: return baseStrength;
                }
            }))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(d => d.size + 5))
            // 신경망 효과를 위한 추가 포스
            .force('x', d3.forceX(this.width / 2).strength(0.1))
            .force('y', d3.forceY(this.height / 2).strength(0.1));
        

        
        // 링크 렌더링 - 신경망 스타일 (최적화됨)
        const link = graphGroup.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.links)
            .enter().append('line')
            .attr('class', d => `graph-link ${d.type}`)
            .attr('stroke-width', (d, i) => this.strokeWidthCache[i])
            .attr('stroke', (d, i) => this.linkColorCache[i])
            .attr('stroke-dasharray', 'none')
            .attr('opacity', d => 0.3 + Math.random() * 0.4);
        
        // 노드 렌더링 - 신경망 스타일 (최적화됨)
        const node = graphGroup.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter().append('circle')
            .attr('class', d => `graph-node ${d.type}`)
            .attr('r', d => d.size)
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .call(this.drag());
        
        // 펄스 애니메이션 제거됨 (성능 최적화)
        
        // 텍스트 레이블 - 신경망 스타일 (최적화됨)
        const text = graphGroup.append('g')
            .attr('class', 'texts')
            .selectAll('text')
            .data(this.nodes)
            .enter().append('text')
            .attr('class', 'graph-text')
            .attr('fill', '#ffffff')
            .attr('font-size', d => {
                if (d.type === 'folder') return '12px';
                if (d.type === 'document') return '10px';
                return '8px';
            })
            .attr('font-weight', d => d.type === 'folder' ? 'bold' : 'normal')
            .text(d => {
                if (d.type === 'document') {
                    const lines = d.title.split('\n');
                    return lines[0];
                }
                return d.title.length > 12 ? d.title.substring(0, 12) + '...' : d.title;
            });
        

        
        // 툴팁 이벤트 (트랜지션 제거됨)
        node.on('mouseover', (event, d) => {
            this.showTooltip(event, d);
            // 호버 시 노드 강조 (트랜지션 없이)
            d3.select(event.currentTarget)
                .attr('stroke-width', 4)
                .attr('r', d.size * 1.2);
        })
        .on('mouseout', (event, d) => {
            this.hideTooltip();
            // 호버 해제 시 원래 상태로 (트랜지션 없이)
            d3.select(event.currentTarget)
                .attr('stroke-width', 2)
                .attr('r', d.size);
        });
        
        // 시뮬레이션 업데이트
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
            
            text
                .attr('x', d => d.x)
                .attr('y', d => d.y + (d.type === 'tag' ? -15 : 25));
        });
    }
    

    

    
    prepareTreeLayout() {
        // 문서 노드에서 태그들을 가지처럼 배치하기 위한 전처리
        // 각 문서 노드의 태그들을 원형으로 배치
        const documentNodes = this.nodes.filter(d => d.type === 'document');
        
        documentNodes.forEach(docNode => {
            const docTags = this.links
                .filter(link => link.source === docNode.id && link.metadata?.level === 'document_to_tag')
                .map(link => link.target);
            
            // 태그들을 문서 노드 주변에 원형으로 배치
            docTags.forEach((tagId, index) => {
                const tagNode = this.nodes.find(n => n.id === tagId);
                if (tagNode) {
                    const angle = (2 * Math.PI * index) / docTags.length;
                    const radius = 50; // 문서 노드로부터의 거리
                    
                    // 초기 위치 설정 (시뮬레이션에서 참고용)
                    tagNode.initialAngle = angle;
                    tagNode.initialRadius = radius;
                    tagNode.parentDocId = docNode.id;
                }
            });
        });
    }
    
    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }
    
    showTooltip(event, d) {
        // 간소화된 툴팁: 제목과 타입만 표시
        let content = `<div style="font-weight: bold; color: #333;">${d.title.split('\n')[0]}</div>`;
        content += `<div style="color: #666; font-size: 12px;">${d.type}</div>`;
        
        // 중요한 정보만 추가
        if (d.metadata?.document_count) {
            content += `<div style="color: #666; font-size: 11px;">문서: ${d.metadata.document_count}개</div>`;
        }
        if (d.metadata?.frequency) {
            content += `<div style="color: #666; font-size: 11px;">빈도: ${d.metadata.frequency}</div>`;
        }
        
        this.tooltip
            .style('opacity', 1)
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('border', 'none')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('font-size', '12px')
            .html(content)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 5) + 'px');
    }
    
    hideTooltip() {
        this.tooltip.style('opacity', 0);
    }
    
    centerGraph() {
        const transform = d3.zoomIdentity;
        this.svg.transition()
            .duration(750)
            .call(d3.zoom().transform, transform);
    }
    
    showLoading(show) {
        const loading = document.getElementById('graph-loading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }
    
    showError(message) {
        const container = document.getElementById(this.containerId);
        const errorDiv = container.querySelector('.graph-error') || 
            container.appendChild(document.createElement('div'));
        
        errorDiv.className = 'graph-error';
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            z-index: 5;
        `;
        errorDiv.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 10px; opacity: 0.5;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <p>${message}</p>
        `;
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    resize() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.svg
            .attr('width', this.width)
            .attr('height', this.height);
        
        if (this.simulation) {
            this.simulation
                .force('center', d3.forceCenter(this.width / 2, this.height / 2))
                .restart();
        }
    }
}

// 전역 그래프 인스턴스
let graphVisualization = null;
let isGraphLoaded = false;

// 그래프 팝업 열기 함수 (스플래시 이미지 클릭 시 호출)
async function openGraphPopup() {
    const popupOverlay = document.getElementById('graph-popup-overlay');
    const graphContainer = document.getElementById('graph-container');
    
    if (!popupOverlay || !graphContainer) {
        console.error('그래프 팝업 요소를 찾을 수 없습니다.');
        return;
    }
    
    try {
        // 팝업 오버레이 보이기
        popupOverlay.style.display = 'flex';
        
        // 그래프가 아직 로드되지 않은 경우에만 로드
        if (!isGraphLoaded) {
            // 그래프 시각화 초기화 및 로드
            if (!graphVisualization) {
                graphVisualization = new GraphVisualization('graph-container');
            }
            
            graphVisualization.loadGraphData();
            isGraphLoaded = true;
            
            console.log('✅ 그래프 시각화가 팝업에서 로드되었습니다.');
        } else {
            // 이미 로드된 경우 그래프 리사이즈
            if (graphVisualization) {
                setTimeout(() => {
                    graphVisualization.resize();
                }, 100);
            }
        }
        
        // ESC 키로 팝업 닫기 이벤트 추가
        document.addEventListener('keydown', handlePopupKeydown);
        
    } catch (error) {
        console.error('❌ 그래프 팝업 열기 중 오류 발생:', error);
        showErrorMessage('그래프 팝업을 여는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 그래프 팝업 닫기 함수
function closeGraphPopup(event) {
    // 이벤트가 있고, 클릭한 요소가 팝업 내부인 경우 닫지 않음
    if (event && event.target.closest('.graph-popup') && !event.target.classList.contains('graph-popup-close')) {
        return;
    }
    
    const popupOverlay = document.getElementById('graph-popup-overlay');
    
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
        
        // ESC 키 이벤트 제거
        document.removeEventListener('keydown', handlePopupKeydown);
        
        console.log('✅ 그래프 팝업이 닫혔습니다.');
    }
}

// ESC 키로 팝업 닫기
function handlePopupKeydown(event) {
    if (event.key === 'Escape') {
        closeGraphPopup();
    }
}

// 사용자 박스 관리
class UserBoxManager {
    constructor() {
        this.updateUserStats();
        this.bindUserBoxEvents();
        this.updateLastAccess();
    }
    
    async updateUserStats() {
        try {
            // 폴더 수 업데이트
            const folders = await this.loadFolders();
            const folderCountElement = document.querySelector('.folder-count');
            if (folderCountElement) {
                folderCountElement.textContent = folders.length;
            }
            
            // 마지막 접근일 업데이트
            const lastAccess = this.getLastAccessDays();
            const lastAccessElement = document.querySelector('.last-access-date');
            if (lastAccessElement) {
                lastAccessElement.textContent = lastAccess;
            }
            
        } catch (error) {
            console.error('사용자 통계 업데이트 실패:', error);
            // 기본값 유지
        }
    }
    
    async loadFolders() {
        try {
            const response = await ApiService.get('/folders/', { limit: 100 });
            return response.folders || [];
        } catch (error) {
            console.warn('폴더 목록 로드 실패, 빈 배열 반환:', error);
            return [];
        }
    }
    
    getLastAccessDays() {
        // 마지막 접근일 계산 (예시: localStorage 기반)
        const lastAccess = localStorage.getItem('lastAccess');
        if (!lastAccess) return 0;
        
        const lastDate = new Date(lastAccess);
        const now = new Date();
        const diffTime = Math.abs(now - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
    
    updateLastAccess() {
        // 현재 접근 시간을 저장
        localStorage.setItem('lastAccess', new Date().toISOString());
    }
    
    bindUserBoxEvents() {
        // 로그아웃 버튼
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // PDF 추가 버튼
        const pdfAddBtn = document.querySelector('.pdf-add-btn');
        if (pdfAddBtn) {
            pdfAddBtn.addEventListener('click', this.handlePdfAdd.bind(this));
        }
    }
    
    handleLogout() {
        if (confirm('로그아웃 하시겠습니까?')) {
            // 로컬 스토리지 클리어 (특정 키만)
            localStorage.removeItem('localCategories');
            localStorage.removeItem('lastAccess');
            
            // 홈페이지 리로드
            alert('로그아웃되었습니다.');
            window.location.reload();
        }
    }
    
    async handlePdfAdd() {
        // PDF 파일 업로드 기능 - 폴더 생성 먼저
        try {
            // 1단계: 먼저 폴더 선택/생성
            const folderChoice = await this.selectFolderForUpload();
            if (folderChoice.cancelled) {
                return;
            }

            // 2단계: 파일 선택
            const file = await this.selectPdfFile();
            if (!file) {
                return;
            }

            // 3단계: 업로드 실행
            await this.uploadPdfFile(file, folderChoice);
            
        } catch (error) {
            console.error('PDF 추가 기능 오류:', error);
            showErrorMessage('PDF 추가 기능에 오류가 발생했습니다.');
        }
    }

    async selectPdfFile() {
        return new Promise((resolve) => {
            // 파일 입력 요소 생성
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                resolve(file);
                // 파일 입력 요소 제거
                document.body.removeChild(fileInput);
            });

            // 취소 시 처리
            fileInput.addEventListener('cancel', () => {
                resolve(null);
                document.body.removeChild(fileInput);
            });
            
            // DOM에 추가하고 클릭
            document.body.appendChild(fileInput);
            fileInput.click();
        });
    }

    async uploadPdfFile(file, folderChoice) {
        // 파일 크기 검증 (10MB 제한)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            showErrorMessage('파일 크기는 10MB를 초과할 수 없습니다.');
            return;
        }

        // 파일 형식 검증
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showErrorMessage('PDF 파일만 업로드할 수 있습니다.');
            return;
        }

        // 업로드 진행 상태 표시
        this.showUploadProgress(file.name);

        try {
            // FormData 생성
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', `PDF 파일: ${file.name}`);
            formData.append('preserve_formatting', 'true');

            // 생성된 폴더 ID 사용
            if (folderChoice.folderId) {
                formData.append('folder_id', folderChoice.folderId);
            }

            // API 업로드 요청
            const response = await fetch('http://localhost:8000/upload/', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.hideUploadProgress();
                const folderInfo = folderChoice.folderName ? `\n폴더: ${folderChoice.folderName}` : '';
                showSuccessMessage(`✅ PDF 업로드 완료!\n\n📁 파일: ${file.name}${folderInfo}\n📊 처리된 청크: ${result.processed_chunks}개`);
                
                // 폴더 목록 새로고침
                await loadFolders();
                this.updateUserStats();
            } else {
                throw new Error(result.message || '업로드에 실패했습니다.');
            }
            
        } catch (error) {
            this.hideUploadProgress();
            console.error('PDF 업로드 오류:', error);
            
            if (error.message.includes('fetch')) {
                showErrorMessage('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } else {
                showErrorMessage(`업로드 실패: ${error.message}`);
            }
        }
    }

    async selectFolderForUpload() {
        return new Promise((resolve) => {
            // 간단한 폴더 선택 다이얼로그 생성
            const modal = document.createElement('div');
            modal.className = 'upload-folder-modal';
            modal.innerHTML = `
                <div class="upload-folder-dialog">
                    <h3>1단계: 폴더 생성</h3>
                    <p>PDF 파일을 업로드할 새 폴더를 먼저 생성하세요:</p>
                    <div class="folder-input-area">
                        <input type="text" id="folder-name-input" placeholder="새 폴더 이름을 입력하세요 (예: 데일카네기 인간관계론)" />
                        <div class="folder-input-buttons">
                            <button id="create-folder-btn">폴더 생성 후 PDF 업로드</button>
                            <button id="cancel-folder-btn">취소</button>
                        </div>
                    </div>
                </div>
            `;

            // 모달 스타일 적용
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

            const dialog = modal.querySelector('.upload-folder-dialog');
            dialog.style.cssText = `
                background: white;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 450px;
                width: 90%;
            `;

            document.body.appendChild(modal);

            const folderInput = modal.querySelector('#folder-name-input');
            folderInput.focus();

            // 이벤트 처리
            modal.addEventListener('click', async (e) => {
                if (e.target.id === 'create-folder-btn') {
                    const folderName = folderInput.value.trim();
                    if (folderName) {
                        try {
                            // 먼저 폴더를 생성
                            const folderId = await this.createFolderFirst(folderName);
                            document.body.removeChild(modal);
                            resolve({ 
                                cancelled: false, 
                                folderId: folderId,
                                folderName: folderName
                            });
                        } catch (error) {
                            showErrorMessage(`폴더 생성 실패: ${error.message}`);
                        }
                    } else {
                        showErrorMessage('폴더 이름을 입력해주세요.');
                    }
                }

                if (e.target.id === 'cancel-folder-btn') {
                    document.body.removeChild(modal);
                    resolve({ cancelled: true });
                }
            });

            // Enter 키로 폴더 생성
            folderInput.addEventListener('keypress', async (e) => {
                if (e.key === 'Enter') {
                    const folderName = folderInput.value.trim();
                    if (folderName) {
                        try {
                            const folderId = await this.createFolderFirst(folderName);
                            document.body.removeChild(modal);
                            resolve({ 
                                cancelled: false, 
                                folderId: folderId,
                                folderName: folderName
                            });
                        } catch (error) {
                            showErrorMessage(`폴더 생성 실패: ${error.message}`);
                        }
                    }
                }
            });

            // ESC 키로 취소
            const handleKeydown = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleKeydown);
                    resolve({ cancelled: true });
                }
            };
            document.addEventListener('keydown', handleKeydown);
        });
    }

    async createFolderFirst(folderName) {
        try {
            // 1. 먼저 기존 폴더 목록에서 같은 이름의 폴더가 있는지 확인
            const foldersResponse = await fetch('http://localhost:8000/folders/?limit=100');
            if (foldersResponse.ok) {
                const foldersData = await foldersResponse.json();
                const existingFolder = foldersData.folders.find(folder => 
                    folder.title.trim().toLowerCase() === folderName.trim().toLowerCase()
                );
                
                if (existingFolder) {
                    showSuccessMessage(`기존 폴더 "${existingFolder.title}"을 사용합니다.`);
                    return existingFolder.folder_id;
                }
            }

            // 2. 기존 폴더가 없으면 새로 생성
            const response = await fetch('http://localhost:8000/folders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: folderName,
                    folder_type: 'general'
                })
            });

            const result = await response.json();

            if (response.ok && result.folder_id) {
                showSuccessMessage(`새 폴더 "${folderName}"이 생성되었습니다.`);
                return result.folder_id;
            } else {
                // 중복 폴더명 오류인 경우 다시 검색해서 기존 폴더 사용
                if (result.detail && result.detail.includes('이미 존재하는 폴더명')) {
                    const retryResponse = await fetch('http://localhost:8000/folders/?limit=100');
                    if (retryResponse.ok) {
                        const retryData = await retryResponse.json();
                        const existingFolder = retryData.folders.find(folder => 
                            folder.title.trim().toLowerCase() === folderName.trim().toLowerCase()
                        );
                        
                        if (existingFolder) {
                            showSuccessMessage(`기존 폴더 "${existingFolder.title}"을 사용합니다.`);
                            return existingFolder.folder_id;
                        }
                    }
                }
                throw new Error(result.detail || result.message || '폴더 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('폴더 생성 오류:', error);
            if (error.message.includes('fetch')) {
                throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            } else {
                throw error;
            }
        }
    }

    showUploadProgress(fileName) {
        // 기존 진행 상태가 있으면 제거
        this.hideUploadProgress();

        const progressModal = document.createElement('div');
        progressModal.id = 'upload-progress-modal';
        progressModal.innerHTML = `
            <div class="upload-progress-dialog">
                <div class="upload-progress-content">
                    <div class="upload-spinner"></div>
                    <h3>2단계: PDF 파일 업로드 중...</h3>
                    <p class="upload-filename">${fileName}</p>
                    <div class="upload-status">서버로 전송 및 텍스트 추출 중...</div>
                </div>
            </div>
        `;

        // 스타일 적용
        progressModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;

        document.body.appendChild(progressModal);
    }

    hideUploadProgress() {
        const progressModal = document.getElementById('upload-progress-modal');
        if (progressModal) {
            document.body.removeChild(progressModal);
        }
    }
    
    // 외부에서 호출할 수 있는 업데이트 메서드
    refresh() {
        this.updateUserStats();
    }
}

// Todo List 관리 클래스
class TodoManager {
    constructor() {
        this.todos = this.getLocalTodos();
        this.nextId = this.getNextId();
        this.initializeTodoList();
    }
    
    // 로컬 스토리지에서 Todo 데이터 가져오기
    getLocalTodos() {
        const defaultTodos = [
            {
                id: 1,
                text: "프로젝트 기획서 작성하기",
                time: "마감: 오늘 오후 6시",
                completed: true,
                priority: false
            },
            {
                id: 2,
                text: "팀 미팅 준비",
                time: "마감: 내일 오전 10시",
                completed: false,
                priority: false
            },
            {
                id: 3,
                text: "블로그 포스팅 작성",
                time: "마감: 이번 주 내",
                completed: false,
                priority: true
            },
            {
                id: 4,
                text: "독서 - 새로운 책 읽기",
                time: "마감: 주말까지",
                completed: false,
                priority: false
            }
        ];
        
        try {
            const savedTodos = localStorage.getItem('userTodos');
            if (savedTodos) {
                const parsed = JSON.parse(savedTodos);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTodos;
            }
        } catch (error) {
            console.warn('Todo 데이터 파싱 오류:', error);
        }
        
        return defaultTodos;
    }
    
    // 다음 ID 가져오기
    getNextId() {
        const maxId = this.todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
        return maxId + 1;
    }
    
    // 로컬 스토리지에 Todo 데이터 저장
    saveLocalTodos() {
        try {
            localStorage.setItem('userTodos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Todo 저장 오류:', error);
        }
    }
    
    // Todo 추가
    addTodo(text, time = '') {
        if (text && text.trim()) {
            const newTodo = {
                id: this.nextId++,
                text: text.trim(),
                time: time || '마감: 자유',
                completed: false,
                priority: false
            };
            this.todos.unshift(newTodo); // 맨 앞에 추가
            this.saveLocalTodos();
            this.renderTodoList();
            return true;
        }
        return false;
    }
    
    // Todo 완료 상태 토글
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveLocalTodos();
            this.renderTodoList();
            this.updateProgress();
        }
    }
    
    // Todo 삭제
    removeTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveLocalTodos();
        this.renderTodoList();
        this.updateProgress();
}

    // Todo 우선순위 토글
    togglePriority(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.priority = !todo.priority;
            this.saveLocalTodos();
            this.renderTodoList();
    }
    }
    
    // Todo 리스트 렌더링
    renderTodoList() {
        const todoList = document.getElementById('todo-list');
        if (!todoList) return;
    
        if (this.todos.length === 0) {
            todoList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #999;">
                    할 일이 없습니다.<br>
                    <small>새로운 할 일을 추가해보세요!</small>
        </div>
    `;
            this.updateProgress();
            return;
        }
        
        todoList.innerHTML = this.todos.map(todo => `
            <div class="todo-item" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                     onclick="todoManager.toggleTodo(${todo.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                </div>
                <div class="todo-content">
                    <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                    <div class="todo-time">${todo.time}</div>
                </div>
                ${todo.priority ? '<div class="todo-priority">중요</div>' : ''}
                <div class="todo-more" onclick="todoManager.showTodoMenu(${todo.id}, event)">⋯</div>
            </div>
        `).join('');
        
        this.updateProgress();
    }
    
    // 진행률 업데이트
    updateProgress() {
        const completed = this.todos.filter(todo => todo.completed).length;
        const total = this.todos.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('progress-percentage');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
    }
    
    // Todo 메뉴 표시
    showTodoMenu(id, event) {
        event.stopPropagation();
        // 간단한 확인 후 삭제
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
            this.removeTodo(id);
        }
    }
    
    // Todo List 초기화
    initializeTodoList() {
        this.renderTodoList();
        this.updateProgress();
    }
}

// Todo 매니저 인스턴스
let todoManager;

// 새 할 일 추가 함수
function addNewTodo() {
    const text = prompt('새로운 할 일을 입력하세요:');
    if (text && text.trim()) {
        if (!todoManager) {
            todoManager = new TodoManager();
        }
        todoManager.addTodo(text.trim());
    }
}

// Todo List 초기화 함수
function initializeTodoList() {
    if (!todoManager) {
        todoManager = new TodoManager();
    }
}

// 달력 관리 클래스
class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.folderDates = this.getFolderDates();
        this.monthNames = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        this.dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        this.bindEvents();
    }
    
    // 폴더 생성 날짜 데이터 가져오기
    getFolderDates() {
        try {
            const saved = localStorage.getItem('folderCreationDates');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('폴더 날짜 데이터 로드 오류:', error);
            return {};
        }
    }
    
    // 폴더 생성 날짜 저장
    saveFolderDates() {
        try {
            localStorage.setItem('folderCreationDates', JSON.stringify(this.folderDates));
        } catch (error) {
            console.error('폴더 날짜 데이터 저장 오류:', error);
        }
    }
    
    // 폴더 생성 날짜 추가
    addFolderDate(date = new Date()) {
        const dateKey = this.formatDateKey(date);
        if (!this.folderDates[dateKey]) {
            this.folderDates[dateKey] = 0;
        }
        this.folderDates[dateKey]++;
        this.saveFolderDates();
        this.renderCalendar(); // 달력 다시 렌더링
    }
    
    // 날짜를 키 형식으로 변환 (YYYY-MM-DD)
    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    // 이벤트 바인딩
    bindEvents() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousMonth());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextMonth());
        }
    }
    
    // 이전 달
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    // 다음 달
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    // 달력 렌더링
    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthYearElement = document.getElementById('currentMonthYear');
        
        if (!calendarGrid || !monthYearElement) return;
        
        // 월/년 표시
        monthYearElement.textContent = `${this.currentDate.getFullYear()}년 ${this.monthNames[this.currentDate.getMonth()]}`;
        
        // 달력 그리드 초기화
        calendarGrid.innerHTML = '';
        
        // 요일 헤더 추가
        this.dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // 현재 월의 첫 번째 날과 마지막 날
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        
        // 첫 번째 주의 빈 칸 추가
        const startDay = firstDay.getDay();
        for (let i = 0; i < startDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            const prevMonthDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), -(startDay - 1 - i));
            emptyDay.textContent = prevMonthDate.getDate();
            calendarGrid.appendChild(emptyDay);
        }
        
        // 현재 월의 날짜들 추가
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateKey = this.formatDateKey(currentDayDate);
            
            // 오늘 날짜 체크
            const today = new Date();
            if (currentDayDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // 폴더가 있는 날짜 체크
            if (this.folderDates[dateKey]) {
                dayElement.classList.add('has-folder');
                dayElement.title = `${this.folderDates[dateKey]}개의 폴더가 생성됨`;
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        // 마지막 주의 빈 칸 추가
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6주 * 7일 = 42칸
        for (let i = 1; i <= remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            emptyDay.textContent = i;
            calendarGrid.appendChild(emptyDay);
        }
    }
    
    // 초기화
    init() {
        this.renderCalendar();
    }
}

// 전역 매니저 인스턴스들
let userBoxManager;
let calendarManager;

// 페이지 로드 시 통합된 라이브러리, 카테고리, 그래프 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 다크모드 매니저 초기화
    if (typeof DarkModeManager !== 'undefined') {
        const darkModeManager = new DarkModeManager();
    }
    
    // 사용자 박스 초기화
    userBoxManager = new UserBoxManager();
    
    // Todo List 초기화
    initializeTodoList();
    
    // 달력 초기화
    calendarManager = new CalendarManager();
    calendarManager.init();
    
    // 통합된 라이브러리와 카테고리 로드
    loadUnifiedLibrary().then(() => {
        // 폴더 로드 완료 후 사용자 박스 업데이트
        if (userBoxManager) {
            userBoxManager.refresh();
        }
    });
    loadAndRenderCategories();
    
    // 그래프 시각화는 스플래시 이미지 클릭 시에만 로드됩니다
    console.log('✅ 홈 페이지 로드 완료. 그래프를 보려면 스플래시 이미지를 클릭하세요.');
});

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', () => {
    if (graphVisualization) {
        graphVisualization.resize();
    }
}); 

// 배너 버튼 클릭 함수들
function openQuizMate() {
    console.log('Quiz Mate 배너 클릭됨');
    
    // SeeQuizMate-main 프로젝트로 이동 (새 탭에서 열기)
    const quizMateUrl = 'http://localhost:5173';
    
    // 현재 탭에서 이동하려면 이 주석을 해제
    // window.location.href = quizMateUrl;
    
    // 새 탭에서 열기 (추천)
    window.open(quizMateUrl, '_blank', 'noopener,noreferrer');
    
    console.log('Quiz Mate 페이지로 이동:', quizMateUrl);
}

async function openSecondBrain() {
    console.log('Second Brain 배너 클릭됨 - 그래프 시각화 열기');
    
    // 기존 그래프 팝업 함수 호출
    await openGraphPopup();
}

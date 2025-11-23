// ===== 유틸리티 함수들 =====

// 현재 선택된 폴더 정보
let currentFolder = null;

// 선택된 문서 관리
let selectedDocuments = new Set(); // 선택된 문서 ID들

// ===== 문서 선택 관리 함수들 =====

// 문서 선택/해제 토글
function toggleDocumentSelection(fileId) {
    try {
        const checkbox = document.getElementById(`doc-${fileId}`);
        const pileChart = checkbox?.closest('.pile-chart');
        
        if (!checkbox || !pileChart) {
            console.warn('⚠️ 체크박스 또는 pile-chart를 찾을 수 없습니다:', fileId);
            return;
        }
        
        // 체크박스 상태에 따라 선택 상태 업데이트
        if (checkbox.checked) {
            selectedDocuments.add(fileId);
            pileChart.classList.add('selected');
            console.log('✅ 문서 선택:', fileId);
        } else {
            selectedDocuments.delete(fileId);
            pileChart.classList.remove('selected');
            console.log('❌ 문서 선택 해제:', fileId);
        }
        
        updateSelectionStatus();
        
    } catch (error) {
        console.error('문서 선택 토글 실패:', error);
    }
}

// 전역에서 접근 가능하도록 window 객체에 추가
window.toggleDocumentSelection = toggleDocumentSelection;

// 모든 문서 선택
function selectAllDocuments() {
    const checkboxes = document.querySelectorAll('.document-checkbox');
    checkboxes.forEach(checkbox => {
        const fileId = checkbox.getAttribute('data-file-id');
        checkbox.checked = true;
        selectedDocuments.add(fileId);
        checkbox.closest('.pile-chart').classList.add('selected');
    });
    updateSelectionStatus();
}

// 모든 문서 선택 해제
function clearAllSelections() {
    const checkboxes = document.querySelectorAll('.document-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('.pile-chart').classList.remove('selected');
    });
    selectedDocuments.clear();
    updateSelectionStatus();
}

// 선택 상태 업데이트
function updateSelectionStatus() {
    console.log(`📋 선택된 문서: ${selectedDocuments.size}개`, Array.from(selectedDocuments));
    
    // 선택된 문서 수 표시 (필요시 UI 업데이트)
    const statusElement = document.querySelector('.selection-status');
    if (statusElement) {
        statusElement.textContent = `${selectedDocuments.size}개 문서 선택됨`;
    }
}

// 선택된 문서 목록 반환
function getSelectedDocuments() {
    return Array.from(selectedDocuments);
}

// ===== 알림 및 로딩 관련 함수들 =====

// 알림 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.api-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `api-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// 로딩 표시 함수
function showLoading(target = null) {
    const loader = document.createElement('div');
    loader.className = 'api-loader';
    loader.innerHTML = `
        <div class="api-loader-content">
            <div class="api-loader-spinner"></div>
            데이터 로딩 중...
        </div>
    `;
    
    if (target) {
        target.appendChild(loader);
    }
    
    return loader;
}

// 로딩 제거 함수
function hideLoading(target = null) {
    const loaders = target ? 
        target.querySelectorAll('.api-loader') : 
        document.querySelectorAll('.api-loader');
    loaders.forEach(loader => loader.remove());
}

// ===== 폴더 및 문서 관련 유틸리티 =====

// 선택된 폴더 정보 로드
function loadSelectedFolder() {
    try {
        const savedFolder = localStorage.getItem('selectedFolder');
        if (savedFolder) {
            currentFolder = JSON.parse(savedFolder);
            console.log('선택된 폴더:', currentFolder);
            
            // 페이지 제목 업데이트
            const titleElement = document.querySelector('.main-title');
            if (titleElement && currentFolder.title) {
                titleElement.textContent = currentFolder.title;
            }
            
            // 메모 모듈 새로고침
            if (typeof refreshMemoModulesOnFolderChange === 'function') {
                refreshMemoModulesOnFolderChange();
            }
            
            // 추천 모듈 새로고침
            if (typeof refreshRecommendationModulesOnFolderChange === 'function') {
                refreshRecommendationModulesOnFolderChange();
            }
        } else {
            console.warn('선택된 폴더 정보가 없습니다.');
            // home.html로 리다이렉트
            window.location.href = 'home.html';
        }
    } catch (error) {
        console.error('폴더 정보 로드 실패:', error);
        window.location.href = 'home.html';
    }
}

// 파일 타입별 정보 반환
function getFileTypeInfo(fileType) {
    const type = fileType.toLowerCase();
    
    switch (type) {
        case 'pdf':
            return {
                icon: `<svg class="file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                       </svg>`,
                badgeClass: 'pdf'
            };
        case 'doc':
        case 'docx':
            return {
                icon: `<svg class="file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="8" y1="13" x2="16" y2="13"></line>
                        <line x1="8" y1="17" x2="12" y2="17"></line>
                        </svg>`,
                badgeClass: 'docx'
            };
        default:
            return {
                icon: `<svg class="file-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        </svg>`,
                badgeClass: 'pdf'
            };
    }
}

// 파일 크기 포맷팅 (글자수 기반)
function formatFileSize(charCount) {
    if (charCount < 1000) {
        return `${charCount}자`;
    } else if (charCount < 10000) {
        return `${(charCount / 1000).toFixed(1)}K자`;
    } else {
        return `${Math.round(charCount / 1000)}K자`;
    }
}

// 날짜 포맷팅
function formatDocumentDate(date) {
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

// ===== 문서 렌더링 함수 =====

// 문서 목록 렌더링
function renderDocuments(documentGroups) {
    const pileContainer = document.querySelector('.pile-container');
    if (!pileContainer) return;
    
    if (documentGroups.length === 0) {
        pileContainer.innerHTML = `
            <div class="empty-documents-container">
                <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                이 폴더에는 아직 문서가 없습니다.<br>
                <small class="empty-details">문서를 업로드해보세요.</small>
            </div>
        `;
        return;
    }
    
    let documentsHTML = '';
    
    documentGroups.forEach((docGroup, index) => {
        // 파일 타입에 따른 아이콘 및 배지 스타일 결정
        const fileInfo = getFileTypeInfo(docGroup.file_type);
        
        // 날짜 포맷팅
        const createdDate = new Date(docGroup.created_at);
        const formattedDate = formatDocumentDate(createdDate);
        const formattedSize = formatFileSize(docGroup.file_size || docGroup.page_count);
        
        // 파일명 처리 - Unknown Document인 경우 생성날짜로 대체
        let displayFileName = docGroup.file_name;
        if (displayFileName === 'Unknown Document' || !displayFileName || displayFileName.trim() === '') {
            const dateForFileName = createdDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit'
            }).replace(/\./g, '-').replace(/-$/g, '');
            displayFileName = `문서_${dateForFileName}`;
        }
        
        documentsHTML += `
            <div class="pile-item">
                <div class="pile-chart" data-file-id="${docGroup.file_id}">
                    <div class="file-row">
                        <div class="file-info">
                            <div class="file-checkbox">
                                <input type="checkbox" 
                                       class="document-checkbox" 
                                       id="doc-${docGroup.file_id}"
                                       data-file-id="${docGroup.file_id}"
                                       onchange="toggleDocumentSelection('${docGroup.file_id}')">
                                <label for="doc-${docGroup.file_id}" class="checkbox-label"></label>
                            </div>
                            <div class="file-icon-container">
                                ${fileInfo.icon}
                            </div>
                            <div class="file-details">
                                <div class="file-name">${displayFileName}</div>
                                <div class="file-source">${docGroup.page_count}페이지</div>
                            </div>
                        </div>
                        
                        <div class="file-size">${formattedSize}</div>
                        <div class="file-date">${formattedDate}</div>
                        
                        <div class="file-type">
                            <span class="type-badge ${fileInfo.badgeClass}">${docGroup.file_type.toUpperCase()}</span>
                        </div>
                        
                        <div class="file-actions">
                            <button class="action-btn download-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                            <button class="action-btn more-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                            </button>
                            <button class="action-btn expand-btn">
                                <svg class="expand-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="pile-low-text" data-file-id="${docGroup.file_id}">
                    <div class="content-container">
                        <div class="content-header">
                            <div class="content-actions">
                                <button class="preview-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <line x1="12" y1="9" x2="8" y2="9"></line>
                                    </svg>
                                    전체 텍스트
                                </button>
                                <button class="full-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                    전체보기
                                </button>
                            </div>
                        </div>
                        
                        <div class="content-display">
                            <div class="text-content-area">
                                <div class="content-text" data-raw-content="${encodeURIComponent(docGroup.low_text || '문서 내용을 불러오는 중...')}" style="font-size: calc(1em * var(--font-scale)); line-height: calc(1.5 * var(--font-scale));">${docGroup.low_text || '문서 내용을 불러오는 중...'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    pileContainer.innerHTML = documentsHTML;
    
    // 선택 상태 업데이트
    updateSelectionStatus();
}

// ===== 기본 문서 액션 함수들 =====

// 문서 다운로드
function downloadDocument(fileId) {
    console.log('문서 다운로드:', fileId);
    // TODO: 다운로드 기능 구현
    showNotification('다운로드 기능은 곧 구현될 예정입니다.', 'info');
}

// 더 많은 옵션 표시
function showMoreOptions(fileId) {
    console.log('문서 옵션:', fileId);
    // TODO: 옵션 메뉴 구현
    showNotification('옵션 메뉴는 곧 구현될 예정입니다.', 'info');
}

// 전체 텍스트 보기 (content-container에 표시)
async function previewDocument(fileId) {
    try {
        console.log('전체 텍스트 로드:', fileId);
        
        showNotification('전체 텍스트를 로드하는 중...', 'info');
        
        // 문서 전체 내용 로드
        const response = await ApiService.get(`/documents/single/${fileId}/content`);
        
        // 해당 파일의 pile-low-text 영역 찾기
        const pileLowTextElement = document.querySelector(`.pile-low-text[data-file-id="${fileId}"]`);
        
        if (pileLowTextElement) {
            // 문서가 접혀있으면 자동으로 확장
            if (!pileLowTextElement.classList.contains('expanded')) {
                const pileItem = pileLowTextElement.closest('.pile-item');
                const expandButton = pileItem?.querySelector('.expand-btn');
                if (expandButton) {
                    expandButton.click();
                }
            }
            
            const contentArea = pileLowTextElement.querySelector('.text-content-area');
            const contentTextElement = contentArea?.querySelector('.content-text');
            
            if (contentTextElement) {
                // 전체 텍스트를 content-container에 표시
                contentTextElement.innerHTML = response.raw_text || '문서 내용을 불러올 수 없습니다.';
                contentTextElement.setAttribute('data-raw-content', encodeURIComponent(response.raw_text || ''));
                
                // 글꼴 크기 스케일링 적용
                contentTextElement.style.fontSize = 'calc(1em * var(--font-scale))';
                contentTextElement.style.lineHeight = 'calc(1.5 * var(--font-scale))';
                
                // 스크롤을 맨 위로 이동
                contentArea.scrollTop = 0;
                
                console.log('✅ 전체 텍스트 로드 완료');
                showNotification('전체 텍스트를 로드했습니다.', 'success');
            } else {
                console.error('❌ content-text 요소를 찾을 수 없습니다.');
                showNotification('텍스트 표시 영역을 찾을 수 없습니다.', 'error');
            }
        } else {
            console.error('❌ pile-low-text 요소를 찾을 수 없습니다. fileId:', fileId);
            showNotification('문서 영역을 찾을 수 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('전체 텍스트 로드 실패:', error);
        showNotification('전체 텍스트를 불러올 수 없습니다.', 'error');
    }
}

// ===== 네비게이션 함수들 =====

// 네비게이션 함수 추가
function navigateToHome() {
    window.location.href = 'home.html';
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

function previousPage() {
    // 이전 페이지 로직 (백엔드 연동 시 구현)
    console.log('이전 페이지로 이동');
}

function nextPage() {
    // 다음 페이지 로직 (백엔드 연동 시 구현)
    console.log('다음 페이지로 이동');
}

// ===== 파일 이름 인라인 편집 기능 =====

// 파일 이름 편집 모드 시작
function startFileNameEdit(fileNameElement, fileId) {
    try {
        // 이미 편집 중이면 중단
        if (fileNameElement.classList.contains('editing')) {
            return;
        }
        
        const currentFileName = fileNameElement.textContent.trim();
        
        // 편집 모드 클래스 추가
        fileNameElement.classList.add('editing');
        
        // 입력 필드 생성
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'file-name-input';
        input.value = currentFileName;
        
        // 기존 텍스트 숨기기
        fileNameElement.innerHTML = '';
        fileNameElement.appendChild(input);
        
        // 입력 필드에 포커스 및 전체 선택
        input.focus();
        input.select();
        
        // 이벤트 리스너 추가
        const handleSave = async () => {
            const newFileName = input.value.trim();
            
            // 변경사항이 없으면 취소
            if (newFileName === currentFileName) {
                cancelFileNameEdit(fileNameElement, currentFileName);
                return;
            }
            
            // 빈 값 체크
            if (!newFileName) {
                showNotification('파일 이름을 입력해주세요.', 'warning');
                input.focus();
                return;
            }
            
            try {
                // API 호출하여 파일 이름 변경
                await updateFileName(fileId, newFileName);
                
                // 성공 시 UI 업데이트
                finishFileNameEdit(fileNameElement, newFileName);
                
                // 문서 목록 새로고침 (변경된 이름이 반영되도록)
                setTimeout(() => {
                    loadSelectedFolder();
                }, 500);
                
            } catch (error) {
                console.error('파일 이름 변경 실패:', error);
                // 실패 시 원래 이름으로 복원
                cancelFileNameEdit(fileNameElement, currentFileName);
            }
        };
        
        const handleCancel = () => {
            cancelFileNameEdit(fileNameElement, currentFileName);
        };
        
        // Enter 키로 저장
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        });
        
        // 포커스 잃으면 저장
        input.addEventListener('blur', handleSave);
        
        // 클릭 이벤트 전파 방지
        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
    } catch (error) {
        console.error('파일 이름 편집 시작 실패:', error);
        showNotification('파일 이름 편집을 시작할 수 없습니다.', 'error');
    }
}

// 파일 이름 편집 완료
function finishFileNameEdit(fileNameElement, newFileName) {
    try {
        // 편집 모드 클래스 제거
        fileNameElement.classList.remove('editing');
        
        // 새 파일 이름으로 텍스트 업데이트
        fileNameElement.innerHTML = newFileName;
        
        console.log('✅ 파일 이름 편집 완료:', newFileName);
        
    } catch (error) {
        console.error('파일 이름 편집 완료 실패:', error);
    }
}

// 파일 이름 편집 취소
function cancelFileNameEdit(fileNameElement, originalFileName) {
    try {
        // 편집 모드 클래스 제거
        fileNameElement.classList.remove('editing');
        
        // 원래 파일 이름으로 복원
        fileNameElement.innerHTML = originalFileName;
        
        console.log('↩️ 파일 이름 편집 취소');
        
    } catch (error) {
        console.error('파일 이름 편집 취소 실패:', error);
    }
}

// 파일 이름 클릭 이벤트 핸들러 설정
function setupFileNameEditHandlers() {
    try {
        // 이벤트 위임을 사용하여 동적으로 생성된 요소에도 적용
        document.addEventListener('click', (e) => {
            // file-name 클래스를 가진 요소 클릭 시
            if (e.target.classList.contains('file-name') && !e.target.classList.contains('editing')) {
                e.preventDefault();
                e.stopPropagation();
                
                // 파일 ID 찾기 (pile-chart에서 찾도록 수정)
                const pileItem = e.target.closest('.pile-item');
                const pileChart = pileItem?.querySelector('.pile-chart');
                const fileId = pileChart?.dataset.fileId;
                
                if (fileId) {
                    console.log('📄 파일 이름 편집 시작:', fileId);
                    startFileNameEdit(e.target, fileId);
                } else {
                    console.warn('⚠️ 파일 ID를 찾을 수 없습니다.');
                    showNotification('파일 정보를 찾을 수 없습니다.', 'warning');
                }
            }
        });
        
        console.log('✅ 파일 이름 편집 핸들러 설정 완료');
        
    } catch (error) {
        console.error('파일 이름 편집 핸들러 설정 실패:', error);
    }
}
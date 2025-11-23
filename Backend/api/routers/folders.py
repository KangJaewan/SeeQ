"""
폴더 관리 API 라우터
정규화된 폴더 시스템 - folders 컬렉션 중심 관리
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from database.connection import get_database
from database.operations import DatabaseOperations
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

class FolderCreateRequest(BaseModel):
    """폴더 생성 요청 모델"""
    title: str
    folder_type: str = "library"
    cover_image_url: Optional[str] = None

class FolderUpdateRequest(BaseModel):
    """폴더 업데이트 요청 모델"""
    title: Optional[str] = None
    folder_type: Optional[str] = None
    cover_image_url: Optional[str] = None

class FolderResponse(BaseModel):
    """폴더 응답 모델"""
    folder_id: str  # ObjectId를 문자열로 변환
    title: str
    folder_type: str
    created_at: Optional[datetime] = None
    last_accessed_at: Optional[datetime] = None
    cover_image_url: Optional[str] = None
    document_count: int = 0
    file_count: int = 0

class FolderListResponse(BaseModel):
    """폴더 목록 응답 모델"""
    folders: List[FolderResponse]
    total_count: int

class DocumentGroup(BaseModel):
    """문서 그룹 응답 모델 (각 문서)"""
    file_id: str
    file_name: str
    file_type: str
    file_size: Optional[int] = None
    created_at: datetime
    page_count: int
    low_text: str  # raw_text의 미리보기
    folder_id: Optional[str] = None

class FolderDocumentsResponse(BaseModel):
    """폴더 내 문서 그룹 목록 응답 모델"""
    folder_id: Optional[str] = None
    total_documents: Optional[int] = None
    document_groups: List[DocumentGroup]
    total_count: Optional[int] = None
    page_info: Optional[dict] = None

@router.post("/", response_model=FolderResponse)
async def create_folder(request: FolderCreateRequest):
    """폴더 생성 엔드포인트"""
    try:
        # 입력 검증
        if not request.title or len(request.title.strip()) == 0:
            raise HTTPException(status_code=400, detail="폴더명은 필수입니다.")
        
        if len(request.title) > 100:
            raise HTTPException(status_code=400, detail="폴더명은 100자를 초과할 수 없습니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 중복 폴더명 확인
        existing_folder = await db_ops.find_one("folders", {"title": request.title.strip()})
        if existing_folder:
            raise HTTPException(status_code=400, detail="이미 존재하는 폴더명입니다.")
        
        # 폴더 생성
        folder_id = await db_ops.create_folder(
            title=request.title.strip(),
            folder_type=request.folder_type,
            cover_image_url=request.cover_image_url
        )
        
        # 생성된 폴더 정보 반환
        folder_doc = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        
        return FolderResponse(
            folder_id=str(folder_doc["_id"]),
            title=folder_doc["title"],
            folder_type=folder_doc["folder_type"],
            created_at=folder_doc["created_at"],
            last_accessed_at=folder_doc["last_accessed_at"],
            cover_image_url=folder_doc.get("cover_image_url"),
            document_count=0,
            file_count=0
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 생성 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=FolderListResponse)
async def list_folders(limit: int = 50, skip: int = 0):
    """폴더 목록 조회 엔드포인트"""
    try:
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 목록 조회 (최근 접근 순)
        folders = await db_ops.find_many(
            "folders", 
            {}, 
            limit=limit, 
            skip=skip
        )
        
        # 각 폴더의 문서 및 파일 수 계산
        folder_responses = []
        for folder in folders:
            try:
                folder_id_str = str(folder["_id"])
                
                # created_at과 last_accessed_at 안전 처리
                current_time = datetime.now()
                
                created_at = folder.get('created_at', current_time)
                last_accessed_at = folder.get('last_accessed_at', current_time)
                
                # created_at이 None이거나 datetime이 아닌 경우 현재 시간으로 대체
                if not isinstance(created_at, datetime):
                    created_at = current_time
                if not isinstance(last_accessed_at, datetime):
                    last_accessed_at = current_time
                
                # 문서 수 (documents 컬렉션에서)
                doc_count = await db.documents.count_documents({"folder_id": folder_id_str})
                
                # 고유 파일 수 계산
                pipeline = [
                    {"$match": {"folder_id": folder_id_str}},
                    {"$group": {"_id": "$file_metadata.file_id"}},
                    {"$count": "unique_files"}
                ]
                file_count_result = await db.documents.aggregate(pipeline).to_list(1)
                file_count = file_count_result[0]["unique_files"] if file_count_result else 0
                
                folder_responses.append(FolderResponse(
                    folder_id=folder_id_str,
                    title=folder.get("title", "Untitled Folder"),
                    folder_type=folder.get("folder_type", "general"),
                    created_at=created_at,
                    last_accessed_at=last_accessed_at,
                    cover_image_url=folder.get("cover_image_url"),
                    document_count=doc_count,
                    file_count=file_count
                ))
                
            except Exception as folder_error:
                logger.error(f"폴더 처리 중 오류 (ID: {folder.get('_id', 'Unknown')}): {folder_error}")
                # 개별 폴더 오류는 건너뛰고 계속 진행
                continue
        
        # 최근 접근 순으로 정렬
        folder_responses.sort(key=lambda x: x.last_accessed_at, reverse=True)
        
        return FolderListResponse(
            folders=folder_responses,
            total_count=len(folder_responses)
        )
        
    except Exception as e:
        logger.error(f"폴더 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{folder_id}", response_model=FolderResponse)
async def get_folder(folder_id: str):
    """특정 폴더 조회 엔드포인트"""
    try:
        if not ObjectId.is_valid(folder_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 폴더 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 존재 확인
        folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        if not folder:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다.")
        
        # 폴더 접근 시간 업데이트
        await db_ops.update_folder_access(folder_id)
        
        # 문서 및 파일 수 계산
        doc_count = await db.documents.count_documents({"folder_id": folder_id})
        
        pipeline = [
            {"$match": {"folder_id": folder_id}},
            {"$group": {"_id": "$file_metadata.file_id"}},
            {"$count": "unique_files"}
        ]
        file_count_result = await db.documents.aggregate(pipeline).to_list(1)
        file_count = file_count_result[0]["unique_files"] if file_count_result else 0
        
        return FolderResponse(
            folder_id=str(folder["_id"]),
            title=folder["title"],
            folder_type=folder["folder_type"],
            created_at=folder.get("created_at"),
            last_accessed_at=folder.get("last_accessed_at"),
            cover_image_url=folder.get("cover_image_url"),
            document_count=doc_count,
            file_count=file_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{folder_id}", response_model=FolderResponse)
async def update_folder(folder_id: str, request: FolderUpdateRequest):
    """폴더 정보 업데이트 엔드포인트"""
    try:
        if not ObjectId.is_valid(folder_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 폴더 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 존재 확인
        folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        if not folder:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다.")
        
        # 업데이트할 필드 준비
        update_fields = {}
        if request.title is not None and request.title.strip():
            if len(request.title) > 100:
                raise HTTPException(status_code=400, detail="폴더명은 100자를 초과할 수 없습니다.")
            
            # 중복 폴더명 확인 (자기 자신 제외)
            existing_folder = await db_ops.find_one("folders", {
                "title": request.title.strip(),
                "_id": {"$ne": ObjectId(folder_id)}
            })
            if existing_folder:
                raise HTTPException(status_code=400, detail="이미 존재하는 폴더명입니다.")
            
            update_fields["title"] = request.title.strip()
        
        if request.folder_type is not None:
            update_fields["folder_type"] = request.folder_type
        
        if request.cover_image_url is not None:
            update_fields["cover_image_url"] = request.cover_image_url
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="업데이트할 내용이 없습니다.")
        
        # 폴더 업데이트
        success = await db_ops.update_one(
            "folders",
            {"_id": ObjectId(folder_id)},
            {"$set": update_fields}
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="폴더 업데이트에 실패했습니다.")
        
        # 업데이트된 폴더 정보 반환
        updated_folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        
        # 문서 및 파일 수 계산
        doc_count = await db.documents.count_documents({"folder_id": folder_id})
        
        pipeline = [
            {"$match": {"folder_id": folder_id}},
            {"$group": {"_id": "$file_metadata.file_id"}},
            {"$count": "unique_files"}
        ]
        file_count_result = await db.documents.aggregate(pipeline).to_list(1)
        file_count = file_count_result[0]["unique_files"] if file_count_result else 0
        
        return FolderResponse(
            folder_id=str(updated_folder["_id"]),
            title=updated_folder["title"],
            folder_type=updated_folder["folder_type"],
            created_at=updated_folder.get("created_at"),
            last_accessed_at=updated_folder.get("last_accessed_at"),
            cover_image_url=updated_folder.get("cover_image_url"),
            document_count=doc_count,
            file_count=file_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{folder_id}", response_model=FolderResponse)
async def patch_folder(folder_id: str, request: FolderUpdateRequest):
    """폴더 정보 부분 업데이트 엔드포인트 (PATCH 메서드)"""
    try:
        if not ObjectId.is_valid(folder_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 폴더 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 존재 확인
        folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        if not folder:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다.")
        
        # 업데이트할 필드 준비
        update_fields = {}
        if request.title is not None and request.title.strip():
            if len(request.title) > 100:
                raise HTTPException(status_code=400, detail="폴더명은 100자를 초과할 수 없습니다.")
            
            # 중복 폴더명 확인 (자기 자신 제외)
            existing_folder = await db_ops.find_one("folders", {
                "title": request.title.strip(),
                "_id": {"$ne": ObjectId(folder_id)}
            })
            if existing_folder:
                raise HTTPException(status_code=400, detail="이미 존재하는 폴더명입니다.")
            
            update_fields["title"] = request.title.strip()
        
        if request.folder_type is not None:
            update_fields["folder_type"] = request.folder_type
        
        if request.cover_image_url is not None:
            update_fields["cover_image_url"] = request.cover_image_url
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="업데이트할 내용이 없습니다.")
        
        # 폴더 업데이트
        success = await db_ops.update_one(
            "folders",
            {"_id": ObjectId(folder_id)},
            {"$set": update_fields}
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="폴더 업데이트에 실패했습니다.")
        
        # 업데이트된 폴더 정보 반환
        updated_folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        
        # 문서 및 파일 수 계산
        doc_count = await db.documents.count_documents({"folder_id": folder_id})
        
        pipeline = [
            {"$match": {"folder_id": folder_id}},
            {"$group": {"_id": "$file_metadata.file_id"}},
            {"$count": "unique_files"}
        ]
        file_count_result = await db.documents.aggregate(pipeline).to_list(1)
        file_count = file_count_result[0]["unique_files"] if file_count_result else 0
        
        return FolderResponse(
            folder_id=str(updated_folder["_id"]),
            title=updated_folder["title"],
            folder_type=updated_folder["folder_type"],
            created_at=updated_folder.get("created_at"),
            last_accessed_at=updated_folder.get("last_accessed_at"),
            cover_image_url=updated_folder.get("cover_image_url"),
            document_count=doc_count,
            file_count=file_count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 PATCH 업데이트 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{folder_id}")
async def delete_folder(folder_id: str, force: bool = False):
    """폴더 삭제 엔드포인트"""
    try:
        if not ObjectId.is_valid(folder_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 폴더 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 존재 확인
        folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        if not folder:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다.")
        
        # 폴더 내 문서 확인
        doc_count = await db.documents.count_documents({"folder_id": folder_id})
        
        if doc_count > 0 and not force:
            raise HTTPException(
                status_code=400, 
                detail=f"폴더에 {doc_count}개의 문서가 있습니다. force=true로 강제 삭제하거나 문서를 먼저 삭제해주세요."
            )
        
        # 폴더 내 모든 데이터 삭제 (cascade delete)
        if force and doc_count > 0:
            logger.info(f"폴더 강제 삭제: {folder_id}, 문서 {doc_count}개 함께 삭제")
            
            # 관련 데이터 모두 삭제
            await db.documents.delete_many({"folder_id": folder_id})
            await db.chunks.delete_many({"folder_id": folder_id})
            await db.summaries.delete_many({"folder_id": folder_id})
            await db.qapairs.delete_many({"folder_id": folder_id})
            await db.recommendations.delete_many({"folder_id": folder_id})
            await db.labels.delete_many({"folder_id": folder_id})
            await db.memos.delete_many({"folder_id": folder_id})
            await db.highlights.delete_many({"folder_id": folder_id})
        
        # 폴더 삭제
        success = await db_ops.delete_one("folders", {"_id": ObjectId(folder_id)})
        
        if not success:
            raise HTTPException(status_code=500, detail="폴더 삭제에 실패했습니다.")
        
        return {
            "success": True,
            "message": f"폴더 '{folder['title']}'가 삭제되었습니다.",
            "deleted_documents": doc_count if force else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{folder_id}/documents", response_model=FolderDocumentsResponse)
async def get_folder_documents(folder_id: str, limit: int = 50, skip: int = 0):
    """폴더 내 문서 목록 조회 엔드포인트 (각 문서를 개별 아이템으로)"""
    try:
        if not ObjectId.is_valid(folder_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 폴더 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 폴더 존재 확인
        folder = await db_ops.find_one("folders", {"_id": ObjectId(folder_id)})
        if not folder:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다.")
        
        # 폴더 접근 시간 업데이트
        await db_ops.update_folder_access(folder_id)
        
        # 해당 폴더의 모든 문서 조회
        documents = await db_ops.find_many(
            "documents",
            {"folder_id": folder_id},
            limit=limit,
            skip=skip
        )
        
        # 전체 문서 수 계산
        total_count = await db.documents.count_documents({"folder_id": folder_id})
        
        # 응답 포맷 생성
        document_groups = []
        for doc in documents:
            try:
                logger.debug(f"문서 처리 중: {doc.get('_id', 'Unknown ID')}")
                
                # raw_text에서 미리보기 텍스트 생성 (처음 500자) - None 안전 처리
                raw_text_val = doc.get("raw_text")
                logger.debug(f"raw_text_val type: {type(raw_text_val)}, value: {repr(raw_text_val)}")
                
                if raw_text_val is None:
                    raw_text = ""
                    logger.debug("raw_text가 None이므로 빈 문자열로 설정")
                else:
                    raw_text = str(raw_text_val)  # 문자열로 변환하여 안전하게 처리
                    logger.debug(f"raw_text 길이: {len(raw_text)}")
                
                low_text = raw_text[:500] + "..." if len(raw_text) > 500 else raw_text
                
                # 파일 메타데이터 처리
                file_metadata = doc.get("file_metadata", {})
                logger.debug(f"file_metadata type: {type(file_metadata)}, value: {repr(file_metadata)}")

                if file_metadata is None:
                    file_metadata = {}
                    logger.debug("file_metadata가 None이므로 빈 딕셔너리로 설정")

                # original_filename 또는 file_name을 시도 (호환성)
                file_name = file_metadata.get("original_filename") or file_metadata.get("file_name", "Unknown Document")
                file_type = file_metadata.get("file_type", "unknown")
                
                # 글자수 계산 (raw_text 기준)
                char_count = len(raw_text)
                logger.debug(f"char_count: {char_count}")

                # created_at 필드를 안전하게 처리
                created_at_val = doc.get("created_at")
                logger.debug(f"created_at_val type: {type(created_at_val)}, value: {repr(created_at_val)}")
                
                if isinstance(created_at_val, datetime):
                    created_at = created_at_val
                else:
                    # None이거나 datetime이 아닌 다른 타입일 경우 현재 시간으로 대체
                    created_at = datetime.now()
                    logger.debug("created_at을 현재 시간으로 설정")
                
                document_groups.append(DocumentGroup(
                    file_id=str(doc.get("_id", "")),  # document ID를 file_id로 사용
                    file_name=file_name,
                    file_type=file_type,
                    file_size=char_count,  # 글자수를 파일 크기로 사용
                    created_at=created_at,
                    page_count=char_count,  # 글자수를 page_count 필드에도 저장
                    low_text=low_text,
                    folder_id=folder_id
                ))
                
                logger.debug(f"문서 처리 완료: {doc.get('_id', 'Unknown ID')}")
                
            except Exception as doc_error:
                logger.error(f"개별 문서 처리 중 오류 발생 (ID: {doc.get('_id', 'Unknown')}): {doc_error}")
                logger.error(f"문서 데이터: {repr(doc)}")
                raise doc_error
        
        return FolderDocumentsResponse(
            folder_id=folder_id,
            total_documents=total_count,
            document_groups=document_groups,
            total_count=total_count,
            page_info={
                "current_page": (skip // limit) + 1,
                "total_pages": (total_count + limit - 1) // limit,
                "has_next": skip + limit < total_count,
                "has_previous": skip > 0
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 문서 목록 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 
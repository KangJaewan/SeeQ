"""
문서 상세 조회 API 라우터
개별 문서 파일의 전체 내용 조회 기능
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

class DocumentPageContent(BaseModel):
    """문서 페이지 내용 모델"""
    page_number: int
    low_text: str
    chunk_count: int

class DocumentContent(BaseModel):
    """문서 전체 내용 모델"""
    file_id: str
    file_name: str
    file_type: str
    file_size: Optional[int] = None
    created_at: datetime
    folder_id: str
    total_pages: int
    pages: List[DocumentPageContent]

class UpdateFileNameRequest(BaseModel):
    """파일 이름 변경 요청 모델"""
    new_file_name: str

@router.get("/{file_id}/content", response_model=DocumentContent)
async def get_document_content(file_id: str):
    """특정 파일의 전체 문서 내용 조회"""
    try:
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 해당 파일의 모든 문서 페이지 조회
        documents = await db_ops.find_many(
            "documents",
            {"file_metadata.file_id": file_id},
            sort=[("page_number", 1)]  # 페이지 번호 순으로 정렬
        )
        
        if not documents:
            raise HTTPException(status_code=404, detail="해당 파일의 문서를 찾을 수 없습니다.")
        
        # 첫 번째 문서에서 파일 메타데이터 추출
        first_doc = documents[0]
        file_metadata = first_doc["file_metadata"]
        
        # 각 페이지별로 chunk 수 계산
        pages = []
        for doc in documents:
            chunk_count = await db.chunks.count_documents({"document_id": str(doc["_id"])})
            
            pages.append(DocumentPageContent(
                page_number=doc.get("page_number", 1),
                low_text=doc.get("low_text", ""),
                chunk_count=chunk_count
            ))
        
        return DocumentContent(
            file_id=file_id,
            file_name=file_metadata.get("original_filename") or file_metadata.get("file_name", "Unknown Document"),
            file_type=file_metadata.get("file_type", "unknown"),
            file_size=file_metadata.get("file_size"),
            created_at=first_doc["created_at"],
            folder_id=first_doc["folder_id"],
            total_pages=len(documents),
            pages=pages
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"문서 내용 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/single/{document_id}/content")
async def get_single_document_content(document_id: str):
    """개별 문서의 전체 raw_text 내용 조회"""
    try:
        if not ObjectId.is_valid(document_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 문서 ID입니다.")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 문서 ID로 단일 문서 조회
        document = await db_ops.find_one("documents", {"_id": ObjectId(document_id)})
        
        if not document:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")
        
        # 문서 기본 정보와 raw_text 반환
        file_metadata = document.get("file_metadata", {})
        raw_text = document.get("raw_text", "")

        return {
            "document_id": str(document["_id"]),
            "file_name": file_metadata.get("original_filename") or file_metadata.get("file_name", "Unknown Document"),
            "file_type": file_metadata.get("file_type", "unknown"),
            "file_size": file_metadata.get("file_size"),
            "created_at": document.get("created_at"),
            "folder_id": document.get("folder_id", ""),
            "raw_text": raw_text,
            "char_count": len(raw_text)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"문서 내용 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/summary")
async def get_document_summary(file_id: str):
    """특정 파일의 요약 정보 조회"""
    try:
        db = await get_database()
        
        # 해당 파일의 문서들로부터 폴더 ID 찾기
        first_doc = await db.documents.find_one({"file_metadata.file_id": file_id})
        if not first_doc:
            raise HTTPException(status_code=404, detail="해당 파일의 문서를 찾을 수 없습니다.")
        
        folder_id = first_doc["folder_id"]
        
        # 요약 정보 조회
        summary = await db.summaries.find_one({
            "folder_id": folder_id,
            "file_metadata.file_id": file_id
        })
        
        if not summary:
            return {"summary": "요약 정보가 없습니다.", "keywords": []}
        
        return {
            "summary": summary.get("summary_text", ""),
            "keywords": summary.get("keywords", []),
            "created_at": summary.get("created_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"문서 요약 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{file_id}/name")
async def update_file_name(file_id: str, request: UpdateFileNameRequest):
    """특정 파일의 이름 변경"""
    try:
        new_file_name = request.new_file_name.strip()
        
        if not new_file_name:
            raise HTTPException(status_code=400, detail="파일 이름을 입력해주세요.")
        
        if len(new_file_name) > 255:
            raise HTTPException(status_code=400, detail="파일 이름이 너무 깁니다. (최대 255자)")
        
        db = await get_database()
        db_ops = DatabaseOperations(db)
        
        # 해당 file_id를 가진 모든 문서 조회
        documents = await db_ops.find_many(
            "documents",
            {"file_metadata.file_id": file_id}
        )
        
        if not documents:
            raise HTTPException(status_code=404, detail="해당 파일의 문서를 찾을 수 없습니다.")
        
        # 모든 문서의 file_metadata.file_name 업데이트
        update_result = await db.documents.update_many(
            {"file_metadata.file_id": file_id},
            {"$set": {"file_metadata.file_name": new_file_name}}
        )
        
        logger.info(f"파일 이름 변경 완료: {file_id} -> {new_file_name} ({update_result.modified_count}개 문서 업데이트)")
        
        return {
            "success": True,
            "file_id": file_id,
            "new_file_name": new_file_name,
            "updated_documents": update_result.modified_count,
            "message": "파일 이름이 성공적으로 변경되었습니다."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"파일 이름 변경 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 
    
@router.get("/documents")  # 슬래시 추가
async def get_documents_by_folder(folder_id: str):
    db = await get_database()                   # AsyncIOMotorDatabase
    collection = db["documents"]                # ✅ 컬렉션 지정 (예: "documents")
    cursor = collection.find(
        {"folder_id": folder_id},
        {"_id": 0, "file_metadata.file_id": 1, "created_at": 1}
    )
    docs = await cursor.to_list(length=None)    # ✅ 커서를 리스트로
    return docs

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """문서 삭제 (문서, 청크, 벡터 모두 삭제)"""
    try:
        if not ObjectId.is_valid(document_id):
            raise HTTPException(status_code=400, detail="유효하지 않은 문서 ID입니다.")

        db = await get_database()
        db_ops = DatabaseOperations(db)

        # 문서 조회
        document = await db_ops.find_one("documents", {"_id": ObjectId(document_id)})

        if not document:
            raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다.")

        file_id = document.get("file_metadata", {}).get("file_id")

        # 1. 해당 문서의 청크 삭제
        chunks_result = await db.chunks.delete_many({"document_id": document_id})
        logger.info(f"청크 {chunks_result.deleted_count}개 삭제 완료")

        # 2. 해당 문서의 벡터 삭제 (file_id 기준)
        if file_id:
            vectors_result = await db.vectors.delete_many({"file_id": file_id})
            logger.info(f"벡터 {vectors_result.deleted_count}개 삭제 완료")

        # 3. 문서 삭제
        await db.documents.delete_one({"_id": ObjectId(document_id)})
        logger.info(f"문서 {document_id} 삭제 완료")

        return {
            "success": True,
            "document_id": document_id,
            "deleted_chunks": chunks_result.deleted_count,
            "deleted_vectors": vectors_result.deleted_count if file_id else 0,
            "message": "문서가 성공적으로 삭제되었습니다."
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"문서 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))
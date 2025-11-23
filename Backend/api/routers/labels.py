from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from database.connection import get_database
from utils.logger import get_logger
import random

logger = get_logger(__name__)
router = APIRouter(prefix="/labels", tags=["labels"])

class LabelKeywordsResponse(BaseModel):
    document_id: str
    keywords: List[str]

@router.get("/keywords", response_model=List[LabelKeywordsResponse])
async def get_keywords(document_ids: List[str] = Query(...)):
    try:
        db = await get_database()
        results = []
        for doc_id in document_ids:
            label_doc = await db.labels.find_one({"document_id": doc_id})
            if label_doc:
                keywords = label_doc.get("keywords", [])
                results.append(LabelKeywordsResponse(document_id=doc_id, keywords=keywords))
        return results
    except Exception as e:
        logger.error(f"키워드 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="키워드 조회 중 오류 발생")

@router.get("/topic")
async def get_topic(document_ids: List[str] = Query(...)):
    try:
        db = await get_database()
        all_keywords = []

        for doc_id in document_ids:
            label_doc = await db.labels.find_one({"document_id": doc_id})
            if label_doc:
                # labels.keywords 구조
                if "labels" in label_doc:
                    keywords = label_doc["labels"].get("keywords", [])
                # 루트 수준 keywords
                elif "keywords" in label_doc:
                    keywords = label_doc.get("keywords", [])
                else:
                    keywords = []

                if keywords:
                    all_keywords.append(random.choice(keywords))

        if not all_keywords:
            return {"topic": None}

        topic = random.choice(all_keywords)

        return {"topic": topic}
    except Exception as e:
        logger.error(f"토픽 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="토픽 조회 중 오류 발생")
    

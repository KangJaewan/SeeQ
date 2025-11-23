"""
계층적 Force-Directed Graph 분석 API
폴더-문서-태그 계층 구조 그래프 분석 및 시각화
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import numpy as np
from collections import Counter
import hashlib

from database.connection import get_database
from database.operations import DatabaseOperations
from utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

class GraphNode(BaseModel):
    """그래프 노드 모델"""
    id: str
    title: str
    type: str  # 'folder', 'document', 'tag'
    size: float = 1.0
    color: str = "#1f77b4"
    level: int = 0  # 계층 레벨 (0: 폴더, 1: 문서, 2: 태그)
    parent_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    """그래프 엣지 모델"""
    source: str
    target: str
    weight: float = 1.0
    type: str  # 'hierarchy', 'similarity'
    metadata: Dict[str, Any] = {}

class HierarchicalGraphData(BaseModel):
    """계층적 그래프 데이터 모델"""
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: Dict[str, Any]

class GraphAnalysisService:
    """그래프 분석 서비스 클래스"""
    
    def __init__(self, db):
        self.db = db
        self.db_ops = DatabaseOperations(db)
    
    async def get_folder_document_tags(self) -> Dict[str, Any]:
        """폴더-문서-태그 계층 구조 데이터 수집"""
        try:
            folders = await self.db.folders.find({}).to_list(None)
            hierarchy_data = {}
            
            for folder in folders:
                folder_id = str(folder["_id"])
                folder_title = folder.get("title", "Untitled")
                folder_type = folder.get("folder_type", "general")
                
                # 폴더 내 문서들 수집
                documents = await self.db.documents.find({"folder_id": folder_id}).to_list(None)
                
                # 문서별 태그 수집
                folder_documents = {}
                all_folder_tags = set()
                
                for doc in documents:
                    doc_id = str(doc["_id"])
                    doc_title = doc.get("title", doc.get("file_metadata", {}).get("file_name", "Untitled"))
                    
                    # 해당 문서의 라벨에서 태그 추출
                    file_id = doc.get("file_metadata", {}).get("file_id")
                    
                    # 여러 방법으로 라벨 검색 시도
                    labels = []
                    if file_id:
                        # 방법 1: folder_id와 file_id로 검색
                        labels = await self.db.labels.find({
                            "folder_id": folder_id,
                            "file_metadata.file_id": file_id
                        }).to_list(None)
                        
                        # 방법 2: file_id만으로 검색
                        if not labels:
                            labels = await self.db.labels.find({
                                "file_metadata.file_id": file_id
                            }).to_list(None)
                    
                    # 방법 3: 문서 ID로 검색
                    if not labels:
                        labels = await self.db.labels.find({
                            "document_id": str(doc["_id"])
                        }).to_list(None)
                    
                    # 방법 4: 폴더 ID만으로 검색
                    if not labels:
                        labels = await self.db.labels.find({
                            "folder_id": folder_id
                        }).to_list(None)
                    
                    document_tags = set()
                    for label in labels:
                        # tags 필드에서 태그 추출
                        if "tags" in label and isinstance(label["tags"], list):
                            document_tags.update(label["tags"])
                        
                        # ai_metadata.keywords에서도 태그 추출
                        if "ai_metadata" in label and "keywords" in label["ai_metadata"]:
                            keywords = label["ai_metadata"]["keywords"]
                            if isinstance(keywords, list):
                                document_tags.update(keywords)
                        
                        # category도 태그로 추가
                        if "category" in label and label["category"]:
                            document_tags.add(label["category"])
                    
                    # 생성 날짜를 문서 제목으로 사용
                    created_at = doc.get("created_at", datetime.now())
                    if isinstance(created_at, datetime):
                        date_title = created_at.strftime("%Y-%m-%d")
                    else:
                        date_title = str(created_at)[:10] if str(created_at) else "Unknown"
                    
                    folder_documents[doc_id] = {
                        "title": date_title,  # 생성 날짜를 제목으로 사용
                        "original_title": doc_title,
                        "tags": list(document_tags),
                        "file_id": doc.get("file_metadata", {}).get("file_id"),
                        "created_at": created_at
                    }
                    
                    all_folder_tags.update(document_tags)
                
                hierarchy_data[folder_id] = {
                    "title": folder_title,
                    "type": folder_type,
                    "documents": folder_documents,
                    "all_tags": list(all_folder_tags),
                    "created_at": folder.get("created_at", datetime.now())
                }
            
            logger.info(f"계층 구조 데이터 수집 완료: {len(hierarchy_data)}개 폴더")
            return hierarchy_data
            
        except Exception as e:
            logger.error(f"계층 구조 데이터 수집 실패: {e}")
            raise
    
    def calculate_tag_similarity(self, tags1: List[str], tags2: List[str]) -> float:
        """태그 기반 Jaccard 유사도 계산"""
        if not tags1 or not tags2:
            return 0.0
        
        set1 = set(tags1)
        set2 = set(tags2)
        
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union if union > 0 else 0.0
    
    def get_node_color(self, node_type: str, folder_type: str = None) -> str:
        """노드 타입에 따른 색상 반환"""
        color_map = {
            'folder': {
                'research': '#ff7f0e',
                'project': '#2ca02c', 
                'reference': '#d62728',
                'archive': '#9467bd',
                'general': '#1f77b4'
            },
            'document': '#8c564b',
            'tag': '#e377c2'
        }
        
        if node_type == 'folder' and folder_type:
            return color_map['folder'].get(folder_type, '#1f77b4')
        
        return color_map.get(node_type, '#17becf')
    
    def calculate_node_size(self, node_type: str, count: int = 1) -> float:
        """노드 타입과 개수에 따른 크기 계산"""
        base_sizes = {
            'folder': 30,
            'document': 15,
            'tag': 8
        }
        
        base_size = base_sizes.get(node_type, 10)
        # 로그 스케일 적용
        size_multiplier = 1 + np.log10(max(1, count))
        return base_size * size_multiplier
    
    async def generate_hierarchical_graph(self, tag_similarity_threshold: float = 0.3) -> HierarchicalGraphData:
        """계층적 그래프 데이터 생성 (경량화: 실시간 계산 최소화)"""
        try:
            hierarchy_data = await self.get_folder_document_tags()
            
            nodes = []
            edges = []
            
            # 태그별 빈도 계산 (전체)
            all_tags_counter = Counter()
            for folder_data in hierarchy_data.values():
                all_tags_counter.update(folder_data["all_tags"])
            
            # 1. 폴더 노드 생성
            for folder_id, folder_data in hierarchy_data.items():
                folder_size = self.calculate_node_size('folder', len(folder_data["documents"]))
                
                folder_node = GraphNode(
                    id=f"folder_{folder_id}",
                    title=folder_data["title"],
                    type="folder",
                    size=folder_size,
                    color=self.get_node_color('folder', folder_data["type"]),
                    level=0,
                    metadata={
                        "document_count": len(folder_data["documents"])
                    }
                )
                nodes.append(folder_node)
                
                # 2. 문서 노드 생성
                for doc_id, doc_data in folder_data["documents"].items():
                    doc_size = self.calculate_node_size('document', len(doc_data["tags"]))
                    
                    # 문서 제목에 태그 정보 포함
                    doc_title = doc_data["title"]
                    if doc_data["tags"]:
                        # 상위 3개 태그만 표시
                        top_tags = doc_data["tags"][:3]
                        tags_str = ", ".join(top_tags)
                        doc_title = f"{doc_data['title']}\n[{tags_str}]"
                    
                    doc_node = GraphNode(
                        id=f"doc_{doc_id}",
                        title=doc_title,
                        type="document",
                        size=doc_size,
                        color=self.get_node_color('document'),
                        level=1,
                        parent_id=f"folder_{folder_id}",
                        metadata={
                            "tag_count": len(doc_data["tags"])
                        }
                    )
                    nodes.append(doc_node)
                    
                    # 폴더-문서 계층 엣지
                    folder_doc_edge = GraphEdge(
                        source=f"folder_{folder_id}",
                        target=f"doc_{doc_id}",
                        weight=1.0,
                        type="hierarchy",
                        metadata={"level": "folder_to_document"}
                    )
                    edges.append(folder_doc_edge)
                    
                    # 3. 태그 노드 생성 및 문서-태그 엣지
                    for tag in doc_data["tags"]:
                        if tag and tag.strip():  # 빈 태그 제외
                            tag_id = f"tag_{hashlib.md5(tag.encode()).hexdigest()[:8]}"
                            tag_frequency = all_tags_counter[tag]
                            tag_size = self.calculate_node_size('tag', tag_frequency)
                            
                            # 태그 노드 (중복 방지)
                            if not any(node.id == tag_id for node in nodes):
                                tag_node = GraphNode(
                                    id=tag_id,
                                    title=tag,
                                    type="tag",
                                    size=tag_size,
                                    color=self.get_node_color('tag'),
                                    level=2,
                                    metadata={
                                        "frequency": tag_frequency
                                    }
                                )
                                nodes.append(tag_node)
                            
                            # 문서-태그 엣지
                            doc_tag_edge = GraphEdge(
                                source=f"doc_{doc_id}",
                                target=tag_id,
                                weight=1.0,
                                type="hierarchy",
                                metadata={"level": "document_to_tag"}
                            )
                            edges.append(doc_tag_edge)
            
            # 4. 폴더간 유사도 엣지 생성 (경량화: 간단한 공통 태그 기반)
            folder_ids = list(hierarchy_data.keys())
            similarity_count = 0
            
            # 성능 최적화: 폴더가 5개 이상이면 유사도 계산 건너뛰기
            if len(folder_ids) <= 5:
                for i, folder_id1 in enumerate(folder_ids):
                    for folder_id2 in folder_ids[i+1:]:
                        tags1 = set(hierarchy_data[folder_id1]["all_tags"])
                        tags2 = set(hierarchy_data[folder_id2]["all_tags"])
                        
                        # 간단한 공통 태그 기반 연결 (복잡한 Jaccard 계산 대신)
                        common_tags = tags1.intersection(tags2)
                        
                        # 공통 태그가 2개 이상이면 연결
                        if len(common_tags) >= 2:
                            similarity_edge = GraphEdge(
                                source=f"folder_{folder_id1}",
                                target=f"folder_{folder_id2}",
                                weight=len(common_tags) * 0.1,  # 단순 가중치
                                type="similarity",
                                metadata={
                                    "common_tag_count": len(common_tags)
                                }
                            )
                            edges.append(similarity_edge)
                            similarity_count += 1
            
            logger.info(f"계층적 그래프 생성 완료: {len(nodes)}개 노드, {len(edges)}개 엣지 (유사도 엣지: {similarity_count}개)")
            
            # 메타데이터 생성
            metadata = {
                "total_folders": len([n for n in nodes if n.type == "folder"]),
                "total_documents": len([n for n in nodes if n.type == "document"]),
                "total_tags": len([n for n in nodes if n.type == "tag"]),
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "hierarchy_edges": len([e for e in edges if e.type == "hierarchy"]),
                "similarity_edges": len([e for e in edges if e.type == "similarity"]),
                "tag_similarity_threshold": tag_similarity_threshold,
                "generated_at": datetime.now().isoformat()
            }
            
            logger.info(f"계층적 그래프 생성 완료: {len(nodes)}개 노드, {len(edges)}개 엣지")
            
            return HierarchicalGraphData(
                nodes=nodes,
                edges=edges,
                metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"계층적 그래프 생성 실패: {e}")
            raise

# API 엔드포인트들
@router.get("/graph", response_model=HierarchicalGraphData)
async def get_hierarchical_graph(
    tag_similarity_threshold: float = Query(0.3, description="폴더간 태그 유사도 임계값 (0.0-1.0)"),
    max_nodes: int = Query(100, description="최대 노드 수 제한")
):
    """
    계층적 그래프 데이터 조회
    - 폴더 → 문서 → 태그 계층 구조
    - 폴더간 태그 유사도 기반 엣지 생성
    """
    try:
        db = await get_database()
        service = GraphAnalysisService(db)
        
        graph_data = await service.generate_hierarchical_graph(tag_similarity_threshold)
        
        # 노드 수 제한 적용
        if len(graph_data.nodes) > max_nodes:
            # 중요도 기반 노드 선택 (폴더는 항상 포함, 문서와 태그는 크기 순)
            folders = [n for n in graph_data.nodes if n.type == "folder"]
            documents = sorted([n for n in graph_data.nodes if n.type == "document"], 
                             key=lambda x: x.size, reverse=True)
            tags = sorted([n for n in graph_data.nodes if n.type == "tag"], 
                         key=lambda x: x.size, reverse=True)
            
            remaining_slots = max_nodes - len(folders)
            docs_to_include = documents[:remaining_slots//2] if remaining_slots > 0 else []
            tags_to_include = tags[:remaining_slots//2] if remaining_slots > 0 else []
            
            selected_nodes = folders + docs_to_include + tags_to_include
            selected_node_ids = {n.id for n in selected_nodes}
            
            # 선택된 노드들 간의 엣지만 유지
            filtered_edges = [e for e in graph_data.edges 
                            if e.source in selected_node_ids and e.target in selected_node_ids]
            
            graph_data.nodes = selected_nodes
            graph_data.edges = filtered_edges
            graph_data.metadata["nodes_filtered"] = True
            graph_data.metadata["filtered_node_count"] = len(selected_nodes)
        
        return graph_data
        
    except Exception as e:
        logger.error(f"계층적 그래프 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folder-similarity")
async def get_folder_similarity(
    folder_id1: str = Query(..., description="첫 번째 폴더 ID"),
    folder_id2: str = Query(..., description="두 번째 폴더 ID")
):
    """두 폴더 간 상세 유사도 분석"""
    try:
        db = await get_database()
        service = GraphAnalysisService(db)
        
        hierarchy_data = await service.get_folder_document_tags()
        
        if folder_id1 not in hierarchy_data or folder_id2 not in hierarchy_data:
            raise HTTPException(status_code=404, detail="폴더를 찾을 수 없습니다")
        
        tags1 = hierarchy_data[folder_id1]["all_tags"]
        tags2 = hierarchy_data[folder_id2]["all_tags"]
        
        similarity = service.calculate_tag_similarity(tags1, tags2)
        common_tags = list(set(tags1).intersection(set(tags2)))
        unique_tags1 = list(set(tags1) - set(tags2))
        unique_tags2 = list(set(tags2) - set(tags1))
        
        return {
            "folder1": {
                "id": folder_id1,
                "title": hierarchy_data[folder_id1]["title"],
                "tags": tags1,
                "tag_count": len(tags1)
            },
            "folder2": {
                "id": folder_id2,
                "title": hierarchy_data[folder_id2]["title"],
                "tags": tags2,
                "tag_count": len(tags2)
            },
            "similarity_score": similarity,
            "common_tags": common_tags,
            "common_tag_count": len(common_tags),
            "unique_tags_folder1": unique_tags1,
            "unique_tags_folder2": unique_tags2,
            "analysis_date": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"폴더 유사도 분석 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 
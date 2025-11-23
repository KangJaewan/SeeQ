"""
Force-Directed Graph 분석 API 라우터
폴더-문서-태그 계층 구조 그래프 분석 및 시각화
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
import numpy as np
from collections import defaultdict, Counter
import asyncio
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
    parent_id: Optional[str] = None  # 부모 노드 ID
    metadata: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    """그래프 엣지 모델"""
    source: str
    target: str
    weight: float = 1.0
    type: str  # 'hierarchy', 'similarity', 'tag_relation'
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
            folders = await self.db_ops.find_many("folders", {})
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
                    labels = await self.db.labels.find({
                        "folder_id": folder_id,
                        "file_metadata.file_id": doc.get("file_metadata", {}).get("file_id")
                    }).to_list(None)
                    
                    document_tags = set()
                    for label in labels:
                        if "tags" in label and isinstance(label["tags"], list):
                            document_tags.update(label["tags"])
                    
                    folder_documents[doc_id] = {
                        "title": doc_title,
                        "tags": list(document_tags),
                        "file_id": doc.get("file_metadata", {}).get("file_id"),
                        "created_at": doc.get("created_at", datetime.now())
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
            'folder': 20,
            'document': 10,
            'tag': 5
        }
        
        base_size = base_sizes.get(node_type, 10)
        # 로그 스케일 적용
        size_multiplier = 1 + np.log10(max(1, count))
        return base_size * size_multiplier
    
    async def generate_hierarchical_graph(self, tag_similarity_threshold: float = 0.3) -> HierarchicalGraphData:
        """계층적 그래프 데이터 생성"""
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
                        "folder_type": folder_data["type"],
                        "document_count": len(folder_data["documents"]),
                        "tag_count": len(folder_data["all_tags"]),
                        "created_at": folder_data["created_at"].isoformat()
                    }
                )
                nodes.append(folder_node)
                
                # 2. 문서 노드 생성
                for doc_id, doc_data in folder_data["documents"].items():
                    doc_size = self.calculate_node_size('document', len(doc_data["tags"]))
                    
                    doc_node = GraphNode(
                        id=f"doc_{doc_id}",
                        title=doc_data["title"],
                        type="document",
                        size=doc_size,
                        color=self.get_node_color('document'),
                        level=1,
                        parent_id=f"folder_{folder_id}",
                        metadata={
                            "file_id": doc_data["file_id"],
                            "tag_count": len(doc_data["tags"]),
                            "created_at": doc_data["created_at"].isoformat()
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
                                    "frequency": tag_frequency,
                                    "tag_name": tag
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
            
            # 4. 폴더간 태그 유사도 기반 엣지 생성
            folder_ids = list(hierarchy_data.keys())
            for i, folder_id1 in enumerate(folder_ids):
                for folder_id2 in folder_ids[i+1:]:
                    tags1 = hierarchy_data[folder_id1]["all_tags"]
                    tags2 = hierarchy_data[folder_id2]["all_tags"]
                    
                    similarity = self.calculate_tag_similarity(tags1, tags2)
                    
                    if similarity >= tag_similarity_threshold:
                        # 공통 태그 찾기
                        common_tags = list(set(tags1).intersection(set(tags2)))
                        
                        similarity_edge = GraphEdge(
                            source=f"folder_{folder_id1}",
                            target=f"folder_{folder_id2}",
                            weight=similarity,
                            type="similarity",
                            metadata={
                                "similarity_score": similarity,
                                "common_tags": common_tags,
                                "common_tag_count": len(common_tags)
                            }
                        )
                        edges.append(similarity_edge)
            
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
    
    async def get_folder_tag_matrix(self) -> Dict[str, Any]:
        """폴더별 태그 매트릭스 생성"""
        try:
            hierarchy_data = await self.get_folder_document_tags()
            
            # 모든 고유 태그 수집
            all_tags = set()
            for folder_data in hierarchy_data.values():
                all_tags.update(folder_data["all_tags"])
            
            all_tags = sorted(list(all_tags))
            folder_ids = list(hierarchy_data.keys())
            
            # 태그 매트릭스 생성
            tag_matrix = []
            for folder_id in folder_ids:
                folder_tags = set(hierarchy_data[folder_id]["all_tags"])
                row = [1 if tag in folder_tags else 0 for tag in all_tags]
                tag_matrix.append(row)
            
            # 폴더간 유사도 매트릭스 계산
            similarity_matrix = []
            for i, folder_id1 in enumerate(folder_ids):
                row = []
                for j, folder_id2 in enumerate(folder_ids):
                    if i == j:
                        similarity = 1.0
                    else:
                        tags1 = hierarchy_data[folder_id1]["all_tags"]
                        tags2 = hierarchy_data[folder_id2]["all_tags"]
                        similarity = self.calculate_tag_similarity(tags1, tags2)
                    row.append(similarity)
                similarity_matrix.append(row)
            
            return {
                "folder_ids": folder_ids,
                "folder_titles": [hierarchy_data[fid]["title"] for fid in folder_ids],
                "all_tags": all_tags,
                "tag_matrix": tag_matrix,
                "similarity_matrix": similarity_matrix,
                "computed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"폴더 태그 매트릭스 생성 실패: {e}")
            raise

# API 엔드포인트들
@router.get("/hierarchical-graph", response_model=HierarchicalGraphData)
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
        db = get_database()
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
            docs_to_include = documents[:remaining_slots//2]
            tags_to_include = tags[:remaining_slots//2]
            
            selected_nodes = folders + docs_to_include + tags_to_include
            selected_node_ids = {n.id for n in selected_nodes}
            
            # 선택된 노드들 간의 엣지만 유지
            filtered_edges = [e for e in graph_data.edges 
                            if e.source in selected_node_ids and e.target in selected_node_ids]
            
            graph_data.nodes = selected_nodes
            graph_data.edges = filtered_edges
            graph_data.metadata["nodes_filtered"] = True
            graph_data.metadata["original_node_count"] = len(graph_data.nodes)
        
        return graph_data
        
    except Exception as e:
        logger.error(f"계층적 그래프 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folder-tag-matrix")
async def get_folder_tag_matrix():
    """폴더별 태그 매트릭스 및 유사도 매트릭스 조회"""
    try:
        db = get_database()
        service = GraphAnalysisService(db)
        
        matrix_data = await service.get_folder_tag_matrix()
        return matrix_data
        
    except Exception as e:
        logger.error(f"폴더 태그 매트릭스 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/folder-similarity")
async def get_folder_similarity(
    folder_id1: str = Query(..., description="첫 번째 폴더 ID"),
    folder_id2: str = Query(..., description="두 번째 폴더 ID")
):
    """두 폴더 간 상세 유사도 분석"""
    try:
        db = get_database()
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

# 기존 API들 유지 (호환성)
# ... existing code ...
/**
 * Graph API (D3.js 시각화용)
 */
import { apiClient } from './client'

export const graphApi = {
  /**
   * 계층적 그래프 데이터 조회
   */
  getHierarchical: async (threshold = 0.5, maxNodes = 300) => {
    const response = await apiClient.get(
      `/graph-hierarchical/graph?tag_similarity_threshold=${threshold}&max_nodes=${maxNodes}`
    )
    return response.data
  },

  /**
   * 그래프 분석 데이터 조회
   */
  getAnalysis: async () => {
    const response = await apiClient.get('/graph-analysis/')
    return response.data
  },
}

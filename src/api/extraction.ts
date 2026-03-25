import request from '@/utils/http'

/**
 * 开始信息提取
 * @param params 提取参数
 * @returns 提取任务信息
 */
export function startExtraction(params: Api.Extraction.StartParams) {
  return request.post<Api.Extraction.StartResponse>({
    url: '/api/extraction/start',
    data: params
  })
}

/**
 * 获取提取结果
 * @param taskId 任务ID
 * @returns 提取结果
 */
export function getExtractionResult(taskId: string) {
  return request.get<Api.Extraction.ResultResponse>({
    url: `/api/extraction/${taskId}/result`
  })
}

/**
 * 获取提取历史
 * @param params 查询参数
 * @returns 提取历史列表
 */
export function getExtractionHistory(params?: Api.Extraction.HistoryParams) {
  return request.get<Api.Extraction.HistoryResponse>({
    url: '/api/extraction/history',
    params
  })
}

/**
 * 删除提取记录
 * @param id 记录ID
 * @returns 删除结果
 */
export function deleteExtractionRecord(id: number) {
  return request.delete<Api.BaseResponse>({
    url: `/api/extraction/${id}`
  })
}

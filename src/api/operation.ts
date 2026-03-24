import request from '@/utils/http'

/**
 * 执行智能操作指令
 * @param params 指令参数
 * @returns 执行结果
 */
export function executeOperation(params: Api.Operation.ExecuteParams) {
  return request.post<Api.Operation.ExecuteResponse>({
    url: '/api/operation/execute',
    data: params
  })
}

/**
 * 获取操作历史
 * @param params 查询参数
 * @returns 操作历史列表
 */
export function getOperationHistory(params?: Api.Operation.HistoryParams) {
  return request.get<Api.Operation.HistoryResponse>({
    url: '/api/operation/history',
    params
  })
}

/**
 * 删除操作记录
 * @param id 记录ID
 * @returns 删除结果
 */
export function deleteOperationRecord(id: number) {
  return request.delete<Api.BaseResponse>({
    url: `/api/operation/${id}`
  })
}

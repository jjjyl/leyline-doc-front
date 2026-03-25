import request from '@/utils/http'

/**
 * 获取文档表格数据
 * @param id 文档ID
 * @returns 文档表格数据，包含文档ID和表格列表
 */
export function getTableData(id: number) {
  return request.get<Api.Table.TableInfo>({
    url: `/api/table/${id}`
  })
}

/**
 * 提取文档表格 Schema
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableSchema(id: number) {
  return request.post<Api.BaseResponse>({
    url: `/api/table/extract-schema/${id}`
  })
}

/**
 * 提取文档表格数据
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableData(id: number) {
  return request.post<Api.BaseResponse>({
    url: `/api/table/extract/${id}`
  })
}

/**
 * 生成文档表格
 * @param id 文档ID
 * @returns 生成结果
 */
export function generateTable(id: number) {
  return request.post<Api.BaseResponse>({
    url: `/api/table/generate/${id}`
  })
}
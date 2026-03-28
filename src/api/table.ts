import request from '@/utils/http'

/**
 * 从 MongoDB 中获取指定文档已提取的表格数据，如果文档尚未提取表格则返回空列表
 * @param docId 文档ID
 * @returns 文档表格数据，包含文档ID和表格列表
 */
export function getTableData(docId: number) {
  return request.get<Api.Table.TableInfo>({
    url: `/api/table/${docId}`
  })
}

/**
 * 提取文档表格结构
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableSchema(id: number) {
  return request.post<Api.Table.schema>({
    url: `/api/table/extract-schema/${id}`
  })
}

/**
 * (同步)从指定文档中提取表格数据，返回包含表头和数据行的完整表格
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableData(id: number) {
  return request.post<Api.Table.TableInfo>({
    url: `/api/table/extract/${id}`
  })
}

/**
 * (异步)从指定文档中生成结构化的表格数据，包含 Schema 提取和数据提取两个阶段
 * @param id 文档ID
 * @returns 生成结果
 */
export function generateTable(id: number) {
  return request.post<Api.Table.generateTableResponse>({
    url: `/api/table/generate/${id}`
  })
}
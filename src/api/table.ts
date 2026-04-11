import request from '@/utils/http'

/**
 * 从 MongoDB 中获取指定文档已提取的表格数据，如果文档尚未提取表格则返回空列表
 * @param docId 文档ID
 * @returns 文档表格数据，包含文档ID和表格列表
 */
export function getTableData(docId: number) {
  return request.get<Api.Table.GetTablesResponse>({
    url: `/api/table/${docId}`
  })
}

/**
 * 提取文档表格结构
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableSchema(id: number) {
  return request.post<Api.Table.ExtractTableSchemaResponse>({
    url: `/api/table/extract-schema/${id}`
  })
}

/**
 * (同步)从指定文档中提取表格数据，返回包含表头和数据行的完整表格
 * @param id 文档ID
 * @returns 提取结果
 */
export function extractTableData(id: number) {
  return request.post<Api.Table.ExtractTableDataResponse>({
    url: `/api/table/extract/${id}`,
    timeout: 300000
  })
}

/**
 * (异步)从指定文档中生成结构化的表格数据，包含 Schema 提取和数据提取两个阶段
 * @param id 文档ID
 * @returns 生成结果
 */
export function generateTable(id: number) {
  return request.post<Api.Table.GenerateTableResponse>({
    url: `/api/table/generate/${id}`
  })
}

/**
 * 根据文档ID、表格ID和行ID修改表格中的指定行数据
 * @param docId 文档ID
 * @param tableId 表格ID
 * @param rowId 行ID
 * @param cells 新的单元格数据
 * @returns 修改结果
 */
export function updateTableRow(docId: number, tableId: string, rowId: string, cells: string[]) {
  return request.put<Api.TableRow.UpdateTableRowResponse>({
    url: `/api/table/row/${docId}/${tableId}/${rowId}`,
    data: {
      doc_id: docId,
      table_id: tableId,
      row_id: rowId,
      cells
    }
  })
}

/**
 * 根据文档ID、表格ID和行ID删除表格中的指定行
 * @param docId 文档ID
 * @param tableId 表格ID
 * @param rowId 行ID
 * @returns 删除结果
 */
export function deleteTableRow(docId: number, tableId: string, rowId: string) {
  return request.del<Api.TableRow.DeleteTableRowResponse>({
    url: `/api/table/row/${docId}/${tableId}/${rowId}`
  })
}

/**
 * 根据指定的数据源文档和模板文档，使用 AI 提取表格数据
 * @param params 请求参数
 * @returns 提取的表格数据
 */
export function extractSpecifiedTables(params: Api.Table.ExtractSpecifiedRequest) {
  return request.post<Api.Table.ExtractSpecifiedResponse>({
    url: '/api/table/extract-specified',
    data: params
  })
}

import request from '@/utils/http'

/**
 * 获取文档库列表
 * @returns 文档库列表
 */
export function getDocLibs() {
  return request.get<Array<Api.DocLib.ListDocLibsResponse>>({
    url: '/api/doc-lib'
  })
}

/**
 * 创建文档库
 * @param params 创建参数
 * @returns 创建结果
 */
export function createDocLib(params: Api.DocLib.CreateDocLibRequest) {
  return request.post<Api.DocLib.CreateDocLibResponse>({
    url: '/api/doc-lib',
    data: params
  })
}

/**
 * 获取文档库详情
 * @param id 文档库ID
 * @returns 文档库详情
 */
export function getDocLib(id: number) {
  return request.get<Api.DocLib.GetDocLibResponse>({
    url: `/api/doc-lib/${id}`
  })
}

/**
 * 更新文档库
 * @param id 文档库ID
 * @param params 更新参数
 * @returns 更新结果
 */
export function updateDocLib(id: number, params: Api.DocLib.UpdateDocLibRequest) {
  return request.put<Api.BaseResponse>({
    url: `/api/doc-lib/${id}`,
    data: params
  })
}

/**
 * 删除文档库
 * @param id 文档库ID
 * @returns 删除结果
 */
export function deleteDocLib(id: number) {
  return request.delete<Api.BaseResponse>({
    url: `/api/doc-lib/${id}`
  })
}

/**
 * 创建上传会话
 * @param params 上传参数
 * @returns 上传会话信息
 */
export function createUploadSession(params: Api.Doc.CreateUploadSessionRequest) {
  return request.post<Api.Doc.CreateUploadSessionResponse>({
    url: '/api/doc/upload-session',
    data: params
  })
}

/**
 * 完成上传
 * @param params 完成上传参数
 * @returns 上传结果
 */
export function finishUpload(params: Api.Doc.FinishUploadRequest) {
  return request.post<Api.Doc.FinishUploadResponse>({
    url: '/api/doc/upload/finish',
    data: params
  })
}

/**
 * 提取表格Schema
 * @param docId 文档ID
 * @returns 表格Schema
 */
export function extractTableSchema(docId: number) {
  return request.post<Api.Table.ExtractTableSchemaResponse>({
    url: `/api/table/extract-schema/${docId}`
  })
}

/**
 * 提取表格数据
 * @param docId 文档ID
 * @returns 表格数据
 */
export function extractTableData(docId: number) {
  return request.post<Api.Table.ExtractTableDataResponse>({
    url: `/api/table/extract/${docId}`
  })
}

/**
 * 生成表格
 * @param docId 文档ID
 * @returns 生成结果
 */
export function generateTable(docId: number) {
  return request.post<Api.Table.GenerateTableResponse>({
    url: `/api/table/generate/${docId}`
  })
}

/**
 * 获取表格数据
 * @param docId 文档ID
 * @returns 表格数据
 */
export function getTableData(docId: number) {
  return request.get<Api.Table.GetTablesResponse>({
    url: `/api/table/${docId}`
  })
}
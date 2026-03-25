import request from '@/utils/http'

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
 * @param docId 完成上传参数
 * @returns 上传结果
 */
export function finishUpload(docId: number) {
  return request.post<Api.Doc.FinishUploadResponse>({
    url: '/api/doc/upload/finish',
    data: {
      doc_id: docId
    }
  })
}

// /**
//  * 提取表格Schema
//  * @param docId 文档ID
//  * @returns 表格Schema
//  */
// export function extractTableSchema(docId: number) {
//   return request.post<Api.Table.ExtractTableSchemaResponse>({
//     url: `/api/table/extract-schema/${docId}`
//   })
// }
//
// /**
//  * 提取表格数据
//  * @param docId 文档ID
//  * @returns 表格数据
//  */
// export function extractTableData(docId: number) {
//   return request.post<Api.Table.ExtractTableDataResponse>({
//     url: `/api/table/extract/${docId}`
//   })
// }
//
// /**
//  * 生成表格
//  * @param docId 文档ID
//  * @returns 生成结果
//  */
// export function generateTable(docId: number) {
//   return request.post<Api.Table.GenerateTableResponse>({
//     url: `/api/table/generate/${docId}`
//   })
// }
//
// /**
//  * 获取表格数据
//  * @param docId 文档ID
//  * @returns 表格数据
//  */
// export function getTableData(docId: number) {
//   return request.get<Api.Table.GetTablesResponse>({
//     url: `/api/table/${docId}`
//   })
// }
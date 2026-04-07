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

/**
 * 列出文件列表
 * @param parentId 父文件夹ID
 * @param libId 文档库id
 * @returns 文档列表
 */
export function getDocList(parentId?: number, libId?: number) {
  return request.get<Array<Api.Doc.DocInfo>>({
    url: '/api/doc',
    params: {
      parent_id: parentId,
      lib_id: libId
    }
  })
}

/**
 * 删除文档
 * @param docId 文档ID
 * @returns 删除结果
 */
export function deleteDoc(docId: number) {
  return request.del<string>({
    url: `/api/doc/${docId}`
  })
}

/**
 * 获取指定文档的详细信息
 * @param docId 文档ID
 * @returns 文档详情
 */
export function getDocDetail(docId: number) {
  return request.get<Api.Doc.DocInfo>({
    url: `/api/doc/${docId}`
  })
}

/**
 * 创建新文档
 * @param params 创建文档参数
 * @returns 创建的文档信息
 */
export function createDoc(params: {
  lib_id: number
  name: string
  parent_id?: number
  type?: string
}) {
  return request.post<{ id: number; name: string; type: string }>({
    url: '/api/doc',
    data: params
  })
}

/**
 * 更新文档信息
 * @param params 更新文档参数
 * @returns 更新结果
 */
export function updateDoc(params: { id: number; name: string }) {
  return request.put<{ id: number; name: string }>({
    url: '/api/doc',
    data: params
  })
}

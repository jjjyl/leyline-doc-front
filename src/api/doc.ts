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
 * @param parentId 完成上传参数
 * @param libId 文档库id
 * @returns 文档列表
 */
export function getDocList(parentId: number, libId: number) {
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
 * @param docId 完成上传参数
 * @returns 删除结果
 */
export function deleteDoc(docId: number) {
  return request.del<string>({
    url: `/api/doc/${docId}`
  })
}

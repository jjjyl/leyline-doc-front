import request from '@/utils/http'

/**
 * 文档上传
 * @param file 文档文件
 * @returns 上传结果
 */
export function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<Api.Document.UploadResponse>({
    url: '/api/documents/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取文档列表
 * @param params 查询参数
 * @returns 文档列表
 */
export function getDocumentList(params?: Api.Document.ListParams) {
  return request.get<Api.Document.ListResponse>({
    url: '/api/documents',
    params
  })
}

/**
 * 预览文档
 * @param id 文档ID
 * @returns 文档预览内容
 */
export function previewDocument(id: number) {
  return request.get<Api.Document.PreviewResponse>({
    url: `/api/documents/${id}/preview`
  })
}

/**
 * 删除文档
 * @param id 文档ID
 * @returns 删除结果
 */
export function deleteDocument(id: number) {
  return request.delete<Api.BaseResponse>({
    url: `/api/documents/${id}`
  })
}

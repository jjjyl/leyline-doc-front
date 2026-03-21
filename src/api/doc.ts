import request from '@/utils/http'

/**
 * 创建上传会话
 * @param params 上传参数
 * @returns 文档库列表
 */
export function fetchUploader(params: Api.Doc.uplodeSessionParams) {
  return request.post({
    url: '/api/doc/upload-session',
    params
  })
}

/**
 * 上传文件
 * @param file 上传文件
 * @returns 上传结果
 */
export function UploadDoc(file: string) {
  return request.post({
    url: '/api/doc/upload',
    data: {
      file: file
    }
  })
}

/**
 * 完成上传
 * @param doc_id 文件id
 * @returns doc_id 文件id
 */
export function fetchUploadResult(doc_id: number) {
  return request.post({
    url: '/api/doc/upload/finish',
    data: {
      doc_id: doc_id
    }
  })
}
import request from '@/utils/http'

/**
 * 上传表格模板
 * @param file 模板文件
 * @param name 模板名称
 * @param description 描述
 * @returns 上传结果
 */
export function uploadTemplate(file: File, name: string, description?: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', name)
  if (description) {
    formData.append('description', description)
  }

  return request.post<Api.Template.UploadResponse>({
    url: '/api/templates/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取模板列表
 * @param params 查询参数
 * @returns 模板列表
 */
export function getTemplateList(params?: Api.Template.ListParams) {
  return request.get<Api.Template.ListResponse>({
    url: '/api/templates',
    params
  })
}

/**
 * 删除模板
 * @param id 模板ID
 * @returns 删除结果
 */
export function deleteTemplate(id: number) {
  return request.delete<Api.BaseResponse>({
    url: `/api/templates/${id}`
  })
}

/**
 * 开始数据填写
 * @param params 填写参数
 * @returns 填写任务信息
 */
export function startDataFilling(params: Api.Filling.StartParams) {
  return request.post<Api.Filling.StartResponse>({
    url: '/api/filling/start',
    data: params
  })
}

/**
 * 获取填写结果
 * @param taskId 任务ID
 * @returns 填写结果
 */
export function getFillingResult(taskId: string) {
  return request.get<Api.Filling.ResultResponse>({
    url: `/api/filling/${taskId}/result`
  })
}

/**
 * 导出表格
 * @param taskId 任务ID
 * @param format 导出格式
 * @returns 文件下载
 */
export function exportTable(taskId: string, format: 'word' | 'excel') {
  return request.post<Blob>({
    url: `/api/filling/${taskId}/export`,
    data: { format },
    responseType: 'blob'
  })
}

/**
 * 生成分享链接
 * @param taskId 任务ID
 * @returns 分享链接信息
 */
export function generateShareLink(taskId: string) {
  return request.post<Api.Filling.ShareResponse>({
    url: `/api/filling/${taskId}/share`
  })
}

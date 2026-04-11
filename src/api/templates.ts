// templates.ts
import request from '@/utils/http'

/**
 * 获取模板列表
 * @returns 模板列表
 */
export function getTemplateList() {
  return request.get<Api.Template.ListResponse>({
    url: '/api/templ/list'
  })
}

/**
 * 创建上传会话（获取上传URL）
 * @param file 文件对象
 */
export function createUploadSession(file: File) {
  return request.post<Api.Template.CreateUploadSessionResponse>({
    url: '/api/templ/upload/create',
    data: {
      file_name: file.name,
      file_size: file.size
    }
  })
}

/**
 * 完成上传（通知后端上传完成）
 * @param templId 模板ID
 */
export async function finishUpload(templId: number) {
  return request.post<Api.Template.FinishUploadResponse>({
    url: '/api/templ/upload/finish',
    data: { templ_id: templId }
  })
}

/**
 * 删除模板
 * @param id 模板ID
 */
export function deleteTemplate(id: number) {
  return request.del<Api.BaseResponse>({
    url: `/api/templ/${id}`
  })
}

/**
 * 提取表格数据（获取已提取的表格）
 * @param templId 模板ID
 */
export async function extractTableData(templId: number) {
  // 假设后端提供了获取表格数据的接口
  return request.get<Api.Template.GetTablesResponse>({
    url: `/api/templ/schema/${templId}` // 注意：此接口可能返回的是schema，如果需要数据则需另外接口
  })
}

/**
 * 获取模板的表格结构（Schema）
 * @param templId 模板ID
 */
export async function getTemplate(templId: number) {
  return request.get<Api.Template.TableSchema>({
    url: `/api/templ/schema/${templId}`
  })
}

/**
 * 更新模板表格结构
 * @param params 更新参数
 */
export async function updateTemplate(params: Api.Template.UpdateSchemaRequest) {
  return request.put<Api.BaseResponse>({
    url: '/api/templ/schema',
    data: params
  })
}

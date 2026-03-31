import request from '@/utils/http'

/**
 * 获取文件夹详情
 */
export function getFolder(id: number) {
  return request.get<Api.Folder.FolderInfo>({
    url: `/api/folder/${id}`
  })
}

/**
 * 创建文件夹
 */
export function folderCreate(params: Api.Folder.FolderCreateParams) {
  return request.post({ url: `/api/folder`, params })
}

/**
 * 更新文件夹
 */
export function updateFolder(lib_id: number, name: string) {
  return request.put<Api.BaseResponse>({
    url: '/api/folder',
    data: {
      lib_id,
      name
    }
  })
}

/**
 * 删除文件夹
 */
export function deleteFolder(id: number) {
  return request.del<Api.BaseResponse>({
    url: `/api/folder/${id}`
  })
}


import request from '@/utils/http'

/**
 * 获取文件夹列表
 * @param libId 文档库ID
 */
export function getFolderList(libId: number) {
  return request.get<{ folders: any[] }>({
    url: '/api/folder',
    params: { lib_id: libId }
  })
}

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
  return request.post({ url: `/api/folder`, data: params })
}

/**
 * 更新文件夹
 */
export function updateFolder(id: number, name: string) {
  return request.put<Api.BaseResponse>({
    url: '/api/folder',
    data: {
      id,
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

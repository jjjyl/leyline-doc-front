import request from '@/utils/http'

/**
 * 获取文档库
 * @returns 文档库列表
 */
export function fetchDocLibs(): Promise<Array<Api.DocLib.DocLibInfo>> {
  return request.get({
    url: '/api/doc-lib'
  })
}

/**
 * 创建文档库
 * @param name 文档库名称
 * @returns lib-id
 */
export function docLibCreate(name: string) {
  return request.post({
    url: `/api/doc-lib`,
    data: {
      name: name
    }
  })
}

// /**
//  * 获取文档库详情
//  * @param docLibId 文档库ID
//  * @returns 文档库详情
//  */
// export function getDocLib(docLibId: number) {
//   return request.get<Api.DocLib.DocLibInfo>({
//     url: `/api/doc-lib/${docLibId}`
//   })
// }
//
// /**
//  * 更新文档库
//  * @param id 文档库ID
//  * @param params 更新参数
//  * @returns 更新结果
//  */
// export function updateDocLib(id: number, params: Api.DocLib.UpdateDocLibRequest) {
//   return request.put<Api.BaseResponse>({
//     url: `/api/doc-lib/${id}`,
//     data: params
//   })
// }
//
// /**
//  * 删除文档库
//  * @param id 文档库ID
//  * @returns 删除结果
//  */
// export function deleteDocLib(id: number) {
//   return request.delete<Api.BaseResponse>({
//     url: `/api/doc-lib/${id}`
//   })
// }

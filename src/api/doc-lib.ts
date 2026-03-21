import request from '@/utils/http'

/**
 * 获取文档库
 * @returns 文档库列表
 */
export function fetchDocLibs() {
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


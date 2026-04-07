import request from '@/utils/http'

/**
 * 更新用户信息
 * @param params 用户信息参数
 * @returns 更新后的用户信息
 */
export function updateUserInfo(params: { email?: string; name?: string }) {
  return request.put<Api.Auth.UserInfo>({
    url: '/api/user/me',
    data: params
  })
}

/**
 * 更新密码
 * @param params 密码更新参数
 * @returns 更新结果
 */
export function updatePassword(params: Api.Auth.UpdatePasswordParams) {
  return request.put({ url: '/api/user/password', data: params })
}

/**
 * 获取当前登录用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/me'
  })
}

/**
 * 根据用户ID获取用户详细信息
 * @param id 用户ID
 * @returns 用户信息
 */
export function getUserById(id: number) {
  return request.get<Api.Auth.UserInfo>({
    url: `/api/user/${id}`
  })
}

/**
 * 删除当前登录用户
 * @returns 删除结果
 */
export function deleteCurrentUser() {
  return request.del({
    url: '/api/user/me'
  })
}

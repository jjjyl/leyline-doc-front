import request from '@/utils/http'

/**
 * 更新用户信息
 */
export function updateUserInfo(params: Api.Auth.UserInfo) {
  return request.put<Api.Auth.UserInfo>({
    url: '/api/user/me',
    params
  })
}

/**
 * 更新密码
 */
export function updatePassword(params: Api.Auth.UpdatePasswordParams) {
  return request.put({ url: '/api/user/password', params })
}
import request from '@/utils/http'

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/me'
  })
}

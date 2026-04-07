import request from '@/utils/http'

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    data: params
  })
}

/**
 * 用户注册
 */
export const register = (params: Api.Auth.RegisterParams) => {
  return request.post({ url: '/api/auth/register', params })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/me'
  })
}

/**
 * 用户登出，将 token 加入黑名单
 * @returns 登出结果
 */
export function logout() {
  return request.post({
    url: '/api/auth/logout'
  })
}

/**
 * 刷新 Token
 * @param refreshToken refresh_token
 * @returns 新的 access_token 和 refresh_token
 */
export function refreshToken(refreshToken: string) {
  return request.post<{ token: string; refresh_token: string }>({
    url: '/api/auth/refresh',
    data: {
      refresh_token: refreshToken
    }
  })
}

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
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function logout() {
  return request.post({
    url: '/api/auth/logout'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

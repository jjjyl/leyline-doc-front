import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

// 获取 axios 实例的默认配置
const axiosInstance = request as any
const baseURL = axiosInstance.defaults?.baseURL || ''
const commonHeaders = axiosInstance.defaults?.headers?.common || {}

/**
 * 流式聊天消息（SSE）
 * @param params - 请求参数
 * @param onData - 每次收到数据块的回调（接收纯文本内容）
 * @param onDone - 流结束时的回调（可选，接收 usage 信息）
 * @param onError - 错误回调
 * @returns 用于取消请求的 AbortController
 */
export function sendStreamMessage(
  params: Api.AiChat.SendMessageParams,
  onData: (chunk: string) => void,
  onDone?: (usage?: any) => void,
  onError?: (error: Error) => void
): AbortController {
  const controller = new AbortController()

  const userStore = useUserStore()

  // 根据实际 store 中的字段名调整，常见的有 accessToken、token
  const token = userStore.accessToken
  // 拼接完整 URL（如果 baseURL 以 / 结尾，注意处理）
  const fullURL = 'http://poyuan.kmdns.net:36879/api/llm/chat/stream'

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  console.log('🔍 实际请求 URL:', fullURL)
  fetch(fullURL, {
    method: 'post',
    headers,
    body: JSON.stringify({
      prompt: params.prompt,
      session_id: params.session_id || ''
    }),
    signal: controller.signal
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('响应体为空')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const jsonStr = line.slice(5).trim()
          if (!jsonStr) continue

          try {
            const { event, data } = JSON.parse(jsonStr)
            if (event === 'data' && typeof data === 'string') {
              onData(data)
            } else if (event === 'done') {
              let usage = null
              if (data && typeof data === 'string') {
                try {
                  usage = JSON.parse(data)
                } catch (e) {}
              }
              onDone?.(usage)
              return // 收到 done 事件后直接结束
            }
          } catch (e) {
            // 兼容非 JSON 格式，直接当作文本处理
            onData(jsonStr)
          }
        }
      }
      // 流自然结束（未收到 done 事件）
      onDone?.()
    })
    .catch((error) => {
      if (error.name === 'AbortError') return
      onError?.(error)
    })

  return controller
}

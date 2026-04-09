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
 * @param onMeta - 数据元回调
 * @param onDone - 流结束时的回调（可选，接收 usage 信息）
 * @param onError - 错误回调
 * @returns 用于取消请求的 AbortController
 */
export function sendStreamMessage(
  params: Api.AiChat.SendMessageParams,
  onData: (chunk: string) => void,
  onMeta?: (meta: { session_id?: string; user_id?: number }) => void,
  onDone?: (usage?: any) => void,
  onError?: (error: Error) => void
): AbortController {
  const controller = new AbortController()
  const userStore = useUserStore()
  const token = userStore.accessToken

  // 请根据实际后端地址修改（截图示例为 /api/llm/chat/stream）
  const fullURL = 'http://poyuan.kmdns.net:36879/api/llm/chat/stream'

  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

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
          // 标准 SSE 格式：以 "data:" 开头
          if (!line.startsWith('data:')) continue
          const jsonStr = line.slice(5).trim()
          if (!jsonStr) continue

          try {
            const parsed = JSON.parse(jsonStr)
            const { event, data } = parsed

            if (event === 'meta') {
              // data 可能是 JSON 字符串，需要二次解析
              let sessionId: string | undefined
              if (typeof data === 'string') {
                try {
                  const metaData = JSON.parse(data)
                  sessionId = metaData.session_id
                } catch (e) {
                  console.warn('解析 meta data 失败:', data)
                }
              } else if (data && typeof data === 'object') {
                sessionId = data.session_id
              }
              onMeta?.({ session_id: sessionId, user_id: parsed.user_id })
            } else if (event === 'data') {
              onData(typeof data === 'string' ? data : String(data))
            } else if (event === 'done') {
              let usage = null
              if (typeof data === 'string') {
                try {
                  usage = JSON.parse(data)
                } catch {
                  usage = data
                }
              } else {
                usage = data
              }
              onDone?.(usage)
              return
            }
          } catch (e) {
            console.warn('解析 SSE 数据失败:', jsonStr, e)
          }
        }
      }
      onDone?.()
    })
    .catch((error) => {
      if (error.name === 'AbortError') return
      onError?.(error)
    })

  return controller
}

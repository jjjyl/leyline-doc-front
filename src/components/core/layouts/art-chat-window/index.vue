<!-- 系统聊天窗口 -->
<template>
  <div>
    <ElDrawer v-model="isDrawerVisible" :size="isMobile ? '100%' : '480px'" :with-header="false">
      <!-- AI 智能体信息头部 -->
      <div class="mb-5 flex-cb border-b border-g-200 pb-4">
        <div class="flex-c gap-3">
          <div class="relative">
            <ElAvatar :size="40" :src="aiInfo.avatar" />
            <div
              class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
              :class="aiInfo.isOnline ? 'bg-success' : 'bg-warning'"
            ></div>
          </div>
          <div>
            <div class="flex-c gap-2">
              <span class="text-base font-medium">{{ aiInfo.name }}</span>
              <ElTag size="small" type="primary" effect="plain" round>AI 助手</ElTag>
            </div>
            <div class="mt-1 flex-c gap-1 text-xs text-g-500">
              <div
                class="h-1.5 w-1.5 rounded-full"
                :class="aiInfo.isOnline ? 'bg-success' : 'bg-warning'"
              ></div>
              <span>{{ aiInfo.status }}</span>
            </div>
          </div>
        </div>
        <div>
          <ElIcon class="c-p hover:text-g-600" :size="20" @click="closeChat">
            <Close />
          </ElIcon>
        </div>
      </div>

      <div class="flex h-[calc(100%-80px)] flex-col">
        <!-- 聊天消息区域 -->
        <div
          class="flex-1 overflow-y-auto px-4 py-5 [&::-webkit-scrollbar]:!w-1"
          ref="messageContainer"
        >
          <template v-for="(message, index) in messages" :key="message.id">
            <div
              :class="[
                'mb-6 flex w-full items-start gap-3',
                message.isMe ? 'flex-row-reverse' : 'flex-row'
              ]"
            >
              <!-- 头像 -->
              <ElAvatar :size="36" :src="message.avatar" class="shrink-0 mt-1" />

              <!-- 消息内容 -->
              <div
                :class="[
                  'flex max-w-[80%] flex-col',
                  message.isMe ? 'items-end' : 'items-start'
                ]"
              >
                <!-- 发送者信息 -->
                <div
                  :class="[
                    'mb-1.5 flex items-center gap-2 text-xs',
                    message.isMe ? 'flex-row-reverse' : 'flex-row'
                  ]"
                >
                  <span class="font-medium text-g-700">{{ message.sender }}</span>
                  <span class="text-g-400">{{ message.time }}</span>
                </div>

                <!-- 消息气泡 -->
                <div
                  :class="[
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    message.isMe
                      ? 'bg-theme text-white rounded-br-sm'
                      : 'bg-g-100 text-g-900 rounded-bl-sm'
                  ]"
                >
                  <!-- 思考状态动画 -->
                  <template v-if="message.isThinking">
                    <div class="flex-c gap-1.5">
                      <div class="h-2 w-2 rounded-full bg-g-400 animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="h-2 w-2 rounded-full bg-g-400 animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="h-2 w-2 rounded-full bg-g-400 animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                  </template>
                  <template v-else>
                    {{ message.content }}
                  </template>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 输入区域 -->
        <div class="border-t border-g-200 px-4 pt-4 pb-2">
          <!-- 快捷提问建议 -->
          <div class="mb-3 flex flex-wrap gap-2">
            <ElTag
              v-for="(suggestion, idx) in suggestions"
              :key="idx"
              size="small"
              effect="plain"
              round
              class="c-p hover:bg-theme/10 cursor-pointer transition-colors"
              @click="handleSuggestionClick(suggestion)"
            >
              {{ suggestion }}
            </ElTag>
          </div>

          <!-- 输入框 -->
          <div class="relative">
            <ElInput
              v-model="messageText"
              type="textarea"
              :rows="3"
              placeholder="向 AI 提问，了解你想知道的一切..."
              resize="none"
              class="custom-textarea"
              @keydown.meta.enter="sendMessage"
              @keydown.ctrl.enter="sendMessage"
            />
            <div class="absolute bottom-3 right-3 flex-c gap-2">
              <ElButton
                type="primary"
                :loading="isSending"
                :disabled="!messageText.trim()"
                @click="sendMessage"
                class="rounded-full px-6"
              >
                发送
              </ElButton>
            </div>
          </div>

          <!-- 提示信息 -->
          <div class="mt-3 flex-c text-xs text-g-400">
            <span>AI 生成的内容可能不准确，请谨慎参考</span>
          </div>
        </div>
      </div>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { Picture, Paperclip, Close, ChatDotRound } from '@element-plus/icons-vue'
  import { mittBus } from '@/utils/sys'
  import aiAvatar from '@/assets/images/avatar/avatar10.webp'
  import meAvatar from '@/assets/images/avatar/avatar5.webp'

  defineOptions({ name: 'ArtChatWindow' })

  // 类型定义
  interface ChatMessage {
    id: number
    sender: string
    content: string
    time: string
    isMe: boolean
    avatar: string
    isThinking?: boolean
  }

  interface AIInfo {
    name: string
    avatar: string
    status: string
    isOnline: boolean
  }

  // 常量定义
  const MOBILE_BREAKPOINT = 640
  const SCROLL_DELAY = 100
  const BOT_NAME = 'DeepSeek AI'
  const USER_NAME = '我'

  // AI 智能体信息
  const aiInfo = ref<AIInfo>({
    name: BOT_NAME,
    avatar: aiAvatar,
    status: '在线 · 随时为您服务',
    isOnline: true
  })

  // 快捷建议问题
  const suggestions = ref<string[]>([
    '介绍一下你自己',
    '如何使用这个系统？',
    '帮我分析一下数据',
    '今天有什么新功能？'
  ])

  // 响应式布局
  const { width } = useWindowSize()
  const isMobile = computed(() => width.value < MOBILE_BREAKPOINT)

  // 组件状态
  const isDrawerVisible = ref(false)
  const isSending = ref(false)

  // 消息相关状态
  const messageText = ref('')
  const messageId = ref(100)
  const messageContainer = ref<HTMLElement | null>(null)

  // 初始化聊天消息数据
  const initializeMessages = (): ChatMessage[] => [
    {
      id: 1,
      sender: BOT_NAME,
      content: `你好！我是${BOT_NAME}，你的 AI 智能助手。我可以回答你的问题、提供建议、帮助你分析数据等。有什么问题我可以帮你的吗？`,
      time: formatTime(new Date()),
      isMe: false,
      avatar: aiAvatar
    }
  ]

  const messages = ref<ChatMessage[]>(initializeMessages())

  // 工具函数：格式化时间
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  // 滚动到底部
  const scrollToBottom = (): void => {
    nextTick(() => {
      setTimeout(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTop = messageContainer.value.scrollHeight
        }
      }, SCROLL_DELAY)
    })
  }

  // 模拟调用后端 AI API
  const callAIAPI = async (userMessage: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500))

    // 简单的关键词回复逻辑（实际应该调用后端 API）
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes('介绍')) {
      return `我是${BOT_NAME}，一个基于先进人工智能技术的智能助手。我可以帮助你：

📚 解答各种问题
🔍 分析和处理数据
💡 提供建议和方案
⚙️ 协助使用系统功能

我支持自然语言对话，可以用中文或英文交流。有什么我可以帮你的吗？`
    } else if (lowerMessage.includes('使用') || lowerMessage.includes('帮助')) {
      return `使用这个系统很简单：

1️⃣ **浏览功能**：通过左侧菜单访问不同模块
2️⃣ **文档管理**：上传、整理和分析您的文档
3️⃣ **数据分析**：查看实时数据和报表
4️⃣ **模板中心**：使用预设模板快速开始

每个模块都有详细的功能说明，您可以随时向我咨询具体操作方法！`
    } else if (lowerMessage.includes('分析') || lowerMessage.includes('数据')) {
      return `我可以帮您进行以下数据分析：

📊 **实时监控**：跟踪关键指标变化
📈 **趋势预测**：基于历史数据分析走向
🎯 **异常检测**：识别数据中的异常情况
📋 **报表生成**：自动生成可视化报告

您想分析哪方面的数据呢？我可以提供更具体的指导。`
    } else if (lowerMessage.includes('功能') || lowerMessage.includes('更新')) {
      return `最近系统新增的功能：

✨ **智能文档解析**：自动提取文档关键信息
🤖 **AI 对话助手**：就是我啦，随时为您解答疑问
📱 **移动端优化**：更好的手机和平板体验
🎨 **主题定制**：个性化您的工作界面

想要了解更多功能详情吗？随时问我！`
    } else {
      // 默认回复
      return `感谢你的提问！作为一个 AI 助手，我正在不断学习和进步中。

关于你提到的这个问题，我建议：

1. 可以先查看系统文档获取详细信息
2. 如果涉及具体操作，我可以一步步指导你
3. 复杂问题可以联系技术支持团队

我会尽力提供帮助，还有其他问题吗？`
    }
  }

  // 发送消息
  const sendMessage = async (): Promise<void> => {
    const text = messageText.value.trim()
    if (!text || isSending.value) return

    // 添加用户消息
    const userMessage: ChatMessage = {
      id: messageId.value++,
      sender: USER_NAME,
      content: text,
      time: formatTime(new Date()),
      isMe: true,
      avatar: meAvatar
    }

    messages.value.push(userMessage)
    messageText.value = ''
    scrollToBottom()

    // 添加 AI 思考状态
    const thinkingMessage: ChatMessage = {
      id: messageId.value++,
      sender: BOT_NAME,
      content: '',
      time: formatTime(new Date()),
      isMe: false,
      avatar: aiAvatar,
      isThinking: true
    }
    messages.value.push(thinkingMessage)
    scrollToBottom()

    // 调用 AI API
    isSending.value = true
    try {
      const response = await callAIAPI(text)

      // 移除思考状态，添加实际回复
      messages.value.pop()

      const aiResponse: ChatMessage = {
        id: messageId.value++,
        sender: BOT_NAME,
        content: response,
        time: formatTime(new Date()),
        isMe: false,
        avatar: aiAvatar
      }
      messages.value.push(aiResponse)
      scrollToBottom()
    } catch (error) {
      console.error('AI 响应失败:', error)
      messages.value.pop()

      const errorMessage: ChatMessage = {
        id: messageId.value++,
        sender: BOT_NAME,
        content: '抱歉，我遇到了一些问题，暂时无法回答您的问题。请稍后再试。',
        time: formatTime(new Date()),
        isMe: false,
        avatar: aiAvatar
      }
      messages.value.push(errorMessage)
      scrollToBottom()
    } finally {
      isSending.value = false
    }
  }

  // 处理建议点击
  const handleSuggestionClick = (suggestion: string) => {
    messageText.value = suggestion
    sendMessage()
  }

  // 聊天窗口控制方法
  const openChat = (): void => {
    isDrawerVisible.value = true
    scrollToBottom()
  }

  const closeChat = (): void => {
    isDrawerVisible.value = false
  }

  // 生命周期
  onMounted(() => {
    scrollToBottom()
    mittBus.on('openChat', openChat)
  })

  onUnmounted(() => {
    mittBus.off('openChat', openChat)
  })
</script>

<style scoped lang="scss">
  .custom-textarea {
    :deep(.el-textarea__inner) {
      padding-right: 80px;
      border-radius: 12px;
      border: 1px solid var(--el-border-color);

      &:focus {
        box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
      }
    }
  }

  // 消息气泡动画
  .message-enter-active,
  .message-leave-active {
    transition: all 0.3s ease;
  }

  .message-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }

  .message-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
</style>

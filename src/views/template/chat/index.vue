<!-- AI 智能对话页面 -->
<template>
  <div class="chat-page">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <div class="ai-profile">
        <div class="avatar-wrapper">
          <ElAvatar :size="80" :src="aiInfo.avatar" />
          <span class="online-dot" :class="{ online: aiInfo.isOnline }"></span>
        </div>
        <h2 class="ai-name">{{ aiInfo.name }}</h2>
        <ElTag size="small" type="primary" effect="plain" round class="mt-2"> AI 智能助手 </ElTag>
        <p class="ai-desc">{{ aiInfo.description }}</p>
      </div>

      <div class="section">
        <h3 class="section-title">AI 能力</h3>
        <div class="ability-tags">
          <ElTag v-for="(ability, idx) in aiInfo.abilities" :key="idx" size="small" round>
            {{ ability }}
          </ElTag>
        </div>
      </div>

      <div class="section flex-1 overflow-hidden">
        <h3 class="section-title">推荐提问</h3>
        <div class="suggestions">
          <div
            v-for="(suggestion, idx) in suggestions"
            :key="idx"
            class="suggestion-item"
            @click="handleSuggestionClick(suggestion)"
          >
            <ElIcon class="icon">
              <ChatDotRound />
            </ElIcon>
            <span>{{ suggestion }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="header-left">
          <ElAvatar :size="36" :src="aiInfo.avatar" />
          <div class="header-info">
            <div class="header-name">
              <span>{{ aiInfo.name }}</span>
              <ElTag size="small" type="success" effect="light">在线</ElTag>
            </div>
            <div class="header-status">前面的区域，现在就来探索吧！</div>
          </div>
        </div>
        <div class="header-actions">
          <ElButton circle plain @click="clearChatHistory" title="清空记录">
            <ElIcon>
              <Delete />
            </ElIcon>
          </ElButton>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="message-list" ref="messageContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.isMe ? 'message-me' : 'message-ai']"
        >
          <ElAvatar :size="40" :src="message.avatar" class="avatar" />
          <div class="message-body">
            <div class="message-sender">{{ message.sender }}</div>
            <div class="message-time">{{ message.time }}</div>
            <div :class="['message-bubble', message.isMe ? 'bubble-me' : 'bubble-ai']">
              <template v-if="message.isThinking">
                <div class="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </template>
              <template v-else>
                <div class="message-text">{{ message.content }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <div v-if="messages.length <= 1" class="quick-suggestions">
          <ElTag
            v-for="(suggestion, idx) in quickSuggestions"
            :key="idx"
            size="small"
            effect="plain"
            round
            class="quick-tag"
            @click="handleSuggestionClick(suggestion)"
          >
            {{ suggestion }}
          </ElTag>
        </div>

        <div class="input-wrapper">
          <ElInput
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="向 AI 提问... (Ctrl+Enter 发送)"
            resize="none"
            @keydown.ctrl.enter="sendMessage"
            @keydown.meta.enter="sendMessage"
          />
          <ElButton type="primary" :loading="isSending" @click="sendMessage" class="send-btn">
            <ElIcon>
              <Promotion />
            </ElIcon>
            发送
          </ElButton>
        </div>
        <div class="input-footer">
          <span>💡 AI 生成内容仅供参考，请谨慎判断</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ChatDotRound, Delete, Promotion } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import aiAvatar from '@/assets/images/avatar/Paimon.jpg'
  import meAvatar from '@/assets/images/avatar/me.jpg'
  import { sendStreamMessage } from '@/api/ai-chat'

  defineOptions({ name: 'TemplateChat' })

  // ==================== 类型定义 ====================
  interface AIInfo {
    name: string
    avatar: string
    description: string
    isOnline: boolean
    abilities: string[]
  }

  interface ChatMessage {
    id: number
    sender: string
    content: string
    time: string
    isMe: boolean
    avatar: string
    isThinking?: boolean
  }

  // ==================== 响应式数据 ====================

  // 添加响应式变量：当前活动的 AbortController
  const currentController = ref<AbortController | null>(null)

  const aiInfo = ref<AIInfo>({
    name: '派蒙',
    avatar: aiAvatar,
    description: '派蒙，最好的伙伴！',
    isOnline: true,
    abilities: ['问题解答', '数据分析', '文档处理', '创意写作']
  })

  const suggestions = ref<string[]>([
    '介绍一下你自己和你的功能',
    '如何使用这个系统进行文档管理？',
    '帮我分析一下最近的数据趋势',
    '今天系统有什么新功能上线吗？'
  ])

  const quickSuggestions = ref<string[]>([
    '你好，请介绍一下你自己',
    '如何使用这个系统？',
    '帮我分析数据',
    '有什么新功能？'
  ])

  const isSending = ref(false)
  const messageText = ref('')
  const messageId = ref(100)
  const messageContainer = ref<HTMLElement | null>(null)
  const messages = ref<ChatMessage[]>([])

  // ==================== 工具函数 ====================
  /**
   * 格式化时间
   */
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  /**
   * 初始化消息列表
   */
  const initializeMessages = (): ChatMessage[] => [
    {
      id: 1,
      sender: aiInfo.value.name,
      content: `你好！我是${aiInfo.value.name}，你的 AI 智能助手 🤖

我可以帮你：
✨ 解答各种问题
📊 分析和处理数据
💡 提供建议和方案
📝 协助撰写文档

有什么我可以帮你的吗？`,
      time: formatTime(new Date()),
      isMe: false,
      avatar: aiAvatar
    }
  ]

  /**
   * 滚动到底部
   */
  const scrollToBottom = () => {
    setTimeout(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    }, 100)
  }

  // ==================== AI API 调用 ====================
  /**
   * 模拟调用后端 AI API
   */
  const callAIAPI = async (userMessage: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1500))

    const lowerMessage = userMessage.toLowerCase()

    // 关键词回复逻辑（后续替换为真实 API）
    if (lowerMessage.includes('介绍')) {
      return `我是${aiInfo.value.name}，一个基于先进人工智能技术的智能助手。

🎯 我的核心能力：
• 自然语言理解和生成
• 多轮对话交互
• 数据分析和洞察
• 文档内容处理

🚀 我能帮你做什么：
• 回答各类知识性问题
• 协助使用系统功能
• 分析和总结数据
• 提供建议和方案

我支持中文和英文交流，会用清晰、有条理的方式回答问题。现在就开始我们的对话吧！😊`
    } else if (lowerMessage.includes('使用') || lowerMessage.includes('帮助')) {
      return `很高兴为您介绍系统的使用方法！

📚 快速入门指南：

1️⃣ 文档管理
• 进入「文档上传」模块
• 拖拽文件到上传区域
• 系统自动解析和分类

2️⃣ 数据分析
• 选择需要分析的文档
• 点击「智能提取」按钮
• 查看结构化数据和报表

3️⃣ 模板中心
• 浏览预设模板库
• 选择合适的模板
• 一键应用到文档

有任何不懂的地方随时问我！💪`
    } else if (lowerMessage.includes('分析') || lowerMessage.includes('数据')) {
      return `我可以帮您进行全方位的数据分析！

📊 数据分析服务：

**实时监控**
• 追踪关键指标变化
• 异常数据预警
• 多维度数据对比

**趋势预测**
• 基于历史数据分析
• 识别发展模式
• 预测未来走向

**智能报告**
• 自动生成可视化报表
• 关键发现总结
• 可执行建议

您想分析哪方面的数据呢？📈`
    } else if (lowerMessage.includes('功能') || lowerMessage.includes('更新')) {
      return `让我为您介绍系统的最新功能！

🎉 近期上线功能：

✨ AI 智能助手（就是我啦！）
• 自然语言对话交互
• 实时问题解答
• 个性化建议服务

🤖 智能文档解析
• 自动识别文档结构
• 提取关键信息
• 支持多种格式

📱 移动端优化
• 响应式设计
• 触控友好界面

想要详细了解某个功能吗？随时问我！😄`
    } else if (lowerMessage.includes('你好') || lowerMessage.includes('hi')) {
      return `你好！很高兴见到你！👋

我是${aiInfo.value.name}，你的 AI 智能助手。今天有什么我可以帮助你的吗？

你可以问我：
• 关于系统使用的问题
• 数据分析相关的需求
• 文档处理的疑问
• 或者任何你想了解的内容

期待与你交流！😊`
    } else {
      return `感谢你的提问！🤔

这是一个很好的问题！作为 AI 助手，我会尽力为你提供准确、有用的信息。

建议你：
1. 可以先查看相关功能模块的说明
2. 如果需要具体操作指导，我可以一步步教你
3. 复杂问题可以联系技术支持团队

我会一直在这里帮助你，还有其他问题吗？😊`
    }
  }

  // ==================== 事件处理 ====================
  /**
   * 发送消息
   */
  const sendMessage = async () => {
    const text = messageText.value.trim()
    if (!text || isSending.value) return

    // 取消之前的请求
    if (currentController.value) {
      currentController.value.abort()
      currentController.value = null
    }

    // 添加用户消息...
    messages.value.push({
      id: messageId.value++,
      sender: '我',
      content: text,
      time: formatTime(new Date()),
      isMe: true,
      avatar: meAvatar
    })
    messageText.value = ''
    scrollToBottom()

    // 添加 AI 占位消息
    const aiMessageId = messageId.value++
    messages.value.push({
      id: aiMessageId,
      sender: aiInfo.value.name,
      content: '',
      time: formatTime(new Date()),
      isMe: false,
      avatar: aiAvatar,
      isThinking: true
    })
    scrollToBottom()

    isSending.value = true
    let accumulatedContent = ''
    const sessionId = localStorage.getItem('chat_session_id') || ''

    // 调用底层通信函数，传入回调
    currentController.value = sendStreamMessage(
      { prompt: text, session_id: sessionId },
      // onData: 接收每个数据块
      (chunk) => {
        accumulatedContent += chunk
        const msg = messages.value.find((m) => m.id === aiMessageId)
        if (msg) {
          msg.isThinking = false
          msg.content = accumulatedContent
          scrollToBottom()
        }
      },
      // onDone: 流结束
      (usage) => {
        isSending.value = false
        currentController.value = null
        if (usage) console.log('Token 使用情况:', usage)
      },
      // onError: 错误处理
      (error) => {
        console.error('AI 响应失败:', error)
        const msg = messages.value.find((m) => m.id === aiMessageId)
        if (msg) {
          msg.isThinking = false
          msg.content = '抱歉，我遇到了一些问题，暂时无法回答。请稍后再试。'
        }
        isSending.value = false
        currentController.value = null
        ElMessage.error('AI 响应失败，请重试')
      }
    )
  }

  /**
   * 处理建议点击
   */
  const handleSuggestionClick = (suggestion: string) => {
    messageText.value = suggestion
    sendMessage()
  }

  /**
   * 清空聊天记录
   */
  const clearChatHistory = () => {
    messages.value = initializeMessages()
    ElMessage.success('聊天记录已清空')
    scrollToBottom()
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    messages.value = initializeMessages()
    scrollToBottom()
  })
</script>

<style scoped lang="scss">
  .chat-page {
    display: flex;
    height: calc(100vh - 120px);
    margin: 0;
    padding: 0;
  }

  .sidebar {
    width: 320px;
    background: #f5f7fa;
    border-right: 1px solid #e4e7ed;
    padding: 20px;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .ai-profile {
    text-align: center;
    margin-bottom: 24px;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;
  }

  .online-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #f56c6c;
    border: 2px solid #fff;

    &.online {
      background: #67c23a;
    }
  }

  .ai-name {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
  }

  .ai-desc {
    font-size: 13px;
    color: #909399;
    margin-top: 8px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 12px;
  }

  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .suggestions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }

  .suggestion-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 13px;
    color: #606266;

    &:hover {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }

    .icon {
      color: #409eff;
      margin-top: 1px;
    }
  }

  .main-chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #e4e7ed;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  .header-status {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }

  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    background: #f5f7fa;
  }

  .message {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    &.message-me {
      flex-direction: row-reverse;

      .message-body {
        align-items: flex-end;
      }

      .message-bubble {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 12px 12px 0 12px;
      }
    }

    &.message-ai {
      .message-bubble {
        background: #fff;
        color: #333;
        border-radius: 12px 12px 12px 0;
        border: 1px solid #e4e7ed;
      }
    }
  }

  .message-body {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .message-sender {
    font-size: 12px;
    color: #606266;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .message-time {
    font-size: 11px;
    color: #909399;
    margin-bottom: 6px;
  }

  .message-bubble {
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .thinking-dots {
    display: flex;
    gap: 4px;

    span {
      width: 8px;
      height: 8px;
      background: #909399;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }

      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .input-area {
    padding: 20px 24px;
    border-top: 1px solid #e4e7ed;
    background: #fff;
  }

  .quick-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .quick-tag {
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(64, 158, 255, 0.1);
    }
  }

  .input-wrapper {
    display: flex;
    gap: 12px;

    :deep(.el-textarea) {
      flex: 1;

      .el-textarea__inner {
        border-radius: 12px;
        border: 2px solid #e4e7ed;
        resize: none;

        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
        }
      }
    }

    .send-btn {
      min-width: 100px;
      border-radius: 12px;
    }
  }

  .input-footer {
    display: flex;
    justify-content: center;
    margin-top: 12px;
    font-size: 12px;
    color: #909399;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .loading-image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .loading-text {
    font-size: 14px;
    color: #606266;
    margin: 0;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>

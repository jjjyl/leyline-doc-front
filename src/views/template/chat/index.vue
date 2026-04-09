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

      <div class="sidebar-header">
        <h3 class="sidebar-title">历史会话</h3>
        <el-button type="primary" size="small" plain @click="createNewSession">
          <el-icon><Plus /></el-icon> 新建会话
        </el-button>
      </div>

      <div class="session-list" v-loading="loadingSessions">
        <div
          v-for="session in sessions"
          :key="session.id"
          :class="['session-item', { active: currentSessionId === session.id }]"
          @click="switchToSession(session.id)"
        >
          <div class="session-info">
            <div class="session-title">{{ session.title || '新对话' }}</div>
            <div class="session-time">{{ formatSessionTime(session.updatedAt) }}</div>
          </div>
          <el-button
            class="delete-session-btn"
            size="small"
            type="danger"
            plain
            circle
            @click.stop="deleteSession(session.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <div v-if="sessions.length === 0" class="empty-sessions"> 暂无会话，点击上方新建 </div>
      </div>

      <!--      <div class="section flex-1 overflow-hidden">-->
      <!--        <h3 class="section-title">推荐提问</h3>-->
      <!--        <div class="suggestions">-->
      <!--          <div-->
      <!--            v-for="(suggestion, idx) in suggestions"-->
      <!--            :key="idx"-->
      <!--            class="suggestion-item"-->
      <!--            @click="handleSuggestionClick(suggestion)"-->
      <!--          >-->
      <!--            <ElIcon class="icon">-->
      <!--              <ChatDotRound />-->
      <!--            </ElIcon>-->
      <!--            <span>{{ suggestion }}</span>-->
      <!--          </div>-->
      <!--        </div>-->
      <!--      </div>-->
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
  import { Delete, Promotion } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import aiAvatar from '@/assets/images/avatar/Paimon.jpg'
  import meAvatar from '@/assets/images/avatar/me.jpg'
  import { sendStreamMessage } from '@/api/ai-chat'
  import util from 'xgplayer/es/utils/util'

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
  interface Session {
    id: string // 前端生成的唯一 ID
    sessionId: string // 后端返回的真实 session_id（空字符串表示尚未获得）
    title: string // 会话标题（取自第一条用户消息）
    createdAt: number
    updatedAt: number
    messages: ChatMessage[]
  }

  // ==================== 响应式数据 ====================

  const aiInfo = ref<AIInfo>({
    name: '派蒙',
    avatar: aiAvatar,
    description: '派蒙，最好的伙伴！',
    isOnline: true,
    abilities: ['问题解答', '数据分析', '文档处理', '创意写作']
  })

  // const suggestions = ref<string[]>([
  //   '介绍一下你自己和你的功能',
  //   '如何使用这个系统进行文档管理？',
  //   '帮我分析一下最近的数据趋势',
  //   '今天系统有什么新功能上线吗？'
  // ])

  const quickSuggestions = ref<string[]>([
    '你好，请介绍一下你自己',
    '如何使用这个系统？',
    '帮我分析数据',
    '有什么新功能？'
  ])

  // 会话相关
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string>('')
  const loadingSessions = ref(false)

  // 当前会话的消息（计算属性，实际存储在 sessions 中）
  const messages = ref<ChatMessage[]>([])
  // 当前会话的 session_id（方便使用）
  const currentSessionRealId = ref<string>('')

  // UI 状态
  const isSending = ref(false)
  const messageText = ref('')
  const messageId = ref(100)
  const messageContainer = ref<HTMLElement | null>(null)
  // 添加响应式变量：当前活动的 AbortController
  const currentController = ref<AbortController | null>(null)

  // ==================== 工具函数 ====================
  /**
   * 格式化时间
   */
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatSessionTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 24 * 60 * 60 * 1000) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
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

  // ==================== 会话持久化 ====================
  const saveSessionsToLocal = () => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions.value))
  }

  const loadSessionsFromLocal = () => {
    const saved = localStorage.getItem('chat_sessions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        sessions.value = parsed
        if (sessions.value.length > 0) {
          const sorted = [...sessions.value].sort((a, b) => b.updatedAt - a.updatedAt)
          currentSessionId.value = sorted[0].id
          loadCurrentSessionMessages()
        } else {
          createNewSession()
        }
      } catch (e) {
        console.error('加载会话失败', e)
        createNewSession()
      }
    } else {
      createNewSession()
    }
  }

  // 加载当前会话的消息和 session_id
  const loadCurrentSessionMessages = () => {
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      messages.value = session.messages
      currentSessionRealId.value = session.sessionId
      // 重新映射 messageId 避免冲突（可选）
      if (messages.value.length) {
        const maxId = Math.max(...messages.value.map((m) => m.id), 0)
        messageId.value = maxId + 1
      } else {
        messageId.value = 100
      }
      scrollToBottom()
    }
  }

  // 更新当前会话的消息（同时保存到 session 和本地）
  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
    messages.value = newMessages
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      session.messages = newMessages
      session.updatedAt = Date.now()
      // 如果会话没有标题且有用户消息，取第一条用户消息作为标题
      if (!session.title) {
        const firstUserMsg = newMessages.find((m) => m.isMe)
        if (firstUserMsg) {
          session.title =
            firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        }
      }
      saveSessionsToLocal()
    }
  }

  // 更新当前会话的 session_id（后端返回的）
  const updateCurrentSessionRealId = (realId: string) => {
    if (!realId) return
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      session.sessionId = realId
      session.updatedAt = Date.now()
      saveSessionsToLocal()
      currentSessionRealId.value = realId
    }
  }

  // 清空当前会话消息（重置为欢迎语）
  const clearCurrentSessionMessages = async () => {
    try {
      await ElMessageBox.confirm('清空当前会话的所有消息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const initialMsgs = initializeMessages()
      updateCurrentSessionMessages(initialMsgs)
      // 重置当前会话的 sessionId
      updateCurrentSessionRealId('')
      ElMessage.success('已清空当前会话')
    } catch {
      // 取消操作
    }
  }

  // ==================== 会话管理 ====================
  // 创建新会话
  const createNewSession = () => {
    const newId = generateSessionId()
    const newSession: Session = {
      id: newId,
      sessionId: '', // 初始为空，等待后端返回
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: initializeMessages() // 使用欢迎语初始化
    }
    sessions.value.unshift(newSession)
    saveSessionsToLocal()
    currentSessionId.value = newId
    loadCurrentSessionMessages()
  }

  // 切换到指定会话
  const switchToSession = (sessionId: string) => {
    if (sessionId === currentSessionId.value) return
    // 保存当前会话的修改（如果有正在进行的请求，取消）
    if (currentController.value) {
      currentController.value.abort()
      currentController.value = null
    }
    isSending.value = false
    currentSessionId.value = sessionId
    loadCurrentSessionMessages()
  }

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    try {
      await ElMessageBox.confirm('确定删除这个会话吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const index = sessions.value.findIndex((s) => s.id === sessionId)
      if (index !== -1) {
        sessions.value.splice(index, 1)
        saveSessionsToLocal()
        if (sessionId === currentSessionId.value) {
          if (sessions.value.length > 0) {
            currentSessionId.value = sessions.value[0].id
            loadCurrentSessionMessages()
          } else {
            createNewSession()
          }
        }
        ElMessage.success('会话已删除')
      }
    } catch {
      // 取消
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
    const userMsg: ChatMessage = {
      id: messageId.value++,
      sender: '我',
      content: text,
      time: formatTime(new Date()),
      isMe: true,
      avatar: meAvatar
    }
    const newMessages = [...messages.value, userMsg]
    updateCurrentSessionMessages(newMessages)
    messageText.value = ''
    scrollToBottom()

    // 添加 AI 占位消息
    const aiMessageId = messageId.value++
    const aiPlaceholder: ChatMessage = {
      id: aiMessageId,
      sender: aiInfo.value.name,
      content: '',
      time: formatTime(new Date()),
      isMe: false,
      avatar: aiAvatar,
      isThinking: true
    }
    updateCurrentSessionMessages([...newMessages, aiPlaceholder])
    scrollToBottom()

    isSending.value = true
    let accumulatedContent = ''

    // 获取当前会话的 sessionId（如果存在）
    const sessionId = currentSessionRealId.value || ''

    // 调用底层通信函数，传入回调
    currentController.value = sendStreamMessage(
      { prompt: text, session_id: sessionId },
      // onData: 接收每个数据块
      (chunk) => {
        accumulatedContent += chunk
        const updatedMessages = [...messages.value]
        const msg = updatedMessages.find((m) => m.id === aiMessageId)
        if (msg) {
          msg.isThinking = false
          msg.content = accumulatedContent
          updateCurrentSessionMessages(updatedMessages)
          scrollToBottom()
        }
      },
      // onMeta - 接收对象 { session_id, user_id }
      (meta) => {
        if (meta?.session_id) {
          updateCurrentSessionRealId(meta.session_id)
          console.log('会话 session_id 已更新:', meta.session_id)
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
        const updatedMessages = [...messages.value]
        const msg = updatedMessages.find((m) => m.id === aiMessageId)
        if (msg) {
          msg.isThinking = false
          msg.content = '抱歉，我遇到了一些问题，暂时无法回答。请稍后再试。'
          updateCurrentSessionMessages(updatedMessages)
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

  const generateSessionId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 8)
  }

  // ==================== 生命周期 ====================
  onMounted(() => {
    loadSessionsFromLocal()
    // 可选：清理可能遗留的错误格式的全局 session_id（兼容旧数据）
    const raw = localStorage.getItem('chat_session_id')
    if (raw && (raw.startsWith('{') || raw === '[object Object]')) {
      localStorage.removeItem('chat_session_id')
    }
  })

  /**
   * 清空聊天记录
   */
  const clearChatHistory = () => {
    messages.value = initializeMessages()
    ElMessage.success('聊天记录已清空')
    scrollToBottom()
  }
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

  //.suggestions {
  //  display: flex;
  //  flex-direction: column;
  //  gap: 8px;
  //  overflow-y: auto;
  //}
  //
  //.suggestion-item {
  //  display: flex;
  //  align-items: flex-start;
  //  gap: 8px;
  //  padding: 12px;
  //  background: #fff;
  //  border: 1px solid #e4e7ed;
  //  border-radius: 8px;
  //  cursor: pointer;
  //  transition: all 0.3s;
  //  font-size: 13px;
  //  color: #606266;
  //
  //  &:hover {
  //    border-color: #409eff;
  //    background: rgba(64, 158, 255, 0.05);
  //  }
  //
  //  .icon {
  //    color: #409eff;
  //    margin-top: 1px;
  //  }
  //}

  // ==================== 历史会话美化 ====================
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0 16px 0;

    .sidebar-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .el-button {
      transition:
        transform 0.2s,
        background 0.2s;
      &:hover {
        transform: scale(1.02);
      }
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: #f0f0f0;
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: #c0c4cc;
      border-radius: 4px;
      &:hover {
        background: #909399;
      }
    }
  }

  .session-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    margin-bottom: 10px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.03),
      0 1px 1px rgba(0, 0, 0, 0.02);
    transition: all 0.25s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 8px 18px rgba(0, 0, 0, 0.05),
        0 2px 4px rgba(0, 0, 0, 0.03);
      background: #fefefe;

      .delete-session-btn {
        opacity: 1;
        transform: scale(1);
      }
    }

    &.active {
      background: linear-gradient(115deg, #ecf5ff 0%, #f0f9ff 100%);
      border-left: 3px solid #409eff;
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);

      .session-title {
        color: #409eff;
        font-weight: 500;
      }
    }

    .session-info {
      flex: 1;
      min-width: 0; // 防止文字溢出
    }

    .session-title {
      font-size: 14px;
      font-weight: 500;
      color: #2c3e50;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-time {
      font-size: 11px;
      color: #9aa6b5;
    }

    .delete-session-btn {
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
      border: none;
      color: #f56c6c;

      &:hover {
        opacity: 1 !important;
        background: #fef0f0;
        color: #f56c6c;
        transform: scale(1);
      }
    }
  }

  .empty-sessions {
    text-align: center;
    padding: 40px 16px;
    color: #bcc4d0;
    font-size: 13px;
    background: #fafbfd;
    border-radius: 20px;
    margin-top: 20px;
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

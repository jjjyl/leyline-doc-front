<!-- AI 智能对话页面 · 明亮炫酷动效版（头像光效优化） -->
<template>
  <div class="chat-page">
    <!-- 动态背景层（明亮版） -->
    <div class="bg-animation">
      <div class="grid-overlay"></div>
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>
      <div class="glow-orb orb-3"></div>
    </div>

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
        <h3 class="section-title"> <span class="title-icon">✨</span> AI 能力 </h3>
        <div class="ability-tags">
          <ElTag v-for="(ability, idx) in aiInfo.abilities" :key="idx" size="small" round>
            {{ ability }}
          </ElTag>
        </div>
      </div>

      <div class="sidebar-header">
        <h3 class="sidebar-title"> <span class="title-icon">💬</span> 历史会话 </h3>
        <el-button
          type="primary"
          size="small"
          plain
          @click="createNewSession"
          class="new-session-btn"
        >
          <el-icon><Plus /></el-icon> 新建
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
        <div v-if="sessions.length === 0" class="empty-sessions">
          <div class="empty-icon">💬</div>
          <p>暂无会话，点击上方新建</p>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="main-chat">
      <!-- 顶部栏 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="header-avatar-wrapper">
            <ElAvatar :size="42" :src="aiInfo.avatar" class="header-avatar" />
            <span class="pulse-ring"></span>
          </div>
          <div class="header-info">
            <div class="header-name">
              <span>{{ aiInfo.name }}</span>
              <ElTag size="small" type="success" effect="dark" round>在线</ElTag>
            </div>
            <div class="header-status">
              <span class="status-dot"></span> 前面的区域，现在就来探索吧！
            </div>
          </div>
        </div>
        <div class="header-actions">
          <ElButton circle plain @click="clearChatHistory" title="清空记录" class="action-btn">
            <ElIcon><Delete /></ElIcon>
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
          <div class="message-avatar-wrapper">
            <ElAvatar :size="40" :src="message.avatar" class="avatar" />
            <span v-if="!message.isMe" class="ai-badge">AI</span>
          </div>
          <div class="message-body">
            <div class="message-meta">
              <span class="message-sender">{{ message.sender }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
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
            <span class="suggestion-icon">💡</span> {{ suggestion }}
          </ElTag>
        </div>

        <div class="input-wrapper">
          <ElInput
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="向 AI 提问... (Ctrl+Enter 发送)"
            resize="none"
            class="modern-input"
            @keydown.ctrl.enter="sendMessage"
            @keydown.meta.enter="sendMessage"
          />
          <div class="input-actions">
            <ElButton
              type="primary"
              :loading="isSending"
              @click="sendMessage"
              class="send-btn"
              circle
            >
              <ElIcon><Promotion /></ElIcon>
            </ElButton>
          </div>
        </div>
        <div class="input-footer">
          <span>💡 AI 生成内容仅供参考，请谨慎判断</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Delete, Promotion, Plus } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import aiAvatar from '@imgs/avatar/Paimon.jpg'
  import meAvatar from '@imgs/avatar/me.jpg'
  import { sendStreamMessage } from '@/api/ai-chat'
  import { ref, onMounted } from 'vue'

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
    id: string
    sessionId: string
    title: string
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

  const quickSuggestions = ref<string[]>([
    '你好，请介绍一下你自己',
    '如何使用这个系统？',
    '帮我分析数据',
    '有什么新功能？'
  ])

  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string>('')
  const loadingSessions = ref(false)
  const messages = ref<ChatMessage[]>([])
  const currentSessionRealId = ref<string>('')
  const isSending = ref(false)
  const messageText = ref('')
  const messageId = ref(100)
  const messageContainer = ref<HTMLElement | null>(null)
  const currentController = ref<AbortController | null>(null)

  // ==================== 工具函数 ====================
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

  const loadCurrentSessionMessages = () => {
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      messages.value = session.messages
      currentSessionRealId.value = session.sessionId
      if (messages.value.length) {
        const maxId = Math.max(...messages.value.map((m) => m.id), 0)
        messageId.value = maxId + 1
      } else {
        messageId.value = 100
      }
      scrollToBottom()
    }
  }

  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
    messages.value = newMessages
    const session = sessions.value.find((s) => s.id === currentSessionId.value)
    if (session) {
      session.messages = newMessages
      session.updatedAt = Date.now()
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

  const clearCurrentSessionMessages = async () => {
    try {
      await ElMessageBox.confirm('清空当前会话的所有消息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const initialMsgs = initializeMessages()
      updateCurrentSessionMessages(initialMsgs)
      updateCurrentSessionRealId('')
      ElMessage.success('已清空当前会话')
    } catch {
      // 取消操作
    }
  }

  const createNewSession = () => {
    const newId = generateSessionId()
    const newSession: Session = {
      id: newId,
      sessionId: '',
      title: '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: initializeMessages()
    }
    sessions.value.unshift(newSession)
    saveSessionsToLocal()
    currentSessionId.value = newId
    loadCurrentSessionMessages()
  }

  const switchToSession = (sessionId: string) => {
    if (sessionId === currentSessionId.value) return
    if (currentController.value) {
      currentController.value.abort()
      currentController.value = null
    }
    isSending.value = false
    currentSessionId.value = sessionId
    loadCurrentSessionMessages()
  }

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

  const sendMessage = async () => {
    const text = messageText.value.trim()
    if (!text || isSending.value) return

    if (currentController.value) {
      currentController.value.abort()
      currentController.value = null
    }

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
    const sessionId = currentSessionRealId.value || ''

    currentController.value = sendStreamMessage(
      { prompt: text, session_id: sessionId },
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
      (meta) => {
        if (meta?.session_id) {
          updateCurrentSessionRealId(meta.session_id)
          console.log('会话 session_id 已更新:', meta.session_id)
        }
      },
      (usage) => {
        isSending.value = false
        currentController.value = null
        if (usage) console.log('Token 使用情况:', usage)
      },
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

  const handleSuggestionClick = (suggestion: string) => {
    messageText.value = suggestion
    sendMessage()
  }

  const generateSessionId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 8)
  }

  const clearChatHistory = () => {
    clearCurrentSessionMessages()
    scrollToBottom()
  }

  onMounted(() => {
    loadSessionsFromLocal()
    const raw = localStorage.getItem('chat_session_id')
    if (raw && (raw.startsWith('{') || raw === '[object Object]')) {
      localStorage.removeItem('chat_session_id')
    }
  })
</script>

<style scoped lang="scss">
  /* ========== 全局与动态背景（明亮主题） ========== */
  .chat-page {
    position: relative;
    display: flex;
    height: calc(100vh - 120px);
    margin: 0;
    padding: 0;
    background: #f0f4fc; /* 明亮底色 */
    overflow: hidden;
    isolation: isolate;
  }

  /* 动态背景层（柔和光效） */
  .bg-animation {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(102, 126, 234, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(102, 126, 234, 0.06) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: grid-drift 30s linear infinite;
  }

  @keyframes grid-drift {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(60px, 60px);
    }
  }

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
    animation: float-orb 20s ease-in-out infinite alternate;
  }

  .orb-1 {
    width: 600px;
    height: 600px;
    background: #a5b4fc;
    top: -250px;
    left: -200px;
    animation-duration: 18s;
  }

  .orb-2 {
    width: 700px;
    height: 700px;
    background: #c4b5fd;
    bottom: -300px;
    right: -200px;
    animation-duration: 25s;
    animation-delay: -5s;
  }

  .orb-3 {
    width: 450px;
    height: 450px;
    background: #93c5fd;
    top: 40%;
    left: 60%;
    animation-duration: 22s;
    animation-delay: -10s;
  }

  @keyframes float-orb {
    0% {
      transform: translate(0, 0) scale(1);
    }
    100% {
      transform: translate(60px, -40px) scale(1.1);
    }
  }

  /* ========== 侧边栏（明亮毛玻璃） ========== */
  .sidebar {
    position: relative;
    z-index: 2;
    width: 320px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-right: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow:
      8px 0 32px -8px rgba(0, 0, 0, 0.05),
      inset -1px 0 0 rgba(255, 255, 255, 0.8);
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 12px 0 40px -8px rgba(102, 126, 234, 0.15);
    }

    @media (max-width: 768px) {
      display: none;
    }
  }

  .ai-profile {
    text-align: center;
    margin-bottom: 28px;
  }

  .avatar-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 12px;

    /* 优化：降低透明度、增加模糊，让头像更清晰 */
    &::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: conic-gradient(from 0deg, #667eea, #a855f7, #3b82f6, #667eea);
      animation: rotate-glow 8s linear infinite;
      opacity: 0.25; /* 从 0.5 降至 0.25 */
      filter: blur(6px); /* 从 2px 增至 6px，光晕更扩散，中心更透 */
      z-index: -1; /* 将光环置于头像下方，进一步减少遮挡 */
    }

    &:hover::before {
      opacity: 0.4;
    }
  }

  @keyframes rotate-glow {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .online-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ef4444;
    border: 2px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 12px #ef4444;

    &.online {
      background: #10b981;
      box-shadow: 0 0 12px #10b981;
    }
  }

  .ai-name {
    font-size: 20px;
    font-weight: 700;
    margin: 8px 0 4px;
    color: #1e293b;
    text-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  }

  .ai-desc {
    font-size: 13px;
    color: #64748b;
    margin-top: 8px;
  }

  .section {
    margin-bottom: 24px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 14px;
    letter-spacing: 0.3px;

    .title-icon {
      font-size: 16px;
    }
  }

  .ability-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    :deep(.el-tag) {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(102, 126, 234, 0.2);
      color: #334155;
      backdrop-filter: blur(4px);
      transition: all 0.2s;

      &:hover {
        background: rgba(102, 126, 234, 0.15);
        border-color: #667eea;
        transform: translateY(-1px);
      }
    }
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0 16px 0;

    .sidebar-title {
      font-size: 15px;
      font-weight: 600;
      color: #475569;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .new-session-btn {
      background: rgba(102, 126, 234, 0.1);
      border: 1px solid rgba(102, 126, 234, 0.3);
      color: #4f46e5;
      backdrop-filter: blur(4px);
      transition: all 0.2s;

      &:hover {
        background: rgba(102, 126, 234, 0.25);
        border-color: #667eea;
        color: #3730a3;
        transform: scale(1.02);
      }
    }
  }

  .session-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.3);
      border-radius: 4px;
      &:hover {
        background: rgba(102, 126, 234, 0.5);
      }
    }
  }

  .session-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    transition: all 0.25s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
      transition: left 0.6s ease;
    }

    &:hover::after {
      left: 100%;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(102, 126, 234, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.08);

      .delete-session-btn {
        opacity: 1;
        transform: scale(1);
      }
    }

    &.active {
      background: linear-gradient(
        115deg,
        rgba(102, 126, 234, 0.12) 0%,
        rgba(168, 85, 247, 0.08) 100%
      );
      border-left: 4px solid #667eea;
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow:
        0 6px 16px rgba(102, 126, 234, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);

      .session-title {
        color: #1e293b;
        font-weight: 600;
      }
    }

    .session-info {
      flex: 1;
      min-width: 0;
    }

    .session-title {
      font-size: 14px;
      font-weight: 500;
      color: #334155;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-time {
      font-size: 11px;
      color: #64748b;
    }

    .delete-session-btn {
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.2s ease;
      background: rgba(239, 68, 68, 0.05);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #dc2626;

      &:hover {
        opacity: 1 !important;
        background: rgba(239, 68, 68, 0.15);
        border-color: #ef4444;
        color: #b91c1c;
        transform: scale(1);
      }
    }
  }

  .empty-sessions {
    text-align: center;
    padding: 40px 16px;
    color: #94a3b8;

    .empty-icon {
      font-size: 32px;
      margin-bottom: 12px;
      opacity: 0.5;
    }
  }

  /* ========== 主聊天区 ========== */
  .main-chat {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 28px;
    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-avatar-wrapper {
    position: relative;

    .pulse-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid #667eea;
      opacity: 0.4;
      animation: pulse-ring 2s ease-out infinite;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 0.4;
    }
    100% {
      transform: scale(1.4);
      opacity: 0;
    }
  }

  .header-avatar {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.6);
  }

  .header-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 16px;
    color: #1e293b;
  }

  .header-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 1.5s infinite;
    }
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

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(102, 126, 234, 0.15);
    color: #475569;
    backdrop-filter: blur(4px);
    transition: all 0.2s;

    &:hover {
      background: rgba(102, 126, 234, 0.15);
      border-color: #667eea;
      color: #4f46e5;
      transform: translateY(-2px);
    }
  }

  /* ========== 消息列表 ========== */
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    background: transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(102, 126, 234, 0.25);
      border-radius: 6px;
      &:hover {
        background: rgba(102, 126, 234, 0.4);
      }
    }
  }

  .message {
    display: flex;
    gap: 16px;
    margin-bottom: 28px;
    animation: message-glide 0.4s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards;

    &.message-ai {
      animation-name: glide-left;
    }
    &.message-me {
      animation-name: glide-right;
      flex-direction: row-reverse;

      .message-body {
        align-items: flex-end;
      }

      .message-bubble {
        background: linear-gradient(145deg, #667eea, #a855f7);
        color: #fff;
        border-radius: 20px 20px 6px 20px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }

    &.message-ai .message-bubble {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
      color: #1e293b;
      border-radius: 20px 20px 20px 6px;
      border: 1px solid rgba(255, 255, 255, 0.6);
      box-shadow:
        0 8px 20px -6px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(102, 126, 234, 0.1) inset;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(135deg, #667eea20, #a855f720);
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.4s;
      }

      &:hover::before {
        opacity: 1;
      }
    }
  }

  @keyframes glide-left {
    0% {
      opacity: 0;
      transform: translateX(-24px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes glide-right {
    0% {
      opacity: 0;
      transform: translateX(24px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .message-avatar-wrapper {
    position: relative;
    flex-shrink: 0;

    .ai-badge {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #667eea;
      color: white;
      font-size: 10px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      border: 2px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .message-body {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }

  .message-sender {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  .message-time {
    font-size: 11px;
    color: #94a3b8;
  }

  .message-bubble {
    padding: 16px 20px;
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
  }

  .message-text {
    white-space: pre-wrap;
  }

  /* ========== 思考动效 ========== */
  .thinking-dots {
    display: flex;
    gap: 8px;
    padding: 8px 4px;

    span {
      width: 10px;
      height: 10px;
      background: linear-gradient(145deg, #667eea, #a855f7);
      border-radius: 50%;
      animation: wave-pulse 1.4s infinite ease-in-out both;
      box-shadow: 0 0 16px #667eea;

      &:nth-child(1) {
        animation-delay: -0.32s;
      }
      &:nth-child(2) {
        animation-delay: -0.16s;
      }
    }
  }

  @keyframes wave-pulse {
    0%,
    60%,
    100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    30% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  /* ========== 输入区域 ========== */
  .input-area {
    padding: 22px 32px;
    border-top: 1px solid rgba(102, 126, 234, 0.1);
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(16px);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
  }

  .quick-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .quick-tag {
    cursor: pointer;
    transition: all 0.25s;
    border-radius: 30px;
    padding: 8px 18px;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(102, 126, 234, 0.15);
    color: #475569;

    .suggestion-icon {
      margin-right: 4px;
    }

    &:hover {
      background: rgba(102, 126, 234, 0.15);
      border-color: #667eea;
      color: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: flex-end;

    :deep(.modern-input) {
      flex: 1;

      .el-textarea__inner {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(12px);
        border: 1.5px solid rgba(102, 126, 234, 0.25);
        border-radius: 28px !important;
        padding: 18px 70px 18px 24px;
        font-size: 15px;
        line-height: 1.5;
        color: #1e293b;
        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        box-shadow:
          0 8px 20px -6px rgba(0, 0, 0, 0.05),
          inset 0 1px 2px rgba(255, 255, 255, 0.8);
        resize: none;

        &::placeholder {
          color: #94a3b8;
        }

        &:focus {
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.9);
          box-shadow:
            0 0 0 4px rgba(102, 126, 234, 0.15),
            0 12px 28px -8px rgba(0, 0, 0, 0.08);
          transform: scale(1.005);
        }
      }
    }

    .input-actions {
      position: absolute;
      right: 10px;
      bottom: 10px;
    }

    .send-btn {
      width: 52px;
      height: 52px;
      border-radius: 52px;
      background: linear-gradient(145deg, #667eea, #a855f7);
      border: none;
      box-shadow:
        0 10px 24px -6px rgba(102, 126, 234, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.2) inset;
      transition: all 0.25s ease;
      color: white;

      &:hover {
        transform: scale(1.08) rotate(8deg);
        box-shadow:
          0 16px 32px -8px rgba(168, 85, 247, 0.5),
          0 0 0 2px rgba(255, 255, 255, 0.3) inset;
      }

      .el-icon {
        font-size: 24px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    }
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 14px;
    font-size: 12px;
    color: #64748b;
  }

  /* ========== 响应式 ========== */
  @media (max-width: 768px) {
    .message-body {
      max-width: 85%;
    }

    .input-area {
      padding: 16px 20px;
    }
  }
</style>

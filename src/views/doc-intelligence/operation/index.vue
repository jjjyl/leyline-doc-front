<template>
  <div class="doc-operation-container">
    <div class="ai-chat-layout">
      <!-- 左侧：指令输入区 -->
      <div class="instruction-panel glass-effect">
        <div class="panel-header">
          <div class="header-icon">🤖</div>
          <h2 class="panel-title">文档智能操作</h2>
          <div class="status-indicator">
            <span class="status-dot online"></span>
            <span class="status-text">AI就绪</span>
          </div>
        </div>

        <div class="instruction-input-area">
          <el-form :model="form" label-width="0">
            <el-form-item>
              <div class="input-wrapper">
                <el-input
                  v-model="form.instruction"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入自然语言指令，如：提取这份合同中的甲方名称和合同金额"
                  class="ai-input"
                  @keyup.enter.ctrl="executeInstruction"
                />
                <div class="input-actions">
                  <el-button
                    type="primary"
                    @click="executeInstruction"
                    :loading="executing"
                    class="execute-btn"
                  >
                    <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />
                    {{ executing ? '执行中...' : '执行指令' }}
                  </el-button>
                  <el-button @click="clearInstruction" class="clear-btn">
                    <ArtSvgIcon icon="ri:delete-bin-line" />
                  </el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <div class="common-commands">
          <h3 class="section-title">
            <ArtSvgIcon icon="ri:lightbulb-flash-line" class="title-icon" />
            常用指令
          </h3>
          <div class="commands-grid">
            <div
              v-for="(cmd, index) in commonCommands"
              :key="index"
              class="command-chip"
              @click="selectCommand(cmd)"
            >
              <span class="chip-icon">{{ getCommandIcon(index) }}</span>
              <span class="chip-text">{{ cmd }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：结果展示区 -->
      <div class="result-panel">
        <div class="result-card glass-effect">
          <div class="result-header">
            <h3 class="result-title">
              <ArtSvgIcon icon="ri:sparkling-2-line" class="title-icon" />
              操作结果
            </h3>
            <el-tag v-if="result" type="success" effect="dark" class="result-status">
              ✓ 已完成
            </el-tag>
          </div>

          <div class="result-content" v-loading="executing">
            <Transition name="fade-slide">
              <div v-if="result" class="result-display bounce-in">
                <pre class="result-text">{{ result }}</pre>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">💭</div>
                <p class="empty-text">等待指令...</p>
                <p class="empty-hint">在左侧输入指令或选择常用指令</p>
              </div>
            </Transition>
          </div>
        </div>

        <div class="history-card glass-effect">
          <div class="history-header">
            <h3 class="history-title">
              <ArtSvgIcon icon="ri:history-line" class="title-icon" />
              操作历史
            </h3>
            <div class="history-actions">
              <el-button size="small" text @click="exportHistory">
                <ArtSvgIcon icon="ri:download-line" class="mr-1" />
                导出
              </el-button>
            </div>
          </div>

          <div class="history-list">
            <TransitionGroup name="list-animate">
              <div
                v-for="(item, index) in history"
                :key="index"
                class="history-item"
              >
                <div class="item-header">
                  <div class="item-time">
                    <ArtSvgIcon icon="ri:time-line" class="time-icon" />
                    {{ item.time }}
                  </div>
                  <el-button
                    size="small"
                    text
                    type="danger"
                    @click="deleteHistory(index)"
                    class="delete-btn"
                  >
                    <ArtSvgIcon icon="ri:close-circle-line" />
                  </el-button>
                </div>
                <div class="item-content">
                  <div class="item-instruction">
                    <span class="label">指令：</span>
                    <span class="value">{{ item.instruction }}</span>
                  </div>
                  <div class="item-result">
                    <span class="label">结果：</span>
                    <span class="value">{{ item.result }}</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <div v-if="history.length === 0" class="history-empty">
              <div class="empty-icon">📋</div>
              <p>暂无历史记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { executeOperation } from '@/api/operation'

  const form = reactive({
    instruction: ''
  })

  const commonCommands = [
    '提取这份合同中的甲方名称和合同金额',
    '将文档字体调整为宋体，小四号',
    '删除文档中所有空白行',
    '将文档所有段落设置为两端对齐',
    '提取文档中的所有日期信息',
    '将表格数据转换为JSON格式'
  ]

  const result = ref('')
  const executing = ref(false)
  const history = ref<
    Array<{
      instruction: string
      result: string
      time: string
    }>
  >([])

  const getCommandIcon = (index: number) => {
    const icons = ['📄', '🔤', '🧹', '📐', '📅', '📊']
    return icons[index] || '💡'
  }

  // 执行指令
  const executeInstruction = async () => {
    if (!form.instruction.trim()) {
      ElMessage.warning('请输入指令')
      return
    }

    executing.value = true
    try {
      ElMessage.info('正在处理指令...')

      const response = await executeOperation({
        instruction: form.instruction
      })

      result.value = response.data.result || '指令执行完成'
      addToHistory(form.instruction, result.value)

      ElMessage.success('指令执行完成')
    } catch (error) {
      ElMessage.error('指令执行失败: ' + (error.message || '未知错误'))
      result.value = '执行失败：' + (error.message || '未知错误')
    } finally {
      executing.value = false
    }
  }

  // 清空指令
  const clearInstruction = () => {
    form.instruction = ''
    result.value = ''
  }

  // 选择常用指令
  const selectCommand = (command: string) => {
    form.instruction = command
  }

  // 添加到历史记录
  const addToHistory = (instruction: string, resultText: string) => {
    history.value.unshift({
      instruction: instruction.length > 50 ? instruction.substring(0, 50) + '...' : instruction,
      result: resultText.length > 100 ? resultText.substring(0, 100) + '...' : resultText,
      time: new Date().toLocaleString()
    })

    if (history.value.length > 10) {
      history.value = history.value.slice(0, 10)
    }
  }

  // 删除历史记录
  const deleteHistory = (index: number) => {
    history.value.splice(index, 1)
    ElMessage.success('历史记录已删除')
  }

  // 导出历史记录
  const exportHistory = () => {
    const data = history.value.map((item) => ({
      指令: item.instruction,
      结果: item.result,
      时间: item.time
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'operation_history.json'
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('历史记录已导出')
  }
</script>

<style scoped>
  .doc-operation-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .ai-chat-layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 24px;
    max-width: 1600px;
    margin: 0 auto;
  }

  /* 左侧面板 */
  .instruction-panel {
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    height: fit-content;
    position: sticky;
    top: 24px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(64, 158, 255, 0.1);
  }

  .header-icon {
    font-size: 32px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .panel-title {
    flex: 1;
    font-size: 20px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 12px;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .status-dot.online {
    background: #4caf50;
    box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }

  .status-text {
    font-size: 12px;
    color: #4caf50;
    font-weight: 600;
  }

  .instruction-input-area {
    margin-bottom: 24px;
  }

  .input-wrapper {
    position: relative;
  }

  .ai-input :deep(.el-textarea__inner) {
    border-radius: 12px;
    border: 2px solid rgba(64, 158, 255, 0.2);
    transition: all 0.3s;
    font-size: 14px;
    line-height: 1.6;
  }

  .ai-input :deep(.el-textarea__inner):focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .execute-btn {
    flex: 1;
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s;
  }

  .execute-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .clear-btn {
    border-radius: 10px;
  }

  .common-commands {
    margin-top: 24px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .title-icon {
    font-size: 18px;
    color: #667eea;
  }

  .commands-grid {
    display: grid;
    gap: 10px;
  }

  .command-chip {
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .command-chip:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-color: #667eea;
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .chip-icon {
    font-size: 18px;
  }

  .chip-text {
    flex: 1;
    font-size: 13px;
    color: #555;
    line-height: 1.5;
  }

  /* 右侧面板 */
  .result-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .result-card,
  .history-card {
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .result-header,
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(64, 158, 255, 0.1);
  }

  .result-title,
  .history-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .result-content {
    min-height: 200px;
  }

  .result-display {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }

  .result-text {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.8;
    color: #333;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #999;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 13px;
    margin: 0;
    opacity: 0.7;
  }

  .history-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .history-item {
    padding: 16px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 12px;
    margin-bottom: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .item-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #999;
  }

  .time-icon {
    font-size: 14px;
  }

  .delete-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .history-item:hover .delete-btn {
    opacity: 1;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .item-instruction,
  .item-result {
    display: flex;
    gap: 8px;
    font-size: 13px;
    line-height: 1.6;
  }

  .label {
    color: #666;
    font-weight: 600;
    flex-shrink: 0;
  }

  .value {
    color: #333;
    flex: 1;
  }

  .history-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
  }

  .history-empty .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  /* 动画 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  .list-animate-enter-active,
  .list-animate-leave-active {
    transition: all 0.3s ease;
  }

  .list-animate-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }

  .list-animate-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .ai-chat-layout {
      grid-template-columns: 1fr;
    }

    .instruction-panel {
      position: static;
    }
  }
</style>

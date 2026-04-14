<template>
  <div class="data-filling-container">
    <div class="filling-workspace">
      <!-- 顶部配置面板 -->
      <div class="config-panel glass-effect">
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon-wrapper">
              <div class="icon-bg"></div>
              <span class="header-icon">📊</span>
            </div>
            <div class="header-text">
              <h2 class="panel-title">多文档智能提表</h2>
              <p class="panel-subtitle">基于自然语言指令，从多个文档中提取结构化表格数据（流式）</p>
            </div>
          </div>
          <div class="header-badge">
            <el-tag type="success" effect="dark" size="large" class="ai-badge">
              <ArtSvgIcon icon="ri:sparkling-2-fill" class="mr-1 sparkle-icon" />
              AI 驱动
            </el-tag>
          </div>
        </div>

        <el-form :model="extractForm" label-width="0" class="extract-form">
          <div class="selection-grid">
            <div class="select-card">
              <label class="card-label">
                <ArtSvgIcon icon="ri:file-copy-line" class="label-icon" />
                <span>选择模板</span>
              </label>
              <el-select
                v-model="extractForm.templateIds"
                multiple
                filterable
                placeholder="请选择一个或多个模板文档"
                class="modern-select"
              >
                <el-option
                  v-for="template in templates"
                  :key="template.id"
                  :label="template.name"
                  :value="template.id"
                >
                  <div class="option-content">
                    <ArtSvgIcon icon="ri:file-word-2-line" class="option-icon" />
                    <span>{{ template.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="select-card">
              <label class="card-label">
                <ArtSvgIcon icon="ri:database-2-line" class="label-icon" />
                <span>选择数据源</span>
              </label>
              <el-select
                v-model="extractForm.docIds"
                multiple
                filterable
                placeholder="请选择一个或多个数据源文档"
                class="modern-select"
              >
                <el-option
                  v-for="source in dataSources"
                  :key="source.id"
                  :label="source.name"
                  :value="source.id"
                >
                  <div class="option-content">
                    <ArtSvgIcon :icon="getDocIcon(source.name)" class="option-icon" />
                    <span>{{ source.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
          </div>

          <div class="prompt-section">
            <label class="section-label">
              <ArtSvgIcon icon="ri:lightbulb-flash-line" class="label-icon" />
              <span>自然语言指令</span>
            </label>
            <el-input
              v-model="extractForm.userPrompt"
              type="textarea"
              :rows="4"
              placeholder="例如：提取每个省份的名称、人均GDP、人口数量、每日核酸检测数"
              class="prompt-input"
            />
            <p class="prompt-hint">
              <ArtSvgIcon icon="ri:information-line" class="hint-icon" />
              使用自然语言描述您想提取的字段，AI会自动理解并执行（流式实时返回）
            </p>
          </div>

          <div class="action-area">
            <el-button
              type="primary"
              @click="handleExtract"
              :loading="extracting"
              class="extract-btn"
              size="large"
            >
              <ArtSvgIcon
                :icon="extracting ? 'ri:loader-4-line' : 'ri:play-circle-fill'"
                class="btn-icon"
                :class="{ rotating: extracting }"
              />
              <span>{{ extracting ? '提取中...' : '开始提取' }}</span>
            </el-button>
            <el-button @click="clearResults" class="clear-results-btn">
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              清空结果
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 提取结果展示 -->
      <Transition name="slide-down">
        <div v-if="extractResults.length > 0" class="results-panel glass-effect">
          <div class="results-header">
            <div class="header-left">
              <h3 class="results-title">
                <ArtSvgIcon icon="ri:table-alt-line" class="title-icon" />
                提取结果
              </h3>
              <el-tag type="success" effect="dark" size="small" class="result-count">
                {{ extractResults.length }} 个表格
              </el-tag>
            </div>
          </div>

          <el-tabs v-model="activeTab" type="border-card" class="result-tabs">
            <el-tab-pane
              v-for="(table, idx) in extractResults"
              :key="idx"
              :label="`表格 ${idx + 1}`"
              :name="idx.toString()"
            >
              <div class="table-container">
                <el-table :data="table.rows" border stripe class="result-table">
                  <el-table-column
                    v-for="col in table.columns"
                    :key="col"
                    :prop="col"
                    :label="col"
                    min-width="120"
                    show-overflow-tooltip
                  />
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </Transition>

      <div
        v-if="extractedOnce && extractResults.length === 0 && !extracting"
        class="empty-state glass-effect"
      >
        <div class="empty-animation">
          <div class="empty-icon">📭</div>
          <div class="pulse-ring"></div>
        </div>
        <p class="empty-text">暂无提取结果</p>
        <p class="empty-hint">请选择模板、数据源并输入指令后点击“开始提取”</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getDocList } from '@/api/doc'
  import { getTemplateList } from '@/api/templates'
  // 不再直接使用 extractSpecifiedTables，改为流式 fetch
  // import { extractSpecifiedTables } from '@/api/table'

  // 表单数据
  const extractForm = reactive({
    templateIds: [] as number[],
    docIds: [] as number[],
    userPrompt: ''
  })

  // 模板列表（来自模板接口）
  const templates = ref<{ id: number; name: string }[]>([])
  // 数据源列表（来自文档接口）
  const dataSources = ref<{ id: number; name: string }[]>([])

  // 提取状态
  const extracting = ref(false)
  const extractResults = ref<{ columns: string[]; rows: any[] }[]>([])
  const extractedOnce = ref(false)
  const activeTab = ref('0')

  // 用于中断流式请求
  let abortController: AbortController | null = null

  // 辅助函数：获取 token（根据项目实际存储方式调整）
  const getAuthToken = () => {
    // 示例：从 localStorage 获取，实际请使用项目中的 auth 模块
    return localStorage.getItem('token') || ''
  }

  // 辅助函数：获取文档图标
  const getDocIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'docx') return 'ri:file-word-2-line'
    if (ext === 'xlsx') return 'ri:file-excel-2-line'
    return 'ri:file-line'
  }

  // 加载模板和数据源
  const loadDocuments = async () => {
    try {
      // 1. 加载模板列表
      const templateRes = await getTemplateList()
      const templatesList = templateRes.templates || []
      templates.value = templatesList.map((item: any) => ({
        id: item.id,
        name: item.name
      }))

      // 2. 加载数据源
      const docsRes = await getDocList(undefined, undefined)
      const docsList = docsRes.docs || []
      dataSources.value = docsList.map((doc: any) => ({
        id: doc.id,
        name: doc.name
      }))
    } catch (error) {
      console.error('加载数据失败', error)
      ElMessage.error('加载数据失败')
    }
  }

  // 开始提取（流式）
  const handleExtract = async () => {
    if (extractForm.templateIds.length === 0) {
      ElMessage.warning('请至少选择一个模板文档')
      return
    }
    if (extractForm.docIds.length === 0) {
      ElMessage.warning('请至少选择一个数据源文档')
      return
    }
    if (!extractForm.userPrompt.trim()) {
      ElMessage.warning('请输入自然语言指令')
      return
    }

    // 如果已有进行中的请求，先中断
    if (abortController) {
      abortController.abort()
    }

    // 重置状态
    extracting.value = true
    extractedOnce.value = true
    extractResults.value = [] // 清空旧结果
    activeTab.value = '0'

    // 用于存储 schema 映射：schema_id -> 表格在 extractResults 中的索引
    const schemaMap = new Map<number, number>()
    // 用于暂存未找到对应 schema 的 row（理论上不会出现，但做防御）
    const pendingRows: { schemaId: number; cells: string[] }[] = []

    // 创建 AbortController
    abortController = new AbortController()

    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || ''
      const url = `${baseURL}/api/table/extract-specified`
      const token = getAuthToken()

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doc_ids: extractForm.docIds,
          template_ids: extractForm.templateIds,
          user_prompt: extractForm.userPrompt
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('当前浏览器不支持流式响应')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = '' // 用于存储不完整的行

      // 逐块读取流
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 将新数据追加到缓冲区
        buffer += decoder.decode(value, { stream: true })
        // 按换行符分割
        const lines = buffer.split('\n')
        // 最后一行可能不完整，保留到下一次
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const message = JSON.parse(line)
            await processStreamMessage(message, schemaMap, pendingRows)
          } catch (e) {
            console.warn('解析流消息失败:', line, e)
          }
        }
      }

      // 处理最后可能剩余的不完整行
      if (buffer.trim()) {
        try {
          const message = JSON.parse(buffer)
          await processStreamMessage(message, schemaMap, pendingRows)
        } catch (e) {
          console.warn('解析最后一条消息失败:', buffer, e)
        }
      }

      // 流正常结束，未收到 done 事件也认为完成
      ElMessage.success(`提取完成，共 ${extractResults.value.length} 个表格`)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('流式请求已中断')
        ElMessage.info('提取已取消')
      } else {
        console.error('流式提取失败:', error)
        ElMessage.error(error.message || '提取失败，请检查后端服务')
      }
    } finally {
      extracting.value = false
      abortController = null
      // 如果没有任何表格数据，提示空结果
      if (extractResults.value.length === 0 && extractedOnce.value) {
        ElMessage.info('未提取到任何表格数据')
      }
    }
  }

  // 处理流式消息（info, data, done）
  const processStreamMessage = async (
    message: any,
    schemaMap: Map<number, number>,
    pendingRows: { schemaId: number; cells: string[] }[]
  ) => {
    const { event, data } = message
    if (event === 'info') {
      // 可选：控制台输出或轻提示（避免频繁弹窗）
      console.log('[Info]', data)
      return
    }

    if (event === 'done') {
      console.log('[Done] 提取结束')
      return
    }

    if (event === 'data' && data) {
      let payload: any
      try {
        // data 字段是一个 JSON 字符串，需要二次解析
        payload = typeof data === 'string' ? JSON.parse(data) : data
      } catch (e) {
        console.warn('解析 data 字段失败:', data, e)
        return
      }

      const { type } = payload
      if (type === 'schema') {
        // 处理表结构
        const schemas = payload.schema // 数组，每个元素包含 name, fields 等
        if (Array.isArray(schemas)) {
          for (let idx = 0; idx < schemas.length; idx++) {
            const schemaItem = schemas[idx]
            const fields = schemaItem.fields || []
            const columns = fields.map((field: any) => field.name)
            const newTable = {
              columns,
              rows: []
            }
            extractResults.value.push(newTable)
            // 映射 schema_id 到表格索引
            schemaMap.set(idx, extractResults.value.length - 1)
          }
        }
      } else if (type === 'row') {
        // 处理行数据
        const { table } = payload
        if (table && typeof table.schema_id === 'number') {
          const schemaId = table.schema_id
          const rowCells = table.row?.cells || []
          const tableIndex = schemaMap.get(schemaId)
          if (tableIndex !== undefined) {
            const targetTable = extractResults.value[tableIndex]
            if (targetTable) {
              const rowObj: Record<string, string> = {}
              targetTable.columns.forEach((col, colIdx) => {
                rowObj[col] = rowCells[colIdx] || ''
              })
              targetTable.rows.push(rowObj)
            }
          } else {
            // 防御：暂存未找到 schema 的行（理论上不会发生）
            pendingRows.push({ schemaId, cells: rowCells })
          }
        }
      }
    }
  }

  // 清空结果，并中断正在进行的请求
  const clearResults = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      extracting.value = false
    }
    extractResults.value = []
    extractedOnce.value = false
    activeTab.value = '0'
  }

  onMounted(() => {
    loadDocuments()
  })

  onUnmounted(() => {
    // 组件卸载时中断请求
    if (abortController) {
      abortController.abort()
    }
  })
</script>

<style scoped>
  /* 样式保持不变，省略... 实际使用时保留原样式 */
  .data-filling-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  }

  .filling-workspace {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border-radius: 24px;
  }

  .config-panel {
    padding: 32px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-icon-wrapper {
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    border-radius: 16px;
    animation: pulse-bg 2s ease-in-out infinite;
  }

  @keyframes pulse-bg {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }

  .header-icon {
    font-size: 36px;
    position: relative;
    z-index: 1;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .panel-title {
    font-size: 26px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }

  .panel-subtitle {
    font-size: 14px;
    color: #666;
    margin: 4px 0 0;
  }

  .ai-badge {
    border-radius: 12px;
    padding: 8px 16px;
    font-weight: 600;
  }

  .sparkle-icon {
    animation: sparkle 2s ease-in-out infinite;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.2);
    }
  }

  /* 表单样式 */
  .selection-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    margin-bottom: 28px;
  }

  .select-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #555;
  }

  .label-icon {
    font-size: 18px;
    color: #667eea;
  }

  .modern-select {
    width: 100%;
  }
  .modern-select :deep(.el-input__wrapper) {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
    padding: 10px 14px;
  }
  .modern-select :deep(.el-input__wrapper):hover {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  .modern-select :deep(.el-input__wrapper).is-focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }

  .option-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .option-icon {
    font-size: 18px;
    color: #667eea;
  }

  /* 提示区域 */
  .prompt-section {
    margin-bottom: 28px;
  }
  .section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #555;
    margin-bottom: 12px;
  }
  .prompt-input :deep(.el-textarea__inner) {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
    font-size: 14px;
    line-height: 1.6;
  }
  .prompt-input :deep(.el-textarea__inner):hover {
    border-color: #667eea;
  }
  .prompt-input :deep(.el-textarea__inner):focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  .prompt-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 10px 14px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    font-size: 13px;
    color: #666;
  }
  .hint-icon {
    color: #667eea;
    font-size: 16px;
  }

  /* 操作按钮 */
  .action-area {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 32px;
  }
  .extract-btn {
    border-radius: 14px;
    padding: 16px 40px;
    font-size: 17px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }
  .extract-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(102, 126, 234, 0.45);
  }
  .clear-results-btn {
    border-radius: 12px;
    padding: 14px 32px;
    font-weight: 600;
    transition: all 0.3s;
  }
  .clear-results-btn:hover {
    transform: translateY(-2px);
    background: rgba(255, 152, 0, 0.1);
    border-color: #ff9800;
    color: #ff9800;
  }
  .btn-icon {
    font-size: 20px;
  }
  .rotating {
    animation: rotate 1s linear infinite;
  }
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 结果面板 */
  .results-panel {
    padding: 28px;
  }
  .results-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .results-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  .title-icon {
    font-size: 22px;
    color: #667eea;
  }
  .result-count {
    border-radius: 8px;
  }
  .result-tabs {
    border-radius: 16px;
    overflow: hidden;
  }
  .table-container {
    max-height: 600px;
    overflow-y: auto;
  }
  .result-table {
    border-radius: 12px;
  }

  .empty-state {
    padding: 60px 20px;
    text-align: center;
  }
  .empty-animation {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
  }
  .empty-icon {
    font-size: 64px;
    opacity: 0.5;
  }
  .pulse-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    border: 3px solid rgba(102, 126, 234, 0.2);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;
  }
  @keyframes pulse-ring {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.3);
      opacity: 0;
    }
  }
  .empty-text {
    font-size: 17px;
    font-weight: 600;
    color: #666;
    margin: 0 0 8px;
  }
  .empty-hint {
    font-size: 14px;
    color: #999;
  }

  /* 动画过渡 */
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .slide-down-enter-from {
    opacity: 0;
    transform: translateY(-30px);
  }
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }

  @media (max-width: 768px) {
    .selection-grid {
      grid-template-columns: 1fr;
    }
    .action-area {
      flex-direction: column;
    }
    .extract-btn,
    .clear-results-btn {
      width: 100%;
    }
  }
</style>

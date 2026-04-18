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
                <!-- 原 el-table 替换为 vxe-table -->
                <vxe-table
                  :data="table.rows"
                  height="500"
                  :scroll-y="{ enabled: true, gt: 50 }"
                  border
                  stripe
                >
                  <vxe-column
                    v-for="col in table.columns"
                    :key="col"
                    :field="col"
                    :title="col"
                    min-width="120"
                    show-overflow-tooltip
                  />
                </vxe-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </Transition>

      <!-- 新增：提取历史面板 -->
      <div class="history-panel glass-effect" v-if="extractionHistory.length > 0">
        <div class="panel-header">
          <div class="header-left">
            <h3 class="panel-title">
              <ArtSvgIcon icon="ri:history-line" class="title-icon" />
              提取历史
            </h3>
            <el-tag type="info" effect="plain" class="count-badge">
              {{ extractionHistory.length }} 个表格
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="success" size="small" @click="exportHistory" class="action-btn">
              <ArtSvgIcon icon="ri:download-line" />
              导出历史
            </el-button>
            <el-button type="danger" size="small" @click="clearHistory" class="action-btn">
              <ArtSvgIcon icon="ri:delete-bin-line" />
              清空历史
            </el-button>
          </div>
        </div>
        <vxe-table
          :data="extractionHistory"
          height="400"
          :scroll-y="{ enabled: true, gt: 20 }"
          border
          stripe
        >
          <vxe-column field="tableName" title="表格名称" min-width="180" show-overflow-tooltip />
          <vxe-column
            field="dataSources"
            title="数据源文档"
            min-width="200"
            show-overflow-tooltip
          />
          <vxe-column field="templates" title="模板文档" min-width="200" show-overflow-tooltip />
          <vxe-column field="rowCount" title="行数" width="80" align="center" />
          <vxe-column field="colCount" title="列数" width="80" align="center" />
          <vxe-column field="extractTime" title="提取时间" width="160" />
          <vxe-column title="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="viewTableDetail(row)">
                查看详情
              </el-button>
            </template>
          </vxe-column>
        </vxe-table>
      </div>

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

    <!-- 表格详情对话框 -->
    <el-dialog
      v-model="tableDialogVisible"
      :title="`表格详情：${currentTable.title || '未命名'}`"
      width="80%"
      destroy-on-close
      class="table-detail-dialog"
    >
      <vxe-table
        :data="currentTable.rows"
        height="500"
        :scroll-y="{ enabled: true, gt: 50 }"
        border
        stripe
      >
        <vxe-column
          v-for="col in currentTable.columns"
          :key="col"
          :field="col"
          :title="col"
          min-width="120"
          show-overflow-tooltip
        />
      </vxe-table>
      <template #footer>
        <el-button type="primary" @click="exportCurrentTable">导出 Excel</el-button>
        <el-button @click="tableDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getDocList } from '@/api/doc'
  import { getTemplateList } from '@/api/templates'
  import { exportToExcel } from '@/utils/export'

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

  // ---------- 批量更新缓冲机制 ----------
  // 缓冲区：存储每个表格待追加的行数据 (key: 表格索引, value: 行对象数组)
  const pendingRowsMap = new Map<number, any[]>()
  let batchUpdateTimer: number | null = null
  // 批量更新间隔（毫秒），可根据实际情况调整（50~150ms 较平滑）
  const BATCH_UPDATE_INTERVAL = 50
  // 最大积累行数，达到后立即刷新（防止数据积压过多导致最后一次性渲染太多）
  const MAX_PENDING_ROWS = 200

  // 启动批量更新定时器
  const startBatchUpdater = () => {
    if (batchUpdateTimer) return
    batchUpdateTimer = window.setInterval(() => {
      flushPendingRows()
    }, BATCH_UPDATE_INTERVAL)
  }

  // 停止批量更新定时器并清空缓冲区
  const stopBatchUpdater = () => {
    if (batchUpdateTimer) {
      clearInterval(batchUpdateTimer)
      batchUpdateTimer = null
    }
    // 最后一次刷新缓冲区（确保剩余数据被渲染）
    flushPendingRows()
  }

  // 将缓冲区中的行批量追加到表格中
  const flushPendingRows = () => {
    if (pendingRowsMap.size === 0) return
    for (const [tableIdx, rows] of pendingRowsMap.entries()) {
      if (rows.length === 0) continue
      const targetTable = extractResults.value[tableIdx]
      if (targetTable) {
        // 使用 push(...rows) 批量追加，只触发一次响应式更新
        targetTable.rows.push(...rows)
      }
      // 清空该表对应的缓冲区
      pendingRowsMap.set(tableIdx, [])
    }
  }

  // 向缓冲区添加一行
  const addRowToBuffer = (tableIndex: number, rowObj: Record<string, string>) => {
    if (!pendingRowsMap.has(tableIndex)) {
      pendingRowsMap.set(tableIndex, [])
    }
    const rows = pendingRowsMap.get(tableIndex)!
    rows.push(rowObj)
    // 若积压行数超过阈值，立即刷新，避免内存积压过多
    if (rows.length >= MAX_PENDING_ROWS) {
      flushPendingRows()
    }
  }

  // ---------- 新增：提取历史管理 ----------
  interface HistoryItem {
    id: string // 唯一标识
    tableName: string // 表格名称（取自 schema.name）
    dataSources: string // 数据源文档名称（逗号拼接）
    templates: string // 模板文档名称（逗号拼接）
    rowCount: number
    colCount: number
    extractTime: string
    tableData: { columns: string[]; rows: any[] } // 完整表格数据
  }
  const extractionHistory = ref<HistoryItem[]>([])
  const tableDialogVisible = ref(false)
  const currentTable = ref<{ title: string; columns: string[]; rows: any[] }>({
    title: '',
    columns: [],
    rows: []
  })

  // 生成唯一ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 8)}`

  // 添加表格到历史记录（自动去重：相同表格名称+数据源+模板视为同一表格，覆盖更新）
  const addToHistory = (tableItem: { columns: string[]; rows: any[] }, schemaName: string) => {
    const dataSourceNames = extractForm.docIds
      .map((id) => dataSources.value.find((ds) => ds.id === id)?.name || `文档${id}`)
      .join(', ')
    const templateNames = extractForm.templateIds
      .map((id) => templates.value.find((t) => t.id === id)?.name || `模板${id}`)
      .join(', ')
    const key = `${schemaName}|${dataSourceNames}|${templateNames}`
    const existingIndex = extractionHistory.value.findIndex(
      (item) => `${item.tableName}|${item.dataSources}|${item.templates}` === key
    )
    const newItem: HistoryItem = {
      id: generateId(),
      tableName: schemaName,
      dataSources: dataSourceNames,
      templates: templateNames,
      rowCount: tableItem.rows.length,
      colCount: tableItem.columns.length,
      extractTime: new Date().toLocaleString(),
      tableData: { columns: tableItem.columns, rows: [...tableItem.rows] }
    }
    if (existingIndex !== -1) {
      extractionHistory.value[existingIndex] = newItem
    } else {
      extractionHistory.value.unshift(newItem) // 最新在上
    }
  }

  // 查看表格详情
  const viewTableDetail = (item: HistoryItem) => {
    currentTable.value = {
      title: item.tableName,
      columns: item.tableData.columns,
      rows: item.tableData.rows
    }
    tableDialogVisible.value = true
  }

  // 导出历史记录
  const exportHistory = () => {
    if (extractionHistory.value.length === 0) {
      ElMessage.warning('暂无历史记录')
      return
    }
    const exportData = extractionHistory.value.map(({ id, tableData, ...rest }) => rest)
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extraction_history_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('历史记录已导出')
  }

  // 清空历史记录（同时清空当前提取结果）
  const clearHistory = () => {
    extractionHistory.value = []
    extractResults.value = []
    extractedOnce.value = false
    activeTab.value = '0'
    ElMessage.success('历史记录已清空')
  }

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

  // 处理流式消息（修改：在 schema 处理时记录表格名称，在 row 收集完成后不自动加入历史，等待 done 时统一加入）
  let currentExtractSchemas: Array<{ name: string; tableIndex: number }> = [] // 存储本次提取的表格名称与 extractResults 索引的对应

  const processStreamMessage = async (
    message: any,
    schemaMap: Map<number, number>,
    pendingRows: { schemaId: number; cells: string[] }[]
  ) => {
    const { event, data } = message
    if (event === 'info') {
      console.log('[Info]', data)
      return
    }
    if (event === 'done') {
      console.log('[Done] 提取结束')
      // 处理所有尚未匹配的 pendingRows（兜底）
      if (pendingRows.length > 0) {
        console.warn(`[Done] 尚有 ${pendingRows.length} 行未匹配到 schema，尝试重新匹配`)
        for (const pending of pendingRows) {
          const tableIndex = schemaMap.get(pending.schemaId)
          if (tableIndex !== undefined) {
            const targetTable = extractResults.value[tableIndex]
            if (targetTable) {
              const rowObj: Record<string, string> = {}
              targetTable.columns.forEach((col, colIdx) => {
                rowObj[col] = pending.cells[colIdx] || ''
              })
              addRowToBuffer(tableIndex, rowObj)
            }
          } else {
            console.error(`无法匹配 schema_id ${pending.schemaId}，行数据丢失`, pending.cells)
          }
        }
        // 清空 pendingRows
        pendingRows.length = 0
      }
      // 强制刷新所有缓冲区
      flushPendingRows()
      // 将本次所有表格加入历史记录
      for (const schema of currentExtractSchemas) {
        const tableData = extractResults.value[schema.tableIndex]
        if (tableData && tableData.rows.length > 0) {
          addToHistory(tableData, schema.name)
        }
      }
      currentExtractSchemas = []
      stopBatchUpdater()
      return
    }
    if (event === 'data' && data) {
      let payload: any
      try {
        payload = typeof data === 'string' ? JSON.parse(data) : data
      } catch (e) {
        console.warn('解析 data 字段失败:', data, e)
        return
      }
      const { type } = payload
      if (type === 'schema') {
        const schemas = payload.schema
        if (Array.isArray(schemas)) {
          for (let idx = 0; idx < schemas.length; idx++) {
            const schemaItem = schemas[idx]
            const fields = schemaItem.fields || []
            const columns = fields.map((field: any) => field.name)
            const newTable = { columns, rows: [] }
            extractResults.value.push(newTable)
            const tableIndex = extractResults.value.length - 1
            // 假设后端 schema_id 与数组索引一致（0,1,2...）
            schemaMap.set(idx, tableIndex)
            currentExtractSchemas.push({
              name: schemaItem.name || `表格${idx + 1}`,
              tableIndex
            })
            // 处理等待该 schema_id 的 pendingRows
            const matchedIndices: number[] = []
            for (let i = 0; i < pendingRows.length; i++) {
              if (pendingRows[i].schemaId === idx) {
                const rowCells = pendingRows[i].cells
                const rowObj: Record<string, string> = {}
                columns.forEach((col, colIdx) => {
                  rowObj[col] = rowCells[colIdx] || ''
                })
                addRowToBuffer(tableIndex, rowObj)
                matchedIndices.push(i)
              }
            }
            // 从 pendingRows 中移除已处理的行（从后往前删除避免索引错乱）
            for (let i = matchedIndices.length - 1; i >= 0; i--) {
              pendingRows.splice(matchedIndices[i], 1)
            }
          }
        }
      } else if (type === 'row') {
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
              addRowToBuffer(tableIndex, rowObj)
            }
          } else {
            // 暂时无法匹配，存入 pendingRows
            console.log(`[Info] schema_id ${schemaId} 尚未加载，暂存行数据`)
            pendingRows.push({ schemaId, cells: rowCells })
          }
        }
      }
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

    if (abortController) {
      abortController.abort()
    }

    extracting.value = true
    extractedOnce.value = true
    extractResults.value = []
    activeTab.value = '0'
    currentExtractSchemas = [] // 重置本次提取的 schema 记录
    pendingRowsMap.clear()
    // 启动批量更新定时器
    startBatchUpdater()

    const schemaMap = new Map<number, number>()
    const pendingRows: { schemaId: number; cells: string[] }[] = []

    abortController = new AbortController()

    try {
      const url = `http://poyuan.kmdns.net:36879/api/table/extract-specified`
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
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue

          let jsonStr = trimmedLine
          if (jsonStr.startsWith('data:')) {
            jsonStr = jsonStr.replace(/^data:\s*/, '')
          }
          if (!jsonStr.startsWith('{')) continue

          try {
            const message = JSON.parse(jsonStr)
            await processStreamMessage(message, schemaMap, pendingRows)
          } catch (e) {
            console.warn('解析流消息失败:', jsonStr, e)
          }
        }
      }

      // 处理剩余 buffer
      if (buffer.trim()) {
        let jsonStr = buffer.trim()
        if (jsonStr.startsWith('data:')) {
          jsonStr = jsonStr.replace(/^data:\s*/, '')
        }
        if (jsonStr.startsWith('{')) {
          try {
            const message = JSON.parse(jsonStr)
            await processStreamMessage(message, schemaMap, pendingRows)
          } catch (e) {
            console.warn('解析最后消息失败:', jsonStr, e)
          }
        }
      }

      ElMessage.success(`提取完成，共 ${extractResults.value.length} 个表格`)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        ElMessage.info('提取已取消')
      } else {
        console.error('流式提取失败:', error)
        ElMessage.error(error.message || '提取失败，请检查后端服务')
      }
    } finally {
      extracting.value = false
      abortController = null
      // 确保最终数据被渲染并停止定时器
      stopBatchUpdater()
      if (extractResults.value.length === 0 && extractedOnce.value) {
        ElMessage.info('未提取到任何表格数据')
      }
    }
  }

  // 导出当前表格
  const exportCurrentTable = () => {
    if (!currentTable.value.columns.length || !currentTable.value.rows.length) {
      ElMessage.warning('无数据可导出')
      return
    }
    exportToExcel(
      currentTable.value.columns,
      currentTable.value.rows,
      currentTable.value.title || '表格数据'
    )
    ElMessage.success('导出成功')
  }

  // 清空结果，并中断正在进行的请求
  const clearResults = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      extracting.value = false
    }
    stopBatchUpdater()
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
      stopBatchUpdater()
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

  .history-panel {
    margin-top: 24px;
    padding: 20px;
    border-radius: 24px;
  }

  .history-panel .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(102, 126, 234, 0.2);
  }

  .history-panel .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-panel .panel-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .history-panel .count-badge {
    border-radius: 20px;
  }

  .history-panel .action-btn {
    margin-left: 12px;
  }

  .history-table {
    border-radius: 16px;
    overflow: hidden;
  }

  .table-detail-dialog :deep(.el-dialog__body) {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }

  /* 确保空状态在历史为空时正常显示 */
  .empty-state {
    margin-top: 24px;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .history-panel .panel-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    .history-panel .header-right {
      align-self: flex-end;
    }
  }
</style>

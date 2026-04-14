<template>
  <div class="info-extract-container">
    <div class="extraction-workspace">
      <!-- 顶部：智能提取配置面板 -->
      <div class="config-panel glass-effect">
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon-wrapper">
              <div class="icon-bg"></div>
              <span class="header-icon">🔍</span>
            </div>
            <div class="header-text">
              <h2 class="panel-title">智能信息提取</h2>
              <p class="panel-subtitle">从文档中自动识别和提取关键信息</p>
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
          <!-- 选择区域 -->
          <div class="selection-grid">
            <div class="select-card">
              <label class="card-label">
                <ArtSvgIcon icon="ri:database-2-line" class="label-icon" />
                <span>文档库</span>
              </label>
              <el-select
                v-model="extractForm.libId"
                placeholder="请选择文档库"
                class="modern-select"
                @change="onLibChange"
              >
                <el-option
                  v-for="lib in libList"
                  :key="lib.libId"
                  :label="lib.name"
                  :value="lib.libId"
                >
                  <div class="option-content">
                    <ArtSvgIcon icon="ri:folder-3-line" class="option-icon" />
                    <span>{{ lib.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="select-card">
              <label class="card-label">
                <ArtSvgIcon icon="ri:file-text-line" class="label-icon" />
                <span>选择文档</span>
              </label>
              <!-- 替换为 -->
              <DocumentTreeSelect
                v-model="extractForm.documentId"
                :lib-id="extractForm.libId"
                placeholder="请选择文档"
                class="modern-select"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-area">
            <el-button
              type="primary"
              @click="startExtract"
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

            <Transition name="fade-slide">
              <div v-if="extracting" class="progress-controls">
                <el-button @click="pauseExtract" class="control-btn pause">
                  <ArtSvgIcon icon="ri:pause-circle-line" class="btn-icon" />
                  <span>暂停</span>
                </el-button>
                <el-button @click="cancelExtract" type="danger" class="control-btn cancel">
                  <ArtSvgIcon icon="ri:close-circle-line" class="btn-icon" />
                  <span>取消</span>
                </el-button>
              </div>
            </Transition>
          </div>
        </el-form>
      </div>

      <!-- 中部：提取进度展示 -->
      <Transition name="slide-down">
        <div v-if="extracting" class="progress-panel glass-effect">
          <div class="progress-content">
            <div class="progress-header">
              <div class="progress-title-wrapper">
                <div class="spinner-icon">
                  <ArtSvgIcon icon="ri:brain-line" class="brain-icon rotating" />
                </div>
                <div>
                  <h3 class="progress-title">AI 正在分析文档...</h3>
                  <p class="progress-subtitle">智能识别关键信息，这可能需要几分钟时间</p>
                </div>
              </div>
              <el-tag type="warning" effect="dark" size="large" class="status-tag">
                <ArtSvgIcon icon="ri:loader-4-line" class="rotating mr-1" />
                处理中
              </el-tag>
            </div>

            <div class="progress-bar-section">
              <el-progress
                :percentage="Math.round(progress)"
                :status="progressStatus"
                :stroke-width="16"
                class="extraction-progress"
              >
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                </template>
              </el-progress>
              <div class="progress-steps">
                <div class="step" :class="{ active: progress >= 25, completed: progress > 25 }">
                  <div class="step-dot"></div>
                  <span class="step-label">文档解析</span>
                </div>
                <div class="step" :class="{ active: progress >= 50, completed: progress > 50 }">
                  <div class="step-dot"></div>
                  <span class="step-label">信息识别</span>
                </div>
                <div class="step" :class="{ active: progress >= 75, completed: progress > 75 }">
                  <div class="step-dot"></div>
                  <span class="step-label">数据提取</span>
                </div>
                <div class="step" :class="{ active: progress >= 100, completed: progress > 100 }">
                  <div class="step-dot"></div>
                  <span class="step-label">结果生成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 底部：提取历史与结果 -->
      <div class="results-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">
              <ArtSvgIcon icon="ri:history-line" class="title-icon" />
              提取历史
            </h3>
            <el-tag type="info" effect="plain" class="count-badge">
              {{ extractionHistory.length }} 条记录
            </el-tag>
          </div>
          <div class="section-actions">
            <el-button
              type="success"
              @click="exportResults"
              class="action-btn export"
              :disabled="extractionHistory.length === 0"
            >
              <ArtSvgIcon icon="ri:download-line" class="btn-icon" />
              <span>导出结果</span>
            </el-button>
            <el-button
              type="warning"
              @click="clearResults"
              class="action-btn clear"
              :disabled="extractionHistory.length === 0"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="btn-icon" />
              <span>清空结果</span>
            </el-button>
          </div>
        </div>

        <div class="history-table-wrapper glass-effect">
          <el-table
            :data="extractionHistory"
            class="modern-table"
            :header-cell-style="{
              background:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: '#333',
              fontWeight: '600',
              fontSize: '14px'
            }"
            v-loading="loading"
          >
            <el-table-column prop="name" label="文档名" min-width="220">
              <template #default="{ row }">
                <div class="doc-name-cell">
                  <div class="doc-icon-wrapper">
                    <ArtSvgIcon :icon="getDocIcon(row.type)" class="doc-icon" />
                  </div>
                  <div class="doc-info">
                    <span class="doc-name">{{ row.name }}</span>
                    <span class="doc-type">{{ typeMap[row.type] || '文档' }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="uploader_id" label="上传者ID" width="130">
              <template #default="{ row }">
                <div class="uploader-cell">
                  <ArtSvgIcon icon="ri:user-line" class="user-icon" />
                  <span>{{ row.uploader_id }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'normal' ? 'success' : 'info'"
                  effect="dark"
                  size="small"
                  class="status-tag"
                >
                  <ArtSvgIcon
                    :icon="
                      row.status === 'normal' ? 'ri:checkbox-circle-fill' : 'ri:error-warning-line'
                    "
                    class="mr-1"
                  />
                  {{ row.status === 'normal' ? '正常' : row.status }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="已提取表格" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  size="small"
                  type="primary"
                  @click="showTable(row.id)"
                  class="view-table-btn"
                  :disabled="!row.has_table"
                >
                  <ArtSvgIcon icon="ri:table-alt-line" class="mr-1" />
                  <span>{{ row.has_table ? '查看表格' : '无表格' }}</span>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="extractionHistory.length === 0 && !loading" class="empty-history">
            <div class="empty-animation">
              <div class="empty-icon">📊</div>
              <div class="pulse-ring"></div>
            </div>
            <p class="empty-text">暂无提取记录</p>
            <p class="empty-hint">选择文档后点击"开始提取"，AI将自动识别关键信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { openTableEditDialog } from '@/components/TableEditDialog/useTableEditDialog'
  import * as docApi from '@/api/doc'
  import * as tableApi from '@/api/table'
  import * as docLibApi from '@/api/doc-lib'
  import DocumentTreeSelect from '@views/doc-extraction/Tree/DocumentTreeSelect.vue'

  defineOptions({ name: 'InfoExtract' })

  const extractForm = reactive({
    libId: null as number | null,
    documentId: null,
    types: [] as string[],
    customRule: ''
  })

  const documents = ref<Array<Api.Doc.DocInfo>>([])
  const libList = ref<Array<Api.DocLib.DocLibInfo>>([])
  const parentId = ref(0)
  const loading = ref(false)

  const loadDocuments = async () => {
    try {
      loading.value = true
      const res = await docApi.getDocList(undefined, extractForm.libId)
      // 映射后端字段：将 has_table 转为 hasTable
      documents.value = (res.docs || []).map((doc: any) => ({
        ...doc,
        hasTable: doc.has_table ?? false
      }))
      if (documents.value.length > 0) {
        ElMessage.success(`获取到 ${documents.value.length} 条文档`)
      }
    } catch (error) {
      ElMessage.error('获取文档列表失败')
    } finally {
      loading.value = false
    }
  }

  const loadLibs = async () => {
    try {
      const res = await docLibApi.fetchDocLibs()
      libList.value = res || []
      if (libList.value.length > 0) {
        extractForm.libId =
          extractForm.libId && libList.value.some((lib) => lib.libId === extractForm.libId)
            ? extractForm.libId
            : libList.value[0]?.libId || null
      } else {
        extractForm.libId = null
        ElMessage.warning('暂无文档库，请先创建文档库')
      }
    } catch (error) {
      ElMessage.error('获取文档库列表失败')
    }
  }

  const onLibChange = () => {
    extractForm.documentId = null
    loadDocuments()
  }

  const getDocIcon = (type?: string) => {
    const icons: Record<string, string> = {
      docx: 'ri:file-word-2-line',
      xlsx: 'ri:file-excel-2-line',
      pdf: 'ri:file-pdf-line',
      txt: 'ri:file-text-line',
      md: 'ri:markdown-line'
    }
    return icons[type?.toLowerCase() || ''] || 'ri:file-line'
  }

  const toggleType = (type: string) => {
    const index = extractForm.types.indexOf(type)
    if (index > -1) {
      extractForm.types.splice(index, 1)
    } else {
      extractForm.types.push(type)
    }
  }

  onMounted(async () => {
    try {
      await loadLibs()
      await catchHistory()
    } catch (error) {
      console.error('初始化数据失败:', error)
    }
  })

  const extracting = ref(false)
  const progress = ref(0)
  const progressStatus = ref<'success' | 'warning' | 'exception' | undefined>()

  const results = reactive({
    entities: [] as Array<{
      type: string
      value: string
      confidence: string
      positions?: string[]
    }>,
    keywords: [] as string[],
    amounts: [] as string[],
    dates: [] as string[],
    sentences: [] as string[],
    custom: [] as string[]
  })

  const extractionHistory = ref<Array<Api.Doc.DocInfo>>([])

  const startExtract = async () => {
    if (!extractForm.documentId) {
      ElMessage.warning('请选择文档')
      return
    }

    extracting.value = true
    progress.value = 0
    progressStatus.value = undefined

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 8
      }
    }, 600)

    try {
      const res = await tableApi.extractTableData(extractForm.documentId)
      clearInterval(progressInterval)
      progress.value = 100
      progressStatus.value = 'success'
      ElMessage.success('✓ 提取成功')
      await catchHistory()
    } catch (error) {
      clearInterval(progressInterval)
      progressStatus.value = 'exception'
      ElMessage.error('提取失败，请重试')
    } finally {
      setTimeout(() => {
        extracting.value = false
        progress.value = 0
        progressStatus.value = undefined
      }, 1500)
    }
  }

  const pauseExtract = () => {
    extracting.value = false
    progressStatus.value = 'warning'
    ElMessage.info('已暂停提取')
  }

  const cancelExtract = () => {
    extracting.value = false
    progress.value = 0
    progressStatus.value = undefined
    ElMessage.info('已取消提取')
  }

  const catchHistory = async () => {
    await loadDocuments()
    extractionHistory.value = documents.value.filter((doc) => doc.hasTable).slice(0, 10)
  }

  const exportResults = () => {
    const data = {
      entities: results.entities,
      keywords: results.keywords,
      amounts: results.amounts,
      dates: results.dates,
      custom: results.custom,
      exportTime: new Date().toLocaleString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extraction_results_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    ElMessage.success('✓ 结果已导出')
  }

  const clearResults = () => {
    results.entities = []
    results.keywords = []
    results.amounts = []
    results.dates = []
    results.sentences = []
    results.custom = []
    ElMessage.success('✓ 结果已清空')
  }

  const showTable = async (docId: number) => {
    try {
      const res = await tableApi.getTableData(docId)
      openTableEditDialog(res)
    } catch (error) {
      ElMessage.error('获取表格数据失败')
    }
  }

  const typeMap: Record<string, string> = {
    docx: 'Word文档',
    xlsx: 'Excel表格',
    pdf: 'PDF文档',
    txt: '文本文件',
    md: 'Markdown'
  }
</script>

<style scoped>
  .info-extract-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  }

  .extraction-workspace {
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
  }

  /* 配置面板 */
  .config-panel {
    border-radius: 24px;
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

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
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
    margin: 0;
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
  .extract-form {
    margin-top: 8px;
  }

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
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

  .option-text {
    flex: 1;
  }

  /* 提取类型 */
  .extraction-types-section {
    margin-bottom: 24px;
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

  .type-chips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
  }

  .type-chip {
    position: relative;
    padding: 16px;
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(102, 126, 234, 0.15);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .type-chip:hover {
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  }

  .type-chip.active {
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.15) 0%,
      rgba(118, 75, 162, 0.15) 100%
    );
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  }

  .chip-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .chip-icon {
    font-size: 28px;
  }

  .chip-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .chip-check {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    animation: check-pop 0.3s ease-out;
  }

  @keyframes check-pop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  .hidden-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  /* 自定义规则 */
  .custom-rule-section {
    margin-bottom: 28px;
  }

  .rule-input :deep(.el-textarea__inner) {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
    font-size: 14px;
    line-height: 1.6;
  }

  .rule-input :deep(.el-textarea__inner):hover {
    border-color: #667eea;
  }

  .rule-input :deep(.el-textarea__inner):focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-icon {
    color: #667eea;
    font-size: 16px;
  }

  .rule-hint {
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

  /* 操作区域 */
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

  .extract-btn:active:not(:disabled) {
    transform: translateY(-1px);
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

  .progress-controls {
    display: flex;
    gap: 12px;
  }

  .control-btn {
    border-radius: 12px;
    padding: 14px 24px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .control-btn.pause:hover {
    background: rgba(255, 152, 0, 0.1);
    border-color: #ff9800;
    color: #ff9800;
  }

  .control-btn.cancel:hover {
    background: rgba(244, 67, 54, 0.1);
    border-color: #f44336;
    color: #f44336;
  }

  /* 进度面板 */
  .progress-panel {
    border-radius: 20px;
    padding: 28px;
  }

  .progress-content {
    max-width: 900px;
    margin: 0 auto;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
  }

  .progress-title-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .spinner-icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.15) 0%,
      rgba(118, 75, 162, 0.15) 100%
    );
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brain-icon {
    font-size: 32px;
    color: #667eea;
  }

  .progress-title {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px 0;
  }

  .progress-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .status-tag {
    border-radius: 10px;
    padding: 8px 16px;
    font-weight: 600;
  }

  .progress-bar-section {
    background: rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    padding: 24px;
  }

  .extraction-progress {
    margin-bottom: 20px;
  }

  .extraction-progress :deep(.el-progress-bar__outer) {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.06);
  }

  .extraction-progress :deep(.el-progress-bar__inner) {
    border-radius: 10px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 200% 100%;
    animation: gradient-shift 2s linear infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  .percentage-value {
    font-weight: 700;
    font-size: 15px;
    color: #333;
  }

  .progress-steps {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  .progress-steps::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(0, 0, 0, 0.08);
    z-index: 0;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
    z-index: 1;
    flex: 1;
  }

  .step-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    border: 3px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
  }

  .step.active .step-dot {
    border-color: #667eea;
    background: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  }

  .step.completed .step-dot {
    border-color: #4caf50;
    background: #4caf50;
  }

  .step-label {
    font-size: 13px;
    color: #999;
    font-weight: 500;
    transition: all 0.3s;
  }

  .step.active .step-label,
  .step.completed .step-label {
    color: #333;
    font-weight: 600;
  }

  /* 结果区域 */
  .results-section {
    margin-top: 4px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-title {
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

  .count-badge {
    border-radius: 8px;
    font-weight: 600;
  }

  .section-actions {
    display: flex;
    gap: 12px;
  }

  .action-btn {
    border-radius: 12px;
    padding: 12px 20px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  .action-btn.export {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%);
  }

  .action-btn.clear {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 87, 34, 0.1) 100%);
  }

  .history-table-wrapper {
    border-radius: 20px;
    padding: 24px;
    overflow: hidden;
  }

  .modern-table {
    border-radius: 14px;
    overflow: hidden;
  }

  .doc-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .doc-icon-wrapper {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .doc-icon {
    font-size: 20px;
    color: #667eea;
  }

  .doc-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .doc-name {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .doc-type {
    font-size: 12px;
    color: #999;
  }

  .uploader-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #666;
  }

  .user-icon {
    font-size: 16px;
    color: #667eea;
  }

  .status-tag {
    border-radius: 8px;
    font-weight: 600;
  }

  .view-table-btn {
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .view-table-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .empty-history {
    text-align: center;
    padding: 70px 20px;
    color: #999;
  }

  .empty-animation {
    position: relative;
    display: inline-block;
    margin-bottom: 20px;
  }

  .empty-icon {
    font-size: 64px;
    opacity: 0.5;
    position: relative;
    z-index: 1;
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
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 14px;
    margin: 0;
    opacity: 0.7;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* 动画 */
  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-height: 200px;
    opacity: 1;
  }

  .expand-enter-from,
  .expand-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

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

  /* 响应式 */
  @media (max-width: 1024px) {
    .selection-grid {
      grid-template-columns: 1fr;
    }

    .type-chips-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .panel-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .action-area {
      flex-direction: column;
    }

    .progress-controls {
      width: 100%;
      justify-content: center;
    }

    .section-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }

    .section-actions {
      width: 100%;
    }

    .action-btn {
      flex: 1;
    }

    .type-chips-grid {
      grid-template-columns: 1fr;
    }

    .progress-steps {
      flex-wrap: wrap;
      gap: 12px;
    }
  }
</style>

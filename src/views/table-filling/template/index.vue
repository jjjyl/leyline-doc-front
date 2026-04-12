<template>
  <div class="template-import-container">
    <div class="import-workspace">
      <!-- 顶部操作面板 -->
      <div class="upload-panel glass-effect">
        <div class="panel-header">
          <div class="header-left">
            <div class="header-icon-wrapper">
              <div class="icon-bg"></div>
              <span class="header-icon">📋</span>
            </div>
            <div class="header-text">
              <h2 class="panel-title">表格模板导入</h2>
              <p class="panel-subtitle">上传包含表格的文档，系统将自动提取表格结构作为模板</p>
            </div>
          </div>
          <div class="header-badge">
            <el-tag type="success" effect="dark" size="large" class="ai-badge">
              <ArtSvgIcon icon="ri:sparkling-2-fill" class="mr-1 sparkle-icon" />
              模板管理
            </el-tag>
          </div>
        </div>

        <div class="upload-controls">
          <div class="action-buttons">
            <el-button
              type="primary"
              @click="confirmUpload"
              :loading="uploading"
              :disabled="fileList.length === 0 || uploading"
              class="upload-btn"
            >
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="mr-1" />
              {{ uploading ? '上传中...' : '确认上传' }}
            </el-button>
            <el-button
              @click="clearFileList"
              :disabled="fileList.length === 0 || uploading"
              class="clear-btn"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              清空缓存
            </el-button>
            <span v-if="fileList.length > 0" class="file-count-badge">
              <ArtSvgIcon icon="ri:file-line" class="mr-1" />
              已缓存 {{ fileList.length }} 个文件
            </span>
          </div>

          <el-upload
            ref="uploadRef"
            class="modern-upload"
            drag
            :auto-upload="false"
            v-model:file-list="fileList"
            multiple
            :limit="5"
            :accept="'.docx,.xlsx'"
            :before-upload="beforeUpload"
            :disabled="uploading"
          >
            <div class="upload-dragger">
              <div class="upload-icon-wrapper">
                <div class="icon-ring"></div>
                <ArtSvgIcon icon="ri:file-upload-line" class="upload-main-icon" />
              </div>
              <div class="upload-text-content">
                <p class="upload-main-text">
                  将模板文件拖到此处，或 <em class="highlight-text">点击上传</em>
                </p>
                <p class="upload-hint">支持 Word(.docx) 和 Excel(.xlsx) 格式</p>
              </div>
              <div class="supported-formats">
                <span class="format-badge docx">
                  <ArtSvgIcon icon="ri:file-word-2-line" />
                  Word
                </span>
                <span class="format-badge xlsx">
                  <ArtSvgIcon icon="ri:file-excel-2-line" />
                  Excel
                </span>
              </div>
            </div>
            <template #tip>
              <div class="upload-tip">
                <ArtSvgIcon icon="ri:information-line" class="tip-icon" />
                <span>单个文件不超过 100MB，可同时上传多个模板</span>
              </div>
            </template>
          </el-upload>
        </div>
      </div>

      <!-- 模板列表 -->
      <div class="templates-section">
        <div class="section-header">
          <div class="header-left">
            <h3 class="section-title">
              <ArtSvgIcon icon="ri:file-list-3-line" class="title-icon" />
              已导入模板文档
            </h3>
            <el-tag type="info" effect="plain" class="count-badge">
              {{ templates.length }} 个模板
            </el-tag>
          </div>
          <el-button text @click="loadTemplates" :loading="uploading" class="refresh-btn">
            <ArtSvgIcon icon="ri:refresh-line" :class="{ rotating: uploading }" class="mr-1" />
            刷新
          </el-button>
        </div>

        <div class="table-wrapper glass-effect">
          <el-table
            :data="templates"
            class="modern-table"
            :header-cell-style="{
              background:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: '#333',
              fontWeight: '600',
              fontSize: '14px'
            }"
          >
            <el-table-column prop="name" label="文档名称" min-width="250">
              <template #default="{ row }">
                <div class="file-name-cell">
                  <ArtSvgIcon :icon="getDocIcon(row.type)" class="file-icon" />
                  <span class="file-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  effect="plain"
                  :type="row.type === 'xlsx' ? 'success' : 'primary'"
                >
                  {{ row.type?.toUpperCase() }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="导入时间" width="200">
              <template #default="{ row }">
                <div class="time-cell">
                  <ArtSvgIcon icon="ri:calendar-line" class="mr-1" />
                  {{ row.createTime }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="表格数量" width="120">
              <template #default="{ row }">
                <div class="table-count-badge">
                  <ArtSvgIcon icon="ri:table-alt-line" class="mr-1" />
                  {{ row.tableCount || 0 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button size="small" @click="viewTables(row)" class="table-action-btn view">
                    <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                    查看表格
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click="extractTables(row)"
                    class="table-action-btn extract"
                  >
                    <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />
                    提取表格
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    @click="deleteDocument(row)"
                    class="table-action-btn delete"
                  >
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="templates.length === 0" class="empty-state">
            <div class="empty-animation">
              <div class="empty-icon">📄</div>
              <div class="pulse-ring"></div>
            </div>
            <p class="empty-text">暂无模板文档</p>
            <p class="empty-hint">请上传包含表格的 Word 或 Excel 文件</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格查看对话框 -->
    <el-dialog v-model="tableDialog" title="文档表格" width="90%" class="modern-dialog">
      <div v-if="currentTables.length === 0" class="text-center py-8">
        <p class="text-gray-500">暂无表格数据，请先提取表格</p>
      </div>
      <div v-else>
        <el-tabs v-model="activeTableIndex" @tab-click="handleTableChange">
          <el-tab-pane
            v-for="(table, index) in currentTables"
            :key="index"
            :label="table.name || `表格 ${index + 1}`"
            :name="index.toString()"
          >
            <div class="table-container">
              <table class="extracted-table">
                <thead>
                  <tr>
                    <th v-for="header in table.headers" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIdx) in table.rows" :key="rowIdx">
                    <td v-for="(cell, cellIdx) in row.cells" :key="cellIdx">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import {
    getTemplateList,
    deleteTemplate,
    createUploadSession,
    finishUpload,
    extractTableData
  } from '@/api/templates'

  // 类型定义
  interface TableRow {
    id?: string | number
    cells: any[]
  }
  interface TableData {
    name?: string
    headers: string[]
    rows: TableRow[]
  }
  interface TemplateDoc {
    id: number
    name: string
    type?: string
    createTime?: string
    tableCount?: number
    tables?: TableData[]
    raw?: any
  }

  const uploadRef = ref<any>(null)
  const fileList = ref<any[]>([])
  const templates = ref<TemplateDoc[]>([])
  const uploading = ref(false)

  const tableDialog = ref(false)
  const activeTableIndex = ref('0')
  const currentTables = ref<TableData[]>([])

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      const res = await getTemplateList()
      const rawList = res.templates || []
      templates.value = rawList.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.name?.split('.').pop() || '文件',
        createTime: item.created_at,
        tableCount: 0,
        raw: item
      }))
    } catch (error) {
      console.error('获取模板列表失败:', error)
      ElMessage.error('获取模板列表失败')
    }
  }

  // 清空文件缓存
  const clearFileList = () => {
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    fileList.value = []
    ElMessage.info('已清空待上传文件列表')
  }

  // 单个文件上传（三步流程）
  const uploadSingleFile = async (file: File): Promise<void> => {
    // 1. 创建上传会话
    const sessionRes = await createUploadSession(file)
    const { templ_id, upload_url } = sessionRes

    // 2. PUT 上传文件到预签名 URL
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    })
    if (!uploadResponse.ok) {
      throw new Error(`文件上传失败: ${uploadResponse.status}`)
    }

    // 3. 通知后端上传完成
    await finishUpload(templ_id)
  }

  // 确认上传（批量串行上传）
  const confirmUpload = async () => {
    if (fileList.value.length === 0) {
      ElMessage.warning('请先选择要上传的文件')
      return
    }

    uploading.value = true
    const files = fileList.value.map((item) => item.raw)
    const successList: string[] = []
    const failList: { name: string; error: string }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        await uploadSingleFile(file)
        successList.push(file.name)
        ElMessage.success(`文件 ${file.name} 上传成功`)
      } catch (error: any) {
        const errorMsg = error.message || '上传失败'
        failList.push({ name: file.name, error: errorMsg })
        ElMessage.error(`文件 ${file.name} 上传失败: ${errorMsg}`)
      }
    }

    uploading.value = false

    if (failList.length === 0) {
      ElMessage.success(`全部 ${successList.length} 个文件上传成功`)
    } else {
      ElMessage.warning(`上传完成，成功 ${successList.length} 个，失败 ${failList.length} 个`)
    }

    // 清空缓存并刷新列表
    clearFileList()
    await loadTemplates()
  }

  // 文件选择前的校验
  const beforeUpload = (file: File) => {
    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (!isDocx && !isXlsx) {
      ElMessage.error('仅支持 .docx 或 .xlsx 格式')
      return false
    }
    return true
  }

  // 查看表格
  const viewTables = async (document: TemplateDoc) => {
    try {
      const res = await extractTableData(document.id)
      const tables = res.tables || []
      currentTables.value = tables.map((t: any) => ({
        name: t.name,
        headers: t.headers,
        rows: t.rows.map((r: any) => ({ cells: r.cells }))
      }))
      tableDialog.value = true
    } catch (error) {
      ElMessage.error('获取表格数据失败')
    }
  }

  // 提取表格（触发后端解析）
  const extractTables = async (document: TemplateDoc) => {
    try {
      const res = await extractTableData(document.id)
      const tables = res.tables || []
      const target = templates.value.find((t) => t.id === document.id)
      if (target) {
        target.tableCount = tables.length
        target.tables = tables.map((t: any) => ({
          name: t.name,
          headers: t.headers,
          rows: t.rows.map((r: any) => ({ cells: r.cells }))
        }))
      }
      ElMessage.success('表格提取成功')
    } catch (error) {
      ElMessage.error('表格提取失败')
    }
  }

  // 删除模板
  const deleteDocument = async (document: TemplateDoc) => {
    try {
      await deleteTemplate(document.id)
      templates.value = templates.value.filter((t) => t.id !== document.id)
      ElMessage.success('删除成功')
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }

  const handleTableChange = (tab: any) => {
    activeTableIndex.value = tab.name
  }

  onMounted(() => {
    loadTemplates()
  })
</script>
<style scoped>
  /* 完全仿照前两个页面的样式，引入玻璃效果、动画等 */
  .template-import-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  }

  .import-workspace {
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

  .upload-panel {
    padding: 28px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;
    padding-bottom: 20px;
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

  .header-text .panel-title {
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
    margin: 4px 0 0 0;
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

  .upload-controls {
    margin-top: 8px;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .upload-btn,
  .clear-btn {
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .upload-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .upload-btn:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(102, 126, 234, 0.45);
  }

  .clear-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    background: rgba(255, 152, 0, 0.1);
    border-color: #ff9800;
    color: #ff9800;
  }

  .file-count-badge {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.15);
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #667eea;
  }

  .modern-upload {
    width: 100%;
  }

  .modern-upload :deep(.el-upload-dragger) {
    padding: 0;
    border: none;
    background: transparent;
  }

  .upload-dragger {
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px dashed rgba(102, 126, 234, 0.3);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.4);
  }

  .upload-dragger:hover {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.6);
  }

  .upload-icon-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 24px;
  }

  .icon-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 3px solid #667eea;
    border-radius: 50%;
    opacity: 0.2;
    animation: ring-pulse 2s infinite;
  }

  @keyframes ring-pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.15);
      opacity: 0.1;
    }
  }

  .upload-main-icon {
    font-size: 56px;
    color: #667eea;
    filter: drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3));
    animation: float 3s ease-in-out infinite;
  }

  .upload-text-content {
    margin-bottom: 20px;
  }

  .upload-main-text {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .highlight-text {
    color: #667eea;
    font-style: normal;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba(102, 126, 234, 0.3);
  }

  .upload-hint {
    font-size: 14px;
    color: #999;
  }

  .supported-formats {
    display: flex;
    justify-content: center;
    gap: 12px;
  }

  .format-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .format-badge.docx {
    background: rgba(66, 133, 244, 0.15);
    color: #4285f4;
    border: 1px solid rgba(66, 133, 244, 0.3);
  }

  .format-badge.xlsx {
    background: rgba(52, 168, 83, 0.15);
    color: #34a853;
    border: 1px solid rgba(52, 168, 83, 0.3);
  }

  .upload-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
    padding: 10px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    font-size: 13px;
    color: #666;
  }

  .tip-icon {
    color: #667eea;
  }

  /* 模板列表区域 */
  .templates-section {
    margin-top: 4px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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

  .refresh-btn {
    border-radius: 8px;
    transition: all 0.3s;
  }
  .refresh-btn:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .table-wrapper {
    padding: 20px;
    overflow: hidden;
  }

  .modern-table {
    border-radius: 14px;
    overflow: hidden;
  }

  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .file-icon {
    font-size: 20px;
    color: #667eea;
  }
  .file-name {
    font-weight: 500;
    color: #333;
  }

  .time-cell {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #666;
  }

  .table-count-badge {
    display: inline-flex;
    align-items: center;
    background: rgba(102, 126, 234, 0.1);
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }

  .action-btns {
    display: flex;
    gap: 8px;
  }
  .table-action-btn {
    border-radius: 8px;
    transition: all 0.2s;
  }
  .table-action-btn:hover {
    transform: scale(1.05);
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
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

  /* 对话框 */
  .modern-dialog :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
  }
  .table-container {
    max-height: 600px;
    overflow-y: auto;
  }
  .extracted-table {
    width: 100%;
    border-collapse: collapse;
  }
  .extracted-table th,
  .extracted-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
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
</style>

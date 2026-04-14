<template>
  <div class="content-card">
    <div class="card-header">
      <div class="header-left">
        <h3 class="card-title">最近文档</h3>
        <p class="card-subtitle">共 <span class="text-primary font-medium">{{ tableData.length }}</span> 个文档</p>
      </div>
      <ElButton text type="primary" size="small" @click="viewAll">
        查看全部
        <ElIcon class="ml-1"><ArrowRight /></ElIcon>
      </ElButton>
    </div>

    <ArtTable
      class="modern-table"
      :data="tableData"
      style="width: 100%"
      size="default"
      :border="false"
      :stripe="true"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)',
        fontWeight: '600',
        fontSize: '13px'
      }"
      v-loading="loading"
    >
      <template #default>
        <ElTableColumn label="文档名称" min-width="200">
          <template #default="scope">
            <div class="doc-name-cell" @click="viewDocument(scope.row.id)">
              <ElIcon :size="20" class="doc-icon" :color="getDocColor(scope.row.type)">
                <component :is="getDocIconComponent(scope.row.type)" />
              </ElIcon>
              <div class="doc-info">
                <span class="doc-name-link">{{ scope.row.name }}</span>
                <span class="doc-type">{{ getDocTypeText(scope.row.type) }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="上传时间" width="160" prop="uploadTime">
          <template #default="scope">
            <div class="time-cell">
              <ElIcon :size="14" class="mr-1"><Clock /></ElIcon>
              <span>{{ scope.row.uploadTime }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="提取状态" width="120">
          <template #default="scope">
            <ElTag
              :type="getStatusType(scope.row.status)"
              size="small"
              effect="light"
              round
            >
              <ElIcon :size="12" class="mr-1">
                <component :is="getStatusIcon(scope.row.status)" />
              </ElIcon>
              {{ getStatusText(scope.row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <ElButton
                link
                type="primary"
                size="small"
                @click="viewDetail(scope.row.id)"
              >
                <ElIcon><View /></ElIcon>
                详情
              </ElButton>
              <ElButton
                link
                type="success"
                size="small"
                @click="previewTable(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                <ElIcon><Grid /></ElIcon>
                预览表格
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </template>
    </ArtTable>

    <ElDrawer
      v-model="drawerVisible"
      title="提取表格预览"
      size="70%"
      :close-on-click-modal="false"
    >
      <div v-loading="previewLoading" class="preview-content">
        <div v-if="previewData" class="table-preview">
          <div class="preview-header">
            <h4 class="preview-title">{{ currentDoc?.name }}</h4>
            <ElTag type="success" size="small">已提取 {{ previewData.tableCount }} 个表格</ElTag>
          </div>

          <ElTabs v-model="activeTableTab" class="mt-4">
            <ElTabPane
              v-for="(table, index) in previewData.tables"
              :key="index"
              :label="`表格 ${index + 1}`"
              :name="index.toString()"
            >
              <ElTable
                :data="table.data"
                border
                stripe
                style="width: 100%"
                max-height="400"
              >
                <ElTableColumn
                  v-for="(col, colIndex) in table.columns"
                  :key="colIndex"
                  :prop="col"
                  :label="col"
                  min-width="120"
                />
              </ElTable>
            </ElTabPane>
          </ElTabs>
        </div>
        <ElEmpty v-else description="暂无数据" />
      </div>

      <template #footer>
        <div class="drawer-footer">
          <ElButton @click="drawerVisible = false">关闭</ElButton>
          <ElButton type="primary" @click="exportTable">
            <ElIcon class="mr-1"><Download /></ElIcon>
            导出Excel
          </ElButton>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    ArrowRight,
    Clock,
    View,
    Grid,
    Download,
    Document,
    Files,
    FolderOpened,
    Loading,
    CircleCheck,
    CircleClose
  } from '@element-plus/icons-vue'

  interface DocumentItem {
    id: number
    name: string
    type: 'docx' | 'xlsx' | 'pdf' | 'txt'
    uploadTime: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
  }

  interface TableData {
    columns: string[]
    data: Record<string, any>[]
  }

  interface PreviewData {
    tableCount: number
    tables: TableData[]
  }

  const loading = ref(false)
  const drawerVisible = ref(false)
  const previewLoading = ref(false)
  const previewData = ref<PreviewData | null>(null)
  const currentDoc = ref<DocumentItem | null>(null)
  const activeTableTab = ref('0')

  const tableData = reactive<DocumentItem[]>([
    {
      id: 1,
      name: '2024年财务报表.xlsx',
      type: 'xlsx',
      uploadTime: '2024-01-15 14:30',
      status: 'completed'
    },
    {
      id: 2,
      name: '产品清单.pdf',
      type: 'pdf',
      uploadTime: '2024-01-15 13:20',
      status: 'processing'
    },
    {
      id: 3,
      name: '客户信息表.docx',
      type: 'docx',
      uploadTime: '2024-01-15 12:10',
      status: 'completed'
    },
    {
      id: 4,
      name: '订单记录.xlsx',
      type: 'xlsx',
      uploadTime: '2024-01-15 11:00',
      status: 'pending'
    },
    {
      id: 5,
      name: '库存统计表.pdf',
      type: 'pdf',
      uploadTime: '2024-01-15 10:30',
      status: 'failed'
    }
  ])

  const getDocIconComponent = (type: string) => {
    const icons: Record<string, any> = {
      docx: Document,
      xlsx: Grid,
      pdf: Files,
      txt: FolderOpened
    }
    return icons[type] || Document
  }

  const getDocColor = (type: string) => {
    const colors: Record<string, string> = {
      docx: '#2b579a',
      xlsx: '#217346',
      pdf: '#f40f02',
      txt: '#666666'
    }
    return colors[type] || '#909399'
  }

  const getDocTypeText = (type: string) => {
    const texts: Record<string, string> = {
      docx: 'Word文档',
      xlsx: 'Excel表格',
      pdf: 'PDF文档',
      txt: '文本文件'
    }
    return texts[type] || '未知类型'
  }

  const getStatusType = (status: string) => {
    const types: Record<string, any> = {
      pending: 'info',
      processing: 'warning',
      completed: 'success',
      failed: 'danger'
    }
    return types[status] || 'info'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      processing: Loading,
      completed: CircleCheck,
      failed: CircleClose
    }
    return icons[status] || Clock
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      failed: '失败'
    }
    return texts[status] || status
  }

  const viewDocument = (id: number) => {
    console.log('查看文档:', id)
  }

  const viewDetail = (id: number) => {
    ElMessage.info(`查看文档 ${id} 的详细信息`)
  }

  const previewTable = async (doc: DocumentItem) => {
    try {
      currentDoc.value = doc
      drawerVisible.value = true
      previewLoading.value = true

      await new Promise(resolve => setTimeout(resolve, 800))
      previewData.value = {
        tableCount: 2,
        tables: [
          {
            columns: ['产品名称', '规格', '数量', '单价', '总价'],
            data: [
              { '产品名称': '产品A', '规格': '标准版', '数量': 100, '单价': 99.9, '总价': 9990 },
              { '产品名称': '产品B', '规格': '专业版', '数量': 50, '单价': 199.9, '总价': 9995 }
            ]
          },
          {
            columns: ['月份', '销售额', '成本', '利润'],
            data: [
              { '月份': '1月', '销售额': 50000, '成本': 30000, '利润': 20000 },
              { '月份': '2月', '销售额': 55000, '成本': 32000, '利润': 23000 }
            ]
          }
        ]
      }
    } catch (error) {
      ElMessage.error('获取表格数据失败')
    } finally {
      previewLoading.value = false
    }
  }

  const exportTable = () => {
    ElMessage.success('开始导出Excel文件...')
  }

  const viewAll = () => {
    console.log('查看全部文档')
  }
</script>

<style scoped lang="scss">
  .content-card {
    padding: 24px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    min-height: 380px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .header-left {
    flex: 1;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 6px 0;
  }

  .card-subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }

  .modern-table {
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
  }

  .doc-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    padding: 4px 0;
    transition: all 0.3s;

    &:hover {
      opacity: 0.8;
    }
  }

  .doc-icon {
    flex-shrink: 0;
  }

  .doc-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .doc-name-link {
    font-weight: 500;
    color: var(--el-color-primary);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      text-decoration: underline;
    }
  }

  .doc-type {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .time-cell {
    display: flex;
    align-items: center;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .preview-content {
    min-height: 300px;
  }

  .table-preview {
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    .preview-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  :deep(.el-drawer__body) {
    padding: 20px;
  }
</style>

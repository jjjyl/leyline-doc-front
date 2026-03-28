<template>
  <div class="info-extract">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">信息提取</h2>
      <el-form :model="extractForm" label-width="120px">
        <el-form-item label="选择文档">
          <el-select v-model="extractForm.documentId" placeholder="请选择文档">
            <el-option
              v-for="doc in documents"
              :key="doc.id"
              :label="doc.name"
              :value="doc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提取类型">
          <el-checkbox-group v-model="extractForm.types">
            <el-checkbox label="实体">实体（人名、地名、机构名等）</el-checkbox>
            <el-checkbox label="关键词">关键词</el-checkbox>
            <el-checkbox label="金额">金额</el-checkbox>
            <el-checkbox label="日期">日期</el-checkbox>
            <el-checkbox label="自定义">自定义规则</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="extractForm.types.includes('自定义')" label="自定义规则">
          <el-input
            v-model="extractForm.customRule"
            placeholder="例如：仅提取合同文档中的甲方、乙方、合同期限、金额信息"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="startExtract" :loading="extracting">
            {{ extracting ? '提取中...' : '开始提取' }}
          </el-button>
          <el-button @click="pauseExtract" v-if="extracting">暂停</el-button>
          <el-button @click="cancelExtract" v-if="extracting">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">提取进度</h3>
      <el-progress :percentage="progress" :status="progressStatus" />
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">提取结果</h3>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="实体信息" name="entities">
          <el-table :data="results.entities" style="width: 100%">
            <el-table-column prop="type" label="类型" />
            <el-table-column prop="value" label="内容" />
            <el-table-column prop="confidence" label="置信度" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="editEntity(scope.row)">修改</el-button>
                <el-button size="small" type="danger" @click="deleteEntity(scope.row, scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="关键词" name="keywords">
          <el-tag
            v-for="keyword in results.keywords"
            :key="keyword"
            class="mr-2 mb-2"
          >
            {{ keyword }}
          </el-tag>
        </el-tab-pane>
        <el-tab-pane label="金额信息" name="amounts">
          <ul>
            <li v-for="amount in results.amounts" :key="amount">{{ amount }}</li>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="日期信息" name="dates">
          <ul>
            <li v-for="date in results.dates" :key="date">{{ date }}</li>
          </ul>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">历史记录</h3>
      <el-table :data="extractionHistory" style="width: 100%">
        <el-table-column prop="documentName" label="文档名" />
        <el-table-column prop="types" label="提取类型" />
        <el-table-column prop="time" label="提取时间" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </div>

    <div class="mb-4">
      <el-button type="success" @click="exportResults">导出结果</el-button>
      <el-button type="warning" @click="clearResults">清空结果</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { extractTableData } from '@/api/doc'

const extractForm = reactive({
  documentId: '',
  types: [] as string[],
  customRule: ''
})

const documents = ref([])

// 加载文档列表
const loadDocuments = async () => {
  try {
    const response = await fetch('/api/doc-lib')
    const data = await response.json()
    documents.value = data || []
  } catch (error) {
    ElMessage.error('获取文档列表失败')
  }
}

// 组件挂载时加载文档列表
onMounted(() => {
  loadDocuments()
})

const extracting = ref(false)
const progress = ref(0)
const progressStatus = ref<'success' | 'warning' | 'exception' | undefined>()
const activeTab = ref('entities')
const selectedDoc = ref(null)
const extractedTables = ref([])

const results = reactive({
  entities: [] as Array<{type: string, value: string, confidence: string, positions?: string[]}>,
  keywords: [] as string[],
  amounts: [] as string[],
  dates: [] as string[],
  sentences: [] as string[],
  custom: [] as string[]
})

const extractionHistory = ref<Array<{
  id: number,
  documentName: string,
  types: string[],
  time: string,
  status: string
}>>([])

// 计算属性：根据选择的文档类型推荐提取类型
const recommendedTypes = computed(() => {
  const doc = documents.value.find(d => d.id === extractForm.documentId)
  if (!doc) return []

  switch (doc.type) {
    case 'docx':
      return ['实体', '关键词', '金额', '日期']
    case 'xlsx':
      return ['金额', '日期', '实体']
    case 'md':
      return ['关键词', '实体']
    case 'txt':
      return ['实体', '关键词', '金额', '日期']
    default:
      return ['实体', '关键词']
  }
})

// 开始提取
const startExtract = async () => {
  if (!extractForm.documentId) {
    ElMessage.warning('请选择文档')
    return
  }

  if (extractForm.types.length === 0) {
    ElMessage.warning('请至少选择一种提取类型')
    return
  }

  // 设置选中的文档
  selectedDoc.value = documents.value.find(d => d.id === extractForm.documentId)

  extracting.value = true
  progress.value = 0
  progressStatus.value = ''

  try {
    // 调用真实的提取API
    progress.value = 10
    ElMessage.info('正在分析文档结构...')

    // 提取表格数据
    const tableResult = await extractTableData(extractForm.documentId)
    progress.value = 50
    ElMessage.info('正在识别关键信息...')

    // 这里可以添加更多提取逻辑，如实体识别等
    progress.value = 80
    ElMessage.info('正在整理提取结果...')

    // 处理提取结果
    if (tableResult.data) {
      // 处理表格数据
      extractedTables.value = tableResult.data.tables || []
    }

    progress.value = 100
    progressStatus.value = 'success'
    ElMessage.success('提取完成')

    // 添加到历史记录
    addToHistory()

  } catch (error) {
    progressStatus.value = 'exception'
    ElMessage.error('提取失败')
  } finally {
    extracting.value = false
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

// 编辑实体
const editEntity = async (entity: any) => {
  const { value: newValue } = await ElMessageBox.prompt('修改实体值', '编辑实体', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: entity.value,
    inputPattern: /.+/,
    inputErrorMessage: '实体值不能为空'
  })

  if (newValue) {
    entity.value = newValue
    ElMessage.success('修改成功')
  }
}

// 删除实体
const deleteEntity = async (entity: any, index: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个实体吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    results.entities.splice(index, 1)
    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 添加自定义实体
const addCustomEntity = async () => {
  const { value: entityText } = await ElMessageBox.prompt('输入实体文本', '添加实体', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '实体文本不能为空'
  })

  if (entityText) {
    results.entities.push({
      type: '自定义',
      value: entityText,
      confidence: '100%'
    })
    ElMessage.success('添加成功')
  }
}

// 添加到历史记录
const addToHistory = () => {
  const doc = documents.value.find(d => d.id === extractForm.documentId)
  if (!doc) return

  extractionHistory.value.unshift({
    id: Date.now(),
    documentName: doc.name,
    types: [...extractForm.types],
    time: new Date().toLocaleString(),
    status: '完成'
  })

  // 只保留最近10条记录
  if (extractionHistory.value.length > 10) {
    extractionHistory.value = extractionHistory.value.slice(0, 10)
  }
}

// 导出结果
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
  a.download = 'extraction_results.json'
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('结果已导出')
}

// 清空结果
const clearResults = () => {
  results.entities = []
  results.keywords = []
  results.amounts = []
  results.dates = []
  results.sentences = []
  results.custom = []
  ElMessage.success('结果已清空')
}
</script>

<style scoped>
.info-extract {
  padding: 20px;
}
</style>

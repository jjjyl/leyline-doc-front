<template>
  <div class="info-extract">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">信息提取</h2>
      <el-form :model="extractForm" label-width="120px">
        <el-form-item label="选择文档库">
          <el-select v-model="extractForm.libId" placeholder="请选择文档库">
            <el-option
              v-for="lib in libList"
              :key="lib.libId"
              :label="lib.name"
              :value="lib.libId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择文档">
          <el-select v-model="extractForm.documentId" placeholder="请选择文档">
            <el-option v-for="doc in documents" :key="doc.id" :label="doc.name" :value="doc.id" />
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
            {{ extracting ? '提取中(可能需要几分钟)...' : '开始提取' }}
          </el-button>
          <el-button @click="pauseExtract" v-if="extracting">暂停</el-button>
          <el-button @click="cancelExtract" v-if="extracting">取消</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">提取结果</h3>
      <el-table :data="extractionHistory" style="width: 100%">
        <el-table-column prop="name" label="文档名" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="uploader_id" label="上传者ID" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="已提取表格" width="220">
          <template #default="{ row }">
            <el-button size="small" @click="showTable(row.id)"> 查看 </el-button>
          </template></el-table-column
        >
      </el-table>
    </div>

    <div class="mb-4">
      <el-button type="success" @click="exportResults">导出结果</el-button>
      <el-button type="warning" @click="clearResults">清空结果</el-button>
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

  const extractForm = reactive({
    libId: null as number | null,
    documentId: null,
    types: [] as string[],
    customRule: ''
  })

  const documents = ref<Array<Api.Doc.DocInfo>>([])
  const libList = ref<Array<Api.DocLib.DocLibInfo>>([])
  const parentId = ref(0)

  // 加载文档列表
  const loadDocuments = async () => {
    try {
      const res = await docApi.getDocList(parentId.value, extractForm.libId)
      const data = res.docs
      documents.value = data || []
      ElMessage.success(`获取到${documents.value.length}条文档`)
      console.log(documents.value)
    } catch (error) {
      ElMessage.error('获取文档列表失败')
    }
  }

  const loadLibs = async () => {
    try {
      const res = await docLibApi.fetchDocLibs()
      libList.value = res || []
      if (libList.value.length > 0) {
        if (extractForm.libId && libList.value.some((lib) => lib.libId === extractForm.libId)) {
          // 保持当前选中
        } else {
          extractForm.libId = libList.value[0]?.libId || null
        }
      } else {
        extractForm.libId = null
        ElMessage.warning('暂无文档库，请先创建文档库')
      }
    } catch (error) {
      ElMessage.error('获取文档库列表失败')
    }
  }

  // 组件挂载时加载文档列表
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

  // 开始提取
  const startExtract = async () => {
    if (!extractForm.documentId) {
      ElMessage.warning('请选择文档')
      return
    }

    extracting.value = true
    progress.value = 0
    progressStatus.value = undefined

    try {
      const res = await tableApi.extractTableData(extractForm.documentId)
      ElMessage.success('提取成功')
      await catchHistory()
    } catch (error) {
      progressStatus.value = 'exception'
      ElMessage.error('提取失败', error)
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

  const catchHistory = async () => {
    await loadDocuments()
    extractionHistory.value = documents.value.filter((doc) => doc.has_table).slice(0, 10)
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

  const showTable = async (docId: number) => {
    const res = await tableApi.getTableData(docId)
    openTableEditDialog(res)
  }
</script>

<style scoped>
  .info-extract {
    padding: 20px;
  }
</style>

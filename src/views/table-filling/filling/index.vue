<template>
  <div class="data-filling">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">多文档智能提表</h2>
      <el-form :model="extractForm" label-width="120px">
        <el-form-item label="选择模板">
          <el-select
            v-model="extractForm.templateIds"
            multiple
            filterable
            placeholder="请选择一个或多个模板文档"
            style="width: 100%"
          >
            <el-option
              v-for="template in templates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择数据源">
          <el-select
            v-model="extractForm.docIds"
            multiple
            filterable
            placeholder="请选择一个或多个数据源文档"
            style="width: 100%"
          >
            <el-option
              v-for="source in dataSources"
              :key="source.id"
              :label="source.name"
              :value="source.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="自然语言指令">
          <el-input
            v-model="extractForm.userPrompt"
            type="textarea"
            :rows="4"
            placeholder="例如：提取每个省份的名称、人均GDP、人口数量、每日核酸检测数"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="extracting" @click="handleExtract">
            开始提取
          </el-button>
          <el-button @click="clearResults">清空结果</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="extractResults.length > 0" class="mb-4">
      <h3 class="text-lg font-semibold mb-2">提取结果</h3>
      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane
          v-for="(table, idx) in extractResults"
          :key="idx"
          :label="`表格 ${idx + 1}`"
          :name="idx.toString()"
        >
          <div class="table-container">
            <el-table :data="table.rows" border stripe style="width: 100%">
              <el-table-column
                v-for="col in table.columns"
                :key="col"
                :prop="col"
                :label="col"
                min-width="120"
              />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div v-else-if="extractedOnce" class="text-center text-gray-500 py-8">
      暂无提取结果，请选择模板和数据源后点击“开始提取”
    </div>

    <!-- 原有的手动填写部分可以保留或移除，此处暂时保留 -->
    <!-- ... 原有手动填写代码 ... -->
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getDocList } from '@/api/doc'
  import { getTemplateList } from '@/api/templates'
  import { extractSpecifiedTables } from '@/api/table'

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

  // 加载模板和数据源
  const loadDocuments = async () => {
    try {
      // 1. 加载模板列表
      const templateRes = await getTemplateList()
      // 后端返回 { templates: [...] }
      const templatesList = templateRes.templates || []
      templates.value = templatesList.map((item: any) => ({
        id: item.id,
        name: item.name
      }))

      // 2. 加载数据源（所有文档，后续可扩展树形结构）
      const docsRes = await getDocList(undefined, undefined)
      // getDocList 直接返回文档数组（后端无 data 包裹）
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

  // 开始提取
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

    extracting.value = true
    extractedOnce.value = true

    try {
      const res = await extractSpecifiedTables({
        doc_ids: extractForm.docIds,
        template_ids: extractForm.templateIds,
        user_prompt: extractForm.userPrompt
      })

      const tables = res.tables || []
      if (tables.length === 0) {
        ElMessage.info('未提取到任何表格数据')
        extractResults.value = []
        return
      }

      extractResults.value = tables.map((item: any) => {
        const tableData = item.table
        const columns = tableData.headers || []
        const rows = (tableData.rows || []).map((row: any) => {
          const rowObj: Record<string, string> = {}
          columns.forEach((col: string, idx: number) => {
            rowObj[col] = row.cells?.[idx] || ''
          })
          return rowObj
        })
        return {
          columns,
          rows,
          tableId: item.table_id,
          templateId: item.template_id
        }
      })

      activeTab.value = '0'
      ElMessage.success(`成功提取 ${extractResults.value.length} 个表格`)
    } catch (error: any) {
      console.error('提取失败:', error)
      ElMessage.error(error.message || '提取失败，请检查后端服务')
    } finally {
      extracting.value = false
    }
  }

  // 清空结果
  const clearResults = () => {
    extractResults.value = []
    extractedOnce.value = false
    activeTab.value = '0'
  }

  onMounted(() => {
    loadDocuments()
  })
</script>

<style scoped>
  .data-filling {
    padding: 20px;
  }

  .preview-table th,
  .preview-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  .preview-table th {
    background-color: #f2f2f2;
  }

  .table-container {
    max-height: 600px;
    overflow-y: auto;
  }
</style>

<template>
  <div class="data-filling">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">数据匹配与填写</h2>
      <el-form :model="fillingForm" label-width="120px">
        <el-form-item label="选择模板">
          <el-select v-model="fillingForm.templateId" placeholder="请选择表格模板">
            <el-option
              v-for="template in templates"
              :key="template.id"
              :label="template.name"
              :value="template.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择数据源">
          <el-select v-model="fillingForm.dataSourceId" placeholder="请选择数据源">
            <el-option
              v-for="data in dataSources"
              :key="data.id"
              :label="data.name"
              :value="data.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="startAutoFilling">自动填写</el-button>
          <el-button @click="previewFilling">预览填写结果</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">填写进度</h3>
      <el-progress :percentage="fillingProgress" :status="fillingStatus" />
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">填写结果预览</h3>
      <div class="table-preview">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id">
              <td v-for="cell in row.cells" :key="cell.id" :class="{ unmatched: !cell.matched }">
                {{ cell.value }}
                <el-button v-if="!cell.matched" size="small" type="text" @click="manualFill(cell)">
                  手动填写
                </el-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <el-dialog v-model="manualDialog" title="手动填写" width="500px">
      <el-form :model="manualForm" label-width="80px">
        <el-form-item label="字段名">
          <span>{{ manualForm.fieldName }}</span>
        </el-form-item>
        <el-form-item label="填写内容">
          <el-input v-model="manualForm.value" />
        </el-form-item>
        <el-form-item>
          <el-button @click="confirmManualFill">确认</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getDocList } from '@/api/doc'
  //import { getTableData, generateTable } from '@/api/doc'

  const fillingForm = reactive({
    templateId: '',
    dataSourceId: ''
  })

  const templates = ref([])
  const dataSources = ref([])

  // 加载模板和数据源
  const loadTemplatesAndDataSources = async () => {
    try {
      // 加载模板（实际上是包含表格的文档）
      const templateResponse = await getDocList()
      templates.value = (templateResponse.data.list || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        tableCount: doc.tableCount || 0
      }))

      // 加载数据源（文档列表）
      const docResponse = await getDocList()
      dataSources.value = (docResponse.data.list || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name
      }))
    } catch (error) {
      ElMessage.error('加载数据失败')
    }
  }

  const fillingProgress = ref(0)
  const fillingStatus = ref<'success' | 'warning' | 'exception' | undefined>()

  const tableHeaders = ref(['甲方', '乙方', '合同金额', '签订日期'])
  const tableData = ref([])

  const manualDialog = ref(false)
  const manualForm = reactive({
    cellId: 0,
    fieldName: '',
    value: ''
  })

  const startAutoFilling = async () => {
    if (!fillingForm.templateId || !fillingForm.dataSourceId) {
      ElMessage.warning('请选择模板和数据源')
      return
    }

    fillingProgress.value = 0
    fillingStatus.value = ''

    try {
      // 获取模板文档的表格数据
      const templateTables = await getTableData(fillingForm.templateId)
      const dataSourceTables = await getTableData(fillingForm.dataSourceId)

      // 显示进度
      fillingProgress.value = 50

      // 这里应该实现实际的数据匹配和填写逻辑
      // 目前先显示模板表格作为示例
      if (templateTables.data.tables && templateTables.data.tables.length > 0) {
        const firstTable = templateTables.data.tables[0]
        tableHeaders.value = firstTable.headers || []
        tableData.value = firstTable.rows.map((row: any, index: number) => ({
          id: index + 1,
          cells: row.cells.map((cell: string, cellIndex: number) => ({
            id: cellIndex + 1,
            value: cell,
            matched: true
          }))
        }))
      }

      fillingProgress.value = 100
      fillingStatus.value = 'success'
      ElMessage.success('自动填写完成')
    } catch (error) {
      fillingStatus.value = 'exception'
      ElMessage.error('填写失败')
    }
  }

  const previewFilling = () => {
    ElMessage.info('预览功能已显示在下方')
  }

  const manualFill = (cell: any) => {
    manualForm.cellId = cell.id
    manualForm.fieldName = '签订日期' // 示例
    manualForm.value = cell.value
    manualDialog.value = true
  }

  const confirmManualFill = () => {
    // 更新单元格值
    const row = tableData.value.find((r) => r.cells.some((c) => c.id === manualForm.cellId))
    if (row) {
      const cell = row.cells.find((c) => c.id === manualForm.cellId)
      if (cell) {
        cell.value = manualForm.value
        cell.matched = true
      }
    }
    manualDialog.value = false
    ElMessage.success('手动填写成功')
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadTemplatesAndDataSources()
  })
</script>

<style scoped>
  .data-filling {
    padding: 20px;
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
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

  .unmatched {
    background-color: #fff3cd;
  }
</style>

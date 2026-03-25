<template>
  <div class="table-export">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">表格导出与分享</h2>
      <el-form :model="exportForm" label-width="120px">
        <el-form-item label="选择已填写的表格">
          <el-select v-model="exportForm.tableId" placeholder="请选择表格">
            <el-option
              v-for="table in filledTables"
              :key="table.id"
              :label="table.name"
              :value="table.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="word">Word (.docx)</el-radio>
            <el-radio label="excel">Excel (.xlsx)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="exportTable">导出文件</el-button>
          <el-button @click="generateShareLink">生成分享链接</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">已填写表格列表</h3>
      <el-table :data="filledTables" style="width: 100%">
        <el-table-column prop="name" label="表格名称" />
        <el-table-column prop="templateName" label="模板" />
        <el-table-column prop="fillTime" label="填写时间" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="small" @click="previewTable(scope.row)">预览</el-button>
            <el-button size="small" @click="exportTable(scope.row)">导出</el-button>
            <el-button size="small" @click="shareTable(scope.row)">分享</el-button>
            <el-button size="small" type="danger" @click="deleteTable(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">分享链接</h3>
      <div v-if="shareLink" class="share-link">
        <el-input v-model="shareLink" readonly />
        <el-button @click="copyLink">复制链接</el-button>
        <el-button @click="sendEmail">发送邮件</el-button>
      </div>
    </div>

    <el-dialog v-model="previewDialog" title="表格预览" width="80%">
      <div class="table-preview">
        <table class="preview-table">
          <thead>
            <tr>
              <th v-for="header in previewHeaders" :key="header">{{ header }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in previewData" :key="row.id">
              <td v-for="cell in row.cells" :key="cell.id">{{ cell.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const exportForm = reactive({
  tableId: 0,
  format: 'word'
})

const filledTables = ref([])

// 加载已填写的表格
const loadFilledTables = async () => {
  try {
    // 这里可以调用API获取已填写的表格列表
    // 暂时使用空数组，需要后端提供相应的API
    filledTables.value = []
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadFilledTables()
})

const shareLink = ref('')
const previewDialog = ref(false)
const previewHeaders = ref(['甲方', '乙方', '合同金额', '签订日期'])
const previewData = ref([
  {
    id: 1,
    cells: [
      { id: 1, value: 'ABC公司' },
      { id: 2, value: 'XYZ公司' },
      { id: 3, value: '100000元' },
      { id: 4, value: '2024-01-01' }
    ]
  }
])

const exportTable = async (table?: any) => {
  const targetTable = table || filledTables.value.find(t => t.id === exportForm.tableId)
  if (!targetTable) {
    ElMessage.warning('请选择表格')
    return
  }

  try {
    const response = await fetch(`/api/tables/export/${targetTable.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: exportForm.format })
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${targetTable.name}.${exportForm.format === 'word' ? 'docx' : 'xlsx'}`
      a.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error('导出失败')
    }
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

const generateShareLink = async () => {
  if (!exportForm.tableId) {
    ElMessage.warning('请选择表格')
    return
  }

  try {
    const response = await fetch(`/api/tables/share/${exportForm.tableId}`)
    const data = await response.json()
    shareLink.value = data.shareUrl
    ElMessage.success('分享链接生成成功')
  } catch (error) {
    ElMessage.error('生成分享链接失败')
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  ElMessage.success('链接已复制到剪贴板')
}

const sendEmail = () => {
  const subject = '表格分享'
  const body = `请查看以下表格：${shareLink.value}`
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const previewTable = (table: any) => {
  previewDialog.value = true
}

const shareTable = (table: any) => {
  exportForm.tableId = table.id
  generateShareLink()
}

const deleteTable = (table: any) => {
  filledTables.value = filledTables.value.filter(t => t.id !== table.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.table-export {
  padding: 20px;
}

.share-link {
  display: flex;
  gap: 10px;
  align-items: center;
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
</style>

<template>
  <div class="template-import">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">表格模板导入</h2>
      <p class="text-gray-600 mb-4"
        >请上传包含表格的文档（Word或Excel格式），系统将自动提取表格结构作为模板</p
      >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :http-request="handleUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :file-list="fileList"
        multiple
        :limit="5"
        :accept="'.docx,.xlsx'"
        :before-upload="beforeUpload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text"> 将模板文件拖到此处，或 <em>点击上传</em> </div>
        <template #tip>
          <div class="el-upload__tip"> 支持 Word(.docx) 和 Excel(.xlsx) 格式的文档 </div>
        </template>
      </el-upload>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">已导入模板文档</h3>
      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="name" label="文档名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="createTime" label="导入时间" />
        <el-table-column label="表格数量" width="120">
          <template #default="scope">
            {{ scope.row.tableCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button size="small" @click="viewTables(scope.row)">查看表格</el-button>
            <el-button size="small" @click="extractTables(scope.row)">提取表格</el-button>
            <el-button size="small" type="danger" @click="deleteDocument(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 表格查看对话框 -->
    <el-dialog v-model="tableDialog" title="文档表格" width="90%">
      <div v-if="currentTables.length === 0" class="text-center py-8">
        <p class="text-gray-500">暂无表格数据，请先提取表格</p>
      </div>
      <div v-else>
        <el-tabs v-model="activeTableIndex" @tab-click="handleTableChange">
          <el-tab-pane
            v-for="(table, index) in currentTables"
            :key="index"
            :label="(table as TableData).name || `表格 ${index + 1}`"
            :name="index.toString()"
          >
            <div class="table-container">
              <table class="extracted-table">
                <thead>
                  <tr>
                    <th v-for="header in (table as TableData).headers" :key="header">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in (table as TableData).rows" :key="row.id || Math.random()">
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
  import { ElMessage } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import { getTemplateList, deleteTemplate } from '@/api/templates'
  import { uploadDocument } from '@/api/documents'
  import { extractTableData } from '@/api/table'

  // 定义表格类型
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
  }

  const fileList = ref<any[]>([])
  const templates = ref<TemplateDoc[]>([])

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      const response = await getTemplateList()
      templates.value = response.data.list || []
    } catch {
      ElMessage.error('获取模板列表失败')
    }
  }

  // 组件挂载时加载模板
  onMounted(() => {
    loadTemplates()
  })

  const tableDialog = ref(false)
  const activeTableIndex = ref('0')
  const currentTables = ref<TableData[]>([])

  const handleSuccess = async () => {
    ElMessage.success('上传成功')
    // 重新加载模板列表
    await loadTemplates()
  }

  const handleError = (error: any) => {
    console.error('上传失败:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  }

  const viewTables = (document: TemplateDoc) => {
    currentTables.value = document.tables || []
    tableDialog.value = true
  }

  const extractTables = async (document: TemplateDoc) => {
    try {
      await extractTableData(document.id)
      ElMessage.success('表格提取成功')
      await loadTemplates()
    } catch {
      ElMessage.error('表格提取失败')
    }
  }

  const deleteDocument = async (document: TemplateDoc) => {
    try {
      await deleteTemplate(document.id)
      templates.value = templates.value.filter((t) => t.id !== document.id)
      ElMessage.success('删除成功')
    } catch {
      ElMessage.error('删除失败')
    }
  }

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options
    try {
      const result = await uploadDocument(file)
      onSuccess(result, file)
    } catch (error) {
      onError(error)
    }
  }

  const beforeUpload = (file: File) => {
    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const isValid = isDocx || isXlsx
    if (!isValid) {
      ElMessage.error('仅支持上传 .docx 或 .xlsx 格式的文件')
    }
    return isValid
  }

  const handleTableChange = (tab: any) => {
    activeTableIndex.value = tab.name
  }
</script>

<style scoped>
  .template-import {
    padding: 20px;
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
</style>

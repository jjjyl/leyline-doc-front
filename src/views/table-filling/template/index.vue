<template>
  <div class="template-import">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">表格模板导入</h2>
      <p class="text-gray-600 mb-4"
        >请上传包含表格的文档（Word或Excel格式），系统将自动提取表格结构作为模板</p
      >

      <!-- 操作按钮栏 -->
      <div class="flex items-center gap-4 mb-4">
        <el-button
          type="primary"
          @click="confirmUpload"
          :loading="uploading"
          :disabled="fileList.length === 0 || uploading"
        >
          确认上传
        </el-button>
        <el-button @click="clearFileList" :disabled="fileList.length === 0 || uploading">
          清空缓存
        </el-button>
        <span v-if="fileList.length > 0" class="text-sm text-gray-500">
          已缓存 {{ fileList.length }} 个文件
        </span>
      </div>

      <!-- 上传区域（手动上传模式） -->
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        v-model:file-list="fileList"
        multiple
        :limit="5"
        :accept="'.docx,.xlsx'"
        :before-upload="beforeUpload"
        :disabled="uploading"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text"> 将模板文件拖到此处，或 <em>点击上传</em> </div>
        <template #tip>
          <div class="el-upload__tip"> 支持 Word(.docx) 和 Excel(.xlsx) 格式的文档 </div>
        </template>
      </el-upload>
    </div>

    <!-- 模板列表（保持不变） -->
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

    <!-- 表格查看对话框（保持不变） -->
    <el-dialog v-model="tableDialog" title="文档表格" width="90%">
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
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .gap-4 {
    gap: 1rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-gray-500 {
    color: #6b7280;
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

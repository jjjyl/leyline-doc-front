<template>
  <div class="template-import">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">表格模板导入</h2>
      <el-upload
        class="upload-demo"
        drag
        :action="uploadAction"
        :on-success="handleSuccess"
        :on-error="handleError"
        :file-list="fileList"
        :limit="5"
        :accept="'.docx,.xlsx'"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将模板文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 word(.docx) 和 excel(.xlsx) 格式的表格模板
          </div>
        </template>
      </el-upload>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">已导入模板</h3>
      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="name" label="模板名称" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="createTime" label="导入时间" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="previewTemplate(scope.row)">预览</el-button>
            <el-button size="small" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="editDialog" title="编辑模板" width="80%">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="模板名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="填写规则">
          <el-input
            v-model="editForm.rules"
            type="textarea"
            :rows="4"
            placeholder="描述表格的填写规则和格式要求"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="saveTemplate">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const uploadAction = '/api/templates/upload'
const fileList = ref([])
const templates = ref([])

// 加载模板列表
const loadTemplates = async () => {
  try {
    const response = await fetch('/api/templates')
    const data = await response.json()
    templates.value = data.list || []
  } catch (error) {
    ElMessage.error('获取模板列表失败')
  }
}

// 组件挂载时加载模板
onMounted(() => {
  loadTemplates()
})

const editDialog = ref(false)
const editForm = reactive({
  id: 0,
  name: '',
  rules: ''
})

const handleSuccess = (response: any, file: any) => {
  ElMessage.success('上传成功')
  templates.value.push({
    id: Date.now(),
    name: file.name,
    type: file.name.split('.').pop(),
    createTime: new Date().toLocaleString(),
    rules: '待配置'
  })
}

const handleError = () => {
  ElMessage.error('上传失败')
}

const previewTemplate = (template: any) => {
  ElMessage.info('预览功能待实现')
}

const editTemplate = (template: any) => {
  editForm.id = template.id
  editForm.name = template.name
  editForm.rules = template.rules
  editDialog.value = true
}

const saveTemplate = () => {
  const index = templates.value.findIndex(t => t.id === editForm.id)
  if (index !== -1) {
    templates.value[index].name = editForm.name
    templates.value[index].rules = editForm.rules
  }
  editDialog.value = false
  ElMessage.success('保存成功')
}

const deleteTemplate = (template: any) => {
  templates.value = templates.value.filter(t => t.id !== template.id)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.template-import {
  padding: 20px;
}
</style>

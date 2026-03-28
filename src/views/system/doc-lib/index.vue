<template>
  <div class="doc-lib-manage">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">文档库管理</h2>
      <p class="text-gray-600 mb-4">管理您的文档库，可以创建、编辑、删除文档库</p>
    </div>

    <!-- 创建文档库按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建文档库
      </el-button>
    </div>

    <!-- 文档库列表 -->
    <el-table :data="docLibs" style="width: 100%" v-loading="loading">
      <el-table-column prop="libId" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="belongsUserId" label="所属用户ID" width="120" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editDocLib(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDocLib(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑文档库对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑文档库' : '创建文档库'"
      width="500px"
    >
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入文档库名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue'
  import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import {
    fetchDocLibs,
    docLibCreate,
    updateDocLib,
    deleteDocLib as deleteDocLibApi
  } from '@/api/doc-lib'

  interface DocLib {
    libId: number
    name: string
    belongsUserId: number
  }

  const loading = ref(false)
  const submitLoading = ref(false)
  const showCreateDialog = ref(false)
  const isEdit = ref(false)
  const docLibs = ref<DocLib[]>([])
  const currentEditId = ref<number | null>(null)

  const formRef = ref<FormInstance>()
  const formData = reactive({
    name: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入文档库名称', trigger: 'blur' }]
  }

  // 加载文档库列表
  const loadDocLibs = async () => {
    try {
      loading.value = true
      docLibs.value = await fetchDocLibs()
    } catch (error) {
      console.error('加载文档库列表失败:', error)
      ElMessage.error('加载文档库列表失败')
    } finally {
      loading.value = false
    }
  }

  // 创建文档库
  const handleCreate = async () => {
    try {
      submitLoading.value = true
      await docLibCreate(formData.name)
      ElMessage.success('创建成功')
      showCreateDialog.value = false
      formData.name = ''
      await loadDocLibs()
    } catch (error) {
      console.error('创建文档库失败:', error)
      ElMessage.error('创建文档库失败')
    } finally {
      submitLoading.value = false
    }
  }

  // 更新文档库
  const handleUpdate = async () => {
    if (!currentEditId.value) return

    try {
      submitLoading.value = true
      await updateDocLib(currentEditId.value, formData.name)
      ElMessage.success('更新成功')
      showCreateDialog.value = false
      formData.name = ''
      currentEditId.value = null
      await loadDocLibs()
    } catch (error) {
      console.error('更新文档库失败:', error)
      ElMessage.error('更新文档库失败')
    } finally {
      submitLoading.value = false
    }
  }

  // 编辑文档库
  const editDocLib = (docLib: DocLib) => {
    isEdit.value = true
    currentEditId.value = docLib.libId
    formData.name = docLib.name
    showCreateDialog.value = true
  }

  // 删除文档库
  const deleteDocLib = async (docLib: DocLib) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除文档库 "${docLib.name}" 吗？此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await deleteDocLibApi(docLib.libId)
      ElMessage.success('删除成功')
      await loadDocLibs()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文档库失败:', error)
        ElMessage.error('删除文档库失败')
      }
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      if (isEdit.value) {
        await handleUpdate()
      } else {
        await handleCreate()
      }
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  // 组件挂载时加载数据
  onMounted(() => {
    loadDocLibs()
  })
</script>

<style scoped>
.doc-lib-manage {
  padding: 20px;
}
</style>

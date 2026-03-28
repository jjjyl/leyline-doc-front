<template>
  <div class="doc-import">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">文档导入与识别</h2>

      <!-- 文档库选择区域 -->
      <div class="flex items-center gap-4 mb-4">
        <el-select
          v-model="selectedLibId"
          placeholder="请选择文档库"
          :disabled="uploadingActive"
          style="width: 240px"
          @change="onLibChange"
        >
          <el-option
            v-for="lib in libOptions"
            :key="lib.libId"
            :label="lib.name"
            :value="lib.libId"
          />
        </el-select>

        <!-- 编辑文档库按钮（移除权限限制） -->
        <el-button
          type="primary"
          plain
          :icon="Edit"
          :disabled="!selectedLibId || uploadingActive"
          @click="openEditLibDialog"
        >
          编辑
        </el-button>

        <!-- 删除文档库按钮 -->
        <el-button
          type="danger"
          plain
          :icon="Delete"
          :disabled="!selectedLibId || uploadingActive"
          @click="handleDeleteLib"
        >
          删除
        </el-button>

        <el-button
          type="primary"
          plain
          @click="showCreateLibDialog = true"
          :disabled="uploadingActive"
        >
          新建文档库
        </el-button>

        <el-button
          type="primary"
          @click="confirmUpload"
          :loading="uploadingActive"
          :disabled="!selectedLibId || fileList.length === 0"
        >
          {{ uploadingActive ? '上传中...' : '确认上传' }}
        </el-button>

        <el-button @click="clearFileList" :disabled="uploadingActive || fileList.length === 0">
          清空缓存
        </el-button>

        <span v-if="fileList.length > 0" class="text-sm text-gray-500">
          已缓存 {{ fileList.length }} 个文件
        </span>
      </div>

      <!-- 上传区域 -->
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        v-model:file-list="fileList"
        multiple
        :limit="10"
        :accept="'.docx,.md,.xlsx,.txt'"
        :before-upload="beforeUpload"
        :disabled="uploadingActive"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div v-if="!uploadingActive">
          <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
          <!-- 自定义文件卡片列表 -->
        </div>
        <div v-else class="progress-container">
          <p>正在上传: {{ currentUploadFileName }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${currentUploadProgress}%` }"></div>
          </div>
          <span>{{ currentUploadProgress }}%</span>
          <p class="text-sm mt-1">进度: {{ uploadedCount }} / {{ totalUploadCount }}</p>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 docx、md、xlsx、txt 格式， 请先选择文档库，再添加文件，最后点击【确认上传】
          </div>
        </template>
      </el-upload>
    </div>



    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">已导入文档</h3>
      <el-table :data="documents" style="width: 100%">
        <el-table-column prop="name" label="文件名" />
        <el-table-column prop="size" label="大小" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="previewDocument(scope.row)">预览</el-button>
            <el-button size="small" type="danger" @click="deleteDocument(scope.row)"
            >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="previewDialog" title="文档预览" width="80%">
      <div v-html="previewContent"></div>
    </el-dialog>
  </div>
  <!-- 新建文档库对话框 -->
  <el-dialog
    v-model="showCreateLibDialog"
    title="新建文档库"
    width="30%"
    @close="resetCreateLibForm"
  >
    <el-form :model="createLibForm" :rules="createLibRules" ref="createLibFormRef">
      <el-form-item label="文档库名称" prop="name">
        <el-input v-model="createLibForm.name" placeholder="请输入文档库名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showCreateLibDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateLib" :loading="creatingLib"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑文档库对话框 -->
  <el-dialog
    v-model="showEditLibDialog"
    title="编辑文档库"
    width="30%"
    @close="resetEditLibForm"
  >
    <el-form :model="editLibForm" :rules="editLibRules" ref="editLibFormRef">
      <el-form-item label="文档库名称" prop="name">
        <el-input v-model="editLibForm.name" placeholder="请输入文档库名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditLibDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEditLib" :loading="editingLib"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { UploadFilled, Edit, Delete } from '@element-plus/icons-vue'
  import * as docLibApi from '@/api/doc-lib'
  import * as docApi from '@/api/doc'
  import axios from 'axios'
  import { useUserStore } from '@/store/modules/user'

  const userStore = useUserStore()
  // import FileCardList from '@/views/doc-extraction/import/FireCardList.vue'

  // 文档列表（已导入的）
  const documents = ref([])

  // 预览相关
  const previewDialog = ref(false)
  const previewContent = ref('')
  const selectedDoc = ref(null)

  // 文档库相关
  const libOptions = ref<any[]>([])
  const selectedLibId = ref<number | null>(null)
  const parentId = ref<number>(0)

  // 上传相关
  const uploadRef = ref<any>(null)
  const fileList = ref<any[]>([])
  const uploadingActive = ref(false)
  const currentUploadFileName = ref('')
  const currentUploadProgress = ref(0)
  const uploadedCount = ref(0)
  const totalUploadCount = ref(0)

  // 新建文档库相关
  const showCreateLibDialog = ref(false)
  const creatingLib = ref(false)
  const createLibForm = ref({
    name: ''
  })
  const createLibFormRef = ref()
  const createLibRules = {
    name: [
      { required: true, message: '请输入文档库名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ]
  }

  // 编辑文档库相关
  const showEditLibDialog = ref(false)
  const editingLib = ref(false)
  const editLibForm = ref({
    name: ''
  })
  const editLibFormRef = ref()
  const currentEditLibId = ref<number | null>(null)
  const editLibRules = {
    name: [
      { required: true, message: '请输入文档库名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ]
  }

  // 打开编辑对话框
  const openEditLibDialog = () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择要编辑的文档库')
      return
    }
    const lib = libOptions.value.find(item => item.libId === selectedLibId.value)
    if (lib) {
      currentEditLibId.value = lib.libId
      editLibForm.value.name = lib.name
      showEditLibDialog.value = true
    }
  }

  // 提交编辑
  const handleEditLib = async () => {
    if (!currentEditLibId.value) return
    try {
      await editLibFormRef.value.validate()
      editingLib.value = true

      await docLibApi.updateDocLib(currentEditLibId.value, editLibForm.value.name)

      ElMessage.success('文档库更新成功')

      showEditLibDialog.value = false

      // 刷新文档库列表
      await loadLibs()

      // 保持选中当前编辑的文档库（如果还存在）
      if (libOptions.value.some(lib => lib.libId === currentEditLibId.value)) {
        selectedLibId.value = currentEditLibId.value
      } else {
        // 如果被删除或其他情况，选中第一个
        selectedLibId.value = libOptions.value[0]?.libId || null
      }

      // 重新加载当前库的文档列表
      await loadDocuments()
    } catch (error) {
      console.error('编辑文档库失败:', error)
      ElMessage.error('编辑文档库失败，请重试')
    } finally {
      editingLib.value = false
    }
  }

  // 删除文档库
  const handleDeleteLib = async () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择要删除的文档库')
      return
    }

    const libToDelete = libOptions.value.find(lib => lib.libId === selectedLibId.value)
    if (!libToDelete) return

    try {
      await ElMessageBox.confirm(
        `确定要删除文档库“${libToDelete.name}”吗？删除后该库下的所有文档也将被删除，此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await docLibApi.deleteDocLib(selectedLibId.value)

      ElMessage.success('文档库删除成功')

      // 刷新文档库列表
      await loadLibs()

      // 如果还有文档库，选中第一个；否则清空选中并清空文档列表
      if (libOptions.value.length > 0) {
        selectedLibId.value = libOptions.value[0].libId
        await loadDocuments()
      } else {
        selectedLibId.value = null
        documents.value = []
        ElMessage.info('已无文档库，请先创建')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文档库失败:', error)
        ElMessage.error('删除文档库失败，请重试')
      }
    }
  }

  // 监听文档库变化
  watch(selectedLibId, (newVal) => {
    if (newVal) {
      loadDocuments()
    } else {
      documents.value = []
    }
  })

  // 失败文件记录
  const failedFiles = ref<{ name: string; error: string }[]>([])

  const SUPPORTED_FORMATS = ['docx', 'xlsx', 'md', 'txt']

  // 验证文件（添加到列表前校验）
  const beforeUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !SUPPORTED_FORMATS.includes(fileType)) {
      ElMessage.error(`不支持的文件格式：${fileType}。支持格式：${SUPPORTED_FORMATS.join(', ')}`)
      return false
    }
    return true
  }

  // 清空文件缓存
  const clearFileList = () => {
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    fileList.value = []
    ElMessage.info('已清空待上传文件列表')
  }

  // 切换文档库时清空缓存文件
  const onLibChange = () => {
    if (fileList.value.length > 0) {
      ElMessageBox.confirm('切换文档库会清空当前已缓存的文件列表，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearFileList()
          loadDocuments()
        })
        .catch(() => {
          // 取消切换，恢复原值
          loadDocuments()
        })
    } else {
      loadDocuments()
    }
  }

  // 上传单个文件
  const uploadSingleFile = (file: File, libId: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sessionParams: Api.Doc.CreateUploadSessionRequest = {
          file_name: file.name,
          file_size: file.size,
          lib_id: libId,
          parent_id: parentId.value,
          type: file.type || 'file'
        }

        const sessionData: Api.Doc.CreateUploadSessionResponse =
          await docApi.createUploadSession(sessionParams)

        const { doc_id, upload_url } = sessionData

        await axios.put(upload_url, file, {
          headers: { 'Content-Type': 'application/octet-stream' },
          onUploadProgress: (e) => {
            if (e.total) {
              currentUploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
          }
        })

        await docApi.finishUpload(doc_id)

        resolve()
      } catch (err) {
        console.error(`文件 ${file.name} 上传失败:`, err)
        reject(err)
      }
    })
  }

  // 确认上传
  const confirmUpload = async () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择文档库')
      return
    }

    if (fileList.value.length === 0) {
      ElMessage.warning('请先添加要上传的文件')
      return
    }

    uploadingActive.value = true
    failedFiles.value = []
    uploadedCount.value = 0
    totalUploadCount.value = fileList.value.length

    const filesToUpload = fileList.value.map((item) => item.raw)

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      currentUploadFileName.value = file.name
      currentUploadProgress.value = 0

      try {
        await uploadSingleFile(file, selectedLibId.value)
        uploadedCount.value++
        ElMessage.success(`文件 ${file.name} 上传成功`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '上传失败'
        failedFiles.value.push({ name: file.name, error: errorMsg })
        ElMessage.error(`文件 ${file.name} 上传失败: ${errorMsg}`)
      }
    }

    uploadingActive.value = false
    currentUploadFileName.value = ''
    currentUploadProgress.value = 0

    if (failedFiles.value.length === 0) {
      ElMessage.success(`全部 ${totalUploadCount.value} 个文件上传成功`)
    } else {
      ElMessage.warning(
        `上传完成，成功 ${uploadedCount.value} 个，失败 ${failedFiles.value.length} 个`
      )
    }

    clearFileList()
    await loadDocuments()
  }

  // 预览文档
  const previewDocument = async (doc: any) => {
    try {
      const token = userStore.accessToken
      if (!token) {
        ElMessage.error('未登录，无法预览')
        return
      }

      const wopiSrc = `http://192.168.0.136:36879/wopi/files/${doc.id}`
      const previewUrl = `http://office.server.poyuan233.cn:8088/loleaflet/dist/loleaflet.html?WOPISrc=${encodeURIComponent(wopiSrc)}&access_token=${token}&lang=zh-CN`
      window.open(previewUrl, '_blank')
    } catch (error) {
      ElMessage.error('预览失败')
    }
  }

  // 删除文档
  const deleteDocument = async (doc: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除文档 "${doc.name}" 吗？此操作不可恢复。`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await docApi.deleteDoc(doc.id)
      ElMessage.success('删除成功')
      await loadDocuments()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 加载文档列表
  const loadDocuments = async () => {
    if (!selectedLibId.value) return
    documents.value = []
    try {
      const response = await docApi.getDocList(parentId.value, selectedLibId.value)
      documents.value = response.docs || []
    } catch (error) {
      ElMessage.error('获取文档列表失败')
    }
  }

  // 加载文档库列表
  const loadLibs = async () => {
    try {
      const libList = await docLibApi.fetchDocLibs()
      libOptions.value = libList || []
      if (libOptions.value.length > 0) {
        if (selectedLibId.value && libOptions.value.some(lib => lib.libId === selectedLibId.value)) {
          // 保持当前选中
        } else {
          selectedLibId.value = libOptions.value[0]?.libId || null
        }
      } else {
        selectedLibId.value = null
        ElMessage.warning('暂无文档库，请先创建文档库')
      }
    } catch (error) {
      ElMessage.error('获取文档库列表失败')
    }
  }

  // 新建文档库
  const handleCreateLib = async () => {
    try {
      await createLibFormRef.value.validate()
      creatingLib.value = true

      const res = await docLibApi.docLibCreate(createLibForm.value.name)
      const newLibId = res.lib_id || res.data?.lib_id

      ElMessage.success('文档库创建成功')

      showCreateLibDialog.value = false

      await loadLibs()

      if (newLibId) {
        selectedLibId.value = newLibId
      } else if (libOptions.value.length > 0) {
        selectedLibId.value = libOptions.value[0].libId
      }

      clearFileList()
      await loadDocuments()
    } catch (error) {
      console.error('创建文档库失败:', error)
      ElMessage.error('创建文档库失败，请重试')
    } finally {
      creatingLib.value = false
    }
  }

  // 移除单个文件
  const removeFile = (file: any) => {
    const index = fileList.value.findIndex(f => f.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
      ElMessage.info(`已移除文件: ${file.name}`)
    }
  }

  // 组件挂载时加载文档库和文档列表
  onMounted(async () => {
    await loadLibs()
    if (selectedLibId.value) {
      await loadDocuments()
    }
  })
</script>

<style scoped>
  .doc-import {
    padding: 20px;
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

  .mt-1 {
    margin-top: 0.25rem;
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .progress-container {
    text-align: center;
    width: 100%;
    padding: 20px;
  }

  .progress-bar {
    width: 100%;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    margin: 10px 0;
  }

  .progress-fill {
    height: 20px;
    background-color: #409eff;
    transition: width 0.3s ease;
  }
</style>
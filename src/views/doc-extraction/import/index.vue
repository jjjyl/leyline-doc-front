<template>
  <div class="doc-import">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">文档导入与识别</h2>
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :http-request="handleUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
        :file-list="fileList"
        multiple
        :limit="10"
        :accept="'.docx,.md,.xlsx,.txt'"
        :before-upload="beforeUpload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div v-if="!uploading">
          <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
        </div>
        <div v-else class="progress-container">
          <p>正在上传: {{ fileName }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <span>{{ progress }}%</span>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 docx(≥500KB)、md(≥15KB)、xlsx(≥500KB)、txt(≥15KB) 格式
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
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { UploadFilled } from '@element-plus/icons-vue'
  import * as docLibApi from '@/api/doc-lib'
  import * as docApi from '@/api/doc'
  import axios from 'axios'

  const documents = ref([])

  const previewDialog = ref(false)
  const previewContent = ref('')
  const selectedDoc = ref(null)

  const fileList = ref<any[]>([])
  const parentId = ref<number>(0)
  const libId = ref<number>(1)

  // 状态
  const fileInputRef = ref<HTMLInputElement>()
  const isDragover = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const fileName = ref('')
  const uploadResult = ref<any>(null)

  // 文件格式和大小限制
  const FILE_SIZE_LIMITS = {
    docx: 500 * 1024, // 500KB
    xlsx: 500 * 1024, // 500KB
    md: 15 * 1024, // 15KB
    txt: 15 * 1024 // 15KB
  }

  const SUPPORTED_FORMATS = ['docx', 'xlsx', 'md', 'txt']

  // 验证文件
  const beforeUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !SUPPORTED_FORMATS.includes(fileType)) {
      ElMessage.error(`不支持的文件格式：${fileType}。支持格式：${SUPPORTED_FORMATS.join(', ')}`)
      return false
    }

    const sizeLimit = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS]
    if (file.size < sizeLimit) {
      ElMessage.error(`${fileType}文件大小不能小于${sizeLimit / 1024}KB`)
      return false
    }

    console.log('验证完成')
    return true
  }

  const handleSuccess = async (response: any, file: any) => {
    ElMessage.success('上传成功')
    // 重新获取文档列表
    await loadDocuments()
  }

  const handleError = (error: any, file: any) => {
    console.error('Upload error:', error)
    ElMessage.error(`上传失败：${file.name}`)
  }

  const handleRemove = (file: any, fileList: any[]) => {
    console.log('File removed:', file)
  }

  const previewDocument = async (doc: any) => {
    try {
      selectedDoc.value = doc
      // 调用API获取预览内容
      const response = await fetch(`/api/documents/${doc.id}/preview`)
      const data = await response.json()
      previewContent.value = data.content
      previewDialog.value = true
    } catch (error) {
      ElMessage.error('预览失败', error)
    }
  }

  const deleteDocument = async (doc: any) => {
    try {
      await ElMessageBox.confirm(`确定要删除文档 "${doc.name}" 吗？此操作不可恢复。`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      // 调用API删除文档
      const res = await docApi.deleteDoc(doc.id)
      console.log(res)
      ElMessage.success('删除成功')
      // 重新获取文档列表
      await loadDocuments()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  // 加载文档列表
  const loadDocuments = async () => {
    try {
      const response = await docApi.getDocList(parentId.value, libId.value)
      const data = response.docs
      documents.value = data || []
    } catch (error) {
      ElMessage.error('获取文档列表失败')
    }
  }

  // 核心上传
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;

    uploading.value = true
    fileName.value = file.name
    progress.value = 0
    uploadResult.value = null

    try {
      // ==========================================
      // 2. 创建上传会话
      // ==========================================
      const sessionParams: Api.Doc.CreateUploadSessionRequest = {
        file_name: file.name,
        file_size: file.size,
        lib_id: libId.value,
        parent_id: 0,
        type: file.type || 'file'
      }

      const sessionData: Api.Doc.CreateUploadSessionResponse =
        await docApi.createUploadSession(sessionParams)

      const { doc_id, upload_id, upload_url } = sessionData

      // ==========================================
      // 3. 上传文件到上传链接（独立域名）
      // ==========================================
      const formData = new FormData()
      formData.append('file', file)

      console.log(formData)
      console.log(upload_url)

      await axios.put(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            progress.value = Math.round((e.loaded / e.total) * 100)
          }
        }
      })

      console.log('upload success', upload_url)

      // ==========================================
      // 4. 完成上传
      // ==========================================
      uploadResult.value = await docApi.finishUpload(doc_id)
      fileList.value.push({
        name: file.name,
        size: file.size,
        status: 'success',
        uid: Date.now()
      })
      onSuccess?.(null, file)
      await loadDocuments()
    } catch (err) {
      console.error('上传失败：', err)
      onError?.(err)
      alert('上传失败')
    } finally {
      uploading.value = false
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  }

  // 组件挂载时加载文档列表
  onMounted(async () => {
    const libList = await docLibApi.fetchDocLibs()
    libId.value = libList[0]?.lib_id || 1 // 取第一个文档库
    await loadDocuments()
  })
</script>

<style scoped>
  .doc-import {
    padding: 20px;
  }
</style>

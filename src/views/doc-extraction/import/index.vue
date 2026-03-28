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
            支持 docx(≥500KB)、md(≥15KB)、xlsx(≥500KB)、txt(≥15KB) 格式，
            请先选择文档库，再添加文件，最后点击【确认上传】
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

  // 监听文档库变化
  watch(selectedLibId, (newVal) => {
    if (newVal) {
      loadDocuments()
    }
  })

  // 失败文件记录
  const failedFiles = ref<{ name: string; error: string }[]>([])

  // // 文件格式和大小限制
  // const FILE_SIZE_LIMITS = {
  //   docx: 500 * 1024, // 500KB
  //   xlsx: 500 * 1024, // 500KB
  //   md: 15 * 1024, // 15KB
  //   txt: 15 * 1024 // 15KB
  // }

  const SUPPORTED_FORMATS = ['docx', 'xlsx', 'md', 'txt']

  // 验证文件（添加到列表前校验）
  const beforeUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !SUPPORTED_FORMATS.includes(fileType)) {
      ElMessage.error(`不支持的文件格式：${fileType}。支持格式：${SUPPORTED_FORMATS.join(', ')}`)
      return false
    }

    // const sizeLimit = FILE_SIZE_LIMITS[fileType as keyof typeof FILE_SIZE_LIMITS]
    // if (file.size < sizeLimit) {
    //   ElMessage.error(`${fileType}文件大小不能小于${sizeLimit / 1024}KB`)
    //   return false
    // }

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
          // 这里简单处理：重新设置为原值需要记录原值，较复杂，不做深度处理
          // 实际项目中可以记录之前的 libId，这里为了简化，重新加载当前库的文档
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
        // 1. 创建上传会话
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

        // 2. 上传文件到预签名URL
        const formData = new FormData()
        formData.append('file', file)

        await axios.put(upload_url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              currentUploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
          }
        })

        // 3. 完成上传
        await docApi.finishUpload(doc_id)

        resolve()
      } catch (err) {
        console.error(`文件 ${file.name} 上传失败:`, err)
        reject(err)
      }
    })
  }

  // 确认上传：遍历缓存文件列表，逐个上传
  const confirmUpload = async () => {
    // 校验是否选择了文档库
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择文档库')
      return
    }

    if (fileList.value.length === 0) {
      ElMessage.warning('请先添加要上传的文件')
      return
    }

    // 准备上传
    uploadingActive.value = true
    failedFiles.value = []
    uploadedCount.value = 0
    totalUploadCount.value = fileList.value.length

    // 获取所有原始文件对象
    const filesToUpload = fileList.value.map((item) => item.raw)

    // 逐个上传
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

    // 上传完成处理
    uploadingActive.value = false
    currentUploadFileName.value = ''
    currentUploadProgress.value = 0

    // 汇总结果
    if (failedFiles.value.length === 0) {
      ElMessage.success(`全部 ${totalUploadCount.value} 个文件上传成功`)
    } else {
      ElMessage.warning(
        `上传完成，成功 ${uploadedCount.value} 个，失败 ${failedFiles.value.length} 个`
      )
    }

    // 清空文件缓存
    clearFileList()

    // 刷新文档列表
    await loadDocuments()
  }

  // 预览文档
  const previewDocument = async (doc: any) => {
    try {
      selectedDoc.value = doc
      const response = await fetch(`/api/documents/${doc.id}/preview`)
      const data = await response.json()
      previewContent.value = data.content
      previewDialog.value = true
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
    documents.value = [] // 清空旧数据
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
        selectedLibId.value = libOptions.value[0]?.lib_id || null
      } else {
        ElMessage.warning('暂无文档库，请先创建文档库')
      }
    } catch (error) {
      ElMessage.error('获取文档库列表失败')
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

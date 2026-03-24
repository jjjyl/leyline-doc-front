<template>
  <div class="file-upload">
    <div
      class="upload-area"
      :class="{ 'is-dragover': isDragover }"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
    >
      <input
        ref="fileInputRef"
        type="file"
        style="display: none"
        @change="handleFileChange"
      />

      <div v-if="!uploading">
        <span class="icon">📁</span>
        <p>点击或拖拽文件到此处上传</p>
      </div>

      <div v-else class="progress-container">
        <p>正在上传: {{ fileName }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span>{{ progress }}%</span>
      </div>
    </div>

    <div v-if="uploadResult" class="result">
      <p>✅ 上传成功!</p>
      <a :href="uploadResult.url" target="_blank">{{ uploadResult.name }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import axios from 'axios'
  import * as docApi from '@/api/doc'
  import * as docLibApi from '@/api/doc-lib'

  // 状态
  const fileInputRef = ref<HTMLInputElement>()
  const isDragover = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const fileName = ref('')
  const uploadResult = ref<any>(null)

  // ======================
  // 触发选择文件
  // ======================
  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  // ======================
  // 选择文件
  // ======================
  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files?.[0]) handleUpload(files[0])
  }

  // ======================
  // 拖拽文件
  // ======================
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragover.value = false
    const files = e.dataTransfer?.files
    if (files?.[0]) handleUpload(files[0])
  }

  // ======================
  // 核心：完整上传流程（四步）
  // ======================
  const handleUpload = async (file: File) => {
    uploading.value = true
    fileName.value = file.name
    progress.value = 0
    uploadResult.value = null

    try {
      // ==========================================
      // 1. 获取文档库（你自己替换接口地址）
      // ==========================================
      const libList = await docLibApi.fetchDocLibs()
      const lib_id = libList[0]?.lib_id || 1 // 取第一个文档库

      // ==========================================
      // 2. 创建上传会话
      // ==========================================
      const sessionParams: Api.Doc.uplodeSessionParams = {
        file_name: file.name,
        file_size: file.size,
        lib_id: lib_id,
        parent_id: 0,
        type: file.type || 'file'
      }

      const sessionData: Api.Doc.uploadSessionResponse = await docApi.fetchUploader(sessionParams)

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
      uploadResult.value = await docApi.fetchUploadResult(doc_id)
    } catch (err) {
      console.error('上传失败：', err)
      alert('上传失败')
    } finally {
      uploading.value = false
      if (fileInputRef.value) fileInputRef.value.value = ''
    }
  }
</script>

<style scoped>
  .file-upload {
    max-width: 500px;
    margin: 20px auto;
  }
  .upload-area {
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }
  .upload-area.is-dragover {
    border-color: #409eff;
    background-color: #ecf5ff;
  }
  .progress-bar {
    width: 100%;
    height: 10px;
    background: #eee;
    border-radius: 5px;
    margin: 10px 0;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #67c23a;
    transition: width 0.3s;
  }
  .result {
    margin-top: 20px;
    padding: 10px;
    background: #f0f9eb;
    border-radius: 4px;
  }
</style>
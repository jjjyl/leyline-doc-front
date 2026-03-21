<template>
  <div class="file-upload">
    <!-- 上传区域 -->
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

      <!-- 上传进度条 -->
      <div v-else class="progress-container">
        <p>正在上传: {{ fileName }}</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span>{{ progress }}%</span>
      </div>
    </div>

    <!-- 上传结果展示 -->
    <div v-if="uploadResult" class="result">
      <p>✅ 上传成功!</p>
      <a :href="uploadResult.url" target="_blank">{{ uploadResult.name }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { uploadFile } from '@/api/modules/file'

  // 状态定义
  const fileInputRef = ref<HTMLInputElement>()
  const isDragover = ref(false)
  const uploading = ref(false)
  const progress = ref(0)
  const fileName = ref('')
  const uploadResult = ref<Api.File.FileUploadResult | null>(null)

  // 触发文件选择框
  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  // 处理文件选择
  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const files = target.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  // 处理拖拽
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragover.value = false
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleUpload(files[0])
    }
  }

  // 核心上传逻辑
  const handleUpload = async (file: File) => {
    // 1. 准备 FormData
    const formData = new FormData()
    formData.append('file', file) // 'file' 是后端约定的字段名
    formData.append('description', '这是一个测试文件') // 其他业务参数

    // 2. 初始化状态
    uploading.value = true
    progress.value = 0
    fileName.value = file.name
    uploadResult.value = null

    try {
      // 3. 调用 API
      const res = await uploadFile(formData, (progressEvent) => {
        // 计算进度百分比
        if (progressEvent.total > 0) {
          progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        }
      })

      // 4. 处理成功结果
      uploadResult.value = res
    } catch (error) {
      console.error('上传失败', error)
    } finally {
      uploading.value = false
      // 清空 input 以便再次上传同一个文件
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
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
    background-color: #eee;
    border-radius: 5px;
    margin: 10px 0;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: #67c23a;
    transition: width 0.3s;
  }

  .result {
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f9eb;
    border-radius: 4px;
  }
</style>
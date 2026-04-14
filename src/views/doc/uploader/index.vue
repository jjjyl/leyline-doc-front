<template>
  <div class="file-upload-container">
    <div
      class="upload-area"
      :class="{ 'is-dragover': isDragover, 'animate-pulse': uploading }"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
    >
      <input ref="fileInputRef" type="file" style="display: none" @change="handleFileChange" />

      <div v-if="!uploading" class="upload-content">
        <div class="upload-icon-wrapper">
          <div class="icon-ring"></div>
          <span class="icon">📁</span>
        </div>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint">支持多种文件格式，最大 100MB</p>

        <div class="supported-formats">
          <span class="format-tag">PDF</span>
          <span class="format-tag">Word</span>
          <span class="format-tag">Excel</span>
          <span class="format-tag">PPT</span>
        </div>
      </div>

      <div v-else class="progress-container">
        <div class="progress-header">
          <span class="file-name">
            <span class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            {{ fileName }}
          </span>
          <span class="progress-percent">{{ progress }}%</span>
        </div>
        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }">
              <div class="progress-shimmer"></div>
            </div>
          </div>
          <div class="progress-glow" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="uploadResult" class="result-card">
        <div class="success-animation">
          <div class="checkmark-circle">
            <div class="checkmark draw"></div>
          </div>
        </div>
        <div class="result-content">
          <p class="result-title">上传成功!</p>
          <a :href="uploadResult.url" target="_blank" class="result-link">
            <span class="link-icon">🔗</span>
            {{ uploadResult.name }}
          </a>
        </div>
        <button class="close-btn" @click="uploadResult = null">×</button>
      </div>
    </Transition>
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
      const lib_id = libList[0]?.libId || 1 // 取第一个文档库

      // ==========================================
      // 2. 创建上传会话
      // ==========================================
      const sessionParams: Api.Doc.CreateUploadSessionRequest = {
        file_name: file.name,
        file_size: file.size,
        lib_id: lib_id,
        parent_id: 0,
        type: file.type || 'file'
      }

      const sessionData: Api.Doc.CreateUploadSessionResponse =
        await docApi.createUploadSession(sessionParams)

      const { doc_id, upload_url } = sessionData

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
      const finishResult = await docApi.finishUpload(doc_id)
      uploadResult.value = {
        doc_id: finishResult.docId,
        name: file.name,
        url: `/doc/${finishResult.docId}` // 假设的文档查看链接
      }
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
  .file-upload-container {
    max-width: 700px;
    margin: 30px auto;
  }

  .upload-area {
    border: 3px dashed var(--art-gray-300);
    border-radius: 24px;
    padding: 70px 50px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    background: linear-gradient(135deg, var(--default-box-color) 0%, var(--art-gray-50) 100%);
    position: relative;
    overflow: hidden;
  }

  .upload-area::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.4s;
  }

  .upload-area:hover::before {
    opacity: 1;
  }

  .upload-area:hover {
    border-color: var(--el-color-primary);
    background: linear-gradient(135deg, var(--art-gray-50) 0%, var(--art-gray-100) 100%);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(64, 158, 255, 0.15);
  }

  .upload-area.is-dragover {
    border-color: var(--el-color-primary);
    background: linear-gradient(
      135deg,
      var(--el-color-primary-light-9) 0%,
      var(--el-color-primary-light-8) 100%
    );
    transform: scale(1.03);
    box-shadow: 0 16px 48px rgba(64, 158, 255, 0.25);
  }

  .upload-area.animate-pulse {
    animation: pulse-border 2s infinite;
  }

  @keyframes pulse-border {
    0%,
    100% {
      border-color: var(--el-color-primary);
      box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
    }
    50% {
      border-color: var(--el-color-primary-light-3);
      box-shadow: 0 0 0 20px rgba(64, 158, 255, 0);
    }
  }

  .upload-content {
    position: relative;
    z-index: 1;
  }

  .upload-icon-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 24px;
  }

  .icon-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    border: 3px solid var(--el-color-primary);
    border-radius: 50%;
    opacity: 0.3;
    animation: ring-pulse 2s infinite;
  }

  @keyframes ring-pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.1;
    }
  }

  .upload-icon .icon {
    font-size: 72px;
    display: inline-block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-12px);
    }
  }

  .upload-text {
    font-size: 18px;
    color: var(--art-gray-800);
    margin: 0 0 10px 0;
    font-weight: 600;
  }

  .upload-hint {
    font-size: 14px;
    color: var(--art-gray-500);
    margin: 0 0 20px 0;
  }

  .supported-formats {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .format-tag {
    padding: 4px 12px;
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid var(--el-color-primary-light-7);
  }

  .progress-container {
    position: relative;
    z-index: 1;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .file-name {
    font-size: 15px;
    color: var(--art-gray-800);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .loading-dots {
    display: inline-flex;
    gap: 3px;
  }

  .loading-dots span {
    width: 4px;
    height: 4px;
    background: var(--el-color-primary);
    border-radius: 50%;
    animation: loading-bounce 1.4s infinite ease-in-out both;
  }

  .loading-dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes loading-bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .progress-percent {
    font-size: 16px;
    color: var(--el-color-primary);
    font-weight: 700;
  }

  .progress-bar-wrapper {
    position: relative;
  }

  .progress-bar {
    width: 100%;
    height: 14px;
    background: var(--art-gray-200);
    border-radius: 7px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%);
    background-size: 200% 100%;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 7px;
    position: relative;
    overflow: hidden;
    animation: gradient-shift 2s linear infinite;
  }

  @keyframes gradient-shift {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 200% 50%;
    }
  }

  .progress-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .progress-glow {
    position: absolute;
    top: -2px;
    height: 18px;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent);
    filter: blur(8px);
    border-radius: 7px;
    transition: width 0.3s;
  }

  .result-card {
    margin-top: 24px;
    padding: 24px;
    background: linear-gradient(135deg, #f0f9eb 0%, #e8f5e9 100%);
    border-radius: 16px;
    border: 2px solid #c8e6c9;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 8px 24px rgba(76, 175, 80, 0.15);
    position: relative;
  }

  .success-animation {
    flex-shrink: 0;
  }

  .checkmark-circle {
    width: 60px;
    height: 60px;
    position: relative;
    display: inline-block;
    vertical-align: top;
  }

  .checkmark-circle::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #4caf50;
    animation: circle-scale 0.4s ease-out;
  }

  @keyframes circle-scale {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  .checkmark {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: block;
    stroke-width: 3;
    stroke: #fff;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px #4caf50;
    animation:
      fill 0.4s ease-in-out 0.4s forwards,
      scale 0.3s ease-in-out 0.9s both;
    position: absolute;
    top: 0;
    left: 0;
  }

  .checkmark.draw {
    animation: checkmark-draw 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
  }

  @keyframes checkmark-draw {
    0% {
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
    }
  }

  .result-content {
    flex: 1;
  }

  .result-title {
    margin: 0 0 10px 0;
    font-size: 18px;
    font-weight: 700;
    color: #2e7d32;
  }

  .result-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--el-color-primary);
    text-decoration: none;
    font-size: 15px;
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.6);
  }

  .result-link:hover {
    background: rgba(255, 255, 255, 0.9);
    color: var(--el-color-primary-light-3);
    transform: translateX(4px);
  }

  .link-icon {
    font-size: 18px;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s;
    color: #666;
  }

  .close-btn:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: rotate(90deg);
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .slide-up-enter-from {
    opacity: 0;
    transform: translateY(20px);
  }

  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>

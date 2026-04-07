<template>
  <div class="file-cards" v-if="files.length > 0">
    <div v-for="(file, index) in files" :key="file.uid || index" class="file-card">
      <div class="file-icon">
        <component :is="getFileIcon(file.name)" />
      </div>
      <div class="file-name" :title="file.name">{{ truncateFileName(file.name, 12) }}</div>
      <el-button
        class="delete-btn"
        type="danger"
        :icon="Delete"
        circle
        size="small"
        @click.stop="handleRemove(file)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Delete, Document, Edit, Grid } from '@element-plus/icons-vue'

  const props = defineProps<{
    files: any[]
  }>()

  const emit = defineEmits<{
    (e: 'remove', file: any): void
  }>()

  // 根据文件名返回对应图标组件
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'docx':
        return Document
      case 'xlsx':
        return Grid
      case 'md':
        return Edit
      case 'txt':
        return Edit
      default:
        return Document
    }
  }

  // 截断长文件名
  const truncateFileName = (name: string, maxLen: number) => {
    if (name.length <= maxLen) return name
    return name.substring(0, maxLen - 3) + '...'
  }

  const handleRemove = (file: any) => {
    emit('remove', file)
  }
</script>

<style scoped>
  .file-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 20px;
    padding: 12px;
    background-color: #fafafa;
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
  }

  .file-card {
    position: relative;
    width: 100px;
    height: 100px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }

  .file-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .file-icon {
    font-size: 32px;
    color: #409eff;
    margin-bottom: 8px;
  }

  .file-name {
    font-size: 12px;
    text-align: center;
    word-break: break-all;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .file-card:hover .delete-btn {
    opacity: 1;
  }
</style>
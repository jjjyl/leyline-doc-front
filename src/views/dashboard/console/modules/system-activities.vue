<template>
  <div class="content-card timeline-card">
    <div class="card-header">
      <div class="header-left">
        <h3 class="card-title">系统动态</h3>
        <p class="card-subtitle">实时跟踪系统运行状态</p>
      </div>
      <ElButton text type="primary" size="small" @click="refreshActivities">
        <ElIcon><Refresh /></ElIcon>
        刷新
      </ElButton>
    </div>

    <div v-loading="loading" class="timeline-container">
      <ElScrollbar height="280px">
        <div v-if="activities.length === 0" class="empty-state">
          <ElEmpty description="暂无系统动态" :image-size="60">
            <template #image>
              <ElIcon :size="50" color="#909399">
                <Bell />
              </ElIcon>
            </template>
          </ElEmpty>
        </div>

        <ElTimeline v-else class="custom-timeline">
          <ElTimelineItem
            v-for="activity in activities"
            :key="activity.id"
            :timestamp="activity.time"
            placement="top"
            :type="activity.type"
            :color="activity.color"
          >
            <div class="activity-content" :class="{ unread: !activity.read }">
              <div class="activity-header">
                <span class="activity-title">{{ activity.title }}</span>
                <ElTag
                  v-if="activity.tag"
                  :type="activity.tagType"
                  size="small"
                  effect="light"
                  round
                >
                  {{ activity.tag }}
                </ElTag>
              </div>

              <p class="activity-desc">{{ activity.description }}</p>

              <div v-if="activity.metadata" class="activity-meta">
                <span v-for="(value, key) in activity.metadata" :key="key" class="meta-item">
                  <ElIcon :size="12"><component :is="getMetaIcon(key)" /></ElIcon>
                  {{ value }}
                </span>
              </div>

              <div v-if="!activity.read" class="unread-dot"></div>
            </div>
          </ElTimelineItem>
        </ElTimeline>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    Refresh,
    Bell,
    CircleCheck,
    Document,
    Upload,
    Download,
    Warning,
    InfoFilled,
    TrendCharts
  } from '@element-plus/icons-vue'

  interface ActivityMetadata {
    [key: string]: string
  }

  interface Activity {
    id: number
    title: string
    description: string
    time: string
    type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    color?: string
    tag?: string
    tagType?: 'success' | 'warning' | 'danger' | 'info' | ''
    metadata?: ActivityMetadata
    read: boolean
  }

  const loading = ref(false)

  const activities = ref<Activity[]>([
    {
      id: 1,
      title: '文档《2024年财务报表》表格提取完成',
      description: '成功提取 3 个表格，共识别 156 个字段，置信度 95%',
      time: '14:35:20',
      type: 'success',
      color: '#67c23a',
      tag: '提取完成',
      tagType: 'success',
      metadata: {
        '文档数': '1',
        '表格数': '3',
        '字段数': '156'
      },
      read: false
    },
    {
      id: 2,
      title: '新增支持 PDF 扫描件识别功能',
      description: '系统已升级 OCR 引擎，现在可以识别扫描版 PDF 文档',
      time: '13:20:15',
      type: 'primary',
      color: '#409eff',
      tag: '功能更新',
      tagType: '',
      read: true
    },
    {
      id: 3,
      title: '文档《产品清单》开始提取处理',
      description: '正在分析文档结构，预计需要 2-3 分钟',
      time: '13:10:08',
      type: 'warning',
      color: '#e6a23c',
      tag: '处理中',
      tagType: 'warning',
      read: true
    },
    {
      id: 4,
      title: '批量导入 15 个文档完成',
      description: '成功导入 15 个文档，失败 0 个',
      time: '12:00:00',
      type: 'success',
      color: '#67c23a',
      tag: '批量操作',
      tagType: 'success',
      metadata: {
        '成功': '15',
        '失败': '0'
      },
      read: true
    },
    {
      id: 5,
      title: '系统完成自动备份',
      description: '数据库和文件备份已完成，备份大小 2.3GB',
      time: '11:30:00',
      type: 'info',
      color: '#909399',
      tag: '系统维护',
      tagType: 'info',
      read: true
    },
    {
      id: 6,
      title: '检测到异常提取请求',
      description: '用户 admin 在 1 分钟内发起 50 次提取请求，已触发限流',
      time: '10:15:30',
      type: 'danger',
      color: '#f56c6c',
      tag: '安全警告',
      tagType: 'danger',
      read: true
    }
  ])

  const getMetaIcon = (key: string) => {
    const icons: Record<string, any> = {
      '文档数': Document,
      '表格数': TrendCharts,
      '字段数': InfoFilled,
      '成功': CircleCheck,
      '失败': Warning
    }
    return icons[key] || InfoFilled
  }

  const fetchActivities = async () => {
    try {
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      ElMessage.error('获取系统动态失败')
    } finally {
      loading.value = false
    }
  }

  const refreshActivities = () => {
    fetchActivities()
    ElMessage.success('已刷新')
  }

  onMounted(() => {
    fetchActivities()
  })
</script>

<style scoped lang="scss">
  .timeline-card {
    padding: 24px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .header-left {
    flex: 1;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 6px 0;
  }

  .card-subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }

  .timeline-container {
    min-height: 280px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 240px;
  }

  .custom-timeline {
    padding: 10px 0;
  }

  :deep(.el-timeline-item__wrapper) {
    padding-left: 28px;
    padding-bottom: 20px;
  }

  :deep(.el-timeline-item__tail) {
    left: 5px;
  }

  :deep(.el-timeline-item__node) {
    left: -1px;
  }

  .activity-content {
    position: relative;
    padding: 14px 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color-light);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      transform: translateX(4px);
    }

    &.unread {
      background: linear-gradient(135deg,
        rgba(64, 158, 255, 0.05) 0%,
        rgba(64, 158, 255, 0.02) 100%
      );
      border-left: 3px solid var(--el-color-primary);
    }
  }

  .unread-dot {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 8px;
    height: 8px;
    background: var(--el-color-primary);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    gap: 12px;
  }

  .activity-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--el-text-color-primary);
    flex: 1;
  }

  .activity-desc {
    font-size: 13px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
    margin: 0 0 10px 0;
  }

  .activity-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 10px;
    border-top: 1px dashed var(--el-border-color-lighter);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
</style>

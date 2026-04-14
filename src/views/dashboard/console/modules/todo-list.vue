<template>
  <div class="content-card">
    <div class="card-header">
      <div class="header-left">
        <h3 class="card-title">待复核项</h3>
        <p class="card-subtitle">
          共 <span class="text-warning font-medium">{{ pendingCount }}</span> 项需要确认
        </p>
      </div>
      <ElBadge :value="pendingCount" :max="99" v-if="pendingCount > 0">
        <ElButton text type="warning" size="small" @click="refreshList">
          <ElIcon><Refresh /></ElIcon>
          刷新
        </ElButton>
      </ElBadge>
    </div>

    <div v-loading="loading" class="review-list-container">
      <ElScrollbar>
        <div v-if="list.length === 0" class="empty-state">
          <ElEmpty description="暂无待复核项" :image-size="80">
            <template #image>
              <ElIcon :size="60" color="#67c23a">
                <CircleCheck />
              </ElIcon>
            </template>
          </ElEmpty>
          <p class="empty-hint mt-2 text-xs text-g-500">所有提取数据已完成复核 ✓</p>
        </div>

        <div v-else class="review-list">
          <div
            v-for="(item, index) in list"
            :key="item.id"
            class="review-item"
          >
            <div class="item-header">
              <div class="doc-info" @click="viewDocument(item.docId)">
                <ElIcon :size="18" class="doc-icon" color="#409eff">
                  <Document />
                </ElIcon>
                <span class="doc-name">{{ item.docName }}</span>
              </div>
              <ElTag size="small" type="warning" effect="light" round>
                <ElIcon :size="12" class="mr-1"><WarningFilled /></ElIcon>
                {{ item.confidence }}%
              </ElTag>
            </div>

            <div class="item-field">
              <span class="field-label">疑似字段:</span>
              <span class="field-value">{{ item.suspectField }}</span>
            </div>

            <div class="item-reason" v-if="item.reason">
              <ElIcon :size="14" class="reason-icon"><InfoFilled /></ElIcon>
              <span>{{ item.reason }}</span>
            </div>

            <div class="item-actions">
              <ElButton
                size="small"
                type="success"
                plain
                @click="confirmItem(item)"
              >
                <ElIcon><Check /></ElIcon>
                确认
              </ElButton>
              <ElButton
                size="small"
                type="primary"
                plain
                @click="correctItem(item)"
              >
                <ElIcon><Edit /></ElIcon>
                修正
              </ElButton>
            </div>
          </div>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Refresh,
    CircleCheck,
    Document,
    WarningFilled,
    InfoFilled,
    Check,
    Edit
  } from '@element-plus/icons-vue'

  interface ReviewItem {
    id: number
    docId: number
    docName: string
    suspectField: string
    confidence: number
    reason?: string
  }

  const loading = ref(false)

  const list = reactive<ReviewItem[]>([
    {
      id: 1,
      docId: 101,
      docName: '2024年财务报表.xlsx',
      suspectField: '合并单元格 A3:B5',
      confidence: 65,
      reason: '检测到合并单元格，可能影响数据结构'
    },
    {
      id: 2,
      docId: 102,
      docName: '产品清单.pdf',
      suspectField: '跨页表格行',
      confidence: 72,
      reason: '表格跨越多个页面，需确认完整性'
    },
    {
      id: 3,
      docId: 103,
      docName: '订单记录.xlsx',
      suspectField: '特殊格式日期字段',
      confidence: 68,
      reason: '日期格式不统一，可能存在识别误差'
    }
  ])

  const pendingCount = computed(() => list.length)

  const viewDocument = (docId: number) => {
    console.log('查看文档:', docId)
  }

  const confirmItem = async (item: ReviewItem) => {
    try {
      await ElMessageBox.confirm(
        `确认「${item.suspectField}」的提取结果正确？`,
        '确认操作',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      await new Promise(resolve => setTimeout(resolve, 300))

      const index = list.findIndex(i => i.id === item.id)
      if (index !== -1) {
        list.splice(index, 1)
      }

      ElMessage.success('已确认')
    } catch (error) {
      // 用户取消
    }
  }

  const correctItem = (item: ReviewItem) => {
    ElMessage.info(`打开「${item.suspectField}」的修正界面`)
  }

  const refreshList = async () => {
    try {
      loading.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('已刷新')
    } catch (error) {
      ElMessage.error('刷新失败')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped lang="scss">
  .content-card {
    padding: 24px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    min-height: 520px;
    display: flex;
    flex-direction: column;
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

  .review-list-container {
    flex: 1;
    min-height: 420px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 350px;
    padding: 40px 20px;
  }

  .empty-hint {
    text-align: center;
  }

  .review-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .review-item {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 10px;
    border-left: 3px solid var(--el-color-warning);
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color-light);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transform: translateX(4px);
    }
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .doc-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex: 1;
    min-width: 0;

    &:hover {
      opacity: 0.8;
    }
  }

  .doc-icon {
    flex-shrink: 0;
  }

  .doc-name {
    font-weight: 500;
    color: var(--el-color-primary);
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      text-decoration: underline;
    }
  }

  .item-field {
    margin-bottom: 10px;
    font-size: 13px;
  }

  .field-label {
    color: var(--el-text-color-secondary);
    margin-right: 6px;
  }

  .field-value {
    color: var(--el-text-color-primary);
    font-weight: 500;
  }

  .item-reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 12px;
    padding: 8px 10px;
    background: rgba(230, 162, 60, 0.1);
    border-radius: 6px;
    font-size: 12px;
    color: var(--el-color-warning);
    line-height: 1.5;
  }

  .reason-icon {
    flex-shrink: 0;
    margin-top: 1px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
</style>

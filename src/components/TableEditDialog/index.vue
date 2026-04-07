<!-- components/TableEditDialog/index.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="文档表格详情"
    width="90vw"
    :before-close="handleClose"
    destroy-on-close
    fullscreen-button
  >
    <!-- 多表格切换Tab（适配一个文档多张表格的场景） -->
    <el-tabs v-if="tableData.tables?.length" v-model="activeTab" type="card">
      <el-tab-pane
        v-for="(table, tableIndex) in tableData.tables"
        :key="table.id"
        :label="table.name || `表格${tableIndex + 1}`"
        :name="table.id"
      >
        <!-- 表格备注信息 -->
        <div class="table-meta" v-if="table.comment">
          <el-tag type="info">表格备注：{{ table.comment }}</el-tag>
          <el-tag type="info" class="ml-2"
            >共 {{ table.row_count }} 行 {{ table.col_count }} 列</el-tag
          >
        </div>

        <!-- 可编辑表格核心 -->
        <el-table
          :data="table.rows"
          border
          stripe
          class="mt-3"
          style="width: 100%"
          :loading="updateLoading"
          row-key="id"
        >
          <!-- 动态渲染列，和表头一一对应 -->
          <el-table-column
            v-for="(header, colIndex) in table.headers"
            :key="colIndex"
            :prop="`cells[${colIndex}]`"
            :label="header"
            align="center"
            min-width="120"
          >
            <!-- 可编辑单元格模板 -->
            <template #default="{ row, $index }">
              <!-- 编辑态：输入框 -->
              <el-input
                v-if="
                  editingCell.tableId === table.id &&
                  editingCell.rowId === row.id &&
                  editingCell.colIndex === colIndex
                "
                v-model="row.cells[colIndex]"
                v-focus
                @blur="handleCellBlur(table, row, colIndex, header)"
                @keyup.enter="handleCellBlur(table, row, colIndex, header)"
                class="edit-input"
              />
              <!-- 只读态：文本，点击进入编辑 -->
              <span
                v-else
                @click="handleCellClick(table.id, row.id, colIndex, row.cells[colIndex])"
                class="cell-text"
              >
                {{ row.cells[colIndex] || '-' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 空数据提示 -->
    <el-empty v-else description="该文档暂无提取到的表格数据" />

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  // 引入修改行数据的接口函数
  import { updateTableRow } from '@/api/table'

  // 自定义指令：输入框自动聚焦
  const vFocus = {
    mounted: (el: HTMLElement) => el.querySelector('input')?.focus()
  }

  // ========== Props & Emits 定义（支持v-model调用） ==========
  const props = withDefaults(
    defineProps<{
      /** 弹窗显示状态，支持 v-model:visible */
      visible: boolean
      /** 接口返回的文档表格完整数据（提取接口返回结构） */
      tableData: Api.Table.ExtractTableDataResponse
    }>(),
    {}
  )

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    /** 行修改成功后的回调，返回完整的修改结果 */
    (
      e: 'edit-success',
      params: {
        table: Api.Table.TableFormat
        row: Api.Table.TableRow
        colIndex: number
        colName: string
        updateResult: Api.TableRow.UpdateTableRowResponse
      }
    ): void
  }>()

  // ========== 响应式状态 ==========
  // 弹窗显隐双向绑定
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })
  // 当前激活的表格Tab
  const activeTab = ref('')
  // 正在编辑的单元格定位 + 旧值缓存
  const editingCell = ref<{
    tableId: string
    rowId: string
    colIndex: number
    oldValue: string // 新增：缓存编辑前的旧值，用于失败回滚
  }>({
    tableId: '',
    rowId: '',
    colIndex: -1,
    oldValue: ''
  })
  // 修改请求loading
  const updateLoading = ref(false)

  // ========== 核心逻辑 ==========
  /** 点击单元格进入编辑态，同时缓存旧值 */
  const handleCellClick = (tableId: string, rowId: string, colIndex: number, oldValue: string) => {
    editingCell.value = {
      tableId,
      rowId,
      colIndex,
      oldValue: oldValue || '' // 缓存编辑前的原始值
    }
  }

  /** 单元格失焦/回车，提交整行修改 */
  const handleCellBlur = async (
    table: Api.Table.TableFormat,
    row: Api.Table.TableRow,
    colIndex: number,
    colName: string
  ) => {
    // 1. 提取最新的整行cells数组（后端要求的string[]格式）
    const latestRowCells = [...row.cells]
    // 2. 提取当前编辑的单元格新值
    const currentNewValue = latestRowCells[colIndex]?.trim() || ''

    // 3. 重置编辑态（先重置，避免失焦重复触发）
    const { tableId, rowId, oldValue } = editingCell.value
    editingCell.value = { tableId: '', rowId: '', colIndex: -1, oldValue: '' }

    // 4. 值未变化，不提交请求
    if (currentNewValue === oldValue.trim()) return

    // 5. 发起整行修改请求
    try {
      updateLoading.value = true

      const updateResult = await updateTableRow(
        props.tableData.doc_id,
        table.id,
        rowId,
        latestRowCells
      )

      // 6. 修改成功：用后端返回的最新行数据，更新表格行（保证前后端数据完全一致）
      const targetRow = table.rows.find((item) => item.id === row.id)
      if (targetRow && updateResult.row?.cells) {
        targetRow.cells = updateResult.row.cells
      }

      // 7. 触发成功回调，抛出完整数据
      emit('edit-success', {
        table,
        row: targetRow || row,
        colIndex,
        colName,
        updateResult
      })
      ElMessage.success('单元格修改成功')
    } catch (error: any) {
      // 8. 修改失败：回滚当前单元格到编辑前的旧值
      const targetRow = table.rows.find((item) => item.id === rowId)
      if (targetRow) {
        targetRow.cells[colIndex] = oldValue
      }
      ElMessage.error(error.message || '修改失败，请重试')
    } finally {
      updateLoading.value = false
    }
  }

  /** 关闭弹窗重置状态 */
  const handleClose = () => {
    dialogVisible.value = false
    editingCell.value = { tableId: '', rowId: '', colIndex: -1, oldValue: '' }
    activeTab.value = ''
  }

  // 监听传入的数据，默认激活第一张表格
  watch(
    () => props.tableData,
    (val) => {
      if (val?.tables?.length) {
        activeTab.value = val.tables[0].id
      }
    },
    { immediate: true }
  )
</script>

<style scoped>
  .table-meta {
    padding: 8px 0;
  }
  .cell-text {
    width: 100%;
    display: inline-block;
    padding: 4px 0;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .cell-text:hover {
    background-color: #f5f7fa;
  }
  .edit-input {
    width: 100%;
  }
</style>

<template>
  <div class="doc-operation">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">文档智能操作交互</h2>
      <el-form :model="form" label-width="120px">
        <el-form-item label="自然语言指令">
          <el-input
            v-model="form.instruction"
            type="textarea"
            :rows="4"
            placeholder="请输入自然语言指令，如：提取这份合同中的甲方名称和合同金额"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="executeInstruction">执行指令</el-button>
          <el-button @click="clearInstruction">清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">常用指令</h3>
      <el-tag
        v-for="cmd in commonCommands"
        :key="cmd"
        class="mr-2 mb-2 cursor-pointer"
        @click="selectCommand(cmd)"
      >
        {{ cmd }}
      </el-tag>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">操作结果</h3>
      <el-card>
        <pre>{{ result }}</pre>
      </el-card>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">操作历史</h3>
      <el-table :data="history" style="width: 100%">
        <el-table-column prop="instruction" label="指令" width="300" />
        <el-table-column prop="result" label="结果" />
        <el-table-column prop="time" label="时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  instruction: ''
})

const commonCommands = [
  '提取这份合同中的甲方名称和合同金额',
  '将文档字体调整为宋体，小四号',
  '删除文档中所有空白行',
  '将文档所有段落设置为两端对齐',
  '提取文档中的所有日期信息',
  '将表格数据转换为JSON格式'
]

const result = ref('')
const history = ref<Array<{
  instruction: string,
  result: string,
  time: string
}>>([])

// 执行指令
const executeInstruction = async () => {
  if (!form.instruction.trim()) {
    ElMessage.warning('请输入指令')
    return
  }

  try {
    ElMessage.info('正在处理指令...')

    // 调用API执行指令
    const response = await fetch('/api/operation/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instruction: form.instruction
      })
    })

    const data = await response.json()
    result.value = data.result || '指令执行完成'

    // 添加到历史记录
    addToHistory(form.instruction, result.value)

    ElMessage.success('指令执行完成')
  } catch (error) {
    ElMessage.error('指令执行失败')
    result.value = '执行失败：' + error.message
  }
}

// 清空指令
const clearInstruction = () => {
  form.instruction = ''
  result.value = ''
}

// 选择常用指令
const selectCommand = (command: string) => {
  form.instruction = command
}

// 添加到历史记录
const addToHistory = (instruction: string, resultText: string) => {
  history.value.unshift({
    instruction: instruction.length > 50 ? instruction.substring(0, 50) + '...' : instruction,
    result: resultText.length > 100 ? resultText.substring(0, 100) + '...' : resultText,
    time: new Date().toLocaleString()
  })

  // 只保留最近10条记录
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }
}

// 查看历史详情
const viewHistoryDetail = (item: any) => {
  ElMessage.info('历史详情功能开发中')
}

// 删除历史记录
const deleteHistory = async (index: number) => {
  history.value.splice(index, 1)
  ElMessage.success('历史记录已删除')
}

// 导出历史记录
const exportHistory = () => {
  const data = history.value.map(item => ({
    指令: item.instruction,
    结果: item.result,
    时间: item.time
  }))

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'operation_history.json'
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('历史记录已导出')
}
</script>

<style scoped>
.doc-operation {
  padding: 20px;
}
</style>

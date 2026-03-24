<template>
  <div class="operation-guide">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">操作引导</h2>
      <el-steps :active="activeStep" finish-status="success">
        <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
          :description="step.description"
        />
      </el-steps>
    </div>

    <div class="guide-content">
      <el-card v-if="activeStep === 0" class="mb-4">
        <h3>欢迎使用文档智能操作系统</h3>
        <p>本系统基于大语言模型技术，支持自然语言指令处理文档操作。</p>
        <el-button @click="nextStep">开始引导</el-button>
      </el-card>

      <el-card v-if="activeStep === 1" class="mb-4">
        <h3>指令输入示例</h3>
        <ul>
          <li>提取文档中的关键信息： "提取这份合同中的甲方名称和合同金额"</li>
          <li>格式调整： "将文档字体调整为宋体，小四号"</li>
          <li>内容编辑： "删除文档中所有空白行"</li>
        </ul>
        <el-button @click="nextStep">下一步</el-button>
      </el-card>

      <el-card v-if="activeStep === 2" class="mb-4">
        <h3>操作执行</h3>
        <p>输入指令后，点击执行按钮，系统将自动处理您的请求。</p>
        <p>支持的操作包括：内容提取、格式调整、文档编辑等。</p>
        <el-button @click="nextStep">下一步</el-button>
      </el-card>

      <el-card v-if="activeStep === 3" class="mb-4">
        <h3>高级功能</h3>
        <p>常用指令记忆、批量操作、自定义规则等高级功能。</p>
        <el-button @click="finishGuide">完成引导</el-button>
      </el-card>
    </div>

    <div class="help-section">
      <h3 class="text-lg font-semibold mb-2">实时帮助</h3>
      <el-input
        v-model="helpQuery"
        placeholder="输入您的问题"
        class="mb-2"
      />
      <el-button type="primary" @click="getHelp">获取帮助</el-button>
      <div v-if="helpResponse" class="mt-2">
        <el-card>
          <p>{{ helpResponse }}</p>
        </el-card>
      </div>
    </div>

    <div class="common-questions mt-4">
      <h3 class="text-lg font-semibold mb-2">常见问题</h3>
      <el-list>
        <el-list-item
          v-for="(question, index) in commonQuestions"
          :key="index"
          @click="selectQuestion(question)"
        >
          {{ question }}
        </el-list-item>
      </el-list>
    </div>

    <div class="export-guide mt-4">
      <el-button type="success" @click="exportGuide">导出使用指南</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeStep = ref(0)
const helpQuery = ref('')
const helpResponse = ref('')

const steps = [
  { title: '欢迎使用', description: '了解系统功能' },
  { title: '指令输入', description: '学习自然语言指令' },
  { title: '操作执行', description: '体验自动化操作' },
  { title: '高级功能', description: '掌握高级用法' }
]

const nextStep = () => {
  if (activeStep.value < steps.length - 1) {
    activeStep.value++
  }
}

const finishGuide = () => {
  ElMessage.success('引导完成！您现在可以开始使用系统了。')
  activeStep.value = 0
}

const resetGuide = () => {
  activeStep.value = 0
  ElMessage.info('已重置引导')
}

const getHelp = async () => {
  if (!helpQuery.value.trim()) {
    ElMessage.warning('请输入您的问题')
    return
  }

  try {
    // 模拟AI帮助响应
    await new Promise(resolve => setTimeout(resolve, 1500))

    helpResponse.value = generateHelpResponse(helpQuery.value)
  } catch (error) {
    ElMessage.error('获取帮助失败')
  }
}

const generateHelpResponse = (query: string) => {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('怎么') && lowerQuery.includes('提取')) {
    return `关于信息提取的帮助：

1. 选择要处理的文档
2. 勾选需要的提取类型（实体、关键词、金额、日期等）
3. 点击"开始提取"按钮
4. 等待提取完成，查看结果
5. 可以编辑或删除提取结果

提示：不同类型的文档支持不同的提取类型，例如Word文档适合提取实体和关键词，Excel文档适合提取金额和日期。`
  }

  if (lowerQuery.includes('指令') || lowerQuery.includes('命令')) {
    return `关于指令使用的帮助：

支持的指令类型：
• 内容提取：如"提取合同中的甲方和金额"
• 格式调整：如"将字体设置为宋体小四"
• 文档编辑：如"删除所有空白行"
• 数据转换：如"将表格转换为JSON"

使用技巧：
• 使用自然语言描述您的需求
• 可以点击"常用指令"快速选择
• 系统会自动解析并执行指令`
  }

  if (lowerQuery.includes('模板') || lowerQuery.includes('表格')) {
    return `关于表格数据填写的帮助：

1. 首先导入表格模板（Word或Excel格式）
2. 选择已导入的模板
3. 选择数据源（已提取的文档数据）
4. 点击"自动填写"进行数据填充
5. 预览填写结果，补充缺失信息
6. 导出或分享完成的表格

注意：模板需要包含明确的表头和填写区域。`
  }

  if (lowerQuery.includes('存储') || lowerQuery.includes('数据库')) {
    return `关于数据存储的帮助：

系统支持MySQL和MongoDB数据库：
1. 配置数据库连接信息
2. 测试连接是否正常
3. 系统会自动创建所需的数据表
4. 提取的数据会自动存储到数据库
5. 支持数据备份和恢复功能

安全提示：请妥善保管数据库密码。`
  }

  if (lowerQuery.includes('备份') || lowerQuery.includes('恢复')) {
    return `关于备份和恢复的帮助：

备份功能：
• 定期自动备份数据
• 手动创建备份文件
• 支持下载备份文件

恢复功能：
• 从备份文件恢复数据
• 恢复前会提示确认
• 恢复过程中会覆盖现有数据

建议：重要操作前先创建备份。`
  }

  return `关于"${query}"的帮助：

很抱歉，我暂时没有找到相关问题的答案。您可以尝试：

1. 查看各个功能模块的使用说明
2. 参考示例文档和演示数据
3. 联系技术支持获取帮助

常用问题：
• 如何导入文档？
• 如何使用智能操作？
• 如何配置数据库？
• 如何备份和恢复数据？

如果问题紧急，请提供更详细的描述。`
}

const clearHelp = () => {
  helpQuery.value = ''
  helpResponse.value = ''
}

const commonQuestions = [
  '怎么提取文档信息？',
  '如何使用智能指令？',
  '表格数据怎么填写？',
  '怎么配置数据库？',
  '如何备份数据？'
]

const selectQuestion = (question: string) => {
  helpQuery.value = question
  getHelp()
}

const exportGuide = () => {
  const guideContent = {
    title: '文档智能操作系统使用指南',
    version: '1.0',
    lastUpdate: new Date().toLocaleString(),
    sections: [
      {
        title: '系统概述',
        content: '本系统基于大语言模型技术，支持自然语言指令处理文档操作，包括信息提取、格式调整、数据填写等功能。'
      },
      {
        title: '主要功能',
        content: '1. 文档信息提取 2. 智能操作交互 3. 表格数据填写 4. 数据存储管理'
      },
      {
        title: '使用步骤',
        content: '1. 登录系统 2. 导入文档 3. 选择操作 4. 执行指令 5. 查看结果'
      }
    ]
  }

  const blob = new Blob([JSON.stringify(guideContent, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'system_guide.json'
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('使用指南已导出')
}
</script>

<style scoped>
.operation-guide {
  padding: 20px;
}
</style>

<template>
  <div class="newbie-tutorial-container">
    <div class="tutorial-workspace">
      <!-- 顶部：欢迎横幅 -->
      <div class="welcome-banner glass-effect">
        <div class="banner-content">
          <div class="banner-left">
            <div class="welcome-icon-wrapper">
              <div class="icon-bg-pulse"></div>
              <span class="welcome-icon">🎓</span>
            </div>
            <div class="welcome-text">
              <h1 class="welcome-title">欢迎使用文档智能系统</h1>
              <p class="welcome-subtitle">跟随本教程，5分钟快速掌握所有核心功能</p>
              <div class="progress-info">
                <el-progress
                  :percentage="tutorialProgress"
                  :stroke-width="8"
                  class="tutorial-progress"
                />
                <span class="progress-text">{{ completedSteps }}/{{ totalSteps }} 已完成</span>
              </div>
            </div>
          </div>
          <div class="banner-right">
            <el-button
              type="primary"
              size="large"
              @click="startTutorial"
              v-if="!tutorialStarted"
              class="start-btn"
            >
              <ArtSvgIcon icon="ri:play-circle-fill" class="mr-2" />
              开始学习
            </el-button>
            <el-button
              size="large"
              @click="resetTutorial"
              v-if="tutorialStarted"
              class="restart-btn"
            >
              <ArtSvgIcon icon="ri:restart-line" class="mr-2" />
              重新开始
            </el-button>
          </div>
        </div>
      </div>

      <!-- 中部：教程步骤导航 -->
      <div class="steps-navigation glass-effect" v-if="tutorialStarted">
        <div class="nav-header">
          <h3 class="nav-title">
            <ArtSvgIcon icon="ri:road-map-line" class="title-icon" />
            学习路径
          </h3>
        </div>

        <div class="steps-list">
          <div
            v-for="(step, index) in tutorialSteps"
            :key="index"
            class="step-item"
            :class="{
              active: currentStep === index,
              completed: index < currentStep,
              locked: index > currentStep && !step.unlocked
            }"
            @click="goToStep(index)"
          >
            <div class="step-indicator">
              <div class="step-number" v-if="index < currentStep">
                <ArtSvgIcon icon="ri:check-line" />
              </div>
              <div class="step-number" v-else-if="currentStep === index">
                {{ index + 1 }}
              </div>
              <div class="step-number locked" v-else>
                <ArtSvgIcon icon="ri:lock-line" />
              </div>
              <div class="step-line" v-if="index < tutorialSteps.length - 1"></div>
            </div>

            <div class="step-content">
              <div class="step-header">
                <span class="step-icon">{{ step.icon }}</span>
                <h4 class="step-title">{{ step.title }}</h4>
              </div>
              <p class="step-desc">{{ step.description }}</p>
              <div class="step-meta">
                <span class="duration">
                  <ArtSvgIcon icon="ri:time-line" class="meta-icon" />
                  {{ step.duration }}
                </span>
                <el-tag
                  v-if="index < currentStep"
                  size="small"
                  type="success"
                  effect="dark"
                >
                  已完成
                </el-tag>
                <el-tag
                  v-else-if="currentStep === index"
                  size="small"
                  type="primary"
                  effect="dark"
                >
                  学习中
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教程内容区 -->
      <Transition name="fade-slide" mode="out-in">
        <div :key="currentStep" class="tutorial-content-section" v-if="tutorialStarted">
          <!-- 步骤1: 系统概览 -->
          <div v-if="currentStep === 0" class="content-card glass-effect">
            <div class="card-header">
              <div class="header-badge">
                <span class="badge-icon">🚀</span>
                <span class="badge-text">第一步</span>
              </div>
              <h2 class="card-title">认识我们的系统</h2>
            </div>

            <div class="card-body">
              <div class="intro-section">
                <h3 class="intro-title">
                  <ArtSvgIcon icon="ri:star-smile-line" class="title-icon" />
                  欢迎使用文档智能系统
                </h3>
                <p class="intro-text">
                  这是一个基于先进AI技术的智能文档处理平台，可以帮助您自动化处理各种文档任务，
                  大幅提升工作效率。无论您是处理合同、报告、表格还是其他文档，都能在这里找到高效的解决方案。
                </p>
              </div>

              <div class="features-grid">
                <div
                  v-for="feature in systemFeatures"
                  :key="feature.id"
                  class="feature-card"
                  @click="showFeatureDetail(feature)"
                >
                  <div class="feature-icon">{{ feature.icon }}</div>
                  <h4 class="feature-title">{{ feature.title }}</h4>
                  <p class="feature-desc">{{ feature.desc }}</p>
                  <el-tag size="small" :type="feature.tagType" effect="plain">
                    {{ feature.tag }}
                  </el-tag>
                </div>
              </div>

              <div class="quick-start-tips">
                <h3 class="tips-title">
                  <ArtSvgIcon icon="ri:lightbulb-flash-line" class="title-icon" />
                  快速开始
                </h3>
                <div class="tips-cards">
                  <div v-for="(tip, idx) in quickStartItems" :key="idx" class="tip-item">
                    <div class="tip-icon">{{ tip.icon }}</div>
                    <h4>{{ tip.title }}</h4>
                    <p>{{ tip.desc }}</p>
                  </div>
                </div>
              </div>

              <div class="action-bar">
                <el-button @click="prevStep" class="nav-btn" disabled>
                  <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                  上一步
                </el-button>
                <el-button type="primary" @click="nextStep" class="nav-btn next">
                  下一步
                  <ArtSvgIcon icon="ri:arrow-right-line" class="ml-1" />
                </el-button>
              </div>
            </div>
          </div>

          <!-- 步骤2: 文档导入 -->
          <div v-if="currentStep === 1" class="content-card glass-effect">
            <div class="card-header">
              <div class="header-badge">
                <span class="badge-icon">📁</span>
                <span class="badge-text">第二步</span>
              </div>
              <h2 class="card-title">文档导入与管理</h2>
            </div>

            <div class="card-body">
              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:number-1" class="number-icon" />
                  创建文档库
                </h3>
                <div class="instruction-box">
                  <ol class="instruction-list">
                    <li>点击左侧菜单「文档信息提取」→「文档导入」</li>
                    <li>点击「新建文档库」按钮</li>
                    <li>输入文档库名称，例如："合同文档"</li>
                    <li>点击确定完成创建</li>
                  </ol>
                </div>
                <div class="tip-box info">
                  <ArtSvgIcon icon="ri:lightbulb-flash-line" class="tip-icon" />
                  <span>💡 提示：建议按项目或类型分类创建不同的文档库</span>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:number-2" class="number-icon" />
                  上传文档
                </h3>
                <div class="instruction-box">
                  <ol class="instruction-list">
                    <li>选择目标文档库</li>
                    <li>拖拽文件到上传区域，或点击选择文件</li>
                    <li>支持格式：Word (.docx)、Excel (.xlsx)、Markdown (.md)、文本 (.txt)</li>
                    <li>点击「确认上传」开始上传</li>
                  </ol>
                </div>
                <div class="demo-upload-area">
                  <ArtSvgIcon icon="ri:upload-cloud-2-line" class="demo-icon" />
                  <p>拖拽文件到此处</p>
                  <el-button size="small" type="primary" text>模拟上传演示</el-button>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:number-3" class="number-icon" />
                  管理文件夹
                </h3>
                <div class="instruction-box">
                  <ul class="instruction-list">
                    <li>点击「新建文件夹」创建目录结构</li>
                    <li>支持多层级文件夹嵌套</li>
                    <li>可移动文档到不同文件夹</li>
                    <li>右键菜单提供更多操作选项</li>
                  </ul>
                </div>
              </div>

              <div class="action-bar">
                <el-button @click="prevStep" class="nav-btn">
                  <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                  上一步
                </el-button>
                <el-button type="primary" @click="nextStep" class="nav-btn next">
                  我学会了
                  <ArtSvgIcon icon="ri:check-line" class="ml-1" />
                </el-button>
              </div>
            </div>
          </div>

          <!-- 步骤3: 信息提取 -->
          <div v-if="currentStep === 2" class="content-card glass-effect">
            <div class="card-header">
              <div class="header-badge">
                <span class="badge-icon">🔍</span>
                <span class="badge-text">第三步</span>
              </div>
              <h2 class="card-title">智能信息提取</h2>
            </div>

            <div class="card-body">
              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:sparkling-2-line" class="number-icon" />
                  AI自动提取
                </h3>
                <p class="section-intro">系统可以自动识别并提取文档中的关键信息：</p>

                <div class="extraction-types-demo">
                  <div
                    v-for="type in extractionTypesDemo"
                    :key="type.type"
                    class="type-demo-card"
                  >
                    <div class="type-header">
                      <span class="type-icon">{{ type.icon }}</span>
                      <h4>{{ type.name }}</h4>
                    </div>
                    <div class="type-examples">
                      <p class="example-label">示例：</p>
                      <ul class="example-list">
                        <li v-for="example in type.examples" :key="example">
                          {{ example }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:number-2" class="number-icon" />
                  操作步骤
                </h3>
                <div class="step-by-step">
                  <div
                    v-for="(step, idx) in extractionSteps"
                    :key="idx"
                    class="step-card"
                  >
                    <div class="step-num">{{ idx + 1 }}</div>
                    <div class="step-text">{{ step }}</div>
                  </div>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:lightbulb-flash-line" class="number-icon" />
                  实用技巧
                </h3>
                <div class="tips-grid">
                  <div v-for="(tip, idx) in extractionTips" :key="idx" class="tip-card">
                    <ArtSvgIcon :icon="tip.icon" class="tip-icon" />
                    <p>{{ tip.text }}</p>
                  </div>
                </div>
              </div>

              <div class="action-bar">
                <el-button @click="prevStep" class="nav-btn">
                  <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                  上一步
                </el-button>
                <el-button type="primary" @click="nextStep" class="nav-btn next">
                  继续学习
                  <ArtSvgIcon icon="ri:arrow-right-line" class="ml-1" />
                </el-button>
              </div>
            </div>
          </div>

          <!-- 步骤4: 智能操作 -->
          <div v-if="currentStep === 3" class="content-card glass-effect">
            <div class="card-header">
              <div class="header-badge">
                <span class="badge-icon">🤖</span>
                <span class="badge-text">第四步</span>
              </div>
              <h2 class="card-title">AI智能操作</h2>
            </div>

            <div class="card-body">
              <div class="ai-chat-demo">
                <div class="chat-header">
                  <ArtSvgIcon icon="ri:robot-line" class="robot-icon" />
                  <span>试试对AI说...</span>
                </div>
                <div class="chat-messages">
                  <div
                    v-for="(msg, idx) in demoMessages"
                    :key="idx"
                    class="message"
                    :class="msg.type"
                  >
                    <div class="message-bubble">
                      <p>{{ msg.content }}</p>
                    </div>
                  </div>
                </div>
                <div class="chat-input-demo">
                  <el-input
                    placeholder="输入指令，如：提取这份合同的甲方和金额"
                    disabled
                  >
                    <template #append>
                      <el-button :icon="Send" disabled />
                    </template>
                  </el-input>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">常用指令示例</h3>
                <div class="command-examples">
                  <div
                    v-for="(cmd, idx) in commandExamples"
                    :key="idx"
                    class="command-card"
                    @click="tryCommand(cmd)"
                  >
                    <div class="cmd-icon">{{ cmd.icon }}</div>
                    <div class="cmd-content">
                      <p class="cmd-text">{{ cmd.text }}</p>
                      <span class="cmd-category">{{ cmd.category }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="action-bar">
                <el-button @click="prevStep" class="nav-btn">
                  <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                  上一步
                </el-button>
                <el-button type="primary" @click="nextStep" class="nav-btn next">
                  下一步
                  <ArtSvgIcon icon="ri:arrow-right-line" class="ml-1" />
                </el-button>
              </div>
            </div>
          </div>

          <!-- 步骤5: 常见问题与技巧 -->
          <div v-if="currentStep === 5" class="content-card glass-effect">
            <div class="card-header">
              <div class="header-badge">
                <span class="badge-icon">💡</span>
                <span class="badge-text">第五步</span>
              </div>
              <h2 class="card-title">常见问题与使用技巧</h2>
            </div>

            <div class="card-body">
              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:question-answer-line" class="number-icon" />
                  常见问题 (FAQ)
                </h3>
                <div class="faq-list">
                  <div
                    v-for="(faq, idx) in faqList"
                    :key="idx"
                    class="faq-item"
                  >
                    <details class="faq-details">
                      <summary class="faq-question">
                        <ArtSvgIcon icon="ri:question-mark" class="q-icon" />
                        <span>{{ faq.question }}</span>
                        <ArtSvgIcon icon="ri:arrow-down-s-line" class="arrow-icon" />
                      </summary>
                      <div class="faq-answer">
                        <p>{{ faq.answer }}</p>
                      </div>
                    </details>
                  </div>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:sparkling-2-line" class="number-icon" />
                  专业使用技巧
                </h3>
                <div class="pro-tips-grid">
                  <div v-for="(tip, idx) in proTips" :key="idx" class="pro-tip-card">
                    <div class="pt-icon">{{ tip.icon }}</div>
                    <h4>{{ tip.title }}</h4>
                    <p>{{ tip.content }}</p>
                  </div>
                </div>
              </div>

              <div class="tutorial-section">
                <h3 class="section-title">
                  <ArtSvgIcon icon="ri:keyboard-line" class="number-icon" />
                  快捷键指南
                </h3>
                <div class="shortcuts-list">
                  <div v-for="(shortcut, idx) in shortcuts" :key="idx" class="shortcut-item">
                    <kbd class="shortcut-keys">{{ shortcut.keys }}</kbd>
                    <span class="shortcut-action">{{ shortcut.action }}</span>
                  </div>
                </div>
              </div>

              <div class="action-bar">
                <el-button @click="prevStep" class="nav-btn">
                  <ArtSvgIcon icon="ri:arrow-left-line" class="mr-1" />
                  上一步
                </el-button>
                <el-button type="primary" @click="nextStep" class="nav-btn next">
                  完成学习
                  <ArtSvgIcon icon="ri:check-line" class="ml-1" />
                </el-button>
              </div>
            </div>
          </div>

          <!-- 步骤6: 完成 -->
          <div v-if="currentStep === 6" class="content-card glass-effect completion-card">
            <div class="completion-content">
              <div class="celebration-icon">🎉</div>
              <h2 class="completion-title">恭喜完成教程！</h2>
              <p class="completion-subtitle">您已掌握文档智能系统的核心功能</p>

              <div class="achievement-badges">
                <div
                  v-for="badge in achievementBadges"
                  :key="badge.id"
                  class="badge-item"
                >
                  <div class="badge-icon">{{ badge.icon }}</div>
                  <p class="badge-name">{{ badge.name }}</p>
                </div>
              </div>

              <div class="next-actions">
                <h3 class="actions-title">接下来您可以：</h3>
                <div class="action-cards">
                  <div
                    v-for="action in nextActions"
                    :key="action.id"
                    class="action-card"
                    @click="handleAction(action)"
                  >
                    <div class="ac-icon">{{ action.icon }}</div>
                    <h4>{{ action.title }}</h4>
                    <p>{{ action.desc }}</p>
                  </div>
                </div>
              </div>

              <div class="final-buttons">
                <el-button size="large" @click="resetTutorial" class="final-btn">
                  <ArtSvgIcon icon="ri:restart-line" class="mr-1" />
                  重新学习
                </el-button>
                <el-button
                  type="primary"
                  size="large"
                  @click="goToConsole"
                  class="final-btn primary"
                >
                  <ArtSvgIcon icon="ri:rocket-line" class="mr-1" />
                  开始使用
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 未开始状态 -->
      <div v-if="!tutorialStarted" class="getting-started glass-effect">
        <div class="gs-content">
          <h2 class="gs-title">快速开始</h2>
          <div class="gs-features">
            <div v-for="item in quickStartItems" :key="item.id" class="gs-item">
              <div class="gs-icon">{{ item.icon }}</div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Send } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const tutorialStarted = ref(false)
  const currentStep = ref(0)

  const tutorialSteps = [
    {
      title: '系统概览',
      description: '了解系统功能和特点',
      icon: '🚀',
      duration: '2分钟',
      unlocked: true
    },
    {
      title: '文档导入',
      description: '学习如何上传和管理文档',
      icon: '📁',
      duration: '3分钟',
      unlocked: false
    },
    {
      title: '信息提取',
      description: '掌握AI智能提取功能',
      icon: '🔍',
      duration: '4分钟',
      unlocked: false
    },
    {
      title: '智能操作',
      description: '使用自然语言指令',
      icon: '🤖',
      duration: '3分钟',
      unlocked: false
    },
    {
      title: '常见问题与技巧',
      description: '了解常见问题和使用技巧',
      icon: '💡',
      duration: '3分钟',
      unlocked: false
    },
    {
      title: '完成学习',
      description: '开始您的智能之旅',
      icon: '🎓',
      duration: '1分钟',
      unlocked: false
    }
  ]

  const systemFeatures = [
    {
      id: 1,
      icon: '📄',
      title: '文档管理',
      desc: '支持多种格式文档的上传、存储和组织',
      tag: '基础功能',
      tagType: 'info'
    },
    {
      id: 2,
      icon: '🔍',
      title: '智能提取',
      desc: 'AI自动识别文档中的关键信息',
      tag: '核心功能',
      tagType: 'success'
    },
    {
      id: 3,
      icon: '🤖',
      title: 'AI操作',
      desc: '用自然语言指挥系统执行各种操作',
      tag: '特色功能',
      tagType: 'warning'
    },
    {
      id: 4,
      icon: '📊',
      title: '表格处理',
      desc: '智能匹配和自动填充表格数据',
      tag: '高级功能',
      tagType: 'danger'
    }
  ]

  const extractionTypesDemo = [
    {
      type: 'entity',
      icon: '👤',
      name: '实体识别',
      examples: ['人名：张三、李四', '地名：北京、上海', '机构名：某某公司']
    },
    {
      type: 'amount',
      icon: '💰',
      name: '金额提取',
      examples: ['合同金额：¥100,000', '单价：$50.00', '总计：€1,200']
    },
    {
      type: 'date',
      icon: '📅',
      name: '日期识别',
      examples: ['签订日期：2024-01-15', '有效期：2024年12月31日']
    },
    {
      type: 'keyword',
      icon: '🔑',
      name: '关键词',
      examples: ['核心词汇', '专业术语', '重要概念']
    }
  ]

  const extractionSteps = [
    '进入「文档信息提取」页面',
    '选择目标文档库和具体文档',
    '勾选需要提取的信息类型',
    '点击「开始提取」按钮',
    '等待AI分析完成',
    '查看和编辑提取结果'
  ]

  const extractionTips = [
    { icon: 'ri:file-word-2-line', text: 'Word文档适合提取实体和关键词' },
    { icon: 'ri:file-excel-2-line', text: 'Excel表格适合提取金额和日期' },
    { icon: 'ri:brain-line', text: '提取准确率可达95%以上' },
    { icon: 'ri:edit-line', text: '提取结果可以手动修正' }
  ]

  const demoMessages = [
    { type: 'user', content: '提取这份合同中的甲方名称和合同金额' },
    { type: 'ai', content: '好的，正在分析文档...\n\n✓ 甲方名称：某某科技有限公司\n✓ 合同金额：¥500,000\n\n提取完成！' },
    { type: 'user', content: '将文档字体调整为宋体小四号' },
    { type: 'ai', content: '已将所有文字设置为宋体小四号 ✓' }
  ]

  const commandExamples = [
    { icon: '📝', text: '提取所有日期信息', category: '信息提取' },
    { icon: '🎨', text: '调整段落格式为两端对齐', category: '格式调整' },
    { icon: '🗑️', text: '删除所有空白行', category: '内容编辑' },
    { icon: '📊', text: '将表格转换为JSON', category: '数据转换' }
  ]

  const fillingSteps = [
    {
      title: '导入表格模板',
      desc: '上传包含表格结构的Word或Excel文档作为模板'
    },
    {
      title: '选择数据源',
      desc: '选择之前提取的文档数据作为填充来源'
    },
    {
      title: '智能匹配',
      desc: 'AI自动识别表头并匹配对应的数据字段'
    },
    {
      title: '预览和调整',
      desc: '检查填充结果，手动补充缺失信息'
    },
    {
      title: '导出分享',
      desc: '导出完成的表格或分享给团队成员'
    }
  ]

  const achievementBadges = [
    { id: 1, icon: '🌟', name: '新手入门' },
    { id: 2, icon: '📚', name: '功能掌握' },
    { id: 3, icon: '🎯', name: '操作熟练' },
    { id: 4, icon: '🏆', name: '学习达人' }
  ]

  const nextActions = [
    {
      id: 1,
      icon: '📁',
      title: '导入第一个文档',
      desc: '开始上传您的文档',
      route: '/doc-extraction/import'
    },
    {
      id: 2,
      icon: '🔍',
      title: '尝试信息提取',
      desc: '体验AI智能提取',
      route: '/doc-extraction/extract'
    },
    {
      id: 3,
      icon: '🤖',
      title: '使用智能操作',
      desc: '用自然语言指挥AI',
      route: '/doc-intelligence/operation'
    },
    {
      id: 4,
      title: '查看工作台',
      icon: '🏠',
      desc: '回到主界面',
      route: '/dashboard/console'
    }
  ]

  const quickStartItems = [
    {
      id: 1,
      icon: '⚡',
      title: '快速上手',
      desc: '5分钟掌握核心功能'
    },
    {
      id: 2,
      icon: '🎯',
      title: '实战演练',
      desc: '边学边练加深理解'
    },
    {
      id: 3,
      icon: '💡',
      title: '技巧提示',
      desc: '专业技巧提升效率'
    }
  ]

  const totalSteps = computed(() => tutorialSteps.length)
  const completedSteps = computed(() => currentStep.value)
  const tutorialProgress = computed(() => {
    return Math.round((completedSteps.value / totalSteps.value) * 100)
  })

  const startTutorial = () => {
    tutorialStarted.value = true
    currentStep.value = 0
    ElMessage.success('欢迎开始学习！')
  }

  const nextStep = () => {
    if (currentStep.value < tutorialSteps.length - 1) {
      currentStep.value++
      // 解锁下一步
      if (currentStep.value < tutorialSteps.length) {
        tutorialSteps[currentStep.value].unlocked = true
      }
    }
  }

  const prevStep = () => {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  const goToStep = (index: number) => {
    if (index <= currentStep.value || tutorialSteps[index].unlocked) {
      currentStep.value = index
    } else {
      ElMessage.warning('请先完成前面的步骤')
    }
  }

  const resetTutorial = () => {
    currentStep.value = 0
    tutorialSteps.forEach((step, idx) => {
      step.unlocked = idx === 0
    })
    ElMessage.info('教程已重置')
  }

  const showFeatureDetail = (feature: any) => {
    ElMessage.info(`点击查看「${feature.title}」详细说明`)
  }

  const tryCommand = (cmd: any) => {
    ElMessage.success(`已复制指令：${cmd.text}`)
  }

  const handleAction = (action: any) => {
    if (action.route) {
      router.push(action.route)
    }
  }

  const goToConsole = () => {
    router.push('/dashboard/console')
    ElMessage.success('祝您使用愉快！')
  }
</script>

<style scoped>
  .newbie-tutorial-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .tutorial-workspace {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  /* 欢迎横幅 */
  .welcome-banner {
    border-radius: 24px;
    padding: 32px;
  }

  .banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .banner-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex: 1;
  }

  .welcome-icon-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-bg-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
    border-radius: 20px;
    animation: pulse-scale 2s ease-in-out infinite;
  }

  @keyframes pulse-scale {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  .welcome-icon {
    font-size: 48px;
    position: relative;
    z-index: 1;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .welcome-text {
    flex: 1;
  }

  .welcome-title {
    font-size: 28px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 8px 0;
  }

  .welcome-subtitle {
    font-size: 15px;
    color: #666;
    margin: 0 0 16px 0;
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .tutorial-progress {
    flex: 1;
    max-width: 300px;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 600;
    color: #667eea;
  }

  .start-btn,
  .restart-btn {
    border-radius: 14px;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .start-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }

  /* 步骤导航 */
  .steps-navigation {
    border-radius: 20px;
    padding: 24px;
  }

  .nav-header {
    margin-bottom: 20px;
  }

  .nav-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .title-icon {
    font-size: 20px;
    color: #667eea;
  }

  .steps-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .step-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .step-item:hover:not(.locked) {
    background: rgba(102, 126, 234, 0.08);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.15);
  }

  .step-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  }

  .step-item.completed {
    background: rgba(76, 175, 80, 0.08);
    border-color: rgba(76, 175, 80, 0.3);
  }

  .step-item.locked {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .step-indicator {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .step-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #667eea;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    z-index: 1;
  }

  .step-number.locked {
    background: #ccc;
  }

  .step-item.completed .step-number {
    background: #4caf50;
  }

  .step-line {
    width: 2px;
    flex: 1;
    background: rgba(102, 126, 234, 0.2);
    margin-top: 8px;
  }

  .step-content {
    flex: 1;
  }

  .step-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .step-icon {
    font-size: 20px;
  }

  .step-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .step-desc {
    font-size: 13px;
    color: #666;
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .step-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .duration {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #999;
  }

  .meta-icon {
    font-size: 14px;
  }

  /* 内容卡片 */
  .tutorial-content-section {
    min-height: 400px;
  }

  .content-card {
    border-radius: 24px;
    overflow: hidden;
  }

  .card-header {
    padding: 28px 32px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: white;
    border-radius: 20px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .badge-icon {
    font-size: 18px;
  }

  .badge-text {
    font-size: 13px;
    font-weight: 600;
    color: #667eea;
  }

  .card-title {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }

  .card-body {
    padding: 32px;
  }

  /* 功能网格 */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin: 24px 0;
  }

  .feature-card {
    padding: 20px;
    background: white;
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .feature-card:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  }

  .feature-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .feature-desc {
    font-size: 13px;
    color: #666;
    margin: 0 0 12px 0;
    line-height: 1.6;
  }

  /* 教程区块 */
  .tutorial-section {
    margin-bottom: 32px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px 0;
  }

  .number-icon {
    font-size: 20px;
    color: #667eea;
  }

  .section-intro {
    font-size: 14px;
    color: #666;
    margin: 0 0 16px 0;
  }

  .instruction-box {
    padding: 20px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .instruction-list {
    margin: 0;
    padding-left: 20px;
  }

  .instruction-list li {
    margin-bottom: 10px;
    font-size: 14px;
    color: #555;
    line-height: 1.6;
  }

  .tip-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 18px;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.6;
  }

  .tip-box.info {
    background: rgba(33, 150, 243, 0.08);
    color: #1976d2;
  }

  .tip-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  /* 提取类型演示 */
  .extraction-types-demo {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin: 20px 0;
  }

  .type-demo-card {
    padding: 18px;
    background: white;
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 14px;
    transition: all 0.3s;
  }

  .type-demo-card:hover {
    border-color: #667eea;
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.12);
  }

  .type-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .type-icon {
    font-size: 28px;
  }

  .type-header h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .example-label {
    font-size: 12px;
    color: #999;
    margin: 0 0 8px 0;
  }

  .example-list {
    margin: 0;
    padding-left: 16px;
  }

  .example-list li {
    font-size: 13px;
    color: #666;
    margin-bottom: 6px;
    line-height: 1.5;
  }

  /* 步骤卡片 */
  .step-by-step {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.1);
  }

  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-text {
    flex: 1;
    font-size: 14px;
    color: #555;
  }

  /* 技巧网格 */
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
  }

  .tip-card {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
    background: white;
    border-radius: 10px;
    border: 1px solid rgba(102, 126, 234, 0.1);
  }

  .tip-card .tip-icon {
    font-size: 20px;
    color: #667eea;
    flex-shrink: 0;
  }

  .tip-card p {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  /* AI聊天演示 */
  .ai-chat-demo {
    background: white;
    border-radius: 16px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    font-weight: 600;
    color: #333;
  }

  .robot-icon {
    font-size: 22px;
  }

  .chat-messages {
    padding: 20px;
    max-height: 300px;
    overflow-y: auto;
  }

  .message {
    margin-bottom: 16px;
  }

  .message.user {
    text-align: right;
  }

  .message-bubble {
    display: inline-block;
    padding: 12px 16px;
    border-radius: 16px;
    max-width: 80%;
    text-align: left;
  }

  .message.user .message-bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .message.ai .message-bubble {
    background: rgba(102, 126, 234, 0.1);
    color: #333;
  }

  .message-bubble p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
  }

  .chat-input-demo {
    padding: 16px 20px;
    border-top: 1px solid rgba(102, 126, 234, 0.1);
  }

  /* 指令示例 */
  .command-examples {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }

  .command-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .command-card:hover {
    border-color: #667eea;
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .cmd-icon {
    font-size: 28px;
  }

  .cmd-content {
    flex: 1;
  }

  .cmd-text {
    font-size: 14px;
    color: #333;
    margin: 0 0 4px 0;
    font-weight: 500;
  }

  .cmd-category {
    font-size: 12px;
    color: #999;
  }

  /* 工作流图 */
  .workflow-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 20px;
    background: white;
    border-radius: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .workflow-step {
    text-align: center;
  }

  .wf-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }

  .workflow-step p {
    font-size: 13px;
    color: #666;
    margin: 0;
    font-weight: 500;
  }

  .wf-arrow {
    font-size: 24px;
    color: #667eea;
    font-weight: 700;
  }

  /* 详细步骤 */
  .detailed-steps {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-step {
    display: flex;
    gap: 16px;
    padding: 18px;
    background: white;
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.1);
  }

  .ds-number {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    flex-shrink: 0;
  }

  .ds-content h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 6px 0;
  }

  .ds-content p {
    font-size: 13px;
    color: #666;
    margin: 0;
    line-height: 1.6;
  }

  /* 完成卡片 */
  .completion-card {
    text-align: center;
  }

  .completion-content {
    padding: 40px 32px;
  }

  .celebration-icon {
    font-size: 72px;
    margin-bottom: 20px;
    animation: bounce 1s ease-in-out;
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  .completion-title {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 12px 0;
  }

  .completion-subtitle {
    font-size: 16px;
    color: #666;
    margin: 0 0 32px 0;
  }

  .achievement-badges {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .badge-item {
    text-align: center;
  }

  .badge-item .badge-icon {
    font-size: 40px;
    margin-bottom: 8px;
  }

  .badge-name {
    font-size: 13px;
    color: #666;
    margin: 0;
    font-weight: 500;
  }

  .next-actions {
    margin-bottom: 32px;
  }

  .actions-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
  }

  .action-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .action-card {
    padding: 20px;
    background: white;
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .action-card:hover {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  }

  .ac-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .action-card h4 {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin: 0 0 6px 0;
  }

  .action-card p {
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  .final-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
  }

  .final-btn {
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 15px;
    font-weight: 600;
  }

  .final-btn.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  /* 快速开始 */
  .getting-started {
    border-radius: 24px;
    padding: 40px 32px;
  }

  .gs-content {
    text-align: center;
  }

  .gs-title {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0 0 32px 0;
  }

  .gs-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .gs-item {
    padding: 24px;
    background: white;
    border-radius: 16px;
    transition: all 0.3s;
  }

  .gs-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .gs-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .gs-item h3 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .gs-item p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  /* 操作栏 */
  .action-bar {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid rgba(102, 126, 234, 0.1);
  }

  .nav-btn {
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .nav-btn.next {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  .nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  /* 介绍区域 */
  .intro-section {
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border-radius: 16px;
    border-left: 4px solid #667eea;
  }

  .intro-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin: 0 0 12px 0;
  }

  .intro-text {
    font-size: 15px;
    line-height: 1.8;
    color: #666;
    margin: 0;
  }

  /* 快速开始提示 */
  .quick-start-tips {
    margin: 32px 0;
  }

  .tips-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
  }

  .tips-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .tip-item {
    padding: 20px;
    background: white;
    border-radius: 14px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    text-align: center;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
    }

    .tip-icon {
      font-size: 36px;
      margin-bottom: 12px;
    }

    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin: 0 0 6px 0;
    }

    p {
      font-size: 13px;
      color: #666;
      margin: 0;
    }
  }

  /* FAQ列表 */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .faq-item {
    background: white;
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }
  }

  .faq-details {
    summary {
      list-style: none;

      &::-webkit-details-marker {
        display: none;
      }
    }
  }

  .faq-question {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    transition: all 0.3s;

    &:hover {
      background: rgba(102, 126, 234, 0.05);
    }

    .q-icon {
      font-size: 18px;
      color: #667eea;
      flex-shrink: 0;
    }

    span {
      flex: 1;
    }

    .arrow-icon {
      font-size: 18px;
      color: #999;
      transition: transform 0.3s;
      flex-shrink: 0;
    }
  }

  .faq-details[open] .faq-question .arrow-icon {
    transform: rotate(180deg);
  }

  .faq-answer {
    padding: 0 20px 20px 50px;
    font-size: 14px;
    line-height: 1.8;
    color: #666;

    p {
      margin: 0;
      white-space: pre-line;
    }
  }

  /* 专业技巧网格 */
  .pro-tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .pro-tip-card {
    padding: 20px;
    background: white;
    border-radius: 14px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.12);
    }

    .pt-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }

    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 13px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }
  }

  /* 快捷键列表 */
  .shortcuts-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: white;
    border-radius: 10px;
    border: 1px solid rgba(102, 126, 234, 0.1);
  }

  .shortcut-keys {
    padding: 6px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .shortcut-action {
    flex: 1;
    font-size: 14px;
    color: #666;
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .pro-tips-grid {
      grid-template-columns: 1fr;
    }

    .shortcuts-list {
      grid-template-columns: 1fr;
    }

    .tips-cards {
      grid-template-columns: 1fr;
    }
  }

  /* 动画 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-30px);
  }

  /* 响应式 */
  @media (max-width: 768px) {
    .banner-content {
      flex-direction: column;
    }

    .banner-left {
      flex-direction: column;
      text-align: center;
    }

    .steps-list {
      grid-template-columns: 1fr;
    }

    .action-bar {
      flex-direction: column;
    }

    .workflow-diagram {
      flex-direction: column;
    }

    .wf-arrow {
      transform: rotate(90deg);
    }

    .final-buttons {
      flex-direction: column;
    }
  }
</style>

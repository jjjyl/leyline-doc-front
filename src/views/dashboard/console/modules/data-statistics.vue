<template>
  <div class="art-card p-5 box-border mb-5 max-sm:mb-4" style="min-height: 480px;">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-g-900">提取趋势</h3>
      <ElRadioGroup v-model="timeRange" size="small" @change="fetchData">
        <ElRadioButton label="7">近7天</ElRadioButton>
        <ElRadioButton label="30">近30天</ElRadioButton>
      </ElRadioGroup>
    </div>

    <ArtBarChart
      class="box-border"
      barWidth="50%"
      height="12rem"
      :showAxisLine="false"
      :data="chartData"
      :xAxisData="xAxisLabels"
    />

    <div class="mt-5 pt-4 border-t border-g-200">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-base font-medium text-g-800">数据统计</h3>
        <span class="text-xs text-success font-medium">{{ trendPercentage }}</span>
      </div>
      <p class="text-xs text-g-500 mb-4">
        {{ timeRange === '7' ? '最近7天' : '最近30天' }}的表格提取数据趋势分析
      </p>

      <div class="grid grid-cols-4 gap-3">
        <div v-for="(item, index) in stats" :key="index" class="text-center p-3 bg-g-50 rounded-lg">
          <p class="text-xl font-semibold text-g-900 mb-1">{{ item.num }}</p>
          <p class="text-xs text-g-500">{{ item.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface StatItem {
    name: string
    num: string
  }

  const timeRange = ref('7')
  const xAxisLabels = ref<string[]>([])
  const chartData = ref<number[]>([])

  const stats = ref<StatItem[]>([
    { name: '总提取数', num: '0' },
    { name: '日均提取', num: '0' },
    { name: '最高单日', num: '0' },
    { name: '增长率', num: '0%' }
  ])

  const trendPercentage = computed(() => {
    return timeRange.value === '7' ? '+28%' : '+35%'
  })

  const generateMockData = (days: number) => {
    const labels: string[] = []
    const data: number[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      if (days === 7) {
        // 7天显示月/日
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`)
      } else {
        // 30天只显示日
        labels.push(`${date.getDate()}日`)
      }

      // 生成随机数据（20-80之间）
      data.push(Math.floor(Math.random() * 60) + 20)
    }

    return { labels, data }
  }

  const calculateStats = (data: number[]) => {
    const total = data.reduce((sum, val) => sum + val, 0)
    const avg = Math.round(total / data.length)
    const max = Math.max(...data)
    const growth = Math.floor(Math.random() * 20) + 15 // 模拟增长率

    stats.value = [
      { name: '总提取数', num: total.toString() },
      { name: '日均提取', num: avg.toString() },
      { name: '最高单日', num: max.toString() },
      { name: '增长率', num: `+${growth}%` }
    ]
  }

  const fetchData = async () => {
    try {
      const days = parseInt(timeRange.value)
      const mockData = generateMockData(days)

      xAxisLabels.value = mockData.labels
      chartData.value = mockData.data

      calculateStats(mockData.data)
    } catch (error) {
      console.error('获取提取趋势数据失败:', error)
    }
  }

  // 初始化数据
  fetchData()
</script>

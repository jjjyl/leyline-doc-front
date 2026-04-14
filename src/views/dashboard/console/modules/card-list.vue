<template>
  <ElRow :gutter="20">
    <ElCol v-for="(item, index) in dataList" :key="index" :xs="12" :sm="12" :md="6">
      <div class="art-card stat-card">
        <span class="card-label">{{ item.des }}</span>
        <ArtCountTo class="card-value" :target="item.num" :duration="1300" />
        <div class="card-trend">
          <span class="trend-label">较上周</span>
          <span
            class="trend-value"
            :class="[item.change.indexOf('+') === -1 ? 'trend-down' : 'trend-up']"
          >
            <span class="trend-icon">{{ item.change.indexOf('+') !== -1 ? '↑' : '↓' }}</span>
            {{ item.change }}
          </span>
        </div>
        <div class="card-icon-wrapper">
          <ArtSvgIcon :icon="item.icon" class="card-icon" />
        </div>
        <div class="floating-particles">
          <span v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.3}s` }"></span>
        </div>
      </div>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  interface CardDataItem {
    des: string
    icon: string
    startVal: number
    duration: number
    num: number
    change: string
    gradient: string
  }

  const dataList = reactive<CardDataItem[]>([
    {
      des: '总文档数',
      icon: 'ri:file-text-line',
      startVal: 0,
      duration: 1000,
      num: 1258,
      change: '+15%',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      des: '已提取表格',
      icon: 'ri:table-alt-line',
      startVal: 0,
      duration: 1000,
      num: 3456,
      change: '+28%',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      des: '识别字段总量',
      icon: 'ri:data-line',
      startVal: 0,
      duration: 1000,
      num: 28934,
      change: '+35%',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      des: '今日处理文档',
      icon: 'ri:time-line',
      startVal: 0,
      duration: 1000,
      num: 42,
      change: '+8%',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ])
</script>

<style scoped lang="scss">
  .stat-card {
    position: relative;
    height: 140px;
    padding: 24px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    overflow: hidden;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &:nth-child(1) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    &:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }

  .card-label {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
  }

  .card-value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    margin: 8px 0;
  }

  .card-trend {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  .trend-label {
    opacity: 0.8;
  }

  .trend-value {
    display: flex;
    align-items: center;
    gap: 2px;
    font-weight: 600;
  }

  .trend-up {
    color: rgba(255, 255, 255, 0.95);
  }

  .trend-down {
    color: rgba(255, 255, 255, 0.85);
  }

  .trend-icon {
    font-size: 14px;
  }

  .card-icon-wrapper {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-50%) scale(1.1) rotate(10deg);
    }
  }

  .card-icon {
    font-size: 28px;
    color: white;
  }

  .floating-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
  }

  .floating-particles span {
    position: absolute;
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
    bottom: -10px;
    animation: float-up 4s infinite;
  }

  .floating-particles span:nth-child(1) {
    left: 20%;
  }

  .floating-particles span:nth-child(2) {
    left: 50%;
  }

  .floating-particles span:nth-child(3) {
    left: 80%;
  }

  @keyframes float-up {
    0% {
      transform: translateY(0) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(-140px) scale(1);
      opacity: 0;
    }
  }
</style>

<!-- 工作台页面 -->
<template>
  <div>
    <CardList></CardList>

    <!--    <ElRow :gutter="20">-->
    <!--      <ElCol :sm="24" :lg="24">-->
    <!--        <DocUploader />-->
    <!--      </ElCol>-->
    <!--    </ElRow>-->

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <DataStatistics />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="12">
        <RecentDocuments />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <SystemActivities />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <TodoList />
      </ElCol>
    </ElRow>

    <AboutProject />
  </div>
</template>

<script setup lang="ts">
  import CardList from './modules/card-list.vue'
  import DataStatistics from './modules/data-statistics.vue'

  import RecentDocuments from './modules/recent-documents.vue'
  import SystemActivities from './modules/system-activities.vue'
  import TodoList from './modules/todo-list.vue'
  import AboutProject from './modules/about-project.vue'

  defineOptions({ name: 'Console' })
</script>

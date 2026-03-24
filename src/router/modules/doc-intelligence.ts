import { AppRouteRecord } from '@/types/router'

export const docIntelligenceRoutes: AppRouteRecord = {
  path: '/doc-intelligence',
  name: 'DocIntelligence',
  component: '/index/index',
  meta: {
    title: '文档智能操作',
    icon: 'ri:robot-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'operation',
      name: 'DocOperation',
      component: '/doc-intelligence/operation',
      meta: {
        title: '智能操作交互',
        icon: 'ri:cursor-line',
        keepAlive: true,
        authList: [
          { title: '执行操作', authMark: 'execute' },
          { title: '查看历史', authMark: 'history' }
        ]
      }
    },
    {
      path: 'guide',
      name: 'OperationGuide',
      component: '/doc-intelligence/guide',
      meta: {
        title: '操作引导',
        icon: 'ri:question-line',
        keepAlive: true
      }
    }
  ]
}

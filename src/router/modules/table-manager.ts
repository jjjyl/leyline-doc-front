import { AppRouteRecord } from '@/types/router'

export const tableManagerRoutes: AppRouteRecord = {
  path: '/table-manager',
  name: 'TableManager',
  component: '/index/index',
  meta: {
    title: '表格管理中心',
    icon: 'ri:table-2',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'manage',
      name: 'TableManage',
      component: '/table-manager',
      meta: {
        title: '表格管理',
        icon: 'ri:list-check',
        keepAlive: true,
        authList: [
          { title: '新建表格', authMark: 'create' },
          { title: '编辑表格', authMark: 'edit' },
          { title: '删除表格', authMark: 'delete' },
          { title: '导入导出', authMark: 'import-export' }
        ]
      }
    }
  ]
}

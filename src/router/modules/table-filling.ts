import { AppRouteRecord } from '@/types/router'

export const tableFillingRoutes: AppRouteRecord = {
  path: '/table-filling',
  name: 'TableFilling',
  component: '/index/index',
  meta: {
    title: '表格数据填写',
    icon: 'ri:table-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'template',
      name: 'TemplateImport',
      component: '/table-filling/template',
      meta: {
        title: '模板导入',
        icon: 'ri:file-excel-line',
        keepAlive: true,
        authList: [
          { title: '导入模板', authMark: 'import' },
          { title: '编辑模板', authMark: 'edit' }
        ]
      }
    },
    {
      path: 'filling',
      name: 'DataFilling',
      component: '/table-filling/filling',
      meta: {
        title: '数据填写',
        icon: 'ri:edit-line',
        keepAlive: true,
        authList: [
          { title: '自动填写', authMark: 'auto' },
          { title: '手动补充', authMark: 'manual' }
        ]
      }
    },
    {
      path: 'export',
      name: 'TableExport',
      component: '/table-filling/export',
      meta: {
        title: '导出分享',
        icon: 'ri:share-line',
        keepAlive: true,
        authList: [
          { title: '导出文件', authMark: 'export' },
          { title: '分享链接', authMark: 'share' }
        ]
      }
    }
  ]
}

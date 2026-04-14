import { AppRouteRecord } from '@/types/router'

export const docExtractionRoutes: AppRouteRecord = {
  path: '/doc-extraction',
  name: 'DocExtraction',
  component: '/index/index',
  meta: {
    title: '文档信息提取',
    icon: 'ri:file-text-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'import',
      name: 'DocImport',
      component: '/doc-extraction/import',
      meta: {
        title: '文档导入',
        icon: 'ri:upload-line',
        keepAlive: false,
        authList: [
          { title: '导入文档', authMark: 'import' },
          { title: '批量导入', authMark: 'batch' }
        ]
      }
    },
    {
      path: 'extract',
      name: 'InfoExtract',
      component: '/doc-extraction/extract',
      meta: {
        title: '信息提取',
        icon: 'ri:magic-line',
        keepAlive: false,
        authList: [
          { title: '开始提取', authMark: 'extract' },
          { title: '自定义规则', authMark: 'custom' }
        ]
      }
    },
    {
      path: 'storage',
      name: 'DataStorage',
      component: '/doc-extraction/storage',
      meta: {
        title: '数据存储',
        icon: 'ri:database-line',
        keepAlive: false,
        authList: [
          { title: '配置存储', authMark: 'config' },
          { title: '备份恢复', authMark: 'backup' }
        ]
      }
    }
  ]
}

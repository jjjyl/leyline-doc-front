import { AppRouteRecord } from '@/types/router'

export const templateRoutes: AppRouteRecord = {
  path: '/template',
  name: 'Template',
  component: '/index/index',
  meta: {
    title: 'menus.template.title',
    icon: 'ri:apps-2-line'
  },
  children: [
    {
      path: 'chat',
      name: 'Chat',
      component: '/template/chat',
      meta: {
        title: 'menus.template.chat',
        icon: 'ri:message-3-line',
        keepAlive: true
      }
    }
  ]
}

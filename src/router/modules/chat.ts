import { AppRouteRecord } from '@/types/router'

export const chatRoutes: AppRouteRecord = {
  name: 'Chat',
  path: '/chat',
  component: '/chat/index',
  meta: {
    title: 'menus.chat.title',
    icon: 'ri:message-3-line',
    keepAlive: true
  }
}

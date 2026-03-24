import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { systemRoutes } from './system'
import { articleRoutes } from './article'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { helpRoutes } from './help'
import { docIntelligenceRoutes } from './doc-intelligence'
import { docExtractionRoutes } from './doc-extraction'
import { tableFillingRoutes } from './table-filling'

/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  templateRoutes,
  systemRoutes,
  articleRoutes,
  resultRoutes,
  exceptionRoutes,
  docIntelligenceRoutes,
  docExtractionRoutes,
  tableFillingRoutes,
  ...helpRoutes
]

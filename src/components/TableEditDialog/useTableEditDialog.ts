// components/TableEditDialog/useTableEdit.ts
import { createApp, h } from 'vue'
import TableEditDialog from './index.vue'
import ElementPlus from 'element-plus'

/** 函数式打开表格编辑弹窗 */
export const openTableEditDialog = (tableData: Api.Table.ExtractTableDataResponse) => {
  // 创建临时容器
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建Vue实例
  const app = createApp({
    render() {
      return h(TableEditDialog, {
        visible: true,
        tableData,
        'onUpdate:visible': (val: boolean) => {
          if (!val) {
            app.unmount()
            container.remove()
          }
        },
        onEditSuccess: (params: any) => {
          console.log('修改成功', params)
        }
      })
    }
  })

  // 挂载ElementPlus（确保弹窗样式、组件正常）
  app.use(ElementPlus)
  app.mount(container)
}

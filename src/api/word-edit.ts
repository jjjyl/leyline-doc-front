import request from '@/utils/http'

/**
 * 使用自然语言指令编辑 Word 文档，支持预览和自动确认
 * @param params 编辑文档参数
 * @returns 编辑结果
 */
export function editDocument(params: Api.WordEdit.EditDocumentRequest) {
  return request.post<Api.WordEdit.EditDocumentResponse>({
    url: '/api/word-edit/edit',
    data: params
  })
}

/**
 * 预览文档编辑效果，不实际执行修改
 * @param params 预览编辑参数
 * @returns 预览结果
 */
export function previewEdit(params: Api.WordEdit.PreviewEditRequest) {
  return request.post<Api.WordEdit.PreviewEditResponse>({
    url: '/api/word-edit/preview',
    data: params
  })
}

/**
 * 确认执行之前预览过的编辑操作
 * @param editId 编辑任务ID
 * @returns 确认结果
 */
export function approveEdit(editId: string) {
  return request.post<Api.WordEdit.ApproveEditResponse>({
    url: '/api/word-edit/approve',
    data: {
      edit_id: editId
    }
  })
}

/**
 * 取消待确认的编辑任务
 * @param editId 编辑任务ID
 * @returns 取消结果
 */
export function cancelEdit(editId: string) {
  return request.post<Api.WordEdit.CancelEditResponse>({
    url: '/api/word-edit/cancel',
    data: {
      edit_id: editId
    }
  })
}

/**
 * 获取指定编辑任务的状态
 * @param editId 编辑任务ID
 * @returns 编辑状态
 */
export function getEditStatus(editId: string) {
  return request.get<Api.WordEdit.GetEditStatusResponse>({
    url: `/api/word-edit/status/${editId}`
  })
}

/**
 * 获取指定文档的编辑历史记录
 * @param docId 文档ID
 * @returns 编辑历史列表
 */
export function getEditHistory(docId: number) {
  return request.get<Api.WordEdit.GetEditHistoryResponse>({
    url: `/api/word-edit/history/${docId}`
  })
}

/**
 * 回滚文档到指定版本
 * @param params 回滚参数
 * @returns 回滚结果
 */
export function revertDocument(params: Api.WordEdit.RevertDocumentRequest) {
  return request.post<Api.WordEdit.RevertDocumentResponse>({
    url: '/api/word-edit/revert',
    data: params
  })
}

// src/composables/useDocFolderTree.ts
import { ref, watch, type Ref } from 'vue'
import * as docApi from '@/api/doc'
import * as folderApi from '@/api/folder'

export interface TreeNode {
  id: number
  name: string
  parentId: number
  isFolder: boolean
  children?: TreeNode[]
  // 文档特有字段
  type?: string
  size?: number
  hasTable?: boolean
  status?: string
  uploaderId?: number
}

/**
 * 将文件夹和文档列表构建为树形结构
 */
function buildTree(folders: Api.Folder.FolderInfo[], docs: Api.Doc.DocInfo[]): TreeNode[] {
  const folderMap = new Map<number, TreeNode>()
  const result: TreeNode[] = []

  // 初始化所有文件夹节点
  folders.forEach((folder) => {
    const node: TreeNode = {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId,
      isFolder: true,
      children: []
    }
    folderMap.set(folder.id, node)
  })

  // 将文档挂载到对应父文件夹下
  docs.forEach((doc) => {
    const docNode: TreeNode = {
      id: doc.id,
      name: doc.name,
      parentId: doc.parentId,
      isFolder: false,
      type: doc.type,
      hasTable: doc.hasTable,
      status: doc.status,
      uploaderId: doc.uploaderId
    }
    if (doc.parentId === 0) {
      result.push(docNode)
    } else {
      const parentFolder = folderMap.get(doc.parentId)
      if (parentFolder) {
        parentFolder.children = parentFolder.children || []
        parentFolder.children.push(docNode)
      } else {
        result.push(docNode)
      }
    }
  })

  // 组织文件夹层级关系
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)
    if (!node) return
    if (folder.parentId === 0) {
      result.push(node)
    } else {
      const parentFolder = folderMap.get(folder.parentId)
      if (parentFolder) {
        parentFolder.children = parentFolder.children || []
        parentFolder.children.push(node)
      } else {
        result.push(node)
      }
    }
  })

  // 清理空的 children 数组
  const cleanEmptyChildren = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanEmptyChildren(node.children)
      }
    })
  }
  cleanEmptyChildren(result)

  return result
}

/**
 * 文档/文件夹树形数据管理
 * @param libId 文档库ID（响应式）
 */
export function useDocFolderTree(libId: Ref<number | null>) {
  const treeData = ref<TreeNode[]>([])
  const loading = ref(false)

  const loadTreeData = async () => {
    const currentLibId = libId.value
    if (!currentLibId) {
      treeData.value = []
      return
    }

    loading.value = true
    try {
      const [docRes, folderRes] = await Promise.all([
        docApi.getDocList(undefined, currentLibId),
        folderApi.getFolderList(currentLibId)
      ])

      const docs = (docRes.docs || []).map(mapDocFromBackend)
      const folders = (folderRes.folders || []).map(mapFolderFromBackend)

      treeData.value = buildTree(folders, docs)
    } catch (error) {
      console.error('加载树形数据失败:', error)
      treeData.value = []
    } finally {
      loading.value = false
    }
  }

  // 监听 libId 变化，自动重新加载
  watch(libId, () => {
    loadTreeData()
  })

  return {
    treeData,
    loading,
    loadTreeData,
    buildTree // 暴露构建函数供外部使用
  }
}

// 后端数据映射
function mapDocFromBackend(backendDoc: any): Api.Doc.DocInfo {
  return {
    id: backendDoc.id,
    libId: backendDoc.lib_id,
    name: backendDoc.name,
    parentId: backendDoc.parent_id,
    path: backendDoc.path,
    status: backendDoc.status,
    type: backendDoc.type,
    uploaderId: backendDoc.uploader_id,
    hasTable: backendDoc.has_table
  }
}

function mapFolderFromBackend(backendFolder: any): Api.Folder.FolderInfo {
  return {
    id: backendFolder.id,
    libId: backendFolder.lib_id,
    name: backendFolder.name,
    parentId: backendFolder.parent_id,
    uploaderId: backendFolder.uploader_id,
    createdAt: backendFolder.created_at,
    updateAt: backendFolder.updated_at
  }
}

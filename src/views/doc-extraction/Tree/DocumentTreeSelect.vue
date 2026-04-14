<template>
  <div class="document-tree-select">
    <el-tree-select
      ref="treeSelectRef"
      v-model="selectedKey"
      :data="treeOptions"
      :props="treeProps"
      :placeholder="placeholder"
      :disabled="disabled || !libId"
      :clearable="clearable"
      :filterable="filterable"
      :loading="loading"
      :class="['tree-select', customClass]"
      value-key="value"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import * as docApi from '@/api/doc'
  import * as folderApi from '@/api/folder'

  // ---------- 类型定义 ----------
  interface TreeNode {
    id: number
    name: string
    parentId: number
    isFolder: boolean
    children?: TreeNode[]
    type?: string
    size?: number
    hasTable?: boolean
    status?: string
    uploaderId?: number
  }

  // ---------- Props ----------
  const props = withDefaults(
    defineProps<{
      libId: number | null
      modelValue: number | null
      placeholder?: string
      disabled?: boolean
      clearable?: boolean
      filterable?: boolean
      customClass?: string
    }>(),
    {
      placeholder: '请选择文档',
      disabled: false,
      clearable: true,
      filterable: true,
      customClass: ''
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void
    (e: 'change', value: number | null): void
  }>()

  // ---------- 状态 ----------
  const loading = ref(false)
  const treeData = ref<TreeNode[]>([])
  const selectedKey = ref<string | null>(null)

  // ---------- 树配置 ----------
  const treeProps = {
    label: 'name',
    children: 'children',
    disabled: (data: any) => data.isFolder === true,
    isLeaf: (data: any) => !data.children || data.children.length === 0
  }

  // ---------- 数据加载 ----------
  const loadTreeData = async () => {
    const currentLibId = props.libId
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

      const docs = (docRes.docs || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        parentId: d.parent_id,
        isFolder: false,
        type: d.type,
        size: d.size,
        hasTable: d.has_table,
        status: d.status,
        uploaderId: d.uploader_id
      }))

      const folders = (folderRes.folders || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        parentId: f.parent_id,
        isFolder: true,
        children: []
      }))

      treeData.value = buildTree(folders, docs)
    } catch (error) {
      console.error('加载文档树失败:', error)
      treeData.value = []
    } finally {
      loading.value = false
    }
  }

  // 构建树形结构
  function buildTree(folders: TreeNode[], docs: TreeNode[]): TreeNode[] {
    const folderMap = new Map<number, TreeNode>()
    const result: TreeNode[] = []

    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    docs.forEach((doc) => {
      const node = { ...doc }
      if (doc.parentId === 0) {
        result.push(node)
      } else {
        const parent = folderMap.get(doc.parentId)
        if (parent) {
          parent.children!.push(node)
        } else {
          result.push(node)
        }
      }
    })

    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!
      if (folder.parentId === 0) {
        result.push(node)
      } else {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children!.push(node)
        } else {
          result.push(node)
        }
      }
    })

    const clean = (nodes: TreeNode[]) => {
      nodes.forEach((n) => {
        if (n.children && n.children.length === 0) delete n.children
        else if (n.children) clean(n.children)
      })
    }
    clean(result)
    return result
  }

  // ---------- 转换为 el-tree-select 需要的格式（必须包含 value 字段）----------
  const treeOptions = computed(() => {
    const convert = (nodes: TreeNode[]): any[] => {
      return nodes.map((node) => {
        // 文档的 value 使用 doc_前缀+id，文件夹也生成 value 但会被 disabled
        const value = node.isFolder ? `folder_${node.id}` : `doc_${node.id}`
        return {
          id: node.id,
          name: node.name,
          value: value, // 关键：绑定 v-model 需要 value 字段
          isFolder: node.isFolder,
          disabled: node.isFolder,
          children: node.children ? convert(node.children) : undefined
        }
      })
    }
    return convert(treeData.value)
  })

  // ---------- key 与 id 转换 ----------
  const docIdToKey = (id: number | null): string | null => {
    if (id === null) return null
    return `doc_${id}`
  }
  const keyToDocId = (key: string | null): number | null => {
    if (!key) return null
    const match = key.match(/^doc_(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }

  // ---------- 双向绑定 ----------
  watch(
    () => props.modelValue,
    (newVal) => {
      const newKey = docIdToKey(newVal)
      if (selectedKey.value !== newKey) {
        selectedKey.value = newKey
      }
    },
    { immediate: true }
  )

  watch(selectedKey, (newKey) => {
    const docId = keyToDocId(newKey)
    if (props.modelValue !== docId) {
      emit('update:modelValue', docId)
      emit('change', docId)
    }
  })

  // ---------- 监听 libId 变化并加载数据 ----------
  watch(
    () => props.libId,
    (newLibId) => {
      if (newLibId) {
        loadTreeData()
      } else {
        treeData.value = []
      }
      // 清空选中值
      if (selectedKey.value) {
        selectedKey.value = null
      }
    },
    { immediate: true }
  )

  // 清空处理
  const handleClear = () => {
    selectedKey.value = null
  }

  // 暴露刷新方法
  defineExpose({ refresh: loadTreeData })
</script>

<style scoped>
  .document-tree-select {
    width: 100%;
  }

  .tree-select {
    width: 100%;
  }

  .tree-select :deep(.el-input__wrapper) {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
    padding: 10px 14px;
  }

  .tree-select :deep(.el-input__wrapper):hover {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .tree-select :deep(.el-input__wrapper).is-focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  }
</style>

<!-- src/components/DocumentTreeSelect/index.vue -->
<template>
  <div class="document-tree-select">
    <el-tree-select
      ref="treeSelectRef"
      v-model="selectedKey"
      :data="treeOptions"
      :props="treeProps"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :filterable="filterable"
      :loading="loading"
      :class="['tree-select', customClass]"
      @clear="handleClear"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { useDocFolderTree, type TreeNode } from '@/views/doc-extraction/Tree/TreeNode/treeNode'

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

  const { treeData, loading, loadTreeData } = useDocFolderTree(computed(() => props.libId))

  // 内部选中的 key（带前缀）
  const selectedKey = ref<string | null>(null)

  // 树形选择器的配置
  const treeProps = {
    label: 'name',
    children: 'children',
    disabled: (data: any) => data.disabled === true,
    isLeaf: (data: any) => !data.children || data.children.length === 0
  }

  // 将树节点转换为 el-tree-select 所需格式
  const treeOptions = computed(() => {
    const convert = (nodes: TreeNode[]): any[] => {
      return nodes.map((node) => {
        const isFolder = node.isFolder
        const key = isFolder ? `folder_${node.id}` : `doc_${node.id}`
        return {
          id: node.id,
          name: node.name,
          key: key,
          disabled: isFolder, // 文件夹不可选
          isFolder: isFolder,
          children: node.children ? convert(node.children) : undefined
        }
      })
    }
    return convert(treeData.value)
  })

  // 将文档 ID 转换为带前缀的 key
  const docIdToKey = (docId: number | null): string | null => {
    if (docId === null) return null
    return `doc_${docId}`
  }

  // 将带前缀的 key 转换为文档 ID
  const keyToDocId = (key: string | null): number | null => {
    if (!key) return null
    const match = key.match(/^doc_(\d+)$/)
    return match ? parseInt(match[1], 10) : null
  }

  // 监听外部 modelValue 变化，同步内部 selectedKey
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

  // 监听内部 selectedKey 变化，同步到外部
  watch(selectedKey, (newKey) => {
    const docId = keyToDocId(newKey)
    if (props.modelValue !== docId) {
      emit('update:modelValue', docId)
      emit('change', docId)
    }
  })

  // 清空处理
  const handleClear = () => {
    selectedKey.value = null
  }

  // 节点点击处理（可选，用于额外逻辑）
  const handleNodeClick = (data: any) => {
    if (data.disabled) {
      // 文件夹不可选，可给出提示
      // ElMessage.info('请选择文档文件')
    }
  }

  // 暴露刷新方法
  defineExpose({
    refresh: loadTreeData
  })
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

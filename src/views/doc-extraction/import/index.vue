<template>
  <div class="doc-import-container">
    <div class="import-workspace">
      <!-- 顶部：文档库管理区 -->
      <div class="library-panel glass-effect">
        <div class="panel-header">
          <div class="header-content">
            <div class="header-icon">📚</div>
            <div>
              <h2 class="panel-title">文档导入与识别</h2>
              <p class="panel-subtitle">管理文档库，批量上传和识别文档</p>
            </div>
          </div>
        </div>

        <div class="library-controls">
          <div class="control-group">
            <div class="select-wrapper">
              <label class="select-label">
                <ArtSvgIcon icon="ri:folder-3-line" class="label-icon" />
                文档库
              </label>
              <el-select
                v-model="selectedLibId"
                placeholder="请选择文档库"
                :disabled="uploadingActive"
                class="modern-select lib-select"
                @change="onLibChange"
              >
                <el-option
                  v-for="lib in libOptions"
                  :key="lib.libId"
                  :label="lib.name"
                  :value="lib.libId"
                >
                  <div class="option-lib">
                    <ArtSvgIcon icon="ri:database-2-line" class="lib-icon" />
                    <span>{{ lib.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="select-wrapper">
              <label class="select-label">
                <ArtSvgIcon icon="ri:folder-shared-line" class="label-icon" />
                上传目录
              </label>
              <el-tree-select
                v-model="selectedFolderId"
                :data="folderTreeOptions"
                :props="{ label: 'name', children: 'children', value: 'id' }"
                placeholder="选择上传目录（默认根目录）"
                clearable
                filterable
                :expand-on-click-node="false"
                @node-click="handleTreeNodeClick"
                class="modern-select folder-select"
                :disabled="uploadingActive"
              >
                <template #default="{ data }">
                  <div class="tree-option">
                    <ArtSvgIcon
                      :icon="data.id === 0 ? 'ri:home-line' : 'ri:folder-line'"
                      class="folder-icon"
                    />
                    <span>{{ data.name }}</span>
                  </div>
                </template>
              </el-tree-select>
            </div>
          </div>

          <div class="action-buttons">
            <el-button
              type="primary"
              plain
              :icon="Edit"
              :disabled="!selectedLibId || uploadingActive"
              @click="openEditLibDialog"
              class="action-btn"
            >
              编辑
            </el-button>

            <el-button
              type="danger"
              plain
              :icon="Delete"
              :disabled="!selectedLibId || uploadingActive"
              @click="handleDeleteLib"
              class="action-btn"
            >
              删除
            </el-button>

            <el-button
              type="success"
              plain
              @click="showCreateLibDialog = true"
              :disabled="uploadingActive"
              class="action-btn create-lib-btn"
            >
              <ArtSvgIcon icon="ri:add-circle-line" class="mr-1" />
              新建文档库
            </el-button>

            <el-button
              type="warning"
              plain
              @click="showCreateFolderDialog = true"
              :disabled="!selectedLibId || uploadingActive"
              class="action-btn"
            >
              <ArtSvgIcon icon="ri:folder-add-line" class="mr-1" />
              新建文件夹
            </el-button>
          </div>
        </div>
      </div>

      <!-- 中部：上传区域 -->
      <div class="upload-section">
        <div class="upload-card glass-effect">
          <div class="upload-header">
            <h3 class="upload-title">
              <ArtSvgIcon icon="ri:upload-cloud-2-line" class="title-icon" />
              文件上传
            </h3>
            <div class="upload-stats" v-if="fileList.length > 0">
              <el-tag type="primary" effect="dark">
                <ArtSvgIcon icon="ri:file-line" class="mr-1" />
                已缓存 {{ fileList.length }} 个文件
              </el-tag>
            </div>
          </div>

          <el-upload
            ref="uploadRef"
            class="modern-upload"
            drag
            :auto-upload="false"
            v-model:file-list="fileList"
            multiple
            :limit="10"
            :accept="'.docx,.md,.xlsx,.txt'"
            :before-upload="beforeUpload"
            :disabled="uploadingActive"
          >
            <div v-if="!uploadingActive" class="upload-dragger">
              <div class="upload-icon-wrapper">
                <div class="icon-ring"></div>
                <ArtSvgIcon icon="ri:upload-cloud-2-line" class="upload-main-icon" />
              </div>
              <div class="upload-text-content">
                <p class="upload-main-text">
                  将文件拖到此处，或 <em class="highlight-text">点击上传</em>
                </p>
                <p class="upload-hint">支持 docx、md、xlsx、txt 格式，单个文件最大 100MB</p>
              </div>
              <div class="supported-formats">
                <span class="format-badge docx">
                  <ArtSvgIcon icon="ri:file-word-2-line" />
                  Word
                </span>
                <span class="format-badge xlsx">
                  <ArtSvgIcon icon="ri:file-excel-2-line" />
                  Excel
                </span>
                <span class="format-badge md">
                  <ArtSvgIcon icon="ri:markdown-line" />
                  Markdown
                </span>
                <span class="format-badge txt">
                  <ArtSvgIcon icon="ri:file-text-line" />
                  Text
                </span>
              </div>
            </div>

            <div v-else class="upload-progress">
              <div class="progress-animation">
                <div class="loading-spinner"></div>
              </div>
              <div class="progress-info">
                <p class="current-file">
                  <ArtSvgIcon icon="ri:file-upload-line" class="file-icon" />
                  正在上传: {{ currentUploadFileName }}
                </p>
                <div class="progress-bar-wrapper">
                  <el-progress
                    :percentage="currentUploadProgress"
                    :stroke-width="12"
                    class="upload-progress-bar"
                  />
                </div>
                <p class="progress-detail"> 进度: {{ uploadedCount }} / {{ totalUploadCount }} </p>
              </div>
            </div>

            <template #tip>
              <div class="upload-tip">
                <ArtSvgIcon icon="ri:information-line" class="tip-icon" />
                <span>请先选择文档库，再添加文件，最后点击【确认上传】</span>
              </div>
            </template>
          </el-upload>

          <div class="upload-actions" v-if="fileList.length > 0">
            <el-button
              type="primary"
              @click="confirmUpload"
              :loading="uploadingActive"
              :disabled="!selectedLibId || fileList.length === 0"
              class="confirm-upload-btn"
              size="large"
            >
              <ArtSvgIcon icon="ri:check-double-line" class="mr-1" />
              {{ uploadingActive ? '上传中...' : '确认上传' }}
            </el-button>

            <el-button
              @click="clearFileList"
              :disabled="uploadingActive || fileList.length === 0"
              class="clear-btn"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
              清空缓存
            </el-button>
          </div>
        </div>
      </div>

      <!-- 底部：文档列表 -->
      <div class="documents-section">
        <div class="section-header">
          <h3 class="section-title">
            <ArtSvgIcon icon="ri:file-list-3-line" class="title-icon" />
            已导入文档
          </h3>
          <el-button text @click="loadDocuments" :loading="loading" class="refresh-btn">
            <ArtSvgIcon icon="ri:refresh-line" :class="{ rotating: loading }" class="mr-1" />
            刷新
          </el-button>
        </div>

        <div class="table-wrapper glass-effect">
          <el-table
            :data="treeData"
            row-key="id"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            v-loading="loading"
            border
            class="modern-table"
            :header-cell-style="{
              background:
                'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              color: '#333',
              fontWeight: '600',
              fontSize: '14px'
            }"
          >
            <el-table-column prop="name" label="文件名" min-width="250">
              <template #default="{ row }">
                <div class="file-name-cell">
                  <ArtSvgIcon
                    :icon="row.isFolder ? 'ri:folder-3-fill' : getDocIcon(row.type)"
                    class="file-icon"
                    :class="{ 'folder-icon': row.isFolder }"
                  />
                  <span class="file-name">{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">
                <span v-if="!row.isFolder" class="file-size">{{ formatFileSize(row.size) }}</span>
                <span v-else class="folder-count">{{ row.children?.length || 0 }} 项</span>
              </template>
            </el-table-column>

            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="row.isFolder ? 'warning' : 'primary'" effect="plain" size="small">
                  {{ row.isFolder ? '文件夹' : typeMap[row.type] || row.type || '文件' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'normal' ? 'success' : 'info'"
                  effect="dark"
                  size="small"
                >
                  {{ statusMap[row.status] || row.status }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="是否已有表格" width="140">
              <template #default="{ row }">
                <div v-if="!row.isFolder" class="table-badge">
                  <ArtSvgIcon
                    :icon="
                      row.hasTable ? 'ri:checkbox-circle-fill' : 'ri:indeterminate-circle-line'
                    "
                    :class="row.hasTable ? 'has-table' : 'no-table'"
                  />
                  <span>{{ row.hasTable ? '是' : '否' }}</span>
                </div>
                <span v-else class="text-gray">-</span>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <div class="action-btns">
                  <el-button
                    size="small"
                    @click="previewDocument(row)"
                    :disabled="row.isFolder"
                    class="table-action-btn preview"
                  >
                    <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
                    预览
                  </el-button>
                  <el-button
                    v-if="!row.isFolder"
                    size="small"
                    type="primary"
                    plain
                    @click="moveItem(row)"
                    class="table-action-btn move"
                  >
                    <ArtSvgIcon icon="ri:drag-move-line" class="mr-1" />
                    移动
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    @click="deleteItem(row)"
                    class="table-action-btn delete"
                  >
                    <ArtSvgIcon icon="ri:delete-bin-line" class="mr-1" />
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="treeData.length === 0 && !loading" class="empty-documents">
            <div class="empty-icon">📂</div>
            <p class="empty-text">暂无文档</p>
            <p class="empty-hint">选择文档库后上传文件</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框组件保持不变 -->
    <el-dialog v-model="previewDialog" title="文档预览" width="80%" class="preview-dialog">
      <div v-html="previewContent" class="preview-content"></div>
    </el-dialog>

    <el-dialog
      v-model="showCreateLibDialog"
      title="新建文档库"
      width="30%"
      @close="resetCreateLibForm"
      class="modern-dialog"
    >
      <el-form :model="createLibForm" :rules="createLibRules" ref="createLibFormRef">
        <el-form-item label="文档库名称" prop="name">
          <el-input
            v-model="createLibForm.name"
            placeholder="请输入文档库名称"
            class="dialog-input"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:database-2-line" class="input-icon" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateLibDialog = false" class="cancel-btn">取消</el-button>
          <el-button
            type="primary"
            @click="handleCreateLib"
            :loading="creatingLib"
            class="confirm-btn"
          >
            <ArtSvgIcon icon="ri:check-line" class="mr-1" />
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showEditLibDialog"
      title="编辑文档库"
      width="30%"
      @close="resetEditLibForm"
      class="modern-dialog"
    >
      <el-form :model="editLibForm" :rules="editLibRules" ref="editLibFormRef">
        <el-form-item label="文档库名称" prop="name">
          <el-input v-model="editLibForm.name" placeholder="请输入文档库名称" class="dialog-input">
            <template #prefix>
              <ArtSvgIcon icon="ri:database-2-line" class="input-icon" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditLibDialog = false" class="cancel-btn">取消</el-button>
          <el-button
            type="primary"
            @click="handleEditLib"
            :loading="editingLib"
            class="confirm-btn"
          >
            <ArtSvgIcon icon="ri:check-line" class="mr-1" />
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showCreateFolderDialog"
      title="新建文件夹"
      width="30%"
      class="modern-dialog"
    >
      <el-form :model="createFolderForm" :rules="createFolderRules">
        <el-form-item label="文件夹名称" prop="name">
          <el-input
            v-model="createFolderForm.name"
            placeholder="请输入文件夹名称"
            class="dialog-input"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:folder-line" class="input-icon" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="父文件夹">
          <el-tree-select
            v-model="createFolderForm.parentId"
            :data="folderTreeOptions"
            :props="{ label: 'name', children: 'children', value: 'id' }"
            placeholder="请选择父文件夹（默认根目录）"
            clearable
            filterable
            :expand-on-click-node="false"
            @node-click="handleParentNodeClick"
            class="modern-select"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateFolderDialog = false" class="cancel-btn">取消</el-button>
        <el-button
          type="primary"
          @click="handleCreateFolder"
          :loading="creatingFolder"
          class="confirm-btn"
        >
          <ArtSvgIcon icon="ri:check-line" class="mr-1" />
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { UploadFilled, Edit, Delete } from '@element-plus/icons-vue'
  import * as docLibApi from '@/api/doc-lib'
  import * as docApi from '@/api/doc'
  // 需要引入 folder API
  import * as folderApi from '@/api/folder'
  import axios from 'axios'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'DocImport' })

  const userStore = useUserStore()
  // import FileCardList from '@/views/doc-extraction/import/FireCardList.vue'

  // 文档列表（已导入的）
  const documents = ref([])

  // 预览相关
  const previewDialog = ref(false)
  const previewContent = ref('')
  const selectedDoc = ref(null)

  // 文档库相关
  const libOptions = ref<any[]>([])
  const selectedLibId = ref<number | null>(null)
  const parentId = ref<number>(0)

  //文件夹相关
  const selectedFolderId = ref<number | null>(0)

  // 上传相关
  const uploadRef = ref<any>(null)
  const fileList = ref<any[]>([])
  const uploadingActive = ref(false)
  const currentUploadFileName = ref('')
  const currentUploadProgress = ref(0)
  const uploadedCount = ref(0)
  const totalUploadCount = ref(0)

  // 新增响应式变量
  const treeData = ref<any[]>([]) // 树形数据（用于表格展示）
  const loading = ref(false) // 加载状态

  //创建文件文件夹相关
  const showCreateFolderDialog = ref(false)
  const createFolderFormRef = ref()
  const creatingFolder = ref(false)
  const createFolderForm = ref({
    name: '',
    parentId: 0 // 0 表示根目录
  })
  const createFolderRules = {
    name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }]
  }

  // 构建树形结构的辅助函数
  const buildTree = (folders: Api.Folder.FolderInfo[], docs: Api.Doc.DocInfo[]): any[] => {
    // 先构建 map，以 id 为键
    const folderMap = new Map<number, any>()
    const result: any[] = []

    // 初始化所有文件夹节点，并预留 children 数组
    folders.forEach((folder) => {
      const node = {
        ...folder,
        isFolder: true,
        children: [] as any[],
        // 表格需要的一些字段
        type: 'dir',
        status: 'normal',
        hasTable: false
      }
      folderMap.set(folder.id, node)
    })

    // 将文档挂载到对应父文件夹下
    docs.forEach((doc) => {
      const parentId = doc.parentId
      const docNode = {
        ...doc,
        isFolder: false
        // 如果是文档，没有 children
      }
      if (parentId === 0) {
        // 根目录下的文档
        result.push(docNode)
      } else {
        const parentFolder = folderMap.get(parentId)
        if (parentFolder) {
          parentFolder.children.push(docNode)
        } else {
          // 父文件夹不存在（可能后端数据异常），暂时放到根目录
          result.push(docNode)
        }
      }
    })

    // 将文件夹按父级关系组织
    folders.forEach((folder) => {
      const parentId = folder.parentId
      if (parentId === 0) {
        result.push(folderMap.get(folder.id))
      } else {
        const parentFolder = folderMap.get(parentId)
        if (parentFolder) {
          parentFolder.children.push(folderMap.get(folder.id))
        } else {
          // 父文件夹不存在，放到根目录
          result.push(folderMap.get(folder.id))
        }
      }
    })

    // 清理空 children（避免显示展开图标）
    const cleanEmptyChildren = (nodes: any[]) => {
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

  // 定义映射函数
  const mapDocFromBackend = (backendDoc: any): Api.Doc.DocInfo => {
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
  const mapFolderFromBackend = (backendFolder: any): Api.Folder.FolderInfo => {
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

  // 状态映射
  const statusMap: Record<string, string> = {
    normal: '正常',
    deleted: '已删除',
    processing: '处理中',
    failed: '失败'
    // 根据实际后端返回的状态补充
  }

  // 类型映射（如文件类型或文档类型）
  const typeMap: Record<string, string> = {
    file: '文件',
    dir: '文件夹',
    txt: '文本文件',
    docx: 'Word文档',
    xlsx: 'Excel表格'
    // 根据实际后端返回的类型补充
  }

  // 新建文档库相关
  const showCreateLibDialog = ref(false)
  const creatingLib = ref(false)
  const createLibForm = ref({
    name: ''
  })
  const createLibFormRef = ref()
  const createLibRules = {
    name: [
      { required: true, message: '请输入文档库名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ]
  }

  // 编辑文档库相关
  const showEditLibDialog = ref(false)
  const editingLib = ref(false)
  const editLibForm = ref({
    name: ''
  })
  const editLibFormRef = ref()
  const currentEditLibId = ref<number | null>(null)
  const editLibRules = {
    name: [
      { required: true, message: '请输入文档库名称', trigger: 'blur' },
      { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
    ]
  }

  // 打开编辑对话框
  const openEditLibDialog = () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择要编辑的文档库')
      return
    }
    const lib = libOptions.value.find((item) => item.libId === selectedLibId.value)
    if (lib) {
      currentEditLibId.value = lib.libId
      editLibForm.value.name = lib.name
      showEditLibDialog.value = true
    }
  }

  // 提交编辑
  const handleEditLib = async () => {
    if (!currentEditLibId.value) return
    try {
      await editLibFormRef.value.validate()
      editingLib.value = true

      await docLibApi.updateDocLib(currentEditLibId.value, editLibForm.value.name)

      ElMessage.success('文档库更新成功')

      showEditLibDialog.value = false

      // 刷新文档库列表
      await loadLibs()

      // 保持选中当前编辑的文档库（如果还存在）
      if (libOptions.value.some((lib) => lib.libId === currentEditLibId.value)) {
        selectedLibId.value = currentEditLibId.value
      } else {
        // 如果被删除或其他情况，选中第一个
        selectedLibId.value = libOptions.value[0]?.libId || null
      }

      // 重新加载当前库的文档列表
      await loadDocuments()
    } catch (error) {
      console.error('编辑文档库失败:', error)
      ElMessage.error('编辑文档库失败，请重试')
    } finally {
      editingLib.value = false
    }
  }

  // 删除文档库
  const handleDeleteLib = async () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择要删除的文档库')
      return
    }

    const libToDelete = libOptions.value.find((lib) => lib.libId === selectedLibId.value)
    if (!libToDelete) return

    try {
      await ElMessageBox.confirm(
        `确定要删除文档库“${libToDelete.name}”吗？删除后该库下的所有文档也将被删除，此操作不可恢复。`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await docLibApi.deleteDocLib(selectedLibId.value)

      ElMessage.success('文档库删除成功')

      // 刷新文档库列表
      await loadLibs()

      // 如果还有文档库，选中第一个；否则清空选中并清空文档列表
      if (libOptions.value.length > 0) {
        selectedLibId.value = libOptions.value[0].libId
        await loadDocuments()
      } else {
        selectedLibId.value = null
        documents.value = []
        ElMessage.info('已无文档库，请先创建')
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除文档库失败:', error)
        ElMessage.error('删除文档库失败，请重试')
      }
    }
  }

  // 监听文档库变化
  watch(selectedLibId, (newVal) => {
    if (newVal) {
      loadDocuments()
    } else {
      documents.value = []
    }
  })

  // 失败文件记录
  const failedFiles = ref<{ name: string; error: string }[]>([])

  const SUPPORTED_FORMATS = ['docx', 'xlsx', 'md', 'txt']

  // 验证文件（添加到列表前校验）
  const beforeUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    if (!fileType || !SUPPORTED_FORMATS.includes(fileType)) {
      ElMessage.error(`不支持的文件格式：${fileType}。支持格式：${SUPPORTED_FORMATS.join(', ')}`)
      return false
    }
    return true
  }

  // 清空文件缓存
  const clearFileList = () => {
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    fileList.value = []
    ElMessage.info('已清空待上传文件列表')
  }

  // 切换文档库时清空缓存文件
  const onLibChange = () => {
    if (fileList.value.length > 0) {
      ElMessageBox.confirm('切换文档库会清空当前已缓存的文件列表，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearFileList()
          loadDocuments()
        })
        .catch(() => {
          // 取消切换，恢复原值
          loadDocuments()
        })
    } else {
      loadDocuments()
    }
  }

  // 上传单个文件
  const uploadSingleFile = (file: File, libId: number, parentId: number): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const sessionParams: Api.Doc.CreateUploadSessionRequest = {
          file_name: file.name,
          file_size: file.size,
          lib_id: libId,
          parent_id: parentId,
          type: file.type || 'file'
        }

        const sessionData: Api.Doc.CreateUploadSessionResponse =
          await docApi.createUploadSession(sessionParams)

        const { doc_id, upload_url } = sessionData

        await axios.put(upload_url, file, {
          headers: { 'Content-Type': 'application/octet-stream' },
          onUploadProgress: (e) => {
            if (e.total) {
              currentUploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
          }
        })

        await docApi.finishUpload(doc_id)

        resolve()
      } catch (err) {
        console.error(`文件 ${file.name} 上传失败:`, err)
        reject(err)
      }
    })
  }

  // 确认上传
  const confirmUpload = async () => {
    if (!selectedLibId.value) {
      ElMessage.warning('请先选择文档库')
      return
    }

    if (fileList.value.length === 0) {
      ElMessage.warning('请先添加要上传的文件')
      return
    }
    // 获取上传目标父文件夹ID
    const targetParentId = selectedFolderId.value ?? 0
    uploadingActive.value = true
    failedFiles.value = []
    uploadedCount.value = 0
    totalUploadCount.value = fileList.value.length

    const filesToUpload = fileList.value.map((item) => item.raw)

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      currentUploadFileName.value = file.name
      currentUploadProgress.value = 0

      try {
        await uploadSingleFile(file, selectedLibId.value, targetParentId)
        uploadedCount.value++
        ElMessage.success(`文件 ${file.name} 上传成功`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '上传失败'
        failedFiles.value.push({ name: file.name, error: errorMsg })
        ElMessage.error(`文件 ${file.name} 上传失败: ${errorMsg}`)
      }
    }

    uploadingActive.value = false
    currentUploadFileName.value = ''
    currentUploadProgress.value = 0

    if (failedFiles.value.length === 0) {
      ElMessage.success(`全部 ${totalUploadCount.value} 个文件上传成功`)
    } else {
      ElMessage.warning(
        `上传完成，成功 ${uploadedCount.value} 个，失败 ${failedFiles.value.length} 个`
      )
    }

    clearFileList()
    await loadDocuments()
  }

  // 预览文档
  const previewDocument = async (doc: any) => {
    try {
      const token = userStore.accessToken
      if (!token) {
        ElMessage.error('未登录，无法预览')
        return
      }

      const wopiSrc = `http://192.168.0.136:36879/wopi/files/${doc.id}`
      const previewUrl = `http://office.server.poyuan233.cn:8088/loleaflet/dist/loleaflet.html?WOPISrc=${encodeURIComponent(wopiSrc)}&access_token=${token}&lang=zh-CN`
      window.open(previewUrl, '_blank')
    } catch (error) {
      ElMessage.error('预览失败')
    }
  }

  const deleteItem = async (item: any) => {
    if (item.isFolder) {
      // 删除文件夹
      try {
        await ElMessageBox.confirm(`确定删除文件夹“${item.name}”及其所有内容吗？`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await folderApi.deleteFolder(item.id)
        ElMessage.success('删除成功')
        await loadDocuments()
      } catch (error) {
        if (error !== 'cancel') ElMessage.error('删除失败')
      }
    } else {
      try {
        await ElMessageBox.confirm(
          `确定要删除文档 "${item.name}" 吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await docApi.deleteDoc(item.id)
        ElMessage.success('删除成功')
        await loadDocuments()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
  }

  // 加载文档列表
  // 在loadDocuments中使用
  // 修改 loadDocuments
  const loadDocuments = async () => {
    if (!selectedLibId.value) return
    loading.value = true
    try {
      // 同时请求文档列表和文件夹列表
      const docResponse = await docApi.getDocList(undefined, selectedLibId.value)

      const foldersResponse = await folderApi.getFolderList(selectedLibId.value)

      const docs = (docResponse.docs || []).map(mapDocFromBackend)
      const folders = (foldersResponse.folders || []).map(mapFolderFromBackend)

      treeData.value = buildTree(folders, docs)
    } catch (error) {
      ElMessage.error('获取数据失败')
    } finally {
      loading.value = false
    }
  }

  // 加载文档库列表
  const loadLibs = async () => {
    try {
      const libList = await docLibApi.fetchDocLibs()
      libOptions.value = libList || []
      if (libOptions.value.length > 0) {
        if (
          selectedLibId.value &&
          libOptions.value.some((lib) => lib.libId === selectedLibId.value)
        ) {
          // 保持当前选中
        } else {
          selectedLibId.value = libOptions.value[0]?.libId || null
        }
      } else {
        selectedLibId.value = null
        ElMessage.warning('暂无文档库，请先创建文档库')
      }
    } catch (error) {
      ElMessage.error('获取文档库列表失败')
    }
  }

  // 新建文档库
  const handleCreateLib = async () => {
    try {
      await createLibFormRef.value.validate()
      creatingLib.value = true

      const res = await docLibApi.docLibCreate(createLibForm.value.name)
      const newLibId = res.lib_id || res.data?.lib_id

      ElMessage.success('文档库创建成功')

      showCreateLibDialog.value = false

      await loadLibs()

      if (newLibId) {
        selectedLibId.value = newLibId
      } else if (libOptions.value.length > 0) {
        selectedLibId.value = libOptions.value[0].libId
      }

      clearFileList()
      await loadDocuments()
    } catch (error) {
      console.error('创建文档库失败:', error)
      ElMessage.error('创建文档库失败，请重试')
    } finally {
      creatingLib.value = false
    }
  }

  const folderTreeOptions = computed(() => {
    const extractFolders = (nodes: any[]): any[] => {
      return nodes
        .filter((node) => node.isFolder)
        .map((node) => ({
          id: node.id,
          name: node.name,
          children: node.children ? extractFolders(node.children) : []
        }))
    }
    const folders = extractFolders(treeData.value)
    // 添加根目录选项（id=0）
    return [{ id: 0, name: '根目录', children: folders }]
  })

  //提交创建文件夹表单
  const handleCreateFolder = async () => {
    if (!selectedLibId.value) return
    console.log('创建文件夹参数:', {
      lib_id: selectedLibId.value,
      name: createFolderForm.value.name,
      parent_id: createFolderForm.value.parentId
    })
    try {
      //await createFolderFormRef.value.validate()
      creatingFolder.value = true
      await folderApi.folderCreate({
        lib_id: selectedLibId.value,
        name: createFolderForm.value.name,
        parent_id: createFolderForm.value.parentId || 0
      })

      ElMessage.success('文件夹创建成功')
      showCreateFolderDialog.value = false
      createFolderForm.value = { name: '', parentId: 0 }
      await loadDocuments() // 刷新树
    } catch (error) {
      ElMessage.error('创建失败')
    } finally {
      creatingFolder.value = false
    }
  }

  // 移除单个文件
  const removeFile = (file: any) => {
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index !== -1) {
      fileList.value.splice(index, 1)
      ElMessage.info(`已移除文件: ${file.name}`)
    }
  }

  // 处理上传目录选择器的节点点击
  const handleTreeNodeClick = (data: any, node: any, event: Event) => {
    // 手动设置选中值
    selectedFolderId.value = data.id
    // 阻止事件冒泡，避免可能的冲突
    event.stopPropagation()
  }

  // 处理新建文件夹对话框中父文件夹选择器的节点点击
  const handleParentNodeClick = (data: any, node: any, event: Event) => {
    createFolderForm.value.parentId = data.id
    event.stopPropagation()
  }

  // 组件挂载时加载文档库和文档列表
  onMounted(async () => {
    await loadLibs()
    if (selectedLibId.value) {
      await loadDocuments()
    }
  })

  // 新增辅助函数
  const getDocIcon = (type?: string) => {
    const icons: Record<string, string> = {
      docx: 'ri:file-word-2-line',
      xlsx: 'ri:file-excel-2-line',
      pdf: 'ri:file-pdf-line',
      txt: 'ri:file-text-line',
      md: 'ri:markdown-line'
    }
    return icons[type?.toLowerCase() || ''] || 'ri:file-line'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
</script>

<style scoped>
  .doc-import-container {
    padding: 24px;
    min-height: calc(100vh - 120px);
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  }

  .import-workspace {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .glass-effect {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  /* 文档库面板 */
  .library-panel {
    border-radius: 20px;
    padding: 28px;
  }

  .panel-header {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid rgba(168, 237, 234, 0.3);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-icon {
    font-size: 40px;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .panel-title {
    font-size: 24px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 4px 0;
  }

  .panel-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .library-controls {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .control-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .select-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #555;
  }

  .label-icon {
    font-size: 16px;
    color: #667eea;
  }

  .modern-select {
    width: 100%;
  }

  .option-lib,
  .tree-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .lib-icon,
  .folder-icon {
    font-size: 16px;
    color: #667eea;
  }

  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .action-btn {
    border-radius: 10px;
    transition: all 0.3s;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .create-lib-btn {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%);
  }

  /* 上传区域 */
  .upload-section {
    margin-top: 4px;
  }

  .upload-card {
    border-radius: 20px;
    padding: 28px;
  }

  .upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .upload-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .title-icon {
    font-size: 24px;
    color: #667eea;
  }

  .modern-upload {
    width: 100%;
  }

  .modern-upload :deep(.el-upload-dragger) {
    padding: 0;
    border: none;
    background: transparent;
  }

  .upload-dragger {
    padding: 50px 40px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }

  .upload-icon-wrapper {
    position: relative;
    display: inline-block;
    margin-bottom: 24px;
  }

  .icon-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    border: 3px solid #667eea;
    border-radius: 50%;
    opacity: 0.2;
    animation: ring-pulse 2s infinite;
  }

  @keyframes ring-pulse {
    0%,
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.2;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.15);
      opacity: 0.1;
    }
  }

  .upload-main-icon {
    font-size: 72px;
    color: #667eea;
    filter: drop-shadow(0 8px 16px rgba(102, 126, 234, 0.3));
    animation: float 3s ease-in-out infinite;
  }

  .upload-text-content {
    margin-bottom: 24px;
  }

  .upload-main-text {
    font-size: 18px;
    color: #333;
    margin: 0 0 10px 0;
    font-weight: 600;
  }

  .highlight-text {
    color: #667eea;
    font-style: normal;
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: rgba(102, 126, 234, 0.3);
  }

  .upload-hint {
    font-size: 14px;
    color: #999;
    margin: 0;
  }

  .supported-formats {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .format-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s;
  }

  .format-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .format-badge.docx {
    background: linear-gradient(135deg, rgba(66, 133, 244, 0.15) 0%, rgba(66, 133, 244, 0.05) 100%);
    color: #4285f4;
    border: 1px solid rgba(66, 133, 244, 0.3);
  }

  .format-badge.xlsx {
    background: linear-gradient(135deg, rgba(52, 168, 83, 0.15) 0%, rgba(52, 168, 83, 0.05) 100%);
    color: #34a853;
    border: 1px solid rgba(52, 168, 83, 0.3);
  }

  .format-badge.md {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%);
    color: #ff9800;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  .format-badge.txt {
    background: linear-gradient(
      135deg,
      rgba(158, 158, 158, 0.15) 0%,
      rgba(158, 158, 158, 0.05) 100%
    );
    color: #9e9e9e;
    border: 1px solid rgba(158, 158, 158, 0.3);
  }

  .upload-progress {
    padding: 50px 40px;
    text-align: center;
  }

  .progress-animation {
    margin-bottom: 24px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto;
    border: 4px solid rgba(102, 126, 234, 0.2);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .progress-info {
    max-width: 500px;
    margin: 0 auto;
  }

  .current-file {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    color: #333;
    font-weight: 600;
    margin: 0 0 20px 0;
  }

  .file-icon {
    font-size: 20px;
    color: #667eea;
  }

  .progress-bar-wrapper {
    margin-bottom: 16px;
  }

  .upload-progress-bar :deep(.el-progress-bar__outer) {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.05);
  }

  .upload-progress-bar :deep(.el-progress-bar__inner) {
    border-radius: 10px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.3s ease;
  }

  .progress-detail {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .upload-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 16px;
    padding: 12px;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    font-size: 13px;
    color: #666;
  }

  .tip-icon {
    font-size: 16px;
    color: #667eea;
  }

  .upload-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: center;
  }

  .confirm-upload-btn {
    border-radius: 12px;
    padding: 14px 32px;
    font-size: 16px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    transition: all 0.3s;
  }

  .confirm-upload-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  }

  .clear-btn {
    border-radius: 12px;
    padding: 14px 32px;
    font-size: 16px;
  }

  /* 文档列表 */
  .documents-section {
    margin-top: 4px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .refresh-btn {
    border-radius: 8px;
    transition: all 0.3s;
  }

  .refresh-btn:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .rotating {
    animation: spin 1s linear infinite;
  }

  .table-wrapper {
    border-radius: 16px;
    padding: 20px;
    overflow: hidden;
  }

  .modern-table {
    border-radius: 12px;
    overflow: hidden;
  }

  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .file-icon {
    font-size: 20px;
    color: #667eea;
  }

  .folder-icon {
    color: #ffa726;
  }

  .file-name {
    font-weight: 500;
    color: #333;
  }

  .file-size,
  .folder-count {
    font-size: 13px;
    color: #666;
  }

  .table-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
  }

  .has-table {
    color: #4caf50;
    font-size: 16px;
  }

  .no-table {
    color: #999;
    font-size: 16px;
  }

  .text-gray {
    color: #999;
  }

  .action-btns {
    display: flex;
    gap: 8px;
  }

  .table-action-btn {
    border-radius: 8px;
    transition: all 0.2s;
  }

  .table-action-btn:hover {
    transform: scale(1.05);
  }

  .empty-documents {
    text-align: center;
    padding: 60px 20px;
    color: #999;
  }

  .empty-icon {
    font-size: 56px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 13px;
    margin: 0;
    opacity: 0.7;
  }

  /* 对话框样式 */
  .modern-dialog :deep(.el-dialog) {
    border-radius: 20px;
    overflow: hidden;
  }

  .dialog-input :deep(.el-input__wrapper) {
    border-radius: 10px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    transition: all 0.3s;
  }

  .dialog-input :deep(.el-input__wrapper):hover,
  .dialog-input :deep(.el-input__wrapper).is-focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .input-icon {
    color: #667eea;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .cancel-btn {
    border-radius: 10px;
  }

  .confirm-btn {
    border-radius: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
  }

  .preview-content {
    max-height: 70vh;
    overflow-y: auto;
  }

  /* 响应式 */
  @media (max-width: 768px) {
    .control-group {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
    }

    .upload-actions {
      flex-direction: column;
    }

    .section-header {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
  }
</style>

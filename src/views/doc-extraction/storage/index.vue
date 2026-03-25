<template>
  <div class="data-storage">
    <div class="mb-4">
      <h2 class="text-xl font-bold mb-4">数据存储管理</h2>
      <el-form :model="configForm" label-width="150px">
        <el-form-item label="数据库类型">
          <el-select v-model="configForm.dbType">
            <el-option label="MySQL" value="mysql" />
            <el-option label="MongoDB" value="mongodb" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址">
          <el-input v-model="configForm.host" placeholder="localhost" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="configForm.port" placeholder="3306" />
        </el-form-item>
        <el-form-item label="数据库名">
          <el-input v-model="configForm.database" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="configForm.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="configForm.password" type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testConnection">测试连接</el-button>
          <el-button @click="saveConfig">保存配置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">存储的数据</h3>
      <el-table :data="storedData" style="width: 100%">
        <el-table-column prop="documentName" label="文档名" />
        <el-table-column prop="extractType" label="提取类型" />
        <el-table-column prop="dataCount" label="数据条数" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewData(scope.row)">查看</el-button>
            <el-button size="small" @click="exportData(scope.row)">导出</el-button>
            <el-button size="small" type="danger" @click="deleteData(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">备份与恢复</h3>
      <el-button type="primary" @click="createBackup">创建备份</el-button>
      <el-button @click="restoreBackup">恢复备份</el-button>
      <div class="mt-2">
        <el-table :data="backups" style="width: 100%">
          <el-table-column prop="name" label="备份名称" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column prop="size" label="大小" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="downloadBackup(scope.row)">下载</el-button>
              <el-button size="small" type="danger" @click="deleteBackup(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>

  <el-dialog title="数据详情" v-model="dataDialog" width="600px">
    <div>
      <pre>{{ dataContent }}</pre>
    </div>
    <span class="dialog-footer">
      <el-button @click="dataDialog = false">关闭</el-button>
    </span>
  </el-dialog>

  <el-dialog title="创建备份" v-model="backupDialog" width="400px">
    <el-form :model="backupForm" label-width="100px">
      <el-form-item label="备份名称">
        <el-input v-model="backupForm.name" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="backupForm.description" />
      </el-form-item>
    </el-form>
    <span class="dialog-footer">
      <el-button @click="backupDialog = false">取 消</el-button>
      <el-button type="primary" @click="createBackup">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const configForm = reactive({
  dbType: 'mysql',
  host: 'localhost',
  port: '3306',
  database: 'doc_system',
  username: 'root',
  password: ''
})

const storedData = ref([])

// 加载存储的数据
const loadStoredData = async () => {
  try {
    const response = await fetch('/api/storage/data')
    const data = await response.json()
    storedData.value = data.list || []
  } catch (error) {
    ElMessage.error('获取存储数据失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadStoredData()
})

const dataDialog = ref(false)
const selectedData = ref(null)
const dataContent = ref('')
const backupDialog = ref(false)
const backupForm = reactive({
  name: '',
  description: ''
})

const backups = ref([
  {
    id: 1,
    name: 'backup_20240101',
    createTime: '2024-01-01 10:00:00',
    size: '2.5MB'
  },
  {
    id: 2,
    name: 'backup_20240115',
    createTime: '2024-01-15 14:00:00',
    size: '3.1MB'
  }
])

// 测试数据库连接
const testConnection = async () => {
  try {
    ElMessage.info('正在测试连接...')

    // 模拟连接测试
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('数据库连接成功')
  } catch (error) {
    ElMessage.error('数据库连接失败')
  }
}

// 保存配置
const saveConfig = () => {
  // 模拟保存配置
  localStorage.setItem('db_config', JSON.stringify(configForm))
  ElMessage.success('配置已保存')
}

// 查看数据
const viewData = (data: any) => {
  selectedData.value = data
  // 模拟获取数据内容
  generateMockDataContent(data)
  dataDialog.value = true
}

// 生成模拟数据内容
const generateMockDataContent = (data: any) => {
  if (data.extractType === '实体提取') {
    dataContent.value = JSON.stringify({
      entities: [
        { type: '人名', value: '张三', confidence: '95%' },
        { type: '机构名', value: 'ABC公司', confidence: '98%' },
        { type: '金额', value: '10000元', confidence: '97%' }
      ]
    }, null, 2)
  } else if (data.extractType === '金额提取') {
    dataContent.value = JSON.stringify({
      amounts: ['10000元', '5000元', '8000元']
    }, null, 2)
  }
}

// 导出数据
const exportData = (data: any) => {
  const content = generateMockDataContent(data)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${data.documentName}_data.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('数据已导出')
}

// 删除数据
const deleteData = async (data: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${data.documentName}" 的数据吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    storedData.value = storedData.value.filter(d => d.id !== data.id)
    ElMessage.success('数据已删除')
  } catch (error) {
    // 用户取消
  }
}

// 创建备份
const createBackup = async () => {
  if (!backupForm.name) {
    ElMessage.warning('请输入备份名称')
    return
  }

  try {
    ElMessage.info('正在创建备份...')

    // 模拟备份过程
    await new Promise(resolve => setTimeout(resolve, 3000))

    ElMessage.success('备份创建成功')
    backupDialog.value = false
    backupForm.name = ''
    backupForm.description = ''
  } catch (error) {
    ElMessage.error('备份创建失败')
  }
}

// 恢复备份
const restoreBackup = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要恢复备份吗？当前数据将被覆盖。',
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.info('正在恢复备份...')

    // 模拟恢复过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('备份恢复成功')
  } catch (error) {
    // 用户取消或恢复失败
  }
}

// 批量导入数据
const batchImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

// 数据统计
const dataStats = reactive({
  totalDocuments: 25,
  totalRecords: 1250,
  storageSize: '15.6MB',
  lastBackup: '2024-01-15 10:00:00'
})

// 清理过期数据
const cleanupExpired = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理过期数据吗？',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    ElMessage.info('正在清理过期数据...')

    // 模拟清理过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    ElMessage.success('过期数据清理完成')
  } catch (error) {
    // 用户取消
  }
}

// 下载备份
const downloadBackup = (backup: any) => {
  // 模拟下载备份文件
  const blob = new Blob(['模拟备份文件内容'], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${backup.name}.bak`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('备份文件已下载')
}

// 删除备份
const deleteBackup = async (backup: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    backups.value = backups.value.filter(b => b.id !== backup.id)
    ElMessage.success('备份已删除')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.data-storage {
  padding: 20px;
}
</style>

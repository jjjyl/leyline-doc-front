<template>
  <div class="online-document">
    <!-- 顶部工具栏 - 类似 Excel -->
    <div class="toolbar-container bg-white border-b border-gray-200">
      <!-- 菜单栏 -->
      <div class="menu-bar flex items-center gap-1 px-2 py-1.5 border-b border-gray-200 bg-white">
        <el-dropdown trigger="click" @command="handleMenuCommand">
          <span class="menu-item">
            文件 <ArtSvgIcon icon="ri:arrow-down-s-line" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="modern-dropdown">
              <el-dropdown-item command="new">
                <ArtSvgIcon icon="ri:add-line" class="dropdown-icon" />
                新建
              </el-dropdown-item>
              <el-dropdown-item command="open">
                <ArtSvgIcon icon="ri:folder-open-line" class="dropdown-icon" />
                打开
              </el-dropdown-item>
              <el-dropdown-item command="save">
                <ArtSvgIcon icon="ri:save-line" class="dropdown-icon" />
                保存
              </el-dropdown-item>
              <el-dropdown-item divided command="import">
                <ArtSvgIcon icon="ri:upload-line" class="dropdown-icon" />
                导入
              </el-dropdown-item>
              <el-dropdown-item command="export">
                <ArtSvgIcon icon="ri:download-line" class="dropdown-icon" />
                导出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleEditCommand">
          <span class="menu-item">
            编辑 <ArtSvgIcon icon="ri:arrow-down-s-line" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="modern-dropdown">
              <el-dropdown-item command="undo">
                <ArtSvgIcon icon="ri:arrow-go-back-line" class="dropdown-icon" />
                撤销
              </el-dropdown-item>
              <el-dropdown-item command="redo">
                <ArtSvgIcon icon="ri:arrow-go-forward-line" class="dropdown-icon" />
                重做
              </el-dropdown-item>
              <el-dropdown-item divided command="cut">
                <ArtSvgIcon icon="ri:scissors-cut-line" class="dropdown-icon" />
                剪切
              </el-dropdown-item>
              <el-dropdown-item command="copy">
                <ArtSvgIcon icon="ri:file-copy-line" class="dropdown-icon" />
                复制
              </el-dropdown-item>
              <el-dropdown-item command="paste">
                <ArtSvgIcon icon="ri:clipboard-line" class="dropdown-icon" />
                粘贴
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleViewCommand">
          <span class="menu-item">
            视图 <ArtSvgIcon icon="ri:arrow-down-s-line" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="modern-dropdown">
              <el-dropdown-item command="zoom-in">
                <ArtSvgIcon icon="ri:zoom-in-line" class="dropdown-icon" />
                放大
              </el-dropdown-item>
              <el-dropdown-item command="zoom-out">
                <ArtSvgIcon icon="ri:zoom-out-line" class="dropdown-icon" />
                缩小
              </el-dropdown-item>
              <el-dropdown-item command="reset-zoom">
                <ArtSvgIcon icon="ri:fullscreen-line" class="dropdown-icon" />
                重置缩放
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="handleInsertCommand">
          <span class="menu-item">
            插入 <ArtSvgIcon icon="ri:arrow-down-s-line" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="modern-dropdown">
              <el-dropdown-item command="row-above">
                <ArtSvgIcon icon="ri:insert-row-top" class="dropdown-icon" />
                上方插入行
              </el-dropdown-item>
              <el-dropdown-item command="row-below">
                <ArtSvgIcon icon="ri:insert-row-bottom" class="dropdown-icon" />
                下方插入行
              </el-dropdown-item>
              <el-dropdown-item command="col-left">
                <ArtSvgIcon icon="ri:insert-column-left" class="dropdown-icon" />
                左侧插入列
              </el-dropdown-item>
              <el-dropdown-item command="col-right">
                <ArtSvgIcon icon="ri:insert-column-right" class="dropdown-icon" />
                右侧插入列
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 格式工具栏 -->
      <div class="format-toolbar flex items-center gap-2 p-2.5 flex-wrap bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
        <!-- 撤销/重做 -->
        <div class="toolbar-group flex items-center gap-1.5 pr-3 border-r border-gray-200">
          <el-tooltip content="撤销" placement="bottom">
            <el-button circle size="small" @click="handleUndo" class="toolbar-btn">
              <ArtSvgIcon icon="ri:arrow-go-back-line" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="重做" placement="bottom">
            <el-button circle size="small" @click="handleRedo" class="toolbar-btn">
              <ArtSvgIcon icon="ri:arrow-go-forward-line" />
            </el-button>
          </el-tooltip>
        </div>

        <!-- 字体选择 -->
        <div class="toolbar-group flex items-center gap-2 pr-3 border-r border-gray-200">
          <el-select
            v-model="currentFont.fontFamily"
            size="small"
            style="width: 160px"
            @change="applyFontStyle"
            class="font-selector"
          >
            <el-option label="宋体" value="SimSun, serif" />
            <el-option label="黑体" value="SimHei, sans-serif" />
            <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
            <el-option label="楷体" value="KaiTi, serif" />
            <el-option label="仿宋" value="FangSong, serif" />
            <el-option label="Arial" value="Arial, sans-serif" />
            <el-option label="Times New Roman" value="Times New Roman, serif" />
            <el-option label="Courier New" value="Courier New, monospace" />
          </el-select>
        </div>

        <!-- 字号选择 -->
        <div class="toolbar-group flex items-center gap-2 pr-3 border-r border-gray-200">
          <el-select
            v-model="currentFont.fontSize"
            size="small"
            style="width: 85px"
            @change="applyFontStyle"
          >
            <el-option v-for="size in fontSizeList" :key="size" :label="`${size}px`" :value="size" />
          </el-select>
        </div>

        <!-- 字体样式 -->
        <div class="toolbar-group flex items-center gap-1.5 pr-3 border-r border-gray-200">
          <el-tooltip content="粗体" placement="bottom">
            <el-button
              size="small"
              :type="currentFont.bold ? 'primary' : 'info'"
              @click="toggleBold"
              class="toolbar-btn"
            >
              <ArtSvgIcon icon="ri:bold" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="斜体" placement="bottom">
            <el-button
              size="small"
              :type="currentFont.italic ? 'primary' : 'info'"
              @click="toggleItalic"
              class="toolbar-btn"
            >
              <ArtSvgIcon icon="ri:italic" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="下划线" placement="bottom">
            <el-button
              size="small"
              :type="currentFont.underline ? 'primary' : 'info'"
              @click="toggleUnderline"
              class="toolbar-btn"
            >
              <ArtSvgIcon icon="ri:underline" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除线" placement="bottom">
            <el-button
              size="small"
              :type="currentFont.strikethrough ? 'primary' : 'info'"
              @click="toggleStrikethrough"
              class="toolbar-btn"
            >
              <ArtSvgIcon icon="ri:strikethrough" />
            </el-button>
          </el-tooltip>
        </div>

        <!-- 颜色设置 -->
        <div class="toolbar-group flex items-center gap-2 pr-3 border-r border-gray-200">
          <el-tooltip content="字体颜色" placement="bottom">
            <div class="color-picker-wrapper">
              <el-color-picker
                v-model="currentFont.color"
                size="small"
                show-alpha
                @change="applyFontColor"
              />
            </div>
          </el-tooltip>
          <el-tooltip content="填充颜色" placement="bottom">
            <div class="color-picker-wrapper">
              <el-color-picker
                v-model="currentFont.backgroundColor"
                size="small"
                show-alpha
                @change="applyBackgroundColor"
              >
                <template #label>
                  <ArtSvgIcon icon="ri:highlighter-line" />
                </template>
              </el-color-picker>
            </div>
          </el-tooltip>
        </div>

        <!-- 对齐方式 -->
        <div class="toolbar-group flex items-center gap-1 pr-3 border-r border-gray-200">
          <el-radio-group v-model="currentFont.align" size="small" @change="applyAlign">
            <el-tooltip content="左对齐" placement="bottom">
              <el-radio-button label="left" value="left">
                <ArtSvgIcon icon="ri:align-left" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="居中对齐" placement="bottom">
              <el-radio-button label="center" value="center">
                <ArtSvgIcon icon="ri:align-center" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="右对齐" placement="bottom">
              <el-radio-button label="right" value="right">
                <ArtSvgIcon icon="ri:align-right" />
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </div>

        <!-- 垂直对齐 -->
        <div class="toolbar-group flex items-center gap-1 pr-3 border-r border-gray-200">
          <el-radio-group v-model="currentFont.verticalAlign" size="small" @change="applyVerticalAlign">
            <el-tooltip content="顶部对齐" placement="bottom">
              <el-radio-button label="top" value="top">
                <ArtSvgIcon icon="ri:align-top" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="垂直居中" placement="bottom">
              <el-radio-button label="middle" value="middle">
                <ArtSvgIcon icon="ri:align-vertically" />
              </el-radio-button>
            </el-tooltip>
            <el-tooltip content="底部对齐" placement="bottom">
              <el-radio-button label="bottom" value="bottom">
                <ArtSvgIcon icon="ri:align-bottom" />
              </el-radio-button>
            </el-tooltip>
          </el-radio-group>
        </div>

        <!-- 文本换行 -->
        <div class="toolbar-group pr-3 border-r border-gray-200">
          <el-tooltip content="自动换行" placement="bottom">
            <el-button
              size="small"
              :type="currentFont.wrapText ? 'primary' : 'info'"
              @click="toggleWrapText"
              class="toolbar-btn"
            >
              <ArtSvgIcon icon="ri:text-wrap" />
            </el-button>
          </el-tooltip>
        </div>

        <!-- 单元格操作 -->
        <div class="toolbar-group flex items-center gap-1.5 pr-3 border-r border-gray-200">
          <el-tooltip content="合并单元格" placement="bottom">
            <el-button size="small" @click="handleMergeCells" class="toolbar-btn">
              <ArtSvgIcon icon="ri:merge-cells-horizontal" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="拆分单元格" placement="bottom">
            <el-button size="small" @click="handleSplitCells" class="toolbar-btn">
              <ArtSvgIcon icon="ri:split-cells-horizontal" />
            </el-button>
          </el-tooltip>
        </div>

        <!-- 边框设置 -->
        <div class="toolbar-group pr-3 border-r border-gray-200">
          <el-dropdown trigger="click">
            <el-button size="small" class="toolbar-btn">
              <ArtSvgIcon icon="ri:border-all" />
              <span class="ml-1">边框</span>
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="modern-dropdown">
                <el-dropdown-item @click="setBorder('all')">
                  <ArtSvgIcon icon="ri:border-outer" class="dropdown-icon" />
                  所有边框
                </el-dropdown-item>
                <el-dropdown-item @click="setBorder('outside')">
                  <ArtSvgIcon icon="ri:border-radius" class="dropdown-icon" />
                  外侧边框
                </el-dropdown-item>
                <el-dropdown-item @click="setBorder('inside')">
                  <ArtSvgIcon icon="ri:border-inner" class="dropdown-icon" />
                  内侧边框
                </el-dropdown-item>
                <el-dropdown-item divided @click="setBorder('top')">
                  <ArtSvgIcon icon="ri:arrow-up-line" class="dropdown-icon" />
                  上边框
                </el-dropdown-item>
                <el-dropdown-item @click="setBorder('bottom')">
                  <ArtSvgIcon icon="ri:arrow-down-line" class="dropdown-icon" />
                  下边框
                </el-dropdown-item>
                <el-dropdown-item @click="setBorder('left')">
                  <ArtSvgIcon icon="ri:arrow-left-line" class="dropdown-icon" />
                  左边框
                </el-dropdown-item>
                <el-dropdown-item @click="setBorder('right')">
                  <ArtSvgIcon icon="ri:arrow-right-line" class="dropdown-icon" />
                  右边框
                </el-dropdown-item>
                <el-dropdown-item divided @click="setBorder('none')">
                  <ArtSvgIcon icon="ri:close-circle-line" class="dropdown-icon" />
                  无边框
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 行列操作 -->
        <div class="toolbar-group flex items-center gap-1 pr-3 border-r border-gray-200">
          <el-tooltip content="上方插入行" placement="bottom">
            <el-button size="small" @click="insertRowAbove" class="toolbar-btn">
              <ArtSvgIcon icon="ri:insert-row-top" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="下方插入行" placement="bottom">
            <el-button size="small" @click="insertRowBelow" class="toolbar-btn">
              <ArtSvgIcon icon="ri:insert-row-bottom" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除行" placement="bottom">
            <el-button size="small" @click="deleteRow" class="toolbar-btn" type="danger">
              <ArtSvgIcon icon="ri:delete-row" />
            </el-button>
          </el-tooltip>
          <el-divider direction="vertical" class="mx-1" />
          <el-tooltip content="左侧插入列" placement="bottom">
            <el-button size="small" @click="insertColumnLeft" class="toolbar-btn">
              <ArtSvgIcon icon="ri:insert-column-left" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="右侧插入列" placement="bottom">
            <el-button size="small" @click="insertColumnRight" class="toolbar-btn">
              <ArtSvgIcon icon="ri:insert-column-right" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除列" placement="bottom">
            <el-button size="small" @click="deleteColumn" class="toolbar-btn" type="danger">
              <ArtSvgIcon icon="ri:delete-column" />
            </el-button>
          </el-tooltip>
        </div>

        <!-- 冻结窗格 -->
        <div class="toolbar-group">
          <el-dropdown trigger="click">
            <el-button size="small" class="toolbar-btn">
              <ArtSvgIcon icon="ri:freeze-line" />
              <span class="ml-1">冻结</span>
              <ArtSvgIcon icon="ri:arrow-down-s-line" class="ml-0.5" />
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="modern-dropdown">
                <el-dropdown-item @click="freezeTopRow">
                  <ArtSvgIcon icon="ri:arrow-down-double-line" class="dropdown-icon" />
                  首行
                </el-dropdown-item>
                <el-dropdown-item @click="freezeFirstColumn">
                  <ArtSvgIcon icon="ri:arrow-right-double-line" class="dropdown-icon" />
                  首列
                </el-dropdown-item>
                <el-dropdown-item divided @click="unfreeze">
                  <ArtSvgIcon icon="ri:unpin-line" class="dropdown-icon" />
                  取消冻结
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 新增：表格操作区域 -->
        <div class="toolbar-group flex items-center gap-2 ml-auto">
          <el-tooltip content="提取表格结构" placement="bottom">
            <el-button size="small" type="info" @click="handleExtractSchema" :loading="loading">
              <ArtSvgIcon icon="ri:table-line" />
              提取结构
            </el-button>
          </el-tooltip>
          <el-tooltip content="提取表格数据" placement="bottom">
            <el-button size="small" type="info" @click="handleExtractData" :loading="loading">
              <ArtSvgIcon icon="ri:database-2-line" />
              提取数据
            </el-button>
          </el-tooltip>
          <el-tooltip content="生成完整表格" placement="bottom">
            <el-button size="small" type="primary" @click="handleGenerateTable" :loading="loading">
              <ArtSvgIcon icon="ri:refresh-line" />
              生成表格
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 公式栏 -->
      <div class="formula-bar flex items-center gap-2 p-2.5 border-t border-gray-200 bg-white">
        <div class="cell-address-label text-gray-500 font-medium text-sm">单元格:</div>
        <div class="cell-address w-28 text-center text-sm font-semibold border border-gray-300 rounded-md px-2.5 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
          {{ selectedCellAddress }}
        </div>
        <div class="function-symbol text-indigo-500 font-bold text-lg italic mx-1">ƒx</div>
        <el-input
          v-model="currentCellValue"
          size="small"
          placeholder="输入内容或公式..."
          clearable
          @keyup.enter="updateCellValue"
          class="flex-1"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:function-add-line" class="text-gray-400" />
          </template>
        </el-input>
      </div>
    </div>

    <!-- 表格主体区域 -->
    <div class="spreadsheet-container bg-gradient-to-br from-gray-50 to-white">
      <el-table
        ref="spreadsheetRef"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        height="calc(100vh - 290px)"
        :header-cell-style="{ background: 'linear-gradient(to bottom, #f8fafc, #e2e8f0)', fontWeight: '600', color: '#475569' }"
        :cell-style="{ transition: 'all 0.2s' }"
        @cell-click="handleCellClick"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        v-loading="loading"
      >
        <el-table-column type="selection" width="45" align="center" />

        <!-- 行号列 -->
        <el-table-column label="#" width="60" align="center" fixed>
          <template #default="{ $index }">
            <div class="row-number">
              {{ $index + 1 }}
            </div>
          </template>
        </el-table-column>

        <!-- 动态数据列 -->
        <el-table-column
          v-for="(column, colIndex) in tableColumns"
          :key="column.id"
          :prop="column.field"
          :label="column.title"
          :min-width="column.width || 130"
          :header-align="currentFont.align"
          show-overflow-tooltip
        >
          <template #header>
            <div class="column-header">
              <span class="column-title">{{ column.title }}</span>
              <el-dropdown trigger="click" @command="(cmd) => handleColumnCommand(cmd, column)">
                <el-button link type="primary" size="small" class="column-action">
                  <ArtSvgIcon icon="ri:more-fill" />
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu class="modern-dropdown">
                    <el-dropdown-item :command="{ cmd: 'rename', column }">
                      <ArtSvgIcon icon="ri:pencil-line" class="dropdown-icon" />
                      重命名
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ cmd: 'resize', column }">
                      <ArtSvgIcon icon="ri:arrows-angle-expand-line" class="dropdown-icon" />
                      调整宽度
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ cmd: 'hide', column }">
                      <ArtSvgIcon icon="ri:eye-close-line" class="dropdown-icon" />
                      隐藏
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ cmd: 'sort-asc', column }">
                      <ArtSvgIcon icon="ri:arrow-up-down-line" class="dropdown-icon" />
                      升序
                    </el-dropdown-item>
                    <el-dropdown-item :command="{ cmd: 'sort-desc', column }">
                      <ArtSvgIcon icon="ri:arrow-down-up-line" class="dropdown-icon" />
                      降序
                    </el-dropdown-item>
                    <el-dropdown-item divided :command="{ cmd: 'delete', column }">
                      <ArtSvgIcon icon="ri:delete-bin-line" class="dropdown-icon" />
                      删除列
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <template #default="{ row, column: col }">
            <div
              class="cell-editor"
              :class="{
                'is-editing': isCellEditing(row, col.property),
                'is-selected': isSelectedCell(row, col)
              }"
              :style="getCellStyle(row, col.property)"
              @dblclick="startCellEditing(row, col)"
              @click="selectCell(row, col)"
            >
              <el-input
                v-if="isCellEditing(row, col.property)"
                ref="cellInputRef"
                v-model="row[col.property]"
                size="small"
                :autosize="{ minRows: 1, maxRows: 5 }"
                type="textarea"
                @blur="stopCellEditing(row, col.property)"
                @keyup.enter="stopCellEditing(row, col.property)"
                @keydown.stop
                class="cell-textarea"
              />
              <span v-else class="cell-content">
                {{ formatCellValue(row[col.property], column.format) }}
              </span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="danger"
              size="small"
              @click="deleteRowData(row)"
              class="hover:scale-110 transition-transform"
            >
              <ArtSvgIcon icon="ri:delete-bin-line" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部状态栏 -->
    <div class="status-bar flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 border-t border-gray-300 shadow-inner">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:file-list-3-line" class="text-indigo-500" />
          <span class="text-sm text-gray-700">工作表：<strong class="text-indigo-600">{{ currentSheetName }}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <ArtSvgIcon icon="ri:crosshair-line" class="text-green-500" />
          <span class="text-sm text-gray-700">位置：<span class="font-mono font-bold text-gray-800">{{ selectedCellAddress }}</span></span>
        </div>
        <el-tag v-if="selectedCount > 0" size="small" type="info" effect="plain">
          已选择 {{ selectedCount }} 个单元格
        </el-tag>
      </div>
      <div class="flex items-center gap-3">
        <el-button size="small" @click="addNewSheet" class="btn-gradient">
          <ArtSvgIcon icon="ri:add-line" />
          添加工作表
        </el-button>
        <el-divider direction="vertical" />
        <el-button size="small" @click="calculateSum" class="btn-gradient">
          <ArtSvgIcon icon="ri:calculator-line" />
          求和：<span class="font-mono font-bold">{{ sumValue }}</span>
        </el-button>
        <el-button size="small" @click="calculateAverage" class="btn-gradient">
          <ArtSvgIcon icon="ri:percent-line" />
          平均：<span class="font-mono font-bold">{{ avgValue }}</span>
        </el-button>
      </div>
    </div>

    <!-- 对话框：重命名列 -->
    <el-dialog v-model="renameDialogVisible" title="重命名列" width="450px" class="modern-dialog">
      <div class="dialog-content">
        <el-input
          v-model="editingColumnTitle"
          placeholder="请输入新的列名"
          size="large"
          prefix-icon="ri:pencil-line"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="renameDialogVisible = false" class="btn-cancel">取消</el-button>
          <el-button type="primary" @click="confirmRenameColumn" class="btn-confirm">
            <ArtSvgIcon icon="ri:check-line" class="mr-1" />
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 对话框：调整列宽 -->
    <el-dialog v-model="resizeDialogVisible" title="调整列宽" width="500px" class="modern-dialog">
      <div class="dialog-content">
        <div class="slider-wrapper">
          <el-slider
            v-model="editingColumnWidth"
            :min="50"
            :max="500"
            :step="5"
            show-input
            input-size="small"
          />
        </div>
        <div class="preview-text">
          当前宽度：<strong>{{ editingColumnWidth }}px</strong>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resizeDialogVisible = false" class="btn-cancel">取消</el-button>
          <el-button type="primary" @click="confirmResizeColumn" class="btn-confirm">
            <ArtSvgIcon icon="ri:check-line" class="mr-1" />
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  // 导入后端 API
  import { getTableData, extractTableSchema, extractTableData, generateTable } from '@/api/table'

  defineOptions({ name: 'OnlineDocument' })

  // ==================== 接收文档ID ====================
  const props = defineProps<{
    docId: number  // 文档ID，由父组件传入或路由参数提供
  }>()

  // ==================== 状态定义 ====================

  // 当前选中的单元格
  const selectedCell = ref<any>(null)
  const selectedCellAddress = computed(() => {
    if (!selectedCell.value) return ''
    const col = String.fromCharCode(65 + selectedCell.value.colIndex)
    const row = selectedCell.value.rowIndex + 1
    return `${col}${row}`
  })

  const selectedCount = ref(0)
  const currentCellValue = ref('')

  // 文档信息
  const documentTitle = ref('未命名表格')
  const lastSavedTime = ref('刚刚')

  // 加载状态
  const loading = ref(false)

  // 当前字体样式
  const currentFont = reactive({
    fontFamily: 'Microsoft YaHei, sans-serif',
    fontSize: 14,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    color: '#000000',
    backgroundColor: '#ffffff',
    align: 'left' as 'left' | 'center' | 'right',
    verticalAlign: 'middle' as 'top' | 'middle' | 'bottom',
    wrapText: false
  })

  // 字号列表
  const fontSizeList = [10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

  // 表格数据
  const tableColumns = ref<any[]>([])
  const tableData = ref<any[]>([])

  // 工作表
  const currentSheetName = ref('Sheet1')
  const sheets = ref([{ name: 'Sheet1', data: [] }])

  // 对话框
  const renameDialogVisible = ref(false)
  const resizeDialogVisible = ref(false)
  const editingColumn = ref<any>(null)
  const editingColumnTitle = ref('')
  const editingColumnWidth = ref(120)

  // 计算属性（示例）
  const sumValue = computed(() => '0')
  const avgValue = computed(() => '0')

  // ==================== 工具函数 ====================

  /**
   * 将后端返回的表格数据转换为组件内部格式
   * @param backendData 后端返回的数据，期望格式 { headers: string[], rows: any[][] }
   * @returns { columns, rows }
   */
  const convertBackendDataToTable = (backendData: any) => {
    const headers = backendData?.headers || []
    const rows = backendData?.rows || []

    // 生成列定义
    const columns = headers.map((title: string, idx: number) => ({
      id: idx + 1,
      title,
      field: `col_${idx}`,
      width: 120,
      format: 'text'
    }))

    // 生成行数据
    const dataRows = rows.map((row: any[], rowIdx: number) => {
      const obj: any = { id: rowIdx + 1, cellStyles: {} }
      headers.forEach((_: string, colIdx: number) => {
        obj[`col_${colIdx}`] = row[colIdx] !== undefined ? row[colIdx] : ''
      })
      return obj
    })

    return { columns, rows: dataRows }
  }

  /**
   * 加载文档表格数据
   */
  const loadTableData = async () => {
    if (!props.docId) {
      ElMessage.warning('文档ID无效')
      return
    }
    loading.value = true
    try {
      const res = await getTableData(props.docId)
      // 假设后端返回的数据结构符合 { headers: string[], rows: any[][] }
      if (res && (res.headers || res.rows)) {
        const { columns, rows } = convertBackendDataToTable(res)
        tableColumns.value = columns
        tableData.value = rows
        ElMessage.success('表格数据加载成功')
      } else {
        // 无数据时保持空表格
        ElMessage.info('该文档暂无表格数据，可点击“生成表格”')
      }
    } catch (error) {
      console.error('加载表格数据失败', error)
      ElMessage.error('加载表格数据失败，请检查网络或稍后重试')
    } finally {
      loading.value = false
    }
  }

  /**
   * 提取表格结构
   */
  const handleExtractSchema = async () => {
    if (!props.docId) {
      ElMessage.warning('文档ID无效')
      return
    }
    loading.value = true
    try {
      const res = await extractTableSchema(props.docId)
      // 假设返回的结构为 { schema: [...] }，这里简单提示
      ElMessage.success('表格结构提取成功')
      console.log('Schema:', res)
      // 可根据返回更新表格列定义，示例中暂不自动应用
    } catch (error) {
      console.error('提取表格结构失败', error)
      ElMessage.error('提取表格结构失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 提取表格数据（仅数据）
   */
  const handleExtractData = async () => {
    if (!props.docId) {
      ElMessage.warning('文档ID无效')
      return
    }
    loading.value = true
    try {
      const res = await extractTableData(props.docId)
      // 假设返回 { headers: string[], rows: any[][] }
      if (res && (res.headers || res.rows)) {
        const { columns, rows } = convertBackendDataToTable(res)
        tableColumns.value = columns
        tableData.value = rows
        ElMessage.success('表格数据提取成功')
      } else {
        ElMessage.warning('提取的数据格式无效')
      }
    } catch (error) {
      console.error('提取表格数据失败', error)
      ElMessage.error('提取表格数据失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 生成完整表格（结构+数据）
   */
  const handleGenerateTable = async () => {
    if (!props.docId) {
      ElMessage.warning('文档ID无效')
      return
    }
    loading.value = true
    try {
      const res = await generateTable(props.docId)
      // 假设返回 { headers: string[], rows: any[][] }
      if (res && (res.headers || res.rows)) {
        const { columns, rows } = convertBackendDataToTable(res)
        tableColumns.value = columns
        tableData.value = rows
        ElMessage.success('表格生成成功')
      } else {
        ElMessage.warning('生成的数据格式无效')
      }
    } catch (error) {
      console.error('生成表格失败', error)
      ElMessage.error('生成表格失败')
    } finally {
      loading.value = false
    }
  }

  // ==================== 样式/单元格操作函数 ====================

  // 格式化单元格值
  const formatCellValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return ''
    switch (format) {
      case 'number':
        return Number(value).toLocaleString()
      case 'currency':
        return `¥${Number(value).toLocaleString()}`
      case 'percent':
        return `${value}%`
      default:
        return String(value)
    }
  }

  // 获取单元格样式
  const getCellStyle = (row: any, property: string) => {
    const cellStyle = row.cellStyles?.[property] || {}
    return {
      fontFamily: cellStyle.fontFamily || currentFont.fontFamily,
      fontSize: `${cellStyle.fontSize || currentFont.fontSize}px`,
      fontWeight: cellStyle.bold ? 'bold' : 'normal',
      fontStyle: cellStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        cellStyle.underline ? 'underline' : '',
        cellStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' '),
      color: cellStyle.color || currentFont.color,
      backgroundColor: cellStyle.backgroundColor || currentFont.backgroundColor,
      textAlign: cellStyle.align || currentFont.align,
      verticalAlign: cellStyle.verticalAlign || currentFont.verticalAlign,
      whiteSpace: cellStyle.wrapText ? 'normal' : 'nowrap',
      cursor: 'pointer'
    }
  }

  // 检查单元格是否在编辑
  const isCellEditing = (row: any, property: string) => {
    return row.editing === property
  }

  // 判断是否为选中单元格
  const isSelectedCell = (row: any, column: any) => {
    return selectedCell.value?.row === row && selectedCell.value?.column === column
  }

  // ==================== 事件处理 ====================

  // 选择单元格
  const selectCell = (row: any, column: any) => {
    selectedCell.value = {
      row,
      column,
      rowIndex: tableData.value.indexOf(row),
      colIndex: tableColumns.value.findIndex(c => c.field === column.property)
    }
    currentCellValue.value = row[column.property] || ''
  }

  // 处理单元格点击
  const handleCellClick = (row: any, column: any) => {
    selectCell(row, column)
  }

  // 处理行点击
  const handleRowClick = (row: any) => {
    // 可以添加选中整行的逻辑
  }

  // 开始编辑单元格
  const startCellEditing = (row: any, column: any) => {
    row.editing = column.property
    nextTick(() => {
      // 聚焦输入框
    })
  }

  // 停止编辑单元格
  const stopCellEditing = (row: any, property: string) => {
    if (row.editing === property) {
      row.editing = undefined
    }
  }

  // 更新单元格值
  const updateCellValue = () => {
    if (selectedCell.value) {
      const { row, column } = selectedCell.value
      row[column.property] = currentCellValue.value
    }
  }

  // 应用字体样式
  const applyFontStyle = () => {
    if (selectedCell.value) {
      const { row, column } = selectedCell.value
      if (!row.cellStyles) row.cellStyles = {}
      row.cellStyles[column.property] = {
        ...row.cellStyles[column.property],
        fontFamily: currentFont.fontFamily,
        fontSize: currentFont.fontSize
      }
      ElMessage.success('字体样式已应用')
    } else {
      ElMessage.warning('请先选择单元格')
    }
  }

  // 切换粗体
  const toggleBold = () => {
    currentFont.bold = !currentFont.bold
    applyCellStyle('bold', currentFont.bold)
  }

  // 切换斜体
  const toggleItalic = () => {
    currentFont.italic = !currentFont.italic
    applyCellStyle('italic', currentFont.italic)
  }

  // 切换下划线
  const toggleUnderline = () => {
    currentFont.underline = !currentFont.underline
    applyCellStyle('underline', currentFont.underline)
  }

  // 切换删除线
  const toggleStrikethrough = () => {
    currentFont.strikethrough = !currentFont.strikethrough
    applyCellStyle('strikethrough', currentFont.strikethrough)
  }

  // 应用单元格样式
  const applyCellStyle = (property: string, value: any) => {
    if (selectedCell.value) {
      const { row, column } = selectedCell.value
      if (!row.cellStyles) row.cellStyles = {}
      row.cellStyles[column.property] = {
        ...row.cellStyles[column.property],
        [property]: value
      }
    }
  }

  // 应用字体颜色
  const applyFontColor = (color: string) => {
    currentFont.color = color
    applyCellStyle('color', color)
  }

  // 应用背景颜色
  const applyBackgroundColor = (color: string) => {
    currentFont.backgroundColor = color
    applyCellStyle('backgroundColor', color)
  }

  // 应用对齐方式
  const applyAlign = (align: 'left' | 'center' | 'right') => {
    currentFont.align = align
    applyCellStyle('align', align)
  }

  // 应用垂直对齐
  const applyVerticalAlign = (verticalAlign: 'top' | 'middle' | 'bottom') => {
    currentFont.verticalAlign = verticalAlign
    applyCellStyle('verticalAlign', verticalAlign)
  }

  // 切换文本换行
  const toggleWrapText = () => {
    currentFont.wrapText = !currentFont.wrapText
    applyCellStyle('wrapText', currentFont.wrapText)
  }

  // ==================== 菜单命令处理 ====================

  // 菜单命令
  const handleMenuCommand = (command: string) => {
    switch (command) {
      case 'new':
        createNewDocument()
        break
      case 'save':
        saveDocument()
        break
      case 'import':
        importDocument()
        break
      case 'export':
        exportDocument()
        break
    }
  }

  // 编辑命令
  const handleEditCommand = (command: string) => {
    switch (command) {
      case 'undo':
        handleUndo()
        break
      case 'redo':
        handleRedo()
        break
    }
  }

  // 视图命令
  const handleViewCommand = (command: string) => {
    ElMessage.info(`${command} 功能开发中`)
  }

  // 插入命令
  const handleInsertCommand = (command: string) => {
    switch (command) {
      case 'row-above':
        insertRowAbove()
        break
      case 'row-below':
        insertRowBelow()
        break
      case 'col-left':
        insertColumnLeft()
        break
      case 'col-right':
        insertColumnRight()
        break
    }
  }

  // 撤销
  const handleUndo = () => {
    ElMessage.info('撤销功能开发中')
  }

  // 重做
  const handleRedo = () => {
    ElMessage.info('重做功能开发中')
  }

  // 合并单元格
  const handleMergeCells = () => {
    ElMessage.info('合并单元格功能开发中')
  }

  // 拆分单元格
  const handleSplitCells = () => {
    ElMessage.info('拆分单元格功能开发中')
  }

  // 设置边框
  const setBorder = (type: string) => {
    ElMessage.success(`已应用 ${type} 边框`)
  }

  // ==================== 行列操作 ====================

  // 插入行（上方）
  const insertRowAbove = () => {
    if (!selectedCell.value) {
      ElMessage.warning('请先选择一行')
      return
    }
    const newRow = { id: Date.now(), cellStyles: {} }
    // 为每一列添加默认空值
    tableColumns.value.forEach(col => {
      newRow[col.field] = ''
    })
    const index = tableData.value.indexOf(selectedCell.value.row)
    tableData.value.splice(index, 0, newRow)
    ElMessage.success('插入行成功')
  }

  // 插入行（下方）
  const insertRowBelow = () => {
    if (!selectedCell.value) {
      ElMessage.warning('请先选择一行')
      return
    }
    const newRow = { id: Date.now(), cellStyles: {} }
    tableColumns.value.forEach(col => {
      newRow[col.field] = ''
    })
    const index = tableData.value.indexOf(selectedCell.value.row) + 1
    tableData.value.splice(index, 0, newRow)
    ElMessage.success('插入行成功')
  }

  // 删除行
  const deleteRow = () => {
    if (!selectedCell.value) {
      ElMessage.warning('请先选择一行')
      return
    }
    ElMessageBox.confirm('确定要删除该行吗？', '提示', {
      type: 'warning'
    }).then(() => {
      const index = tableData.value.indexOf(selectedCell.value.row)
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
  }

  // 插入列（左侧）
  const insertColumnLeft = () => {
    ElMessage.info('插入列功能开发中')
  }

  // 插入列（右侧）
  const insertColumnRight = () => {
    ElMessage.info('插入列功能开发中')
  }

  // 删除列
  const deleteColumn = () => {
    ElMessage.info('删除列功能开发中')
  }

  // 冻结窗格
  const freezeTopRow = () => {
    ElMessage.success('已冻结首行')
  }

  const freezeFirstColumn = () => {
    ElMessage.success('已冻结首列')
  }

  const unfreeze = () => {
    ElMessage.success('已取消冻结')
  }

  // ==================== 列操作 ====================

  // 列操作命令
  const handleColumnCommand = (data: any) => {
    const { cmd, column } = data
    switch (cmd) {
      case 'rename':
        editingColumn.value = column
        editingColumnTitle.value = column.title
        renameDialogVisible.value = true
        break
      case 'resize':
        editingColumn.value = column
        editingColumnWidth.value = column.width || 120
        resizeDialogVisible.value = true
        break
      case 'delete':
        deleteColumnData(column)
        break
    }
  }

  // 确认重命名列
  const confirmRenameColumn = () => {
    if (editingColumn.value) {
      editingColumn.value.title = editingColumnTitle.value
      ElMessage.success('重命名成功')
      renameDialogVisible.value = false
    }
  }

  // 确认调整列宽
  const confirmResizeColumn = () => {
    if (editingColumn.value) {
      editingColumn.value.width = editingColumnWidth.value
      ElMessage.success('调整成功')
      resizeDialogVisible.value = false
    }
  }

  // 删除列数据
  const deleteColumnData = (column: any) => {
    ElMessageBox.confirm(`确定要删除列 "${column.title}" 吗？`, '警告', {
      type: 'warning'
    }).then(() => {
      const index = tableColumns.value.indexOf(column)
      tableColumns.value.splice(index, 1)
      // 同时删除所有行的对应字段
      tableData.value.forEach(row => {
        delete row[column.field]
      })
      ElMessage.success('删除成功')
    })
  }

  // 删除行数据
  const deleteRowData = (row: any) => {
    const index = tableData.value.indexOf(row)
    tableData.value.splice(index, 1)
    ElMessage.success('删除成功')
  }

  // 选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedCount.value = selection.length
  }

  // ==================== 工作表操作 ====================

  // 添加新工作表
  const addNewSheet = () => {
    const newName = `Sheet${sheets.value.length + 1}`
    sheets.value.push({ name: newName, data: [] })
    currentSheetName.value = newName
    ElMessage.success(`已添加工作表：${newName}`)
  }

  // 计算求和
  const calculateSum = () => {
    ElMessage.info('求和功能开发中')
  }

  // 计算平均值
  const calculateAverage = () => {
    ElMessage.info('平均值功能开发中')
  }

  // ==================== 文档操作 ====================

  // 新建文档
  const createNewDocument = () => {
    ElMessageBox.confirm('确定要新建文档吗？未保存的内容将丢失。', '提示', {
      type: 'warning'
    }).then(() => {
      tableData.value = []
      tableColumns.value = []
      ElMessage.success('已新建文档')
    })
  }

  // 保存文档
  const saveDocument = () => {
    console.log('保存文档:', {
      name: currentSheetName.value,
      columns: tableColumns.value,
      data: tableData.value
    })
    ElMessage.success('保存成功')
  }

  // 导入文档
  const importDocument = () => {
    ElMessage.info('导入功能开发中')
  }

  // 导出文档
  const exportDocument = () => {
    ElMessage.info('导出功能开发中')
  }

  // ==================== 初始化 ====================
  onMounted(() => {
    if (props.docId) {
      loadTableData()
    } else {
      ElMessage.warning('未提供文档ID，无法加载表格数据')
    }
  })
</script>

<style scoped lang="scss">
  .online-document {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 3px;

    .toolbar-container {
      flex-shrink: 0;
      user-select: none;
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .document-header {
      background: linear-gradient(to right, #eff6ff, #fef2fe);

      .logo-icon {
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.1) rotate(5deg);
        }
      }
    }

    .menu-bar {
      font-size: 13px;

      .menu-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
        }
      }

      .el-dropdown {
        line-height: 1;
      }
    }

    .format-toolbar {
      background: linear-gradient(to bottom, #f9fafb, #ffffff);

      .toolbar-group {
        .toolbar-btn {
          padding: 6px 10px;
          border-radius: 6px;
          transition: all 0.2s;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        .el-select {
          font-size: 13px;
        }

        .color-picker-wrapper {
          display: inline-block;

          :deep(.el-color-picker__trigger) {
            width: 32px;
            height: 32px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            padding: 0;
            transition: all 0.2s;

            &:hover {
              border-color: var(--el-color-primary);
              box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2);
            }
          }
        }
      }

      :deep(.el-color-picker--small) {
        .el-color-picker__trigger {
          width: 26px;
          height: 26px;
        }
      }

      :deep(.el-radio-button__inner) {
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .formula-bar {
      background: linear-gradient(to bottom, #ffffff, #f9fafb);

      .cell-address-label {
        color: #6b7280;
      }

      .cell-address {
        font-family: 'Consolas', 'Monaco', monospace;
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .function-symbol {
        font-weight: bold;
        font-style: italic;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      :deep(.el-input__wrapper) {
        border-radius: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        &.is-focus {
          box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.2);
        }
      }
    }

    .spreadsheet-container {
      flex: 1;
      overflow: auto;
      background: linear-gradient(to bottom, #ffffff, #f9fafb);
      margin: 3px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      :deep(.el-table) {
        background: transparent;

        .row-number {
          font-weight: bold;
          color: #6b7280;
          background: linear-gradient(to right, #f3f4f6, #e5e7eb);
          padding: 8px 0;
          border-radius: 4px;
        }

        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;

          .column-title {
            font-weight: 600;
            color: #374151;
          }

          .column-action {
            opacity: 0;
            transition: opacity 0.2s;
          }

          &:hover .column-action {
            opacity: 1;
          }
        }

        .cell-editor {
          min-height: 36px;
          padding: 6px 10px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: all 0.2s;

          &.is-selected {
            box-shadow: 0 0 0 2px var(--el-color-primary);
            background: rgba(var(--el-color-primary-rgb), 0.05);
          }

          &.is-editing {
            padding: 0;

            .cell-textarea {
              :deep(.el-textarea__inner) {
                padding: 6px 10px;
                resize: none;
                border: 2px solid var(--el-color-primary);
                box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.2);
                border-radius: 4px;
              }
            }
          }

          &:hover:not(.is-editing) {
            background: rgba(var(--el-color-primary-rgb), 0.08);
            cursor: pointer;
          }

          .cell-content {
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding: 2px 0;
          }
        }

        .el-table__header th {
          background: linear-gradient(to bottom, #f8fafc, #e2e8f0);
          font-weight: 600;
          border-right: 1px solid #d1d5db;
          border-bottom: 1px solid #d1d5db;
        }

        .el-table__row {
          transition: all 0.2s;

          &:hover {
            background: linear-gradient(to right, #eff6ff, #fef2fe);
          }

          &.is-current {
            background: linear-gradient(to right, #dbeafe, #e0e7ff);
          }
        }

        :deep(.el-table__body tr:hover > td) {
          background: linear-gradient(to bottom, #f0f9ff, #e0f2fe);
        }
      }
    }

    .status-bar {
      flex-shrink: 0;
      font-size: 13px;
      color: #374151;
      background: linear-gradient(to right, #f3f4f6, #e5e7eb);
      margin: 0 3px 3px 3px;
      border-radius: 0 0 6px 6px;

      .btn-gradient {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
      }
    }

    // 下拉菜单美化
    :deep(.modern-dropdown) {
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(0, 0, 0, 0.08);
      padding: 8px;

      .el-dropdown-menu__item {
        border-radius: 6px;
        padding: 10px 16px;
        transition: all 0.2s;

        &:hover {
          background: linear-gradient(to right, #eff6ff, #fef2fe);
        }

        .dropdown-icon {
          margin-right: 8px;
          color: #6b7280;
        }
      }
    }

    // 对话框美化
    :deep(.modern-dialog) {
      .el-dialog__header {
        background: linear-gradient(to right, #667eea, #764ba2);
        color: white;
        padding: 20px 24px;
        border-radius: 12px 12px 0 0;

        .el-dialog__title {
          font-weight: 600;
          font-size: 18px;
        }
      }

      .dialog-content {
        padding: 24px;

        .slider-wrapper {
          margin: 20px 0;
        }

        .preview-text {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
      }

      .dialog-footer {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding: 16px 24px;
        background: #f9fafb;
        border-radius: 0 0 12px 12px;

        .btn-cancel,
        .btn-confirm {
          padding: 10px 24px;
          border-radius: 8px;
          transition: all 0.2s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
        }

        .btn-confirm {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
        }
      }
    }
  }

  // 滚动条美化
  :deep(.el-table__body-wrapper)::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  :deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  :deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #94a3b8, #64748b);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(135deg, #64748b, #475569);
    }
  }
</style>
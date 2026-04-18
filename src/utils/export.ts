// src/utils/export.ts
import * as XLSX from 'xlsx'

/**
 * 导出表格数据为 Excel 文件
 * @param columns 列名数组
 * @param rows 行数据数组，每行是一个对象，键为列名
 * @param fileName 文件名（不含扩展名）
 */
export function exportToExcel(
  columns: string[],
  rows: Record<string, any>[],
  fileName: string = 'table_data'
) {
  if (!columns.length || !rows.length) {
    console.warn('无数据可导出')
    return
  }
  // 构建二维数组：第一行为列头，后续为数据行
  const sheetData = [columns, ...rows.map((row) => columns.map((col) => row[col] ?? ''))]
  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

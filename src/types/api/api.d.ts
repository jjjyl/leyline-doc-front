/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用响应基础结构 */
  interface BaseResponse {
    code?: number
    msg?: string
    data?: any
  }
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      name: string
      password: string
    }

    interface RegisterParams {
      name: string
      password: string
      email: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    // /** 刷新token响应 */
    // interface RefreshTokenResponse {
    //   token: string
    //   refresh_token: string
    // }

    /** 用户信息 */
    interface UserInfo {
      email: string
      name: string
      user_id: number
      // 前端扩展字段
      buttons?: string[]
      roles?: string[]
      userId?: number
      userName?: string
      avatar?: string
    }
    /** 修改密码 */
    interface UpdatePasswordParams {
      newPassword: string
      oldPassword: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 文件库类型 */
  namespace DocLib {
    /** 文档库参数 */
    interface DocLibInfo {
      belongsUserId: number
      name: string
      libId: number
    }

    export interface DocLibsResponse {
      belongs_user_id: number
      lib_id: number
      name: string
    }

    /** 创建文档库响应 */
    interface CreateDocLibResponse {
      lib_id: number
    }

    /** 更新文档库请求 */
    interface UpdateDocLibRequest {
      lib_id: number
      name: string
    }
  }

  /** 文件类型 */
  namespace Doc {
    /** 文档参数 */
    interface DocInfo {
      id: number
      libId: number
      name: string
      parentId: number
      path: string
      status: string
      type: string
      uploaderId: number
      hasTable: boolean
    }

    /** 创建上传会话参数 */
    interface CreateUploadSessionRequest {
      file_name: string
      file_size: number
      lib_id: number
      parent_id: number
      type: string
    }

    /** 上传会话参数 */
    interface CreateUploadSessionResponse {
      doc_id: number
      upload_id: number
      upload_url: string
    }

    /** 验证完成上传参数 */
    interface FinishUploadRequest {
      docId: number
    }

    /** 完成上传返回 */
    interface FinishUploadResponse {
      docId: number
    }
  }
  /** 表格类型 */
  namespace Table {
    /** 表格基础类型 */
    interface TableInfo {
      colCount: number //列数
      comment: string //表格备注
      header: string[] //表头（列名）
      id: string //表格唯一标识
      name: string //表格名词
      rowCount: number //行数（不包括表头）
      rows: Row[] //数据行数组
    }

    /**数据行数组 */
    interface Row {
      id: string //行唯一标识，用于前端定位修改
      cells: string[] //单元格内容数组，每个元素代表一列的值
    }

    interface schema {
      comment: string
      fields: field[]
      name: string
      primaryKey: string
    }

    interface field {
      description: string
      name: string
      required: boolean
      type: fieldType
    }

    enum fieldType {
      string = 'string',
      int64 = 'int64',
      float64 = 'float64',
      bool = 'bool'
    }

    interface generateTableResponse {
      docId: number
      status: number
    }

    // 后端API响应类型
    interface ExtractTableSchemaResponse {
      doc_id: number
      schemas: TableSchema[]
    }

    interface ExtractTableDataResponse {
      doc_id: number
      tables: TableFormat[]
    }

    interface GenerateTableResponse {
      doc_id: number
      status: string
    }

    interface GetTablesResponse {
      doc_id: number
      tables: TableFormat[]
    }

    interface TableFormat {
      col_count: number
      comment: string
      headers: string[]
      name: string
      row_count: number
      rows: TableRow[]
    }

    interface TableRow {
      cells: string[]
    }

    interface TableSchema {
      comment: string
      fields: TableField[]
      name: string
      primary_key: string
    }

    interface TableField {
      description: string
      name: string
      required: boolean
      type: FiledType
    }

    enum FiledType {
      string = 'string',
      int64 = 'int64',
      float64 = 'float64',
      bool = 'bool'
    }
  }
  /**
   * 文件夹详情
   */
  namespace Folder {
    interface FolderInfo {
      createdAt: string
      id: number
      libId: number
      name: string
      parentId: number
      uploaderId: number
      updateAt: string
    }
    interface FolderCreateParams {
      lib_id: number
      name: string
      parent_id: number
    }
    // 在 Api.Folder 命名空间中添加
    export interface FolderNode extends FolderInfo {
      children?: (FolderNode | Doc.DocInfo)[]
      isFolder: boolean // 用于区分文件夹和文件
      originalType?: string // 保留原始类型
    }
  }
}

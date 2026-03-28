# 文档智能操作系统 API 接口设计

## 概述
本文档定义了文档智能操作系统前端与后端之间的API接口规范。

## 接口规范
- 基础URL: `/api`
- 认证方式: Bearer Token
- 数据格式: JSON
- 字符编码: UTF-8

## 1. 认证接口

### 1.1 用户登录
**接口**: `POST /api/auth/login`
**描述**: 用户登录获取访问令牌

**请求参数**:
```json
{
  "name": "string",      // 用户名
  "password": "string"   // 密码
}
```

**响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",           // 访问令牌
    "refreshToken": "string",    // 刷新令牌
    "user": {
      "id": "number",
      "username": "string",
      "nickname": "string",
      "roles": ["string"],
      "permissions": ["string"]
    }
  }
}
```

### 1.2 获取用户信息
**接口**: `GET /api/auth/user`
**描述**: 获取当前登录用户信息

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": "number",
    "username": "string",
    "nickname": "string",
    "avatar": "string",
    "email": "string",
    "phone": "string",
    "roles": ["string"],
    "permissions": ["string"]
  }
}
```

## 2. 文档管理接口

### 2.1 上传文档
**接口**: `POST /api/documents/upload`
**描述**: 上传文档文件
**Content-Type**: `multipart/form-data`

**请求参数**:
- file: File (文档文件)

**响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": "number",
    "name": "string",
    "size": "number",
    "type": "string",
    "url": "string"
  }
}
```

### 2.2 获取文档列表
**接口**: `GET /api/documents`
**描述**: 获取用户上传的文档列表

**查询参数**:
- page: number (页码，默认1)
- size: number (每页数量，默认10)
- type: string (文档类型过滤)

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "name": "string",
        "size": "number",
        "type": "string",
        "uploadTime": "string",
        "status": "string"
      }
    ],
    "total": "number",
    "page": "number",
    "size": "number"
  }
}
```

### 2.3 预览文档
**接口**: `GET /api/documents/{id}/preview`
**描述**: 预览文档内容

**响应**:
```json
{
  "code": 200,
  "data": {
    "content": "string",    // HTML格式的文档内容
    "type": "string"        // 文档类型
  }
}
```

### 2.4 删除文档
**接口**: `DELETE /api/documents/{id}`
**描述**: 删除指定文档

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

## 3. 信息提取接口

### 3.1 开始信息提取
**接口**: `POST /api/extraction/start`
**描述**: 开始对文档进行信息提取

**请求参数**:
```json
{
  "documentId": "number",     // 文档ID
  "types": ["string"],        // 提取类型: ["entity", "keyword", "amount", "date"]
  "customRule": "string"      // 自定义规则（可选）
}
```

**响应**:
```json
{
  "code": 200,
  "message": "提取任务已开始",
  "data": {
    "taskId": "string",
    "status": "processing"
  }
}
```

### 3.2 获取提取结果
**接口**: `GET /api/extraction/{taskId}/result`
**描述**: 获取信息提取结果

**响应**:
```json
{
  "code": 200,
  "data": {
    "taskId": "string",
    "status": "completed",    // processing, completed, failed
    "progress": "number",     // 进度百分比
    "results": {
      "entities": [
        {
          "type": "string",
          "value": "string",
          "confidence": "number",
          "positions": ["string"]
        }
      ],
      "keywords": ["string"],
      "amounts": ["string"],
      "dates": ["string"],
      "custom": ["string"]
    }
  }
}
```

### 3.3 获取提取历史
**接口**: `GET /api/extraction/history`
**描述**: 获取信息提取历史记录

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "documentName": "string",
        "types": ["string"],
        "status": "string",
        "createTime": "string",
        "resultCount": "number"
      }
    ],
    "total": "number"
  }
}
```

## 4. 智能操作接口

### 4.1 执行指令
**接口**: `POST /api/operation/execute`
**描述**: 执行自然语言指令

**请求参数**:
```json
{
  "instruction": "string",    // 自然语言指令
  "documentId": "number"      // 文档ID（可选）
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "result": "string",       // 执行结果
    "executionTime": "number", // 执行时间（毫秒）
    "status": "success"       // success, failed
  }
}
```

### 4.2 获取操作历史
**接口**: `GET /api/operation/history`
**描述**: 获取操作历史记录

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "instruction": "string",
        "result": "string",
        "executionTime": "number",
        "createTime": "string"
      }
    ],
    "total": "number"
  }
}
```

## 5. 表格管理接口

### 5.1 上传表格模板
**接口**: `POST /api/templates/upload`
**描述**: 上传表格模板
**Content-Type**: `multipart/form-data`

**请求参数**:
- file: File (模板文件)
- name: string (模板名称)
- description: string (描述)

**响应**:
```json
{
  "code": 200,
  "data": {
    "id": "number",
    "name": "string",
    "type": "string",
    "url": "string"
  }
}
```

### 5.2 获取模板列表
**接口**: `GET /api/templates`
**描述**: 获取表格模板列表

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "name": "string",
        "type": "string",
        "createTime": "string"
      }
    ],
    "total": "number"
  }
}
```

### 5.3 开始数据填写
**接口**: `POST /api/filling/start`
**描述**: 开始表格数据自动填写

**请求参数**:
```json
{
  "templateId": "number",     // 模板ID
  "dataSourceId": "number"    // 数据源ID
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "taskId": "string",
    "status": "processing"
  }
}
```

### 5.4 获取填写结果
**接口**: `GET /api/filling/{taskId}/result`
**描述**: 获取数据填写结果

**响应**:
```json
{
  "code": 200,
  "data": {
    "status": "completed",
    "result": {
      "headers": ["string"],
      "data": [
        {
          "row": "number",
          "cells": [
            {
              "column": "string",
              "value": "string",
              "matched": "boolean"
            }
          ]
        }
      ]
    }
  }
}
```

### 5.5 导出表格
**接口**: `POST /api/filling/{taskId}/export`
**描述**: 导出填写的表格

**请求参数**:
```json
{
  "format": "string"    // word 或 excel
}
```

**响应**: 文件下载

### 5.6 生成分享链接
**接口**: `POST /api/filling/{taskId}/share`
**描述**: 生成表格分享链接

**响应**:
```json
{
  "code": 200,
  "data": {
    "shareUrl": "string",
    "expireTime": "string"
  }
}
```

## 6. 数据存储接口

### 6.1 测试数据库连接
**接口**: `POST /api/database/test`
**描述**: 测试数据库连接

**请求参数**:
```json
{
  "type": "string",      // mysql 或 mongodb
  "host": "string",
  "port": "string",
  "database": "string",
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "连接成功"
}
```

### 6.2 保存数据库配置
**接口**: `POST /api/database/config`
**描述**: 保存数据库配置

**请求参数**:
```json
{
  "type": "string",
  "host": "string",
  "port": "string",
  "database": "string",
  "username": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "配置保存成功"
}
```

### 6.3 获取存储的数据
**接口**: `GET /api/storage/data`
**描述**: 获取存储的数据列表

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "documentName": "string",
        "extractType": "string",
        "dataCount": "number",
        "createTime": "string"
      }
    ],
    "total": "number"
  }
}
```

### 6.4 创建备份
**接口**: `POST /api/storage/backup`
**描述**: 创建数据备份

**请求参数**:
```json
{
  "name": "string",
  "description": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "backupId": "string",
    "fileName": "string"
  }
}
```

### 6.5 恢复备份
**接口**: `POST /api/storage/restore`
**描述**: 从备份恢复数据

**请求参数**:
```json
{
  "backupId": "string"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "恢复成功"
}
```

## 7. 系统管理接口

### 7.1 获取用户列表
**接口**: `GET /api/users`
**描述**: 获取系统用户列表（管理员权限）

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "username": "string",
        "nickname": "string",
        "email": "string",
        "roles": ["string"],
        "status": "string",
        "createTime": "string"
      }
    ],
    "total": "number"
  }
}
```

### 7.2 获取操作日志
**接口**: `GET /api/logs`
**描述**: 获取系统操作日志

**查询参数**:
- page: number
- size: number
- startTime: string
- endTime: string
- userId: number

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "number",
        "userId": "number",
        "username": "string",
        "action": "string",
        "description": "string",
        "ip": "string",
        "createTime": "string"
      }
    ],
    "total": "number"
  }
}
```

## 错误响应格式

```json
{
  "code": 400,
  "message": "错误信息",
  "data": null
}
```

## 状态码说明

- 200: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误

## 分页参数

对于列表接口，支持以下查询参数：
- page: 页码（从1开始）
- size: 每页数量（默认10，最大100）

响应中的分页信息：
```json
{
  "list": [...],
  "total": 100,
  "page": 1,
  "size": 10
}
```</content>
<parameter name="filePath">D:\myjava\leyline-doc-front\API_DESIGN.md

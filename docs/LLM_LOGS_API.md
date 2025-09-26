
# LLM日志管理API文档

## 概述

LLM日志管理API提供了对LLM调用日志的查询、统计和管理功能。所有API端点都返回JSON格式的响应。

## 基础URL

```
/api/llm-logs
```

## 响应格式

所有API响应都遵循以下格式：

### 成功响应
```json
{
  "success": true,
  "data": {
    // 具体数据内容
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

## API端点

### 1. 获取LLM日志列表

**端点:** `GET /api/llm-logs`

**描述:** 获取LLM调用日志列表，支持过滤和分页

**查询参数:**

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| success | boolean | 否 | 过滤成功/失败的调用 | `true` 或 `false` |
| model | string | 否 | 模型名称（模糊匹配） | `gpt-4` |
| dateFrom | string | 否 | 开始日期 (ISO 8601) | `2024-01-01T00:00:00Z` |
| dateTo | string | 否 | 结束日期 (ISO 8601) | `2024-01-31T23:59:59Z` |
| userUuid | string | 否 | 用户UUID | `user-123` |
| gameId | number | 否 | 游戏ID | `123` |
| promptTemplate | string | 否 | 提示模板 | `story_generation` |
| page | number | 否 | 页码（默认1） | `1` |
| pageSize | number | 否 | 每页数量（默认20） | `20` |

**示例请求:**
```bash
GET /api/llm-logs?success=true&model=gpt-4&page=1&pageSize=10
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "userUuid": "user-123",
        "gameId": 456,
        "model": "gpt-4",
        "promptTemplate": "story_generation",
        "success": true,
        "duration": 1500,
        "usedRepair": false,
        "usedLlmRepair": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "pageSize": 10,
      "totalPages": 10
    }
  }
}
```

### 2. 获取LLM日志详情

**端点:** `GET /api/llm-logs/{id}`

**描述:** 根据ID获取特定LLM调用日志的详细信息

**路径参数:**

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| id | number | 是 | 日志ID |

**示例请求:**
```bash
GET /api/llm-logs/123
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "userUuid": "user-123",
    "gameId": 456,
    "model": "gpt-4",
    "promptTemplate": "story_generation",
    "success": true,
    "duration": 1500,
    "usedRepair": false,
    "usedLlmRepair": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**错误响应示例:**
```json
{
  "success": false,
  "error": "日志不存在",
  "message": "ID为 123 的日志不存在"
}
```

### 3. 获取LLM日志统计信息

**端点:** `GET /api/llm-logs/stats`

**描述:** 获取LLM调用日志的统计信息

**示例请求:**
```bash
GET /api/llm-logs/stats
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 1000,
    "successfulCalls": 950,
    "failedCalls": 50,
    "callsWithRepair": 100,
    "callsWithLlmRepair": 25,
    "avgDuration": 1200.5,
    "successRate": 95.0
  }
}
```

**统计字段说明:**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| totalCalls | number | 总调用次数 |
| successfulCalls | number | 成功调用次数 |
| failedCalls | number | 失败调用次数 |
| callsWithRepair | number | 使用修复机制的调用次数 |
| callsWithLlmRepair | number | 使用LLM修复机制的调用次数 |
| avgDuration | number | 平均响应时间（毫秒） |
| successRate | number | 成功率（百分比） |

## 错误码

| HTTP状态码 | 描述 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取日志列表
async function getLlmLogs(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });
  
  const response = await fetch(`/api/llm-logs?${params}`);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取日志详情
async function getLlmLogById(id: number) {
  const response = await fetch(`/api/llm-logs/${id}`);
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}

// 获取统计信息
async function getLlmLogStats() {
  const response = await fetch('/api/llm-logs/stats');
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.message);
  }
}
```

### cURL示例

```bash
# 获取所有日志
curl -X GET "http://localhost:3000/api/llm-logs"

# 获取成功的调用日志
curl -X GET "http://localhost:3000/api/llm-logs?success=true"

# 获取特定模型的日志
curl -X GET "http://localhost:3000/api/llm-logs?model=gpt-4"

# 获取日期范围内的日志
curl -X GET "http://localhost:3000/api/llm-logs?dateFrom=2024-01-01T00:00:00Z&dateTo=2024-01-31T23:59:59Z"

# 获取特定日志详情
curl -X GET "http://localhost:3000/api/llm-logs/123"

# 获取统计信息
curl -X GET "http://localhost:3000/api/llm-logs/stats"
```

## 注意事项

1. 所有日期参数都使用ISO 8601格式
2. 分页参数page从1开始
3. pageSize建议不超过100，避免性能问题
4. 模型名称支持模糊匹配
5. 所有API都需要适当的权限验证（根据实际需求配置）
6. 建议在生产环境中添加请求频率限制

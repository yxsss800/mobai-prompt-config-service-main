# 主程序通信API文档

## 概述

本API提供了与主程序通信的功能，包括LLM调用、状态检查、模型列表获取和配置信息获取。

## 环境配置

在 `.env` 文件中配置以下参数：

```env
# 主程序配置
MAIN_PROGRAM_URL=http://localhost:8080  # 主程序的基础URL
MAIN_PROGRAM_API_KEY=your-api-key       # 主程序的API密钥（可选）
```

## API端点

### 1. 检查主程序连接状态

**端点:** `GET /api/main-program/status`

**描述:** 检查与主程序的连接状态

**响应示例:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### 2. LLM调用

**端点:** `POST /api/main-program/llm-call`

**描述:** 通过主程序调用LLM接口

**请求体:**
```json
{
  "model": "gpt-4",
  "systemPrompt": "你是一个有用的助手",
  "prompt": "请生成一个故事",
  "schema": "{\"type\": \"object\", \"properties\": {\"story\": {\"type\": \"string\"}}}",
  "maxTokens": 1000,
  "providerOptions": {},
  "userUuid": "user-123",
  "gameId": 456,
  "promptTemplate": "story_generation"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "result": {
      "story": "从前有一个..."
    },
    "duration": 1500,
    "attemptCount": 1,
    "usedRepair": false,
    "usedLlmRepair": false
  }
}
```

### 3. 获取模型列表

**端点:** `GET /api/main-program/models`

**描述:** 获取主程序支持的模型列表

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "enabled": true
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "enabled": true
    }
  ]
}
```

### 4. 获取配置信息

**端点:** `GET /api/main-program/config`

**描述:** 获取主程序的配置信息

**响应示例:**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "features": ["llm", "repair", "logging"],
    "maxTokens": 4000,
    "timeout": 30000
  }
}
```

## 错误处理

所有API都遵循统一的错误响应格式：

```json
{
  "success": false,
  "error": "错误类型",
  "message": "详细错误信息"
}
```

## 使用示例

### JavaScript/TypeScript

```typescript
// 检查连接状态
async function checkMainProgramStatus() {
  const response = await fetch('/api/main-program/status');
  const result = await response.json();
  return result.data.connected;
}

// 调用LLM
async function callLlm(request) {
  const response = await fetch('/api/main-program/llm-call', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  const result = await response.json();
  return result.data;
}

// 获取模型列表
async function getModels() {
  const response = await fetch('/api/main-program/models');
  const result = await response.json();
  return result.data;
}
```

### cURL示例

```bash
# 检查状态
curl -X GET "http://localhost:3000/api/main-program/status"

# 调用LLM
curl -X POST "http://localhost:3000/api/main-program/llm-call" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "prompt": "Hello world",
    "schema": "{\"type\": \"string\"}"
  }'

# 获取模型列表
curl -X GET "http://localhost:3000/api/main-program/models"

# 获取配置
curl -X GET "http://localhost:3000/api/main-program/config"
```

## 注意事项

1. 所有调用都会自动记录到LLM日志中
2. 如果主程序URL未配置，相关功能将不可用
3. API密钥是可选的，如果主程序需要认证，请配置相应的密钥
4. 所有请求都有超时限制，LLM调用为30秒，其他请求为10秒
5. 建议在生产环境中添加适当的错误处理和重试机制

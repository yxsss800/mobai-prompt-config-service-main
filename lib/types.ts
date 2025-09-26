// 统一的 API 响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// AI 配置响应数据类型
export interface AIConfigResponse {
  id: number
  name: string
  modelId: number
  systemPrompt: string
  userPrompt: string
  inputParams: Record<string, any> | null
  params: Record<string, any> | null
  streaming: boolean
  thinking: boolean
  description: string | null
  category: string
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  model: {
    id: number
    name: string
    apiUrl: string
    apiKey: string
    isActive: boolean
  }
}

// AI 模型调用请求类型
export interface AIModelRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  stream?: boolean
  thinking?: boolean
  enable_thinking?: boolean
  enable_search?: boolean
  params?: Record<string, any>
}

// AI 模型调用响应类型
export interface AIModelResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// 错误类型枚举
export enum ErrorType {
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

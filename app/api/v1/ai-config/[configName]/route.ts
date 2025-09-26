import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, AIConfigResponse, ErrorType } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configName: string }> }
) {
  try {
    const { configName } = await params
    
    // 通过配置名查找配置
    const config = await prisma.aIConfig.findUnique({
      where: { name: configName },
      include: {
        model: true
      }
    })

    if (!config) {
      const errorResponse: ApiResponse = {
        success: false,
        error: ErrorType.CONFIG_NOT_FOUND,
        message: `配置 ${configName} 不存在`,
        timestamp: new Date().toISOString()
      }
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // 解析 JSON 字段
    let inputParams: Record<string, any> | null = null
    let configParams: Record<string, any> | null = null

    // 安全的 JSON 解析函数
    const safeJsonParse = (value: any): Record<string, any> | null => {
      if (!value) return null
      
      // 如果已经是对象，直接返回
      if (typeof value === 'object' && value !== null) {
        return value
      }
      
      // 如果是字符串，尝试解析
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch (error) {
          console.warn('JSON 解析失败:', { value, error })
          return null
        }
      }
      
      return null
    }

    inputParams = safeJsonParse(config.inputParams)
    configParams = safeJsonParse(config.params)

    // 构建响应数据
    const configData: AIConfigResponse = {
      id: config.id,
      name: config.name,
      modelId: config.modelId,
      systemPrompt: config.systemPrompt,
      userPrompt: config.userPrompt,
      inputParams,
      params: configParams,
      streaming: config.streaming,
      thinking: config.thinking,
      description: config.description,
      category: config.category,
      isActive: config.isActive,
      version: config.version,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
      model: {
        id: config.model.id,
        name: config.model.name,
        apiUrl: config.model.apiUrl,
        apiKey: config.model.apiKey,
        isActive: config.model.isActive
      }
    }

    const successResponse: ApiResponse<AIConfigResponse> = {
      success: true,
      data: configData,
      timestamp: new Date().toISOString()
    }
    console.log(`返回了配置: ${configName}`)

    return NextResponse.json(successResponse)
  } catch (error) {
    console.error('获取配置失败:', error)
    
    const errorResponse: ApiResponse = {
      success: false,
      error: ErrorType.INTERNAL_ERROR,
      message: '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

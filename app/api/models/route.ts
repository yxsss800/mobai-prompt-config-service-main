import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // 转换数据格式以匹配前端期望的结构
    const formattedModels = models.map(model => ({
      id: model.id.toString(),
      name: model.name,
      url: model.apiUrl,
      apiKey: model.apiKey,
      enabled: model.isActive,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString()
    }))
    
    return NextResponse.json(formattedModels)
  } catch (error) {
    console.error('获取模型列表失败:', error)
    return NextResponse.json(
      { error: '获取模型列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, url, apiKey } = await request.json()

    const model = await prisma.aIModel.create({
      data: {
        name,
        apiUrl: url,
        apiKey: apiKey || '',
        isActive: true
      }
    })

    // 返回格式化的数据
    const formattedModel = {
      id: model.id.toString(),
      name: model.name,
      url: model.apiUrl,
      apiKey: model.apiKey,
      enabled: model.isActive,
      createdAt: model.createdAt.toISOString(),
      updatedAt: model.updatedAt.toISOString()
    }

    return NextResponse.json(formattedModel, { status: 201 })
  } catch (error) {
    console.error('创建模型失败:', error)
    return NextResponse.json(
      { error: '创建模型失败' },
      { status: 500 }
    )
  }
}

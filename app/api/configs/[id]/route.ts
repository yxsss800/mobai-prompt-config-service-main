import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const config = await prisma.aIConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        model: true
      }
    })

    if (!config) {
      return NextResponse.json(
        { error: '配置不存在' },
        { status: 404 }
      )
    }

    // 转换数据格式以匹配前端期望的结构
    const formattedConfig = {
      id: config.id.toString(),
      name: config.name,
      model: config.model.name,
      systemPrompt: config.systemPrompt,
      userPrompt: config.userPrompt,
      variables: config.inputParams ? (() => {
        try {
          const parsed = JSON.parse(config.inputParams as string)
          return Array.isArray(parsed) ? parsed.map((p: any) => p.name || p) : Object.keys(parsed)
        } catch {
          return []
        }
      })() : [],
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString()
    }

    return NextResponse.json(formattedConfig)
  } catch (error) {
    console.error('获取配置失败:', error)
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, model, systemPrompt, userPrompt, variables } = await request.json()

    // 根据模型名称查找模型ID
    const modelRecord = await prisma.aIModel.findFirst({
      where: { name: model }
    })

    if (!modelRecord) {
      return NextResponse.json(
        { error: '指定的模型不存在' },
        { status: 400 }
      )
    }

    // 将variables数组转换为inputParams对象
    const inputParams = JSON.stringify(variables.reduce((acc: any, variable: string) => {
      acc[variable] = { type: 'string', required: true }
      return acc
    }, {}))

    const config = await prisma.aIConfig.update({
      where: { id: parseInt(id) },
      data: {
        name,
        modelId: modelRecord.id,
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt,
        inputParams
      }
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('更新配置失败:', error)
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.aIConfig.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除配置失败:', error)
    return NextResponse.json(
      { error: '删除配置失败' },
      { status: 500 }
    )
  }
}

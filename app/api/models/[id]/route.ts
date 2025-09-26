import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const model = await prisma.aIModel.findUnique({
      where: { id: parseInt(id) }
    })

    if (!model) {
      return NextResponse.json(
        { error: '模型不存在' },
        { status: 404 }
      )
    }

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

    return NextResponse.json(formattedModel)
  } catch (error) {
    console.error('获取模型失败:', error)
    return NextResponse.json(
      { error: '获取模型失败' },
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
    const body = await request.json()
    const { name, url, apiKey, enabled } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (url !== undefined) updateData.apiUrl = url
    if (apiKey !== undefined) updateData.apiKey = apiKey
    if (enabled !== undefined) updateData.isActive = enabled

    const model = await prisma.aIModel.update({
      where: { id: parseInt(id) },
      data: updateData
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

    return NextResponse.json(formattedModel)
  } catch (error) {
    console.error('更新模型失败:', error)
    return NextResponse.json(
      { error: '更新模型失败' },
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
    await prisma.aIModel.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除模型失败:', error)
    return NextResponse.json(
      { error: '删除模型失败' },
      { status: 500 }
    )
  }
}

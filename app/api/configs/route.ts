import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.aIConfig.findMany({
      include: {
        model: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // 转换数据格式以匹配前端期望的结构
    const formattedConfigs = configs.map(config => {
      let variables: string[] = []
      
      if (config.inputParams) {
        try {
          // 处理 inputParams 的不同格式
          if (Array.isArray(config.inputParams)) {
            // 如果是数组格式，提取 name 字段
            variables = config.inputParams.map((param: any) => param.name || param.note || param)
          } else if (typeof config.inputParams === 'object') {
            // 如果是对象格式，提取键名
            variables = Object.keys(config.inputParams)
          }
        } catch (error) {
          console.error('解析 inputParams 失败:', error)
          variables = []
        }
      }
      
      return {
        id: config.id.toString(),
        name: config.name,
        model: config.model.name,
        systemPrompt: config.systemPrompt,
        userPrompt: config.userPrompt,
        variables,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      }
    })
    
    return NextResponse.json(formattedConfigs)
  } catch (error) {
    console.error('获取配置列表失败:', error)
    return NextResponse.json(
      { error: '获取配置列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // 将variables数组转换为inputParams数组格式
    const inputParams = JSON.stringify(variables.map((variable: string) => ({
      name: variable,
      note: variable.toUpperCase().replace(/\s+/g, '_'),
      type: 'string'
    })))

    const config = await prisma.aIConfig.create({
      data: {
        name,
        modelId: modelRecord.id,
        systemPrompt: systemPrompt || '',
        userPrompt: userPrompt,
        inputParams,
        params: JSON.stringify({})
      }
    })

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('创建配置失败:', error)
    return NextResponse.json(
      { error: '创建配置失败' },
      { status: 500 }
    )
  }
}

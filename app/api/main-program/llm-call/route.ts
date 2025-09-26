import { NextRequest, NextResponse } from 'next/server';
import { mainProgramService } from '../../../../src/services/mainProgramService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需参数
    if (!body.model || !body.prompt || !body.schema) {
      return NextResponse.json(
        { 
          success: false, 
          error: '参数错误', 
          message: '缺少必需参数: model, prompt, schema' 
        },
        { status: 400 }
      );
    }

    const result = await mainProgramService.callLlm(body);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('主程序LLM调用失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '调用失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

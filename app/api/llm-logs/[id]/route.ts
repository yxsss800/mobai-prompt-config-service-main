import { mainProgramService } from '@/src/services/mainProgramService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logId = parseInt(id);
    
    if (isNaN(logId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: '参数错误', 
          message: '日志ID必须是数字' 
        },
        { status: 400 }
      );
    }

    // 调用主程序服务获取日志详情
    const result = await mainProgramService.getLlmLogDetail(logId);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('获取LLM日志详情失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

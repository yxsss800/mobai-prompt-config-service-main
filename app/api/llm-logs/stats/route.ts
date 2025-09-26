import { NextRequest, NextResponse } from 'next/server';
import { mainProgramService } from '@/src/services/mainProgramService';

export async function GET(request: NextRequest) {
  try {
    // 调用主程序服务获取统计信息
    const result = await mainProgramService.getLlmLogStats();
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('获取LLM日志统计失败:', error);
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

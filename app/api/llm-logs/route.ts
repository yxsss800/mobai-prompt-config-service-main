import { mainProgramService } from '@/src/services/mainProgramService';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 构建查询参数
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    // 调用主程序服务获取日志
    const result = await mainProgramService.getLlmLogs(params.toString());
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('获取LLM日志失败:', error);
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

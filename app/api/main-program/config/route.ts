import { NextResponse } from 'next/server';
import { mainProgramService } from '../../../../src/services/mainProgramService';

export async function GET() {
  try {
    const config = await mainProgramService.getConfig();
    
    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('获取主程序配置失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取配置失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

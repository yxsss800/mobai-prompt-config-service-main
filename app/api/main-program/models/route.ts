import { NextResponse } from 'next/server';
import { mainProgramService } from '../../../../src/services/mainProgramService';

export async function GET() {
  try {
    const models = await mainProgramService.getModels();
    
    return NextResponse.json({
      success: true,
      data: models
    });
  } catch (error: any) {
    console.error('获取主程序模型列表失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取模型列表失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { mainProgramService } from '../../../../src/services/mainProgramService';

export async function POST() {
  try {
    const result = await mainProgramService.syncLlmLogs();
    
    return NextResponse.json({
      success: true,
      data: {
        message: `同步完成：成功同步 ${result.synced} 条记录，${result.errors} 条失败`,
        synced: result.synced,
        errors: result.errors
      }
    });
  } catch (error: any) {
    console.error('同步主程序数据失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '同步失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

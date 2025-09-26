import { NextResponse } from 'next/server';
import { mainProgramService } from '../../../../src/services/mainProgramService';

export async function GET() {
  try {
    const isConnected = await mainProgramService.checkConnection();
    
    return NextResponse.json({
      success: true,
      data: {
        connected: isConnected,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('主程序状态检查失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '状态检查失败', 
        message: error.message || '未知错误' 
      },
      { status: 500 }
    );
  }
}

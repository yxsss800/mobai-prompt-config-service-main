import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'

export async function GET(request: NextRequest) {
  try {
    // 获取token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }
    
    try {
      // 验证token
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const secretKey = new TextEncoder().encode(secret)
      const { payload } = await jwtVerify(token, secretKey)
      
      // 检查token是否过期
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return NextResponse.json(
          { success: false, message: '登录已过期' },
          { status: 401 }
        )
      }
      
      // 从token中获取用户ID
      const userId = payload.userId as number
      
      // 查询用户信息
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLogin: true
        }
      })
      
      if (!user || !user.isActive) {
        return NextResponse.json(
          { success: false, message: '用户不存在或已被禁用' },
          { status: 401 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
            lastLogin: user.lastLogin
          }
        }
      })
      
    } catch (error) {
      return NextResponse.json(
        { success: false, message: '无效的登录状态' },
        { status: 401 }
      )
    }
    
  } catch (error) {
    console.error('获取用户信息错误:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}

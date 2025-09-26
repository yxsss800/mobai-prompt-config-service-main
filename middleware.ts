import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// 需要保护的路径
const protectedPaths = [
  '/',
  '/config',
  '/model-admin',
  '/user-admin'
]

// 公开路径（不需要登录）
const publicPaths = [
  '/login'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 跳过静态资源
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') || 
      pathname.startsWith('/public/') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // 检查是否为公开路径
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // 检查是否为需要保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // 获取token
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // 没有token，重定向到登录页
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      // 验证token
      const secret = process.env.JWT_SECRET || 'your-secret-key'
      const secretKey = new TextEncoder().encode(secret)
      const { payload } = await jwtVerify(token, secretKey)
      
      // 检查token是否过期
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        // token过期，重定向到登录页
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // token有效，继续请求
      return NextResponse.next()
    } catch (error) {
      // token无效，重定向到登录页
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

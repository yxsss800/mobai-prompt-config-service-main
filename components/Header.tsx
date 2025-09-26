'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { User, LogOut, Settings, Menu, X } from 'lucide-react'

interface UserInfo {
  id: number
  username: string
  email: string
  name: string | null
  role: string
  lastLogin: string | null
}

export default function Header() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUserInfo(data.data.user)
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUserInfo()
  }, [])

  // 导航菜单项
  const navigationItems = [
    { name: 'Prompt管理', href: '/', current: pathname === '/' },
    { name: '模型管理', href: '/model-admin', current: pathname === '/model-admin' },
    { name: '大模型调用日志', href: '/llm-log', current: pathname === '/llm-log' },
    { name: '系统管理员列表', href: '/user-admin', current: pathname === '/user-admin' },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        // 清除本地状态并重定向到登录页
        window.location.href = '/login'
      } else {
        console.error('退出登录失败')
      }
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* 左侧标题区域 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity">
              <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                <span className="hidden sm:inline">MobAI修仙模拟器</span>
                <span className="sm:hidden">MobAI</span>
              </h1>
              <Badge variant="secondary" className="text-xs shrink-0">
                国内版
              </Badge>
            </Link>
          </div>

          {/* 桌面端导航菜单 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 右侧用户区域 */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 p-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>

            {/* 用户头像下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 !rounded-full p-0 overflow-hidden"
                >
                  <div className="flex h-8 w-8 items-center justify-center !rounded-full bg-primary text-primary-foreground text-xs font-medium border-0">
                    {isLoadingUser ? (
                      <User className="h-4 w-4" />
                    ) : userInfo?.name ? (
                      userInfo.name.charAt(0).toUpperCase()
                    ) : userInfo?.username ? (
                      userInfo.username.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex h-8 w-8 items-center justify-center !rounded-full bg-primary text-primary-foreground text-xs font-medium border-0">
                    {isLoadingUser ? (
                      <User className="h-4 w-4" />
                    ) : userInfo?.name ? (
                      userInfo.name.charAt(0).toUpperCase()
                    ) : userInfo?.username ? (
                      userInfo.username.charAt(0).toUpperCase()
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {isLoadingUser ? '加载中...' : userInfo?.name || userInfo?.username || '用户'}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {isLoadingUser ? '' : userInfo?.role === 'admin' ? '系统管理员' : '普通用户'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? '退出中...' : '退出登录'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.current
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

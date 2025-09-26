'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // 在登录页面不显示Header
  if (pathname === '/login') {
    return null
  }
  
  return <Header />
}

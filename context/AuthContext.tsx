'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  role: string;
}

// 定义 Context 中要存放的数据结构
interface AuthContextType {
  user: User | null; // 用户信息，可能为 null (未登录)
  loading: boolean; // 是否正在加载用户信息
}

// 创建 Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 创建一个 "Provider" 组件，它负责获取并提供用户信息
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 定义一个函数去后端 API 获取当前登录用户信息
    const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const responseData = await response.json();
        setUser(responseData.data.user); 
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchCurrentUser();
}, []); 

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 创建一个自定义 Hook，让其他组件可以方便地使用这个 Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
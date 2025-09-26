'use client'

import { useState, useEffect } from 'react'
import { UserList } from '@/components/UserList'
import { UserForm } from '@/components/UserForm'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  name?: string
  role: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.data)
      } else {
        console.error('获取用户列表失败:', result.message)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 创建用户
  const handleCreateUser = async (userData: Partial<User> & { password?: string }) => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchUsers() // 重新获取用户列表
        setIsFormOpen(false)
        setEditingUser(undefined)
      } else {
        alert(result.message || '创建用户失败')
      }
    } catch (error) {
      console.error('创建用户失败:', error)
      alert('创建用户失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 更新用户
  const handleUpdateUser = async (userData: Partial<User> & { password?: string }) => {
    if (!editingUser) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchUsers() // 重新获取用户列表
        setIsFormOpen(false)
        setEditingUser(undefined)
      } else {
        alert(result.message || '更新用户失败')
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      alert('更新用户失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除用户
  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (result.success) {
        await fetchUsers() // 重新获取用户列表
      } else {
        alert(result.message || '删除用户失败')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      alert('删除用户失败')
    }
  }

  // 编辑用户
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  // 创建新用户
  const handleCreateNew = () => {
    setEditingUser(undefined)
    setIsFormOpen(true)
  }

  // 关闭表单
  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingUser(undefined)
  }

  // 提交表单
  const handleSubmit = async (userData: Partial<User> & { password?: string }) => {
    if (editingUser) {
      await handleUpdateUser(userData)
    } else {
      await handleCreateUser(userData)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
          </div>
          <p className="text-gray-600">
            管理系统用户，包括创建、编辑、删除用户以及设置用户权限。
          </p>
        </div>

        {/* 用户列表 */}
        <UserList
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onCreate={handleCreateNew}
          isLoading={isLoading}
        />

        {/* 用户表单对话框 */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <UserForm
              user={editingUser}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

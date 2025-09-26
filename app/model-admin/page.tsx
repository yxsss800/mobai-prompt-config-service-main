'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Edit, Trash2, Check, X, Settings, Eye, EyeOff } from 'lucide-react'

interface Model {
  id: string
  name: string
  url: string
  apiKey: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export default function ModelAdminPage() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    apiKey: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/models')
      if (response.ok) {
        const data = await response.json()
        setModels(data)
      } else {
        setError('加载模型列表失败')
      }
    } catch (error) {
      console.error('加载模型失败:', error)
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingModel ? `/api/models/${editingModel.id}` : '/api/models'
      const method = editingModel ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadModels()
        resetForm()
        setSuccess(editingModel ? '模型更新成功' : '模型创建成功')
      } else {
        const data = await response.json()
        setError(data.message || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      setError('网络错误，请重试')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模型吗？')) return

    try {
      const response = await fetch(`/api/models/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await loadModels()
        setSuccess('模型删除成功')
      } else {
        setError('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      setError('网络错误，请重试')
    }
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled })
      })

      if (response.ok) {
        await loadModels()
        setSuccess(`模型已${!enabled ? '启用' : '禁用'}`)
      } else {
        setError('操作失败')
      }
    } catch (error) {
      console.error('操作失败:', error)
      setError('网络错误，请重试')
    }
  }

  const handleEdit = (model: Model) => {
    setEditingModel(model)
    setFormData({
      name: model.name,
      url: model.url,
      apiKey: model.apiKey
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', url: '', apiKey: '' })
    setEditingModel(null)
    setShowForm(false)
    setShowApiKey(false)
    setError('')
    setSuccess('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">AI模型管理</h1>
          <p className="text-slate-600">
            管理可用AI模型，支持增删查改。配置页面的模型选择下拉框将自动同步这里的内容。
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? '取消新建' : '新建模型'}
          </Button>
          <Button variant="outline" onClick={loadModels}>
            刷新列表
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-600 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                {editingModel ? '编辑模型' : '新建模型'}
              </CardTitle>
              <CardDescription>
                {editingModel ? '修改模型信息' : '添加新的AI模型'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">模型名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入模型名称"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">模型URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="输入模型API地址"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API密钥</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="输入API密钥（可选）"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Check className="w-4 h-4 mr-2" />
                    {editingModel ? '更新模型' : '创建模型'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Model List */}
        <Card>
          <CardHeader>
            <CardTitle>模型列表</CardTitle>
            <CardDescription>
              当前共有 {models.length} 个模型
            </CardDescription>
          </CardHeader>
          <CardContent>
            {models.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">暂无模型</h3>
                <p className="text-slate-500 mb-6">点击"新建模型"开始添加AI模型</p>
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  添加模型
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {models.map(model => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-800">{model.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            model.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {model.enabled ? '已启用' : '已禁用'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">URL:</span> {model.url}
                        </p>
                        {model.apiKey && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">API Key:</span> {model.apiKey.substring(0, 8)}...
                          </p>
                        )}
                        <p className="text-xs text-slate-500">
                          创建时间: {new Date(model.createdAt).toLocaleString('zh-CN')}
                        </p>
                        {model.updatedAt !== model.createdAt && (
                          <p className="text-xs text-slate-500">
                            更新时间: {new Date(model.updatedAt).toLocaleString('zh-CN')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleEnabled(model.id, model.enabled)}
                        className={model.enabled ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {model.enabled ? '禁用' : '启用'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(model)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(model.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

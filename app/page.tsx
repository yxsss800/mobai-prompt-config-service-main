'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import Controls from '@/components/Controls'
import ConfigForm from '@/components/ConfigForm'
import ConfigList from '@/components/ConfigList'
import EditConfigModal from '@/components/EditConfigModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Config, Model, FormData } from '@/components/types'

export default function HomePage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Config | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    model: '',
    systemPrompt: '',
    userPrompt: '',
    variables: ''
  })
  const [showVariables, setShowVariables] = useState<{ [key: string]: boolean }>({})
  const [showSystemPrompt, setShowSystemPrompt] = useState<{ [key: string]: boolean }>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [configsRes, modelsRes] = await Promise.all([
        fetch('/api/configs'),
        fetch('/api/models')
      ])
      
      if (configsRes.ok) {
        const configsData = await configsRes.json()
        setConfigs(configsData)
      }
      
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json()
        setModels(modelsData)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const variables = formData.variables.split('\n').filter(v => v.trim())
      const configData = {
        ...formData,
        variables
      }

      const url = editingConfig ? `/api/configs/${editingConfig.id}` : '/api/configs'
      const method = editingConfig ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })

      if (response.ok) {
        await loadData()
        resetForm()
        alert(editingConfig ? '配置更新成功' : '配置创建成功')
      } else {
        alert('操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个配置吗？')) return

    try {
      const response = await fetch(`/api/configs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        await loadData()
        alert('配置删除成功')
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    }
  }

  const handleEdit = (config: Config) => {
    setEditingConfig(config)
    setFormData({
      name: config.name,
      model: config.model,
      systemPrompt: config.systemPrompt,
      userPrompt: config.userPrompt,
      variables: config.variables.join('\n')
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({ name: '', model: '', systemPrompt: '', userPrompt: '', variables: '' })
    setEditingConfig(null)
    setShowForm(false)
    setShowEditModal(false)
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const toggleVariables = (id: string) => {
    setShowVariables(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSystemPrompt = (id: string) => {
    setShowSystemPrompt(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">

        <Controls
          showForm={showForm}
          onToggleForm={() => setShowForm(!showForm)}
          onRefresh={loadData}
          onNavigateToModelAdmin={() => window.location.href = '/model-admin'}
          onNavigateToUserAdmin={() => window.location.href = '/user-admin'}
          onNavigateToLlmLog={() => window.location.href = '/llm-log'}
        />

        {showForm && (
          <ConfigForm
            formData={formData}
            setFormData={setFormData}
            models={models}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isEditing={!!editingConfig}
          />
        )}

        <ConfigList
          configs={configs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showVariables={showVariables}
          showSystemPrompt={showSystemPrompt}
          copiedId={copiedId}
          onToggleVariables={toggleVariables}
          onToggleSystemPrompt={toggleSystemPrompt}
          onCopyToClipboard={copyToClipboard}
          onCreateNew={() => setShowForm(true)}
        />

        <EditConfigModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingConfig(null)
          }}
          formData={formData}
          setFormData={setFormData}
          models={models}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowEditModal(false)
            setEditingConfig(null)
          }}
          isEditing={true}
        />
      </div>
    </div>
  )
}

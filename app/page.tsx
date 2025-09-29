'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import Controls from '@/components/Controls'
import ConfigForm from '@/components/ConfigForm'
import ConfigList from '@/components/ConfigList'
import EditConfigModal from '@/components/EditConfigModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Config, Model, FormData } from '@/components/types'
import VoiceInputButton from '@/components/VoiceInputButton'        // TTS
import { useAuth } from '@/context/AuthContext';        // TTS

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
  const { user, loading: userLoading } = useAuth()

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

  const handleReadConfigPrompt = (config: Config) => {
    if (!user) {
      alert("无法获取当前用户信息，请尝试重新登录。");
      return;
    }

    const characterId = user.id; 
    const textToRead = config.systemPrompt;

    if (!textToRead) {
      alert("系统提示为空，无法朗读。");
      return;
    }

    console.log("准备为角色", characterId, "朗读配置:", config.name);
    playTextToSpeech(characterId, textToRead);
  };

  if (loading || userLoading) {
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
          onReadAloud={handleReadConfigPrompt}      //TTS
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
        <div className="mt-12">       
          <h2 className="text-2xl font-bold mb-4 text-center">ASR 语音输入测试</h2> 
          <div className="max-w-md mx-auto">
            <VoiceInputButton />
          </div>
        </div>

      </div>
    </div>
  )
}

function playTextToSpeech(characterId: number, textToRead: string) {
  console.log('[TTS Frontend] 开始专业流媒体播放...');
  const ws = new WebSocket('ws://localhost:3002/api/tts/stream');
  
  const audio = new Audio();
  const mediaSource = new MediaSource();
  audio.src = URL.createObjectURL(mediaSource);

  // 尝试播放
  audio.play().catch(e => console.error("音频播放启动失败，可能是用户未与页面交互:", e));

  // 当 MediaSource 准备好时
  mediaSource.addEventListener('sourceopen', () => {
    console.log('[TTS Frontend] MediaSource 已打开，准备接收数据');
    const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
    
    // 1. 创建一个“等待区”队列
    const chunkQueue: ArrayBuffer[] = [];

    // 2. 创建一个专门处理队列的函数
    const processQueue = () => {
      // 如果缓冲区正忙，或者队列是空的，就先不处理
      if (sourceBuffer.updating || chunkQueue.length === 0) {
        return;
      }
      // 从队列里取出第一个音频块并添加到缓冲区
      const nextChunk = chunkQueue.shift();
      if (nextChunk) {
        sourceBuffer.appendBuffer(nextChunk);
      }
    };

    // 3. 当缓冲区处理完一个块，变得空闲时，就主动去处理队列里的下一个
    sourceBuffer.addEventListener('updateend', () => {
      processQueue();
    });

    // 4. 当收到新的音频块时，不再直接处理，而是先放进队列
    ws.onmessage = async (event) => {
      try {
        const arrayBuffer = await event.data.arrayBuffer();
        chunkQueue.push(arrayBuffer);
        // 尝试处理队列
        processQueue();
      } catch (error) {
        console.error("处理音频块时出错:", error);
      }
    };

    // 当 WebSocket 关闭时
    ws.onclose = () => {
      // 等待缓冲区和队列都处理完毕
      const checkBuffer = setInterval(() => {
        if (!sourceBuffer.updating && chunkQueue.length === 0) {
          clearInterval(checkBuffer);
          if (mediaSource.readyState === 'open') {
            mediaSource.endOfStream();
          }
          console.log('[TTS Frontend] WebSocket 已关闭，媒体流结束。');
        }
      }, 100);
    };
  });

  ws.onopen = () => {
    console.log('[TTS Frontend] WebSocket 已连接，发送请求');
    ws.send(JSON.stringify({
      character_id: String(characterId),
      text: textToRead,
    }));
  };
  
  ws.onerror = (error) => console.error('[TTS Frontend] WebSocket 错误:', error);
}

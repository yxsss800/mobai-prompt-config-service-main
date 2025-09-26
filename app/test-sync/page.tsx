'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function TestSyncPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleSyncLogs = async () => {
    if (!confirm('确定要从主程序同步日志吗？')) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/main-program/sync', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setResult(data.data.message)
      } else {
        setResult(`同步失败: ${data.message}`)
      }
    } catch (error) {
      console.error('同步失败:', error)
      setResult('同步失败')
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/main-program/status')
      const data = await response.json()
      setResult(`主程序状态: ${data.data.connected ? '已连接' : '未连接'}`)
    } catch (error) {
      setResult('检查状态失败')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">主程序数据同步测试</h1>
      
      <div className="space-y-4">
        <Button onClick={checkStatus} variant="outline">
          检查主程序状态
        </Button>
        
        <Button onClick={handleSyncLogs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          同步主程序日志
        </Button>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded">
            <p>{result}</p>
          </div>
        )}
      </div>
    </div>
  )
}

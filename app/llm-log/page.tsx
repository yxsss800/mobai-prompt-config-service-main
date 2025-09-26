'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, Clock, Database, RefreshCw, Search, Eye, Copy, Check } from 'lucide-react'

interface LlmLog {
  id: number
  model: string
  promptTemplate?: string
  success: boolean
  duration?: number
  usedRepair: boolean
  usedLlmRepair: boolean
  createdAt: string
  userUuid?: string
  gameId?: number
  // 详情字段
  prompt?: string
  result?: string
  response?: string  // 保留兼容性
  errorMessage?: string
  systemPrompt?: string
  inputParams?: string
  outputStructure?: string
  attemptCount?: number
  maxTokens?: number
  temperature?: number
  streaming?: boolean
  thinking?: boolean
}

interface LlmLogStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  callsWithRepair: number
  callsWithLlmRepair: number
  avgDuration: number
  successRate: number
}

interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function LlmLogPage() {
  const [logs, setLogs] = useState<LlmLog[]>([])
  const [stats, setStats] = useState<LlmLogStats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 详情模态框状态
  const [selectedLog, setSelectedLog] = useState<LlmLog | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  
  // 过滤条件
  const [filters, setFilters] = useState({
    success: 'all',
    model: '',
    page: 1,
    pageSize: 20
  })

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 构建查询参数
      const params = new URLSearchParams()
      if (filters.success && filters.success !== 'all') params.append('success', filters.success)
      if (filters.model) params.append('model', filters.model)
      params.append('page', filters.page.toString())
      params.append('pageSize', filters.pageSize.toString())

      // 并行获取日志和统计信息
      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`/api/llm-logs?${params}`),
        fetch('/api/llm-logs/stats')
      ])

      if (!logsResponse.ok || !statsResponse.ok) {
        throw new Error('获取数据失败')
      }

      const logsData = await logsResponse.json()
      const statsData = await statsResponse.json()

      if (!logsData.success || !statsData.success) {
        throw new Error(logsData.message || statsData.message || '获取数据失败')
      }

      setLogs(logsData.data.logs || [])
      setPagination(logsData.data.pagination || null)
      setStats(statsData.data || null)
    } catch (err: any) {
      setError(err.message || '加载数据失败')
      console.error('加载LLM日志失败:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters.page, filters.pageSize])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 重置到第一页
    }))
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }))
    loadData()
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const loadLogDetail = async (logId: number) => {
    try {
      setDetailLoading(true)
      const response = await fetch(`/api/llm-logs/${logId}`)
      
      if (!response.ok) {
        throw new Error('获取详情失败')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || '获取详情失败')
      }

      setSelectedLog(result.data)
    } catch (err: any) {
      setError(err.message || '获取详情失败')
      console.error('获取日志详情失败:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 检查是否为有效的JSON字符串
  const isValidJSON = (str: string): boolean => {
    try {
      JSON.parse(str)
      return true
    } catch {
      return false
    }
  }

  // 格式化JSON字符串
  const formatJSON = (str: string): string => {
    try {
      return JSON.stringify(JSON.parse(str), null, 4)
    } catch {
      return str
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'
    return `${ms}ms`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading && !logs.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">LLM 调用日志</h1>
        <Button onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计信息 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCalls}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均耗时</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">修复调用</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.callsWithRepair}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">成功状态</label>
              <Select value={filters.success} onValueChange={(value) => handleFilterChange('success', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="true">成功</SelectItem>
                  <SelectItem value="false">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">模型名称</label>
              <Input
                placeholder="输入模型名称"
                value={filters.model}
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card>
        <CardHeader>
          <CardTitle>调用日志</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无日志数据
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? '成功' : '失败'}
                      </Badge>
                      <span className="font-medium">{log.model}</span>
                      {log.promptTemplate && (
                        <Badge variant="outline">{log.promptTemplate}</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">耗时:</span>
                      <span className="ml-1">{formatDuration(log.duration)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">修复:</span>
                      <span className="ml-1">{log.usedRepair ? '是' : '否'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">LLM修复:</span>
                      <span className="ml-1">{log.usedLlmRepair ? '是' : '否'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">用户:</span>
                      <span className="ml-1">{log.userUuid || '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadLogDetail(log.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详情模态框 */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>日志详情 - ID: {selectedLog?.id}</DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>加载详情中...</span>
            </div>
          ) : selectedLog ? (
            <div className="space-y-6">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">模型:</span>
                      <p className="text-sm">{selectedLog.model}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">状态:</span>
                      <Badge variant={selectedLog.success ? "default" : "destructive"} className="ml-2">
                        {selectedLog.success ? '成功' : '失败'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">耗时:</span>
                      <p className="text-sm">{formatDuration(selectedLog.duration)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">尝试次数:</span>
                      <p className="text-sm">{selectedLog.attemptCount || 1}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">创建时间:</span>
                      <p className="text-sm">{formatDate(selectedLog.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">用户:</span>
                      <p className="text-sm">{selectedLog.userUuid || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">游戏ID:</span>
                      <p className="text-sm">{selectedLog.gameId || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">提示模板:</span>
                      <p className="text-sm">{selectedLog.promptTemplate || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 系统提示词 */}
              {selectedLog.systemPrompt && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">系统提示词</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedLog.systemPrompt!, 'systemPrompt')}
                      >
                        {copiedField === 'systemPrompt' ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedField === 'systemPrompt' ? '已复制' : '复制'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedLog.systemPrompt}
                      readOnly
                      className="min-h-[200px] font-mono text-sm resize-none whitespace-pre-wrap break-words"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 用户提示词 */}
              {selectedLog.prompt && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">用户提示词</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedLog.prompt!, 'prompt')}
                      >
                        {copiedField === 'prompt' ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedField === 'prompt' ? '已复制' : '复制'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedLog.prompt}
                      readOnly
                      className="min-h-[200px] font-mono text-sm resize-none whitespace-pre-wrap break-words"
                    />
                  </CardContent>
                </Card>
              )}
              {/* 响应内容 */}
              {(selectedLog.result || selectedLog.response) && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">响应内容</CardTitle>
                      <div className="flex items-center space-x-2">
                        {isValidJSON(selectedLog.result || selectedLog.response || '') && (
                          <Badge variant="secondary" className="text-xs">
                            JSON格式
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedLog.result || selectedLog.response || '', 'result')}
                        >
                          {copiedField === 'result' ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedField === 'result' ? '已复制' : '复制'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isValidJSON(selectedLog.result || selectedLog.response || '') ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">格式化JSON:</h4>
                          <pre className="bg-gray-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {formatJSON(selectedLog.result || selectedLog.response || '')}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">原始内容:</h4>
                          <Textarea
                            value={selectedLog.result || selectedLog.response || ''}
                            readOnly
                            className="min-h-[150px] font-mono text-sm resize-none whitespace-pre-wrap break-words"
                          />
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={selectedLog.result || selectedLog.response || ''}
                        readOnly
                        className="min-h-[250px] font-mono text-sm resize-none whitespace-pre-wrap break-words"
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 错误信息 */}
              {selectedLog.errorMessage && (
                <Card className="border-red-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-red-600">错误信息</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedLog.errorMessage!, 'errorMessage')}
                      >
                        {copiedField === 'errorMessage' ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copiedField === 'errorMessage' ? '已复制' : '复制'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedLog.errorMessage}
                      readOnly
                      className="min-h-[100px] font-mono text-sm text-red-600 bg-red-50 whitespace-pre-wrap break-words"
                    />
                  </CardContent>
                </Card>
              )}

              {/* 模型参数 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">模型参数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">最大Token数:</span>
                      <p className="text-sm">{selectedLog.maxTokens || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">温度:</span>
                      <p className="text-sm">{selectedLog.temperature || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">流式输出:</span>
                      <p className="text-sm">{selectedLog.streaming ? '是' : '否'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">显示思考:</span>
                      <p className="text-sm">{selectedLog.thinking ? '是' : '否'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 输入参数 */}
              {selectedLog.inputParams && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">输入参数</CardTitle>
                      <div className="flex items-center space-x-2">
                        {isValidJSON(selectedLog.inputParams) && (
                          <Badge variant="secondary" className="text-xs">
                            JSON格式
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedLog.inputParams!, 'inputParams')}
                        >
                          {copiedField === 'inputParams' ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedField === 'inputParams' ? '已复制' : '复制'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isValidJSON(selectedLog.inputParams) ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">格式化JSON:</h4>
                          <pre className="bg-gray-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {formatJSON(selectedLog.inputParams)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">原始内容:</h4>
                          <Textarea
                            value={selectedLog.inputParams}
                            readOnly
                            className="min-h-[100px] font-mono text-sm whitespace-pre-wrap break-words"
                          />
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={selectedLog.inputParams}
                        readOnly
                        className="min-h-[100px] font-mono text-sm whitespace-pre-wrap break-words"
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 输出结构 */}
              {selectedLog.outputStructure && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">输出结构</CardTitle>
                      <div className="flex items-center space-x-2">
                        {isValidJSON(selectedLog.outputStructure) && (
                          <Badge variant="secondary" className="text-xs">
                            JSON格式
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedLog.outputStructure!, 'outputStructure')}
                        >
                          {copiedField === 'outputStructure' ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedField === 'outputStructure' ? '已复制' : '复制'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isValidJSON(selectedLog.outputStructure) ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">格式化JSON:</h4>
                          <pre className="bg-gray-50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {formatJSON(selectedLog.outputStructure)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">原始内容:</h4>
                          <Textarea
                            value={selectedLog.outputStructure}
                            readOnly
                            className="min-h-[100px] font-mono text-sm whitespace-pre-wrap break-words"
                          />
                        </div>
                      </div>
                    ) : (
                      <Textarea
                        value={selectedLog.outputStructure}
                        readOnly
                        className="min-h-[100px] font-mono text-sm whitespace-pre-wrap break-words"
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Edit, Trash2, Eye, EyeOff, Copy, Check, Volume2 } from 'lucide-react'
import { ConfigCardProps } from './types'

export default function ConfigCard({
  config,
  onEdit,
  onDelete,
  showVariables,
  showSystemPrompt,
  copiedId,
  onToggleVariables,
  onToggleSystemPrompt,
  onCopyToClipboard,
  onReadAloud
}: ConfigCardProps) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-slate-800">{config.name}</CardTitle>
            <CardDescription className="mt-1">
              模型: {config.model} | 变量: {config.variables?.length || 0}个
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(config)}
            >
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReadAloud(config)}
            >
              <Volume2 className="w-4 h-4 mr-1" />
              朗读
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(config.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {config.systemPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">系统提示词</Label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleSystemPrompt(config.id)}
                  >
                    {showSystemPrompt[config.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopyToClipboard(config.systemPrompt, `system-${config.id}`)}
                  >
                    {copiedId === `system-${config.id}` ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                  {showSystemPrompt[config.id] ? config.systemPrompt : '点击眼睛图标查看内容'}
                </pre>
              </div>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">用户提示词模板</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleVariables(config.id)}
                >
                  {showVariables[config.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyToClipboard(config.userPrompt, config.id)}
                >
                  {copiedId === config.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                {showVariables[config.id] ? config.userPrompt : '点击眼睛图标查看内容'}
              </pre>
            </div>
          </div>
          
          {config.variables && config.variables.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">可用变量</Label>
              <div className="flex flex-wrap gap-2">
                {config.variables.map((variable, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {`{${variable}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>  
    </Card>
  )
}

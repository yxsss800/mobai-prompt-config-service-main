import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Settings } from 'lucide-react'
import { ConfigFormProps } from './types'

export default function ConfigForm({ 
  formData, 
  setFormData, 
  models, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}: ConfigFormProps) {
  return (
    <Card className="mb-8 border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-blue-600 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          {isEditing ? '编辑配置' : '新建配置'}
        </CardTitle>
        <CardDescription>
          {isEditing ? '修改现有配置信息' : '创建新的AI配置模板'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">配置名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="输入配置名称"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">选择模型</Label>
              <select
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">请选择模型</option>
                {models && models.map(model => (
                  <option key={model.id} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">系统提示词</Label>
            <Textarea
              id="systemPrompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              placeholder="输入系统提示词，定义AI的角色和行为规范"
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userPrompt">用户提示词模板</Label>
            <Textarea
              id="userPrompt"
              value={formData.userPrompt}
              onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
              placeholder="输入用户提示词模板，使用 {{变量名}} 格式定义变量"
              rows={6}
              className="resize-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="variables">变量列表（每行一个）</Label>
            <Textarea
              id="variables"
              value={formData.variables}
              onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
              placeholder="输入变量名，每行一个，例如：&#10;用户名&#10;任务类型&#10;输出格式"
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? '更新配置' : '创建配置'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

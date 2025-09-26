import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Plus } from 'lucide-react'
import { EmptyStateProps } from './types'

export default function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-600 mb-2">暂无配置</h3>
        <p className="text-slate-500 mb-6">点击"新建配置"开始创建你的第一个AI配置</p>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          创建配置
        </Button>
      </CardContent>
    </Card>
  )
}

import { Button } from '@/components/ui/button'
import { Plus, Settings, Users, FileText } from 'lucide-react'
import { ControlsProps } from './types'

export default function Controls({ 
  showForm, 
  onToggleForm, 
  onRefresh, 
  onNavigateToModelAdmin,
  onNavigateToUserAdmin,
  onNavigateToLlmLog
}: ControlsProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onToggleForm}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? '取消新建' : '新建配置'}
        </Button>
      </div>
      <Button variant="outline" onClick={onRefresh}>
        刷新数据
      </Button>
    </div>
  )
}

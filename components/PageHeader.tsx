import { PageHeaderProps } from './types'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function PageHeader({ title, description, onLogout }: PageHeaderProps) {
  return (
    <div className="mb-8 pb-6 border-b border-slate-200 bg-gradient-to-r from-blue-100 to-slate-50 rounded-b-2xl shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-blue-600 mb-2 tracking-wide">
            {title}
          </h1>
          <p className="text-slate-600 text-lg">
            {description}
          </p>
        </div>
        {onLogout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            登出
          </Button>
        )}
      </div>
    </div>
  )
}

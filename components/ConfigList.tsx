import ConfigCard from './ConfigCard'
import EmptyState from './EmptyState'
import { ConfigListProps } from './types'

export default function ConfigList({
  configs,
  onEdit,
  onDelete,
  showVariables,
  showSystemPrompt,
  copiedId,
  onToggleVariables,
  onToggleSystemPrompt,
  onCopyToClipboard,
  onCreateNew
}: ConfigListProps) {
  if (!configs || configs.length === 0) {
    return <EmptyState onCreateNew={onCreateNew} />
  }

  return (
    <div className="space-y-6">
      {configs.map(config => (
        <ConfigCard
          key={config.id}
          config={config}
          onEdit={onEdit}
          onDelete={onDelete}
          showVariables={showVariables}
          showSystemPrompt={showSystemPrompt}
          copiedId={copiedId}
          onToggleVariables={onToggleVariables}
          onToggleSystemPrompt={onToggleSystemPrompt}
          onCopyToClipboard={onCopyToClipboard}
        />
      ))}
    </div>
  )
}

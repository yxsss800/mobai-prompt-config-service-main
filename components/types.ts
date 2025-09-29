export interface Config {
  id: string
  name: string
  model: string
  systemPrompt: string
  userPrompt: string
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface Model {
  id: string
  name: string
  url: string
  enabled: boolean
}

export interface FormData {
  name: string
  model: string
  systemPrompt: string
  userPrompt: string
  variables: string
}

export interface ConfigFormProps {
  formData: FormData
  setFormData: (data: FormData) => void
  models: Model[]
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isEditing?: boolean
}

export interface ConfigCardProps {
  config: Config
  onEdit: (config: Config) => void
  onDelete: (id: string) => void
  showVariables: { [key: string]: boolean }
  showSystemPrompt: { [key: string]: boolean }
  copiedId: string | null
  onToggleVariables: (id: string) => void
  onToggleSystemPrompt: (id: string) => void
  onCopyToClipboard: (text: string, id: string) => void
  onReadAloud: (config: Config) => void;        //TTS
}

export interface ConfigListProps {
  configs: Config[]
  onEdit: (config: Config) => void
  onDelete: (id: string) => void
  showVariables: { [key: string]: boolean }
  showSystemPrompt: { [key: string]: boolean }
  copiedId: string | null
  onToggleVariables: (id: string) => void
  onToggleSystemPrompt: (id: string) => void
  onCopyToClipboard: (text: string, id: string) => void
  onCreateNew: () => void
  onReadAloud: (config: Config) => void;        //TTS
}

export interface PageHeaderProps {
  title: string
  description: string
  onLogout?: () => void
}

export interface ControlsProps {
  showForm: boolean
  onToggleForm: () => void
  onRefresh: () => void
  onNavigateToModelAdmin: () => void
  onNavigateToUserAdmin: () => void
  onNavigateToLlmLog: () => void
}

export interface LoadingSpinnerProps {
  message?: string
}

export interface EmptyStateProps {
  onCreateNew: () => void
}

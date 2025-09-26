# 组件架构说明

## 组件拆分概述

根据业务逻辑，我们将原来的单体页面组件拆分成了以下独立的组件：

### 1. 基础组件

#### `PageHeader`
- **功能**: 页面标题和描述
- **Props**: `title`, `description`
- **用途**: 统一的页面头部展示

#### `LoadingSpinner`
- **功能**: 加载状态展示
- **Props**: `message` (可选)
- **用途**: 数据加载时的等待状态

#### `EmptyState`
- **功能**: 空状态展示
- **Props**: `onCreateNew`
- **用途**: 当没有配置数据时的引导界面

### 2. 控制组件

#### `Controls`
- **功能**: 页面操作按钮
- **Props**: `showForm`, `onToggleForm`, `onRefresh`, `onNavigateToModelAdmin`
- **用途**: 新建配置、模型管理、刷新数据等操作

### 3. 表单组件

#### `ConfigForm`
- **功能**: 配置创建/编辑表单
- **Props**: `formData`, `setFormData`, `models`, `onSubmit`, `onCancel`, `isEditing`
- **用途**: 新建配置时的表单展示

#### `EditConfigModal`
- **功能**: 编辑配置的模态框
- **Props**: 继承自 `ConfigForm`，额外包含 `isOpen`, `onClose`
- **用途**: 编辑现有配置时的模态框展示

### 4. 列表组件

#### `ConfigList`
- **功能**: 配置列表容器
- **Props**: `configs`, 各种事件处理函数
- **用途**: 管理配置列表的展示和交互

#### `ConfigCard`
- **功能**: 单个配置卡片
- **Props**: `config`, 各种事件处理函数
- **用途**: 展示单个配置的详细信息

### 5. 类型定义

#### `types.ts`
- **功能**: 统一的类型定义
- **包含**: `Config`, `Model`, `FormData`, 各组件Props接口
- **用途**: 确保类型安全和代码复用

## 组件层次结构

```
HomePage (主页面)
├── PageHeader (页面头部)
├── Controls (控制按钮)
├── ConfigForm (新建表单)
├── ConfigList (配置列表)
│   ├── EmptyState (空状态)
│   └── ConfigCard (配置卡片) × N
└── EditConfigModal (编辑模态框)
```

## 优势

1. **可维护性**: 每个组件职责单一，易于维护和修改
2. **可复用性**: 组件可以在其他页面中复用
3. **可测试性**: 每个组件可以独立测试
4. **类型安全**: 统一的类型定义确保类型安全
5. **响应式设计**: 所有组件都支持PC和移动端

## 使用方式

```tsx
import { 
  PageHeader, 
  Controls, 
  ConfigForm, 
  ConfigList,
  EditConfigModal,
  LoadingSpinner,
  EmptyState,
  Config,
  Model,
  FormData 
} from '@/components'
```

## 注意事项

- 所有组件都使用 TypeScript 进行类型约束
- 组件遵循 React 函数式组件的最佳实践
- 使用 shadcn/ui 作为基础UI组件库
- 支持响应式设计，适配PC和移动端

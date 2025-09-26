
## 概述

本项目支持在 Vercel 上部署，同时保持本地开发环境的兼容性。

## 部署步骤

### 1. 准备数据库

确保你的 MySQL 数据库可以通过公网访问，或者使用云数据库服务（如 PlanetScale、Railway 等）。

### 2. 在 Vercel 中设置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 数据库配置
DATABASE_URL="mysql://username:password@host:port/database"
DIRECT_URL="mysql://username:password@host:port/database"

# 服务配置
NODE_ENV=production
VERCEL=1
CORS_ORIGIN="*"

# 安全配置
SESSION_SECRET="your-session-secret-here"
```

### 3. 部署到 Vercel

#### 方法1: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

#### 方法2: 通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 Vercel 中导入 GitHub 仓库
3. 配置环境变量
4. 自动部署

### 4. 数据库迁移

部署后，需要运行数据库迁移：

```bash
# 在 Vercel 函数中运行
vercel env pull .env.local
npx prisma db push
```

## 项目结构

```
config-service/
├── src/
│   ├── app.ts              # 主应用文件（支持 Vercel）
│   ├── routes/             # API 路由
│   ├── services/           # 业务逻辑
│   ├── middleware/         # 中间件
│   └── utils/              # 工具函数
├── public/                 # 静态文件
├── prisma/                 # 数据库配置
├── vercel.json            # Vercel 配置
└── package.json           # 项目配置
```

## 配置说明

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/app.ts",
      "use": "@vercel/node"
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/app.ts"
    },
    {
      "src": "/public/(.*)",
      "dest": "/public/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/index.html"
    }
  ]
}
```

### 环境变量

- `DATABASE_URL`: MySQL 数据库连接字符串
- `DIRECT_URL`: 直接数据库连接（用于 Prisma 连接池）
- `VERCEL`: 标识 Vercel 环境
- `CORS_ORIGIN`: CORS 配置
- `SESSION_SECRET`: 会话密钥

## 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npm run db:generate

# 启动开发服务器
npm run dev
```

## 生产部署

```bash
# 构建项目
npm run vercel-build

# 部署到 Vercel
vercel --prod
```

## 注意事项

1. **数据库连接**: Vercel 使用无状态函数，每次请求都会重新连接数据库
2. **连接池**: 使用 `DIRECT_URL` 配置直接连接，避免连接池问题
3. **静态文件**: 静态文件通过 `@vercel/static` 处理
4. **API 路由**: 所有 `/api/*` 请求路由到 `src/app.ts`
5. **环境检测**: 代码会自动检测 Vercel 环境并调整配置

## 故障排除

### 404 错误

- 检查 `vercel.json` 路由配置
- 确保静态文件路径正确
- 验证 API 路由前缀

### 数据库连接错误

- 检查 `DATABASE_URL` 和 `DIRECT_URL` 环境变量
- 确保数据库可以从 Vercel 访问
- 验证数据库用户权限

### 构建错误

- 检查 TypeScript 编译错误
- 确保所有依赖都已安装
- 验证 Prisma 配置

## 性能优化

1. **数据库连接**: 使用连接池优化
2. **缓存**: 考虑添加 Redis 缓存
3. **CDN**: 静态文件通过 Vercel CDN 加速
4. **函数优化**: 合理设置函数超时时间

## 监控和日志

- 使用 Vercel 内置的监控功能
- 查看函数执行日志
- 监控数据库连接状态
- 设置错误告警 
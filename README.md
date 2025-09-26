# 配置管理服务

一个基于Node.js的配置管理服务，提供动态配置和提示词管理功能。

## 功能特性

- 🔧 动态配置管理
- 🤖 AI模型配置
- 📝 提示词模板管理
- 🔐 安全认证
- 📊 使用统计
- 🎨 现代化Web界面

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- PM2 (用于生产环境)

### 安装依赖

```bash
npm install
```

### 环境配置

复制环境变量文件并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 数据库初始化

```bash
npm run db:generate
npm run db:push
```

### 开发环境运行

```bash
npm run dev
```

### 生产环境部署

#### 方法一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 部署到开发环境
./deploy.sh dev

# 部署到生产环境
./deploy.sh prod

# 查看服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 监控服务
./deploy.sh monitor

# 停止服务
./deploy.sh stop

# 删除服务
./deploy.sh delete
```

#### 方法二：使用PM2命令

```bash
# 构建项目
npm run build

# 启动服务（开发环境）
npm run pm2:start

# 启动服务（生产环境）
npm run pm2:start:prod

# 重启服务
npm run pm2:restart

# 重载服务
npm run pm2:reload

# 查看日志
npm run pm2:logs

# 监控服务
npm run pm2:monit

# 停止服务
npm run pm2:stop

# 删除服务
npm run pm2:delete
```

#### 方法三：手动部署

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 数据库迁移
npm run db:generate
npm run db:push

# 4. 启动服务
npm start
```

## 服务访问

- **Web界面**: http://localhost:3001
- **API文档**: http://localhost:3001/api/v1
- **健康检查**: http://localhost:3001/health

## API接口

### 配置管理
- `GET /api/v1/config` - 获取配置列表
- `POST /api/v1/config` - 创建配置
- `GET /api/v1/config/:key` - 获取配置详情
- `PUT /api/v1/config/:key` - 更新配置
- `DELETE /api/v1/config/:key` - 删除配置

### AI配置管理
- `GET /api/v1/ai-config` - 获取AI配置列表
- `POST /api/v1/ai-config` - 创建AI配置
- `GET /api/v1/ai-config/:key` - 获取AI配置详情
- `PUT /api/v1/ai-config/:key` - 更新AI配置
- `DELETE /api/v1/ai-config/:key` - 删除AI配置

### 模型管理
- `GET /api/v1/aimodel/list` - 获取模型列表
- `POST /api/v1/aimodel` - 创建模型
- `PUT /api/v1/aimodel/:id` - 更新模型
- `DELETE /api/v1/aimodel/:id` - 删除模型

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | 3001 |
| `NODE_ENV` | 运行环境 | development |
| `DATABASE_URL` | 数据库连接URL | - |
| `CORS_ORIGIN` | CORS允许的源 | http://localhost:3000 |
| `API_PREFIX` | API前缀 | /api/v1 |
| `LOG_LEVEL` | 日志级别 | info |
| `REDIS_URL` | Redis连接URL | - |

## 生产环境部署

### 1. 服务器准备

确保服务器已安装：
- Node.js >= 16.0.0
- MySQL >= 8.0
- PM2

```bash
# 安装PM2
npm install -g pm2
```

### 2. 项目部署

```bash
# 克隆项目
git clone <your-repo-url>
cd config-service

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，配置生产环境参数

# 使用部署脚本
./deploy.sh prod
```

### 3. 服务管理

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs config-service

# 监控服务
pm2 monit

# 重启服务
pm2 restart config-service

# 停止服务
pm2 stop config-service

# 删除服务
pm2 delete config-service
```

### 4. 开机自启

```bash
# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

## 监控和维护

### 日志管理

日志文件位置：
- 应用日志: `logs/app.log`
- 错误日志: `logs/error.log`
- 访问日志: `logs/access.log`

### 性能监控

使用PM2监控：
```bash
pm2 monit
```

### 健康检查

访问 `/health` 端点检查服务状态。

## 故障排除

### 常见问题

1. **服务启动失败**
   - 检查数据库连接
   - 检查端口是否被占用
   - 查看错误日志

2. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证连接字符串
   - 检查数据库权限

3. **PM2相关问题**
   - 检查PM2进程状态
   - 查看PM2日志
   - 重启PM2服务

### 日志查看

```bash
# 查看应用日志
tail -f logs/app.log

# 查看PM2日志
pm2 logs config-service

# 查看错误日志
tail -f logs/error.log
```

## 开发指南

### 项目结构

```
config-service/
├── src/                    # 源代码
│   ├── routes/            # 路由文件
│   ├── services/          # 服务层
│   ├── types/             # 类型定义
│   └── utils/             # 工具函数
├── public/                # 静态文件
├── prisma/                # 数据库schema
├── logs/                  # 日志文件
├── dist/                  # 构建输出
└── docs/                  # 文档
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 代码检查
npm run lint

# 数据库操作
npm run db:generate    # 生成Prisma客户端
npm run db:push        # 推送数据库schema
npm run db:migrate     # 执行数据库迁移
npm run db:studio      # 打开Prisma Studio
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！ 
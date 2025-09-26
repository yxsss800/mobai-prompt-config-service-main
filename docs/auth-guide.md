# 登录校验功能使用指南

## 概述

配置管理服务已集成登录校验功能，支持以下特性：

- **SDK调用无需认证**：通过SDK客户端调用API时自动跳过认证
- **浏览器访问需要认证**：通过浏览器访问管理界面时需要登录
- **硬编码凭据**：用户名 `MOBAI`，密码 `gogogo`
- **Cookie认证**：使用HTTP-only Cookie进行会话管理

## 功能特性

### 1. 智能认证识别

系统会自动识别请求来源：

- **SDK调用**：通过以下标识识别
  - User-Agent 包含 `ConfigServiceClient`
  - 请求头包含 `X-SDK-Call: true`
  - 请求头包含 `X-Client-Type: sdk`

- **浏览器访问**：需要有效的认证Cookie

### 2. 认证流程

```
浏览器访问 → 检查Cookie → 未登录 → 重定向到登录页面
                    ↓
                已登录 → 允许访问

SDK调用 → 检查标识 → 自动通过 → 允许访问
```

## API接口

### 认证相关接口

#### 1. 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "MOBAI",
  "password": "gogogo"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "username": "MOBAI",
    "isAuthenticated": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. 用户登出
```http
POST /api/v1/auth/logout
```

#### 3. 检查登录状态
```http
GET /api/v1/auth/status
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "username": "MOBAI"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 4. 获取当前用户信息
```http
GET /api/v1/auth/me
```

## 使用方式

### 1. 浏览器访问

1. **访问登录页面**：`http://localhost:3001/login`
2. **输入凭据**：
   - 用户名：`MOBAI`
   - 密码：`gogogo`
3. **登录成功后自动跳转**到主页面

### 2. SDK调用

SDK客户端会自动添加必要的请求头，无需额外配置：

```javascript
import { ConfigService } from './sdk/config-client';

// 直接调用，无需认证
const config = await ConfigService.getConfig('my-config');
const result = await ConfigService.call('my-config', { variable: 'value' });
```

### 3. 前端集成

在HTML页面中引入认证脚本：

```html
<script src="/auth.js"></script>
```

认证脚本会自动：
- 检查登录状态
- 处理认证错误
- 重定向到登录页面

## 安全说明

### 1. Cookie安全

- **HttpOnly**：防止XSS攻击
- **Secure**：生产环境使用HTTPS
- **SameSite**：防止CSRF攻击
- **过期时间**：7天自动过期

### 2. 认证机制

- 使用简单的token验证（生产环境建议使用JWT）
- SDK调用通过请求头标识，避免伪造
- 浏览器访问通过Cookie验证

## 测试

### 1. 运行测试脚本

```bash
node test-auth.js
```

### 2. 手动测试

1. **启动服务器**：`npm run dev`
2. **访问登录页面**：`http://localhost:3001/login`
3. **测试SDK调用**：使用SDK客户端调用API
4. **测试浏览器访问**：直接访问API接口

## 配置说明

### 1. 环境变量

```bash
# 认证相关配置
NODE_ENV=development  # 生产环境会自动启用Secure Cookie
```

### 2. 硬编码凭据

当前凭据硬编码在 `src/middleware/auth.ts` 中：

```typescript
const VALID_USERNAME = 'MOBAI';
const VALID_PASSWORD = 'gogogo';
```

## 故障排除

### 1. 登录失败

- 检查用户名和密码是否正确
- 确认服务器正在运行
- 检查网络连接

### 2. SDK调用失败

- 确认SDK版本是最新的
- 检查请求头是否正确设置
- 查看服务器日志

### 3. Cookie问题

- 清除浏览器Cookie
- 检查浏览器设置
- 确认域名配置正确

## 扩展建议

### 1. 生产环境改进

- 使用JWT替代简单token
- 实现用户数据库
- 添加密码加密
- 实现多用户支持

### 2. 安全增强

- 添加请求频率限制
- 实现IP白名单
- 添加审计日志
- 实现会话管理

## 相关文件

- `src/middleware/auth.ts` - 认证中间件
- `src/routes/authRoutes.ts` - 认证路由
- `public/login.html` - 登录页面
- `public/auth.js` - 前端认证脚本
- `sdk/config-client.ts` - SDK客户端
- `test-auth.js` - 测试脚本 
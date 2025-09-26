#!/bin/bash

# 更新环境变量配置脚本

echo "请输入MySQL用户名:"
read DB_USER

echo "请输入MySQL密码:"
read -s DB_PASSWORD

echo "请输入MySQL主机地址 (默认: localhost):"
read DB_HOST
DB_HOST=${DB_HOST:-localhost}

echo "请输入MySQL端口 (默认: 3306):"
read DB_PORT
DB_PORT=${DB_PORT:-3306}

echo "请输入数据库名称 (默认: config_service):"
read DB_NAME
DB_NAME=${DB_NAME:-config_service}

# 创建新的.env文件
cat > .env << EOF
# 生产环境配置
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# CORS配置
CORS_ORIGIN=https://mob.greenpencil.top

# API配置
API_PREFIX=/api/v1

# 日志配置
LOG_LEVEL=info

# Redis配置（可选）
REDIS_URL=redis://localhost:6379

# 域名配置
DOMAIN=mob.greenpencil.top
BASE_URL=https://mob.greenpencil.top
EOF

echo "环境变量配置已更新！"
echo "数据库连接字符串: mysql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}" 
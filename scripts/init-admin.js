const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function initAdmin() {
  try {
    // 检查是否已存在管理员用户
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.username)
      return
    }

    // 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        name: '系统管理员',
        role: 'admin',
        isActive: true
      }
    })

    console.log('管理员用户创建成功:')
    console.log('用户名: admin')
    console.log('密码: admin123')
    console.log('邮箱:', admin.email)
  } catch (error) {
    console.error('创建管理员用户失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initAdmin()

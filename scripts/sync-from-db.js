const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncFromMainProgramDB() {
  try {
    // 主程序数据库文件路径（请根据实际情况修改）
    const mainProgramDbPath = '/path/to/main-program/database.db';
    
    if (!fs.existsSync(mainProgramDbPath)) {
      console.log('主程序数据库文件不存在，请检查路径:', mainProgramDbPath);
      return;
    }

    // 备份当前数据库
    const currentDbPath = './prisma/dev.db';
    const backupPath = `./prisma/dev.db.backup.${Date.now()}`;
    
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, backupPath);
      console.log('已备份当前数据库到:', backupPath);
    }

    // 复制主程序数据库
    fs.copyFileSync(mainProgramDbPath, currentDbPath);
    console.log('已复制主程序数据库到本地');

    // 重新生成Prisma客户端
    console.log('请运行: npx prisma generate');
    
  } catch (error) {
    console.error('同步失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncFromMainProgramDB();

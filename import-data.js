const { PrismaClient } = require('@prisma/client')
const mysql = require('mysql2/promise')

const prisma = new PrismaClient()

async function importData() {
  let sourceDb = null
  try {
    console.log('🚀 开始导入数据...')
    
    // 连接源数据库
    sourceDb = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'wang1042',
      database: 'xiuxianv2'
    })
    console.log('✅ 源数据库连接成功')
    
    // 获取所有 dictionary 记录
    const [rows] = await sourceDb.execute('SELECT * FROM dictionary')
    console.log(`📊 找到 ${rows.length} 条记录`)
    
    // 获取所有唯一的模型名称
    const modelNames = [...new Set(rows.map(row => row.modelName).filter(name => name))]
    console.log(`🤖 发现 ${modelNames.length} 个模型: ${modelNames.join(', ')}`)
    
    // 创建 AI 模型记录
    const modelMap = new Map()
    for (const modelName of modelNames) {
      const existingModel = await prisma.aIModel.findFirst({
        where: { name: modelName }
      })
      
      if (!existingModel) {
        const newModel = await prisma.aIModel.create({
          data: {
            name: modelName,
            apiUrl: `https://api.example.com/${modelName.toLowerCase()}`,
            apiKey: 'your-api-key-here',
            isActive: true
          }
        })
        modelMap.set(modelName, newModel.id)
        console.log(`✅ 创建模型: ${modelName} (ID: ${newModel.id})`)
      } else {
        modelMap.set(modelName, existingModel.id)
        console.log(`ℹ️  模型已存在: ${modelName} (ID: ${existingModel.id})`)
      }
    }
    
    // 导入配置记录
    let importedCount = 0
    let skippedCount = 0
    
    for (const row of rows) {
      try {
        // 检查是否已存在同名配置
        const existingConfig = await prisma.aIConfig.findFirst({
          where: { name: row.key }
        })
        
        if (existingConfig) {
          console.log(`⏭️  跳过已存在的配置: ${row.key}`)
          skippedCount++
          continue
        }
        
        // 获取模型ID
        const modelId = modelMap.get(row.modelName) || modelMap.values().next().value
        
        // 创建配置记录
        const newConfig = await prisma.aIConfig.create({
          data: {
            name: row.key,
            modelId: modelId,
            systemPrompt: row.value,
            userPrompt: '{{USER_INPUT}}',
            inputParams: null,
            params: {
              temperature: 0.7,
              max_tokens: 2000
            },
            streaming: false,
            thinking: row.enableThinking === 1,
            outputStructure: null,
            description: `从 xiuxianv2.dictionary 导入的配置: ${row.key}`,
            category: 'imported-config',
            isActive: true,
            version: 1
          }
        })
        
        console.log(`✅ 导入配置: ${row.key} (ID: ${newConfig.id})`)
        importedCount++
        
      } catch (error) {
        console.error(`❌ 导入配置失败 ${row.key}:`, error.message)
      }
    }
    
    console.log('\n📈 导入统计:')
    console.log(`✅ 成功导入: ${importedCount} 条配置`)
    console.log(`⏭️  跳过重复: ${skippedCount} 条配置`)
    console.log(`🤖 处理模型: ${modelNames.length} 个`)
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error)
  } finally {
    if (sourceDb) {
      await sourceDb.end()
    }
    await prisma.$disconnect()
    console.log('🔚 导入完成')
  }
}

importData()

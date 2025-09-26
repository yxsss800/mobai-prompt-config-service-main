# AI配置管理服务集成指南

## 概述

AI配置管理服务提供了一个统一的SDK，让其他服务可以简单地调用AI功能，而无需重复编写提示词和配置。

## 快速开始

### 1. 安装SDK

```bash
# 复制SDK文件到您的项目中
cp sdk/config-client.js your-project/
```

### 2. 基本使用

```javascript
const ConfigServiceClient = require('./config-client.js');

// 创建客户端实例
const client = new ConfigServiceClient('http://localhost:3001');

// 最简单的调用方式
async function generateText() {
    try {
        const result = await client.simpleCall('文本生成', {
            task: '写一篇关于AI的文章',
            requirements: '字数300字，通俗易懂',
            format: 'markdown'
        });
        
        console.log('生成结果:', result);
        return result;
    } catch (error) {
        console.error('调用失败:', error.message);
    }
}
```

## API参考

### 核心方法

#### `simpleCall(configName, variables)`
最简单的调用方式，使用配置中的默认提示词。

**参数：**
- `configName` (string): 配置名称
- `variables` (object): 变量参数，用于替换提示词中的插值表达式

**示例：**
```javascript
const result = await client.simpleCall('产品描述生成', {
    productName: '智能手表',
    category: '电子产品',
    features: '心率监测、GPS定位、防水设计',
    targetAudience: '运动爱好者'
});
```

#### `customCall(configName, customPrompt, variables)`
使用自定义提示词调用AI。

**参数：**
- `configName` (string): 配置名称
- `customPrompt` (string): 自定义提示词
- `variables` (object): 变量参数

**示例：**
```javascript
const result = await client.customCall('文本生成',
    '请帮我写一首关于{theme}的诗，风格：{style}',
    {
        theme: '春天',
        style: '五言绝句'
    }
);
```

#### `callAI(configName, variables, customPrompt)`
完整的AI调用方法，支持所有功能。

**参数：**
- `configName` (string): 配置名称
- `variables` (object): 变量参数
- `customPrompt` (string, 可选): 自定义提示词

### 配置管理方法

#### `getAllConfigs()`
获取所有AI配置。

#### `getConfig(name)`
根据名称获取特定配置。

#### `createConfig(configData)`
创建新配置。

#### `updateConfig(name, configData)`
更新配置。

#### `deleteConfig(name)`
删除配置。

#### `toggleConfig(name, isActive)`
启用/禁用配置。

## 使用场景

### 1. 在Express应用中使用

```javascript
const express = require('express');
const ConfigServiceClient = require('./config-client.js');

const app = express();
const client = new ConfigServiceClient();

app.use(express.json());

// AI生成接口
app.post('/ai/generate', async (req, res) => {
    try {
        const { configName, variables } = req.body;
        const result = await client.callAI(configName, variables);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log('服务启动在端口3000');
});
```

### 2. 在业务服务中使用

```javascript
class BusinessService {
    constructor() {
        this.configClient = new ConfigServiceClient();
    }
    
    // 生成产品描述
    async generateProductDescription(productInfo) {
        return await this.configClient.simpleCall('产品描述生成', {
            productName: productInfo.name,
            category: productInfo.category,
            features: productInfo.features.join(', '),
            targetAudience: productInfo.targetAudience
        });
    }
    
    // 生成客服回复
    async generateCustomerServiceReply(customerQuery) {
        return await this.configClient.simpleCall('客服回复生成', {
            customerQuestion: customerQuery.question,
            productContext: customerQuery.productContext,
            tone: customerQuery.tone || '友好'
        });
    }
    
    // 生成营销文案
    async generateMarketingCopy(campaignInfo) {
        return await this.configClient.customCall('营销文案生成',
            '为{product}创建一个{platform}平台的营销文案，目标受众：{audience}，重点突出：{highlights}',
            {
                product: campaignInfo.product,
                platform: campaignInfo.platform,
                audience: campaignInfo.audience,
                highlights: campaignInfo.highlights.join('、')
            }
        );
    }
}
```

### 3. 在Python项目中使用

```python
import requests
import json

class ConfigServiceClient:
    def __init__(self, base_url="http://localhost:3001"):
        self.base_url = base_url
        self.api_prefix = "/api/v1"
    
    def get_config(self, name):
        response = requests.get(f"{self.base_url}{self.api_prefix}/ai-config/{name}")
        data = response.json()
        
        if not data['success']:
            raise Exception(data.get('error', '获取配置失败'))
        
        return data['data']
    
    def call_ai(self, config_name, variables=None):
        if variables is None:
            variables = {}
        
        # 获取配置
        config = self.get_config(config_name)
        
        # 渲染用户提示词
        user_prompt = config['userPrompt']
        for key, value in variables.items():
            user_prompt = user_prompt.replace(f"{{{key}}}", str(value))
        
        # 获取模型信息
        model_response = requests.get(f"{self.base_url}{self.api_prefix}/aimodel/{config['modelId']}")
        model_data = model_response.json()
        model = model_data['data']
        
        # 调用AI API
        headers = {
            'Authorization': f"Bearer {model['apiKey']}",
            'Content-Type': 'application/json'
        }
        
        body = {
            'model': model['name'],
            'messages': [
                {'role': 'system', 'content': config['systemPrompt']},
                {'role': 'user', 'content': user_prompt}
            ],
            **(config.get('params', {}))
        }
        
        response = requests.post(model['apiUrl'], headers=headers, json=body)
        return response.json()

# 使用示例
client = ConfigServiceClient()

# 调用AI
result = client.call_ai('文本生成', {
    'task': '写一篇短文',
    'requirements': '关于环保的200字短文',
    'format': '记叙文'
})

print(result)
```

## 配置说明

### 创建配置

在配置管理界面中，您需要创建AI配置，包含以下信息：

1. **配置名称**: 用于标识此配置的唯一名称
2. **模型**: 选择要使用的AI模型
3. **系统提示词**: 定义AI助手的角色和行为
4. **用户提示词模板**: 使用插值表达式定义动态参数，如 `{task}`、`{requirements}`
5. **输入变量**: 定义提示词模板中需要的变量类型和说明
6. **模型参数**: 设置temperature、max_tokens等参数
7. **其他选项**: 流式输出、思考过程等

### 变量替换

在用户提示词模板中，使用 `{变量名}` 的格式定义动态参数：

```
请帮我{task}，要求：{requirements}，输出格式：{format}
```

调用时传入对应的变量值：

```javascript
const result = await client.simpleCall('文本生成', {
    task: '写一篇关于AI的文章',
    requirements: '字数300字，通俗易懂',
    format: 'markdown'
});
```

## 最佳实践

### 1. 配置命名
- 使用描述性的名称，如 `产品描述生成`、`客服回复生成`
- 按功能分类，便于管理和查找

### 2. 提示词设计
- 系统提示词要明确AI的角色和任务
- 用户提示词模板要灵活，支持多种场景
- 使用清晰的变量名，便于理解和使用

### 3. 错误处理
```javascript
try {
    const result = await client.simpleCall('配置名称', variables);
    // 处理成功结果
} catch (error) {
    console.error('AI调用失败:', error.message);
    // 处理错误，如重试、降级等
}
```

### 4. 性能优化
- 对于频繁调用的配置，可以考虑缓存配置信息
- 使用流式输出处理长文本生成
- 合理设置超时时间

## 故障排除

### 常见问题

1. **配置不存在**
   - 检查配置名称是否正确
   - 确认配置是否已启用

2. **变量替换失败**
   - 检查变量名是否与提示词模板中的占位符一致
   - 确认变量值不为空

3. **模型调用失败**
   - 检查模型配置是否正确
   - 确认API密钥是否有效
   - 检查网络连接

4. **服务连接失败**
   - 确认配置管理服务是否正常运行
   - 检查服务地址和端口是否正确

### 调试技巧

```javascript
// 启用详细日志
const client = new ConfigServiceClient('http://localhost:3001');

// 检查服务状态
const health = await client.healthCheck();
console.log('服务状态:', health);

// 获取配置详情
const config = await client.getConfig('配置名称');
console.log('配置详情:', config);
```

## 总结

通过使用AI配置管理服务的SDK，您可以：

1. **简化AI调用**: 只需要提供配置名称和变量参数
2. **统一管理**: 所有AI配置集中管理，便于维护
3. **灵活扩展**: 支持自定义提示词和多种调用方式
4. **多语言支持**: 提供JavaScript和Python等多种语言的SDK

这样，您的其他服务就可以非常简单地集成AI功能，而无需重复编写提示词和配置代码。 
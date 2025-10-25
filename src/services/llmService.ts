// LLM服务 - 阿里云百炼API集成
import { TripGenerationRequest, TripGenerationResponse } from '../types/database'

class LLMService {
  private apiKey: string = ''
  private baseUrl: string
  private modelName: string
  private apiType: 'aliyun' | 'openai'
  private useProxy: boolean

  constructor() {
    // 在构造函数中安全地访问环境变量
    let envBaseUrl = ''
    let envModelName = ''
    let envUseProxy = false
    
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envBaseUrl = import.meta.env.VITE_LLM_BASE_URL || ''
      envModelName = import.meta.env.VITE_LLM_MODEL || ''
      envUseProxy = import.meta.env.VITE_USE_PROXY === 'true'
    }
    
    this.baseUrl = envBaseUrl || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
    this.modelName = envModelName || 'qwen-plus'
    this.apiType = 'aliyun'
    this.useProxy = envUseProxy
  }

  // 设置API Key
  setApiKey(apiKey: string, config?: { baseUrl?: string; modelName?: string; apiType?: 'aliyun' | 'openai' | 'custom'; useProxy?: boolean }) {
    this.apiKey = apiKey
    
    // 应用配置参数
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl
    }
    if (config?.modelName) {
      this.modelName = config.modelName
    }
    if (config?.useProxy !== undefined) {
      this.useProxy = config.useProxy
    }
    
    // 自动检测API类型
    if (apiKey.startsWith('sk-') && apiKey.length === 51) {
      this.apiType = 'openai'
      if (!config?.baseUrl) {
        this.baseUrl = this.useProxy ? '/api/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'
      }
      if (!config?.modelName) {
        this.modelName = 'gpt-3.5-turbo'
      }
    } else {
      this.apiType = 'aliyun'
      if (!config?.baseUrl) {
        // 使用标准API端点
        this.baseUrl = this.useProxy ? '/api/bailian/api/v1/services/aigc/text-generation/generation' : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
      }
      if (!config?.modelName) {
        this.modelName = 'qwen-plus'
      }
    }
  }

  // 生成旅行计划
  async generateTripPlan(request: TripGenerationRequest): Promise<TripGenerationResponse> {
    // 如果没有配置API Key，使用模拟数据
    if (!this.apiKey) {
      console.log('未配置API Key，使用模拟数据')
      return this.generateMockTripPlan(request)
    }

    try {
      console.log('开始调用阿里云百炼API...')
      console.log('API Key:', this.apiKey.substring(0, 10) + '...')
      
      // 构建提示词
      const prompt = this.buildPrompt(request)
      console.log('构建的提示词:', prompt.substring(0, 200) + '...')
      
      // 调用阿里云百炼API
      const response = await this.callBailianAPI(prompt)
      console.log('API响应:', response.substring(0, 200) + '...')
      
      // 解析响应
      const parsedResponse = this.parseResponse(response)
      console.log('解析后的行程计划:', parsedResponse)
      
      return parsedResponse
    } catch (error) {
      console.error('LLM API调用失败:', error)
      console.log('使用模拟数据作为备选方案')
      return this.generateMockTripPlan(request)
    }
  }

  // 生成模拟旅行计划（用于测试）
  private generateMockTripPlan(request: TripGenerationRequest): TripGenerationResponse {
    const { destination, duration, budgetRange, travelStyle, travelers } = request
    
    // 根据预算范围计算总预算
    const baseBudget = budgetRange === 'budget' ? 2000 : budgetRange === 'comfort' ? 5000 : 10000
    const totalBudget = baseBudget * duration * travelers
    
    // 预算分解
    const budgetBreakdown = {
      flights: Math.round(totalBudget * 0.3),
      accommodation: Math.round(totalBudget * 0.25),
      food: Math.round(totalBudget * 0.2),
      transportation: Math.round(totalBudget * 0.1),
      activities: Math.round(totalBudget * 0.1),
      shopping: Math.round(totalBudget * 0.03),
      other: Math.round(totalBudget * 0.02)
    }

    // 生成每日计划
    const dailyPlan = []
    for (let day = 1; day <= duration; day++) {
      const themes = ['城市探索', '文化体验', '自然风光', '美食之旅', '休闲购物']
      const theme = themes[(day - 1) % themes.length]
      
      const activities = [
        {
          time: '09:00',
          name: '早餐',
          description: '享用当地特色早餐',
          location: undefined,
          type: 'FOOD' as const,
          cost: 50
        },
        {
          time: '10:00',
          name: `${destination}主要景点参观`,
          description: `探索${destination}的著名景点`,
          location: undefined,
          type: 'SIGHTSEEING' as const,
          cost: 100
        },
        {
          time: '12:30',
          name: '午餐',
          description: '品尝当地美食',
          location: undefined,
          type: 'FOOD' as const,
          cost: 80
        },
        {
          time: '14:00',
          name: `${theme}活动`,
          description: `参与${theme}相关的特色活动`,
          location: undefined,
          type: 'SIGHTSEEING' as const,
          cost: 150
        },
        {
          time: '18:00',
          name: '晚餐',
          description: '享受丰盛的晚餐',
          location: undefined,
          type: 'FOOD' as const,
          cost: 120
        },
        {
          time: '20:00',
          name: '夜游',
          description: '欣赏城市夜景',
          location: undefined,
          type: 'SIGHTSEEING' as const,
          cost: 60
        }
      ]

      dailyPlan.push({
        day,
        theme,
        activities
      })
    }

    return {
      tripSummary: {
        title: `${destination}${duration}日${travelStyle}之旅`,
        estimatedTotalCost: totalBudget,
        destination,
        duration,
        preferences: request.preferences || [],
        travelStyle: request.travelStyle,
        travelers: request.travelers,
        startDate: request.startDate,
        endDate: request.endDate,
        specialRequirements: request.specialRequirements
      },
      budgetBreakdown,
      dailyPlan
    }
  }

  // 构建提示词
  private buildPrompt(request: TripGenerationRequest): string {
    const { destination, duration, budgetRange, travelStyle, travelers, preferences, specialRequirements } = request

    return `你是一个专业的旅行规划师。请根据以下需求生成一个详细的旅行计划：

目的地：${destination}
旅行天数：${duration}天
预算范围：${budgetRange}
旅行风格：${travelStyle}
出行人数：${travelers}人
个人偏好：${preferences.join('、')}
特殊要求：${specialRequirements || '无'}

请生成一个结构化的旅行计划，包含以下内容：

1. 行程概览（标题、总预算估算）
2. 预算分解（交通、住宿、餐饮、景点、购物等）
3. 每日详细计划（按天组织，包含时间、活动、地点、类型）

请以JSON格式返回，结构如下：
{
  "tripSummary": {
    "title": "行程标题",
    "estimatedTotalCost": 总预算,
    "destination": "目的地",
    "duration": 天数
  },
  "budgetBreakdown": {
    "flights": 机票费用,
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "transportation": 当地交通费用,
    "activities": 活动费用,
    "shopping": 购物费用,
    "other": 其他费用
  },
  "dailyPlan": [
    {
      "day": 1,
      "theme": "当日主题",
      "activities": [
        {
          "time": "时间",
          "name": "活动名称",
          "description": "活动描述",
          "location": {
            "lat": 纬度,
            "lng": 经度
          },
          "type": "活动类型",
          "cost": 费用
        }
      ]
    }
  ]
}

请确保：
- 预算分配符合${budgetRange}预算范围
- 活动安排符合${travelStyle}旅行风格
- 包含${preferences.join('、')}相关活动
- 考虑${specialRequirements || '无特殊要求'}
- 地点信息尽可能准确
- 时间安排合理，不要过于紧凑`
  }

  // 调用LLM API
  private async callBailianAPI(prompt: string): Promise<any> {
    if (this.apiType === 'openai') {
      return await this.callOpenAIAPI(prompt)
    } else {
      return await this.callAliyunAPI(prompt)
    }
  }

  // 调用OpenAI API
  private async callOpenAIAPI(prompt: string): Promise<any> {
    // 兼容模式使用不同的请求格式
    const requestBody = this.apiType === 'openai' ? {
      model: this.modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的旅行规划师，擅长根据用户需求生成详细、实用的旅行计划。请始终以JSON格式返回结果。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    } : {
      model: this.modelName,
      input: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        result_format: 'text'
      }
    }

    console.log('发送API请求到:', this.baseUrl)
    console.log('请求体:', JSON.stringify(requestBody, null, 2))

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API请求失败详情:', errorText)
        
        if (response.status === 401) {
          throw new Error('API Key无效，请检查您的API Key配置')
        } else if (response.status === 403) {
          throw new Error('API Key权限不足，请检查您的API Key配置')
        } else if (response.status === 429) {
          throw new Error('API调用频率超限，请稍后重试')
        }
        
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API响应数据:', data)
      
      // 处理不同API的响应格式
      if (this.apiType === 'openai') {
        return data.choices[0].message.content
      } else {
        // 兼容模式响应
        return data.output?.text || data.choices?.[0]?.message?.content || data
      }
    } catch (error: any) {
      console.error('API网络请求错误:', error)
      throw error
    }
  }

  // 调用阿里云百炼API
  private async callAliyunAPI(prompt: string): Promise<any> {
    const requestBody = {
      model: this.modelName, // 使用配置的模型名称
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行规划师，擅长根据用户需求生成详细、实用的旅行计划。请始终以JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      parameters: {
        result_format: 'text' // 要求返回文本格式，我们会手动解析JSON
      }
    }

    console.log('发送阿里云百炼API请求到:', this.baseUrl)
    console.log('请求体:', JSON.stringify(requestBody, null, 2))

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
          // 禁用异步调用，因为用户API可能不支持
          // 'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify(requestBody),
        mode: 'cors' // 明确指定CORS模式
      })

      console.log('阿里云百炼API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('阿里云百炼API请求失败详情:', errorText)
        
        // 403错误通常是认证问题
        if (response.status === 403) {
          throw new Error('阿里云百炼API Key无效或权限不足，请检查您的API Key配置')
        }
        
        throw new Error(`阿里云百炼API请求失败: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('阿里云百炼API响应数据:', data)
      
      // 处理同步调用的响应格式
      if (data.output?.text) {
        return data.output.text
      } else if (data.output?.choices?.[0]?.message?.content) {
        return data.output.choices[0].message.content
      } else if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content
      } else {
        console.error('阿里云百炼API调用失败详情:', data)
        throw new Error(`阿里云百炼API调用失败: 未知响应格式 - ${data.message || '无错误信息'}`)
      }
    } catch (error: any) {
      console.error('阿里云百炼API网络请求错误:', error)
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('网络连接失败，请检查网络连接和代理设置')
      }
      throw error
    }
  }

  // 等待异步任务完成
  private async waitForAsyncTask(taskId: string): Promise<string> {
    const maxRetries = 10
    const retryDelay = 2000 // 2秒

    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      const statusResponse = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        
        if (statusData.output?.task_status === 'SUCCEEDED') {
          return statusData.output.choices[0].message.content
        } else if (statusData.output?.task_status === 'FAILED') {
          throw new Error('异步任务执行失败')
        }
        // 继续等待
      }
    }

    throw new Error('异步任务超时')
  }

  // 解析API响应
  private parseResponse(responseText: string): TripGenerationResponse {
    try {
      // 尝试从响应文本中提取JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('无法从响应中提取JSON数据')
      }

      const parsedData = JSON.parse(jsonMatch[0])
      
      // 验证必需字段
      if (!parsedData.tripSummary || !parsedData.dailyPlan) {
        throw new Error('响应数据格式不正确')
      }

      return this.normalizeResponse(parsedData)
    } catch (error) {
      console.error('解析LLM响应失败:', error)
      throw new Error('解析旅行计划数据失败，请重试')
    }
  }

  // 标准化响应数据
  private normalizeResponse(data: any): TripGenerationResponse {
    // 确保预算分解包含所有必需字段
    const budgetBreakdown = {
      flights: data.budgetBreakdown?.flights || 0,
      accommodation: data.budgetBreakdown?.accommodation || 0,
      food: data.budgetBreakdown?.food || 0,
      transportation: data.budgetBreakdown?.transportation || 0,
      activities: data.budgetBreakdown?.activities || 0,
      shopping: data.budgetBreakdown?.shopping || 0,
      other: data.budgetBreakdown?.other || 0
    }

    // 标准化每日计划
    const dailyPlan = data.dailyPlan.map((day: any) => ({
      day: day.day || day.day_number || 0,
      theme: day.theme || '当日活动',
      activities: (day.activities || []).map((activity: any) => ({
        time: activity.time || '00:00',
        name: activity.name || '活动',
        description: activity.description || '',
        location: activity.location || undefined,
        type: activity.type || 'OTHER',
        cost: activity.cost || 0
      }))
    }))

    return {
      tripSummary: {
        title: data.tripSummary?.title || '旅行计划',
        estimatedTotalCost: data.tripSummary?.estimatedTotalCost || 0,
        destination: data.tripSummary?.destination || '',
        duration: data.tripSummary?.duration || 0,
        preferences: data.tripSummary?.preferences || [],
        travelStyle: data.tripSummary?.travelStyle || '',
        travelers: data.tripSummary?.travelers || 1,
        startDate: data.tripSummary?.startDate,
        endDate: data.tripSummary?.endDate,
        specialRequirements: data.tripSummary?.specialRequirements
      },
      budgetBreakdown,
      dailyPlan
    }
  }

  // 自然语言解析（用于语音输入）
  async parseNaturalLanguage(text: string): Promise<Partial<TripGenerationRequest>> {
    const prompt = `请从以下文本中提取旅行规划的关键信息：

文本："${text}"

请提取以下信息：
- 目的地
- 旅行天数
- 预算范围（budget/comfort/luxury）
- 旅行风格（relaxation/adventure/cultural/food/shopping/nature/sightseeing/business）
- 同行人数
- 个人偏好

以JSON格式返回，结构如下：
{
  "destination": "目的地",
  "duration": 天数,
  "budgetRange": "预算范围",
  "travelStyle": "旅行风格",
  "travelers": 人数,
  "preferences": ["偏好1", "偏好2"]
}

如果某个信息不存在，请使用null或空数组。预算范围可选值：budget（经济型）、comfort（舒适型）、luxury（豪华型）。旅行风格可选值：relaxation（休闲度假）、adventure（冒险探索）、cultural（文化体验）、food（美食之旅）、shopping（购物之旅）、nature（自然风光）、sightseeing（城市观光）、business（商务出行）。`

    try {
      const response = await this.callBailianAPI(prompt)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('自然语言解析失败:', error)
    }

    return {}
  }
}

// 创建全局LLM服务实例
export const llmService = new LLMService()

// 初始化LLM服务（在应用启动时调用）
export const initializeLLMService = (apiKey: string, config?: { baseUrl?: string; modelName?: string; apiType?: 'aliyun' | 'openai' | 'custom'; useProxy?: boolean }) => {
  llmService.setApiKey(apiKey, config)
}
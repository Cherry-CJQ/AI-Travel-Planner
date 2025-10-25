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
        // 如果没有配置模型名称，使用环境变量中的默认值
        let envModelName = ''
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          envModelName = import.meta.env.VITE_LLM_MODEL || ''
        }
        this.modelName = envModelName || 'qwen-plus'
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
    const { destination, duration, budgetAmount, travelStyle, travelers } = request
    
    // 使用用户输入的预算金额作为总预算
    const totalBudget = budgetAmount
    
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
    const { destination, duration, budgetAmount, travelStyle, travelers, preferences, specialRequirements, startDate, endDate } = request

    let dateInfo = ''
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      dateInfo = `旅行日期：${start.toLocaleDateString('zh-CN')} 至 ${end.toLocaleDateString('zh-CN')}`
    }

    return `你是一个专业的旅行规划师。请根据以下需求生成一个简洁实用的旅行计划：

目的地：${destination}
旅行天数：${duration}天
预算金额：${budgetAmount}元
旅行风格：${travelStyle}
出行人数：${travelers}人
个人偏好：${preferences.join('、')}
特殊要求：${specialRequirements || '无'}
${dateInfo}

请生成一个结构化的旅行计划，包含以下内容：

1. 行程概览（标题、总预算估算）
2. 预算分解（交通、住宿、餐饮、景点、购物等）
3. 每日详细计划（按天组织，包含时间、活动、地点、类型）

${startDate && endDate ? '请根据旅行日期特点（如节假日、工作日、周末等）优化行程安排。' : ''}

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
          "cost": 费用,
          "notes": "备注信息"
        }
      ]
    }
  ]
}

重要要求：
1. 费用标注：每个活动必须标注具体费用，免费活动cost设为0
2. 预约要求：需要预约/购票/预定的活动在notes中标注
3. 预算控制：总费用控制在${budgetAmount}元以内
4. 风格匹配：活动安排符合${travelStyle}旅行风格
5. 偏好满足：包含${preferences.join('、')}相关活动
6. 时间合理：时间安排不要过于紧凑

请简洁明了地生成计划，避免过多细节描述。`
  }

  // 调用LLM API
  private async callBailianAPI(prompt: string): Promise<any> {
    console.log('调用LLM API，API类型:', this.apiType)
    console.log('API Key:', this.apiKey ? this.apiKey.substring(0, 10) + '...' : '未配置')
    
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

    console.log('阿里云API请求体:', JSON.stringify(requestBody, null, 2))

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
        cost: activity.cost || 0,
        notes: activity.notes || ''
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
    // 如果没有配置API Key，使用本地简单解析
    if (!this.apiKey) {
      console.log('未配置API Key，使用本地解析')
      return this.parseNaturalLanguageLocally(text)
    }

    const prompt = `请从以下中文文本中提取旅行规划的关键信息：

文本："${text}"

请仔细分析文本内容，提取以下信息：
- 目的地：城市或景点名称
- 旅行天数：数字，如"2天"提取为2
- 预算金额：数字，如"预算3000"提取为3000
- 旅行风格：根据描述判断，可选值：relaxation（休闲度假）、adventure（冒险探索）、cultural（文化体验）、food（美食之旅）、shopping（购物之旅）、nature（自然风光）、sightseeing（城市观光）、business（商务出行）
- 同行人数：数字，如"我和女朋友"提取为2，"一个人"提取为1
- 个人偏好：如"喜欢美食"、"打卡标志地点"等

特别注意：
- 如果提到"女朋友"、"男朋友"、"夫妻"等，人数通常为2
- 如果提到"一个人"、"独自"，人数为1
- 预算金额要提取具体数字
- 旅行天数要提取具体数字
- 个人偏好要提取为数组

以JSON格式返回，结构如下：
{
  "destination": "目的地",
  "duration": 天数,
  "budgetAmount": 预算金额,
  "travelStyle": "旅行风格",
  "travelers": 人数,
  "preferences": ["偏好1", "偏好2"]
}

如果某个信息不存在，请使用null或空数组。旅行风格可选值：relaxation（休闲度假）、adventure（冒险探索）、cultural（文化体验）、food（美食之旅）、shopping（购物之旅）、nature（自然风光）、sightseeing（城市观光）、business（商务出行）。

示例：
输入："我和女朋友想去上海玩2天，预算3000，喜欢美食，想要打卡一下上海的标志地点"
输出：{"destination": "上海", "duration": 2, "budgetAmount": 3000, "travelStyle": "sightseeing", "travelers": 2, "preferences": ["美食", "打卡标志地点"]}`

    try {
      console.log('开始解析自然语言输入:', text)
      console.log('API Key已配置，调用大模型解析')
      const response = await this.callBailianAPI(prompt)
      console.log('LLM解析响应:', response)
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0])
        console.log('解析后的数据:', parsedData)
        return parsedData
      } else {
        console.warn('无法从响应中提取JSON数据，响应内容:', response)
      }
    } catch (error) {
      console.error('自然语言解析失败:', error)
      console.log('使用本地解析作为备选方案')
      return this.parseNaturalLanguageLocally(text)
    }

    console.log('解析失败，使用本地解析')
    return this.parseNaturalLanguageLocally(text)
  }

  // 本地简单解析器
  private parseNaturalLanguageLocally(text: string): Partial<TripGenerationRequest> {
    console.log('使用本地解析器解析:', text)
    
    const result: Partial<TripGenerationRequest> = {}
    
    // 提取目的地（常见城市名称）
    const destinations = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '重庆', '西安', '武汉', '苏州', '厦门', '青岛', '大连', '天津', '长沙', '郑州', '沈阳', '昆明', '哈尔滨']
    for (const dest of destinations) {
      if (text.includes(dest)) {
        result.destination = dest
        break
      }
    }
    
    // 提取天数
    const dayMatch = text.match(/(\d+)\s*天/)
    if (dayMatch) {
      result.duration = parseInt(dayMatch[1])
    }
    
    // 提取预算金额
    const budgetMatch = text.match(/预算\s*(\d+)/) || text.match(/(\d+)\s*元/)
    if (budgetMatch) {
      result.budgetAmount = parseInt(budgetMatch[1])
    }
    
    // 提取人数
    if (text.includes('女朋友') || text.includes('男朋友') || text.includes('夫妻') || text.includes('情侣') || text.includes('我们')) {
      result.travelers = 2
    } else if (text.includes('一个人') || text.includes('独自') || text.includes('自己')) {
      result.travelers = 1
    }
    
    // 提取偏好
    const preferences: string[] = []
    if (text.includes('美食') || text.includes('吃') || text.includes('餐厅')) {
      preferences.push('美食')
    }
    if (text.includes('打卡') || text.includes('标志') || text.includes('景点') || text.includes('观光')) {
      preferences.push('打卡标志地点')
    }
    if (text.includes('购物') || text.includes('买')) {
      preferences.push('购物')
    }
    if (text.includes('文化') || text.includes('历史') || text.includes('博物馆')) {
      preferences.push('文化')
    }
    if (text.includes('自然') || text.includes('风景') || text.includes('公园')) {
      preferences.push('自然风光')
    }
    
    if (preferences.length > 0) {
      result.preferences = preferences
    }
    
    // 设置默认旅行风格
    if (text.includes('美食')) {
      result.travelStyle = 'food'
    } else if (text.includes('购物')) {
      result.travelStyle = 'shopping'
    } else if (text.includes('文化') || text.includes('历史')) {
      result.travelStyle = 'cultural'
    } else if (text.includes('自然') || text.includes('风景')) {
      result.travelStyle = 'nature'
    } else {
      result.travelStyle = 'sightseeing'
    }
    
    console.log('本地解析结果:', result)
    return result
  }
}

// 创建全局LLM服务实例
export const llmService = new LLMService()

// 初始化LLM服务（在应用启动时调用）
export const initializeLLMService = (apiKey: string, config?: { baseUrl?: string; modelName?: string; apiType?: 'aliyun' | 'openai' | 'custom'; useProxy?: boolean }) => {
  llmService.setApiKey(apiKey, config)
}
// LLM服务 - 阿里云百炼API集成
import { TripGenerationRequest, TripGenerationResponse } from '../types/database'

class LLMService {
  private apiKey: string = ''
  private baseUrl: string = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

  // 设置API Key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // 生成旅行计划
  async generateTripPlan(request: TripGenerationRequest): Promise<TripGenerationResponse> {
    if (!this.apiKey) {
      throw new Error('LLM API Key未配置，请在设置页面配置您的阿里云百炼API Key')
    }

    try {
      // 构建提示词
      const prompt = this.buildPrompt(request)
      
      // 调用阿里云百炼API
      const response = await this.callBailianAPI(prompt)
      
      // 解析响应
      return this.parseResponse(response)
    } catch (error) {
      console.error('LLM API调用失败:', error)
      throw new Error('生成旅行计划失败，请检查网络连接和API配置')
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

  // 调用阿里云百炼API
  private async callBailianAPI(prompt: string): Promise<any> {
    const requestBody = {
      model: 'qwen-max', // 使用通义千问模型
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

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-DashScope-Async': 'enable' // 启用异步调用
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // 检查异步任务状态
    if (data.output?.task_status === 'SUCCEEDED') {
      return data.output.choices[0].message.content
    } else if (data.output?.task_status === 'PENDING' || data.output?.task_status === 'RUNNING') {
      // 等待异步任务完成
      return await this.waitForAsyncTask(data.output.task_id)
    } else {
      throw new Error(`API调用失败: ${data.output?.task_status || '未知错误'}`)
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
        duration: data.tripSummary?.duration || 0
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
export const initializeLLMService = (apiKey: string) => {
  llmService.setApiKey(apiKey)
}
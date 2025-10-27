// LLM服务 - 阿里云百炼API集成
import { TripGenerationRequest, TripGenerationResponse, Activity } from '../types/database'

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
    const { destination, duration, budgetAmount, travelStyle, travelers, specialRequirements } = request
    
    // 检查是否排除交通费用
    const excludeFlights = specialRequirements?.includes('不包含机票') ||
                          specialRequirements?.includes('不包含车票') ||
                          specialRequirements?.includes('不包含来回路费') ||
                          specialRequirements?.includes('不含交通费')
    
    // 使用用户输入的预算金额作为总预算
    const totalBudget = budgetAmount
    
    // 预算分解 - 根据是否排除交通费用调整分配
    const budgetBreakdown = {
      flights: excludeFlights ? 0 : Math.round(totalBudget * 0.3),
      accommodation: Math.round(totalBudget * 0.25),
      food: Math.round(totalBudget * 0.2),
      transportation: Math.round(totalBudget * 0.1),
      activities: Math.round(totalBudget * 0.1),
      shopping: Math.round(totalBudget * 0.03),
      other: Math.round(totalBudget * 0.02)
    }

    // 如果排除了交通费用，重新分配预算
    if (excludeFlights) {
      const remainingBudget = totalBudget - budgetBreakdown.flights
      budgetBreakdown.accommodation = Math.round(remainingBudget * 0.3)
      budgetBreakdown.food = Math.round(remainingBudget * 0.25)
      budgetBreakdown.activities = Math.round(remainingBudget * 0.2)
      budgetBreakdown.transportation = Math.round(remainingBudget * 0.15)
      budgetBreakdown.shopping = Math.round(remainingBudget * 0.05)
      budgetBreakdown.other = Math.round(remainingBudget * 0.05)
    }

    // 生成每日计划
    const dailyPlan = []
    for (let day = 1; day <= duration; day++) {
      const themes = ['城市探索', '文化体验', '自然风光', '美食之旅', '休闲购物']
      const theme = themes[(day - 1) % themes.length]
      
      // 第一天安排酒店入住
      const isFirstDay = day === 1
      
      // 根据目的地生成具体的位置信息
      const getLocationInfo = (activityName: string, activityType: string) => {
        const commonLocations: Record<string, Record<string, string>> = {
          '北京': {
            '早餐': '王府井小吃街',
            '主要景点参观': '故宫博物院',
            '午餐': '全聚德烤鸭店',
            '文化体验活动': '天坛公园',
            '自然风光活动': '颐和园',
            '美食之旅活动': '簋街',
            '休闲购物活动': '三里屯太古里',
            '晚餐': '后海酒吧街',
            '夜游': '天安门广场'
          },
          '上海': {
            '早餐': '城隍庙小吃广场',
            '主要景点参观': '外滩',
            '午餐': '南京路步行街',
            '文化体验活动': '上海博物馆',
            '自然风光活动': '豫园',
            '美食之旅活动': '田子坊',
            '休闲购物活动': '陆家嘴',
            '晚餐': '新天地',
            '夜游': '东方明珠'
          },
          '南京': {
            '早餐': '夫子庙美食街',
            '主要景点参观': '中山陵',
            '午餐': '老门东',
            '文化体验活动': '南京博物院',
            '自然风光活动': '玄武湖公园',
            '美食之旅活动': '狮子桥美食街',
            '休闲购物活动': '新街口',
            '晚餐': '1912街区',
            '夜游': '秦淮河'
          },
          '杭州': {
            '早餐': '河坊街',
            '主要景点参观': '西湖',
            '午餐': '楼外楼',
            '文化体验活动': '灵隐寺',
            '自然风光活动': '西溪湿地',
            '美食之旅活动': '南宋御街',
            '休闲购物活动': '湖滨银泰',
            '晚餐': '武林夜市',
            '夜游': '断桥残雪'
          }
        }

        const cityLocations = commonLocations[destination] || commonLocations['北京']
        const locationName = cityLocations[activityName] || `${destination}${activityName}`
        
        // 返回完整的MapLocation对象，lat和lng设为0，由地图服务自动获取
        return {
          lat: 0, // 地图服务会自动获取正确的坐标
          lng: 0, // 地图服务会自动获取正确的坐标
          name: locationName,
          address: `${destination}市${locationName}`
        }
      }

      const activities: Activity[] = [
        {
          time: '09:00',
          name: '早餐',
          description: `享用当地特色早餐（${30 * travelers}元/人）`,
          location: getLocationInfo('早餐', 'FOOD'),
          type: 'FOOD',
          cost: 30 * travelers,
          notes: ''
        },
        {
          time: '10:00',
          name: `${destination}主要景点参观`,
          description: `探索${destination}的著名景点（${80}元/人）`,
          location: getLocationInfo('主要景点参观', 'SIGHTSEEING'),
          type: 'SIGHTSEEING',
          cost: 80 * travelers,
          notes: '需提前3天预约'
        },
        {
          time: '12:30',
          name: '午餐',
          description: `品尝当地美食（${60}元/人）`,
          location: getLocationInfo('午餐', 'FOOD'),
          type: 'FOOD',
          cost: 60 * travelers,
          notes: ''
        },
        {
          time: '14:00',
          name: `${theme}活动`,
          description: `参与${theme}相关的特色活动（${50}元/人）`,
          location: getLocationInfo(`${theme}活动`, 'SIGHTSEEING'),
          type: 'SIGHTSEEING',
          cost: 50 * travelers,
          notes: day === 2 ? '需提前1天预约' : ''
        },
        {
          time: '18:00',
          name: '晚餐',
          description: `享受丰盛的晚餐（${80}元/人）`,
          location: getLocationInfo('晚餐', 'FOOD'),
          type: 'FOOD',
          cost: 80 * travelers,
          notes: ''
        },
        {
          time: '20:00',
          name: '夜游',
          description: '欣赏城市夜景',
          location: getLocationInfo('夜游', 'SIGHTSEEING'),
          type: 'SIGHTSEEING',
          cost: 0,
          notes: '免费活动'
        }
      ]

      // 第一天添加酒店入住活动
      if (isFirstDay) {
        activities.unshift({
          time: '14:00',
          name: '酒店入住',
          description: `办理酒店入住手续（住宿费用已包含在总预算中）`,
          location: undefined,
          type: 'ACCOMMODATION',
          cost: 0,
          notes: '酒店费用已计入总预算'
        })
      }

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

    // 检查特殊要求中是否包含预算排除项
    const excludeFlights = specialRequirements?.includes('不包含机票') ||
                          specialRequirements?.includes('不包含车票') ||
                          specialRequirements?.includes('不包含来回路费') ||
                          specialRequirements?.includes('不含交通费')

    return `你是一个专业的旅行规划师。请根据以下需求生成旅行计划：

目的地：${destination}
天数：${duration}天
预算：${budgetAmount}元
风格：${travelStyle}
人数：${travelers}人
偏好：${preferences.join('、')}
特殊要求：${specialRequirements || '无'}
${dateInfo}

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
            "name": "具体位置名称（必须准确）",
            "address": "详细地址（可选）"
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
1. 费用计算：按人计算的费用在description中标注"xx元/人"，cost字段计算总费用（单价 × ${travelers}人），免费的地方cost标注为："免费！"，免费景点要仔细搜索需不需要提前预约！！！
2. 预约要求：需要预约的景点在notes中标注"需提前XX天预约"，景点位置信息、预约提醒必须准确！
3. 预算控制：总费用控制在${budgetAmount}元以内
4. 酒店安排：只在第一天安排酒店入住，住宿费用计入总预算，你需要推荐具体酒店名称（位置）和价格，必须准确！
5. 交通费用：${excludeFlights ? '预算不包含来回路费，flights预算项为0' : '合理估算机票/车票费用'}
6. 风格偏好：活动安排符合${travelStyle}风格，包含${preferences.join('、')}相关活动
7. 行程优化：每天的活动安排要地理位置相近，减少交通时间，提高游览效率，每一场活动位置信息要尽可能详细准确！
8. 位置信息要求：每个活动必须包含location字段，name字段必须是具体、准确的地点名称（如"故宫博物院"、"外滩"、"西湖"等），不要使用模糊描述
9. 地图兼容性：位置名称必须能被高德地图API正确识别，建议使用官方景点名称或知名地标
10. 天数优先级：如果旅行天数和开始-结束日期计算出来的天数有矛盾，应以旅行天数（${duration}天）为准`
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

    const prompt = `你是一个专业的旅行规划助手。请从用户输入中提取旅行规划的关键信息。

用户输入："${text}"

请仔细分析用户输入，提取以下信息：
1. 目的地：用户想去哪里
2. 旅行天数：数字形式的天数
3. 预算金额：数字形式的预算
4. 旅行风格：根据描述判断（休闲度假/冒险探索/文化体验/美食之旅/购物之旅/自然风光/城市观光/商务出行）
5. 同行人数：数字形式的人数
6. 个人偏好：用户提到的喜好和需求，提取为数组
7. 特殊需求：特别注意用户是否提到预算不包含交通费用

重要提示：
- 交通费用排除识别：如果用户提到预算不包含任何形式的交通费用，包括但不限于以下表述：
  "不含来回路费"、"不包含来回路费"、"不含车票"、"不包含车票"、"不含机票"、"不包含机票"、"不含交通费"、"不包含交通费"、"不含路费"、"不包含路费"、"不含交通"、"不包含交通"
  请在specialRequirements中记录"预算不包含来回路费"
- 个人偏好要完整提取用户的需求，如"喜欢吃辣的但是不要过分辣"提取为["喜欢吃辣但不要过分辣"]
- 用户明确要求必须去的地点也要记录在preferences中
- 旅行风格使用中文

请以JSON格式返回结果：
{
  "destination": "目的地",
  "duration": 天数,
  "budgetAmount": 预算金额,
  "travelStyle": "旅行风格",
  "travelers": 人数,
  "preferences": ["偏好1", "偏好2"],
  "specialRequirements": "特殊需求"
}

示例1：
输入："我和女朋友要去上海玩两天，预算3000元（不含来回路费），不要超过，想打卡网红打卡点，品尝一下上海的美食"
输出：{"destination": "上海", "duration": 2, "budgetAmount": 3000, "travelStyle": "城市观光", "travelers": 2, "preferences": ["打卡网红打卡点", "品尝上海美食"], "specialRequirements": "预算不包含来回路费"}

示例2：
输入："我最近想出去玩几天，预算2000块钱吧（不包含来回车票/机票），去长沙玩三天两夜，我喜欢吃辣的但是不要过分辣，必须去毛主席雕塑那，其他地方随便安排"
输出：{"destination": "长沙", "duration": 3, "budgetAmount": 2000, "travelStyle": "城市观光", "travelers": 1, "preferences": ["喜欢吃辣但不要过分辣", "毛主席雕塑"], "specialRequirements": "预算不包含来回路费"}

示例3：
输入："一个人去北京玩3天，预算1500，不含交通费，喜欢历史"
输出：{"destination": "北京", "duration": 3, "budgetAmount": 1500, "travelStyle": "文化体验", "travelers": 1, "preferences": ["历史"], "specialRequirements": "预算不包含来回路费"}

如果某个信息不存在，请使用null或空字符串。`

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
    
    // 设置默认旅行风格（使用中文）
    if (text.includes('美食')) {
      result.travelStyle = '美食之旅'
    } else if (text.includes('购物')) {
      result.travelStyle = '购物之旅'
    } else if (text.includes('文化') || text.includes('历史')) {
      result.travelStyle = '文化体验'
    } else if (text.includes('自然') || text.includes('风景')) {
      result.travelStyle = '自然风光'
    } else {
      result.travelStyle = '城市观光'
    }
    
    // 检查是否包含交通费用排除需求
    if (text.includes('不包含来回车票') ||
        text.includes('不包含来回机票') ||
        text.includes('不含来回路费') ||
        text.includes('不含来回车票') ||
        text.includes('不含来回机票') ||
        text.includes('不包含车票') ||
        text.includes('不包含机票') ||
        text.includes('不包含路费') ||
        text.includes('不包含交通费') ||
        text.includes('不含交通') ||
        text.includes('不含车票') ||
        text.includes('不含机票') ||
        text.includes('不含路费')) {
      result.specialRequirements = '预算不包含来回路费'
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
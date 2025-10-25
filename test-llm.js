// 测试LLM服务
const { LLMService } = require('./src/services/llmService')

async function testLLM() {
  console.log('开始测试LLM服务...')
  
  const llmService = new LLMService()
  
  // 使用用户提供的API Key
  const apiKey = 'sk-78ccae580c884077bfb30f92ba7928e1'
  llmService.setApiKey(apiKey, {
    useProxy: false, // 直接调用，不使用代理
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelName: 'qwen-plus'
  })
  
  const testRequest = {
    destination: '北京',
    duration: 3,
    budgetRange: 'comfort',
    travelStyle: 'cultural',
    travelers: 2,
    preferences: ['历史', '美食'],
    specialRequirements: '希望包含故宫和长城'
  }
  
  try {
    console.log('发送测试请求...')
    const result = await llmService.generateTripPlan(testRequest)
    console.log('测试成功！')
    console.log('生成的行程计划:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('测试失败:', error.message)
    console.error('错误详情:', error)
  }
}

testLLM()
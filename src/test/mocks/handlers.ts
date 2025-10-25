import { http, HttpResponse } from 'msw'

export const handlers = [
  // 模拟Supabase认证
  http.post('https://*.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: {
        id: 'user-123',
        email: 'test@example.com'
      }
    })
  }),

  // 模拟行程数据
  http.get('https://*.supabase.co/rest/v1/trips', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: '测试行程',
        destination: '北京',
        start_date: '2024-01-10',
        end_date: '2024-01-15',
        budget: 5000
      }
    ])
  }),

  // 模拟LLM API
  http.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', () => {
    return HttpResponse.json({
      output: {
        text: '这是一个模拟的行程规划...'
      }
    })
  })
]
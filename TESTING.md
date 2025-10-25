# AI旅行规划助手 - 测试文档

## 概述

本文档介绍AI旅行规划助手应用的测试策略、测试用例和测试执行方法。我们提供了完整的测试覆盖，包括单元测试、集成测试和端到端测试。

## 测试策略

### 测试金字塔

```
      / E2E测试 \
     / 集成测试  \
    /  单元测试   \
```

- **单元测试**: 测试单个组件和函数
- **集成测试**: 测试组件间交互和API集成
- **E2E测试**: 测试完整用户流程

### 测试工具栈

- **单元测试**: Vitest + React Testing Library
- **集成测试**: Vitest + MSW (Mock Service Worker)
- **E2E测试**: Playwright
- **代码覆盖率**: c8
- **类型检查**: TypeScript

## 测试环境设置

### 安装依赖

```bash
# 安装测试依赖
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-c8 msw playwright
```

### 配置Vitest

创建 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts'
      ]
    }
  }
})
```

### 测试设置文件

创建 `src/test/setup.ts`：

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

// 启动MSW服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 单元测试

### 组件测试

#### ErrorBoundary组件测试

创建 `src/components/Error/ErrorBoundary.test.tsx`：

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

// 抛出错误的测试组件
const ThrowError = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('正常渲染子组件', () => {
    render(
      <ErrorBoundary>
        <div>正常内容</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('正常内容')).toBeInTheDocument()
  })

  it('捕获错误并显示错误界面', () => {
    // 抑制控制台错误输出
    const consoleError = vi.spyOn(console, 'error')
    consoleError.mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('出错了')).toBeInTheDocument()
    expect(screen.getByText('抱歉，发生了意外错误')).toBeInTheDocument()
    
    consoleError.mockRestore()
  })
})
```

#### LoadingSpinner组件测试

创建 `src/components/Loading/LoadingSpinner.test.tsx`：

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('渲染默认加载状态', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('渲染页面级加载状态', () => {
    render(<LoadingSpinner type="page" />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('渲染自定义文本', () => {
    render(<LoadingSpinner text="正在处理..." />)
    expect(screen.getByText('正在处理...')).toBeInTheDocument()
  })
})
```

### 工具函数测试

创建 `src/utils/__tests__/dateUtils.test.ts`：

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate, calculateDuration, isDateInRange } from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('格式化日期', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('2024-01-15')
    })
  })

  describe('calculateDuration', () => {
    it('计算日期差', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(calculateDuration(start, end)).toBe(5)
    })
  })

  describe('isDateInRange', () => {
    it('检查日期是否在范围内', () => {
      const date = new Date('2024-01-12')
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(isDateInRange(date, start, end)).toBe(true)
    })
  })
})
```

## 集成测试

### API集成测试

创建 `src/test/mocks/handlers.ts`：

```typescript
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
```

创建 `src/test/mocks/server.ts`：

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 组件集成测试

创建 `src/pages/TripsPage.test.tsx`：

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import TripsPage from './TripsPage'
import { TripProvider } from '../contexts/TripContext'

// Mock Supabase客户端
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user' } } })
    }
  }
}))

const renderWithProvider = (component: React.ReactNode) => {
  return render(
    <TripProvider>
      {component}
    </TripProvider>
  )
}

describe('TripsPage', () => {
  it('渲染行程页面', async () => {
    renderWithProvider(<TripsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('我的行程')).toBeInTheDocument()
    })
  })

  it('显示空状态', async () => {
    renderWithProvider(<TripsPage />)
    
    await waitFor(() => {
      expect(screen.getByText('暂无行程')).toBeInTheDocument()
    })
  })

  it('打开创建行程模态框', async () => {
    const user = userEvent.setup()
    renderWithProvider(<TripsPage />)
    
    const createButton = screen.getByText('创建行程')
    await user.click(createButton)
    
    expect(screen.getByText('创建新行程')).toBeInTheDocument()
  })
})
```

## E2E测试

### Playwright配置

创建 `playwright.config.ts`：

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E测试用例

创建 `e2e/trips.spec.ts`：

```typescript
import { test, expect } from '@playwright/test'

test.describe('行程管理', () => {
  test('创建新行程', async ({ page }) => {
    await page.goto('/')
    
    // 点击创建行程按钮
    await page.click('text=创建行程')
    
    // 填写行程信息
    await page.fill('input[placeholder="行程标题"]', '北京五日游')
    await page.fill('input[placeholder="目的地"]', '北京')
    await page.fill('input[placeholder="预算"]', '5000')
    
    // 选择日期
    await page.click('input[placeholder="开始日期"]')
    await page.click('text=10')
    await page.click('input[placeholder="结束日期"]')
    await page.click('text=15')
    
    // 提交表单
    await page.click('button:has-text("创建")')
    
    // 验证行程创建成功
    await expect(page.locator('text=北京五日游')).toBeVisible()
  })

  test('查看行程详情', async ({ page }) => {
    await page.goto('/')
    
    // 点击行程卡片
    await page.click('text=北京五日游')
    
    // 验证详情页面
    await expect(page.locator('text=行程详情')).toBeVisible()
    await expect(page.locator('text=北京')).toBeVisible()
  })

  test('删除行程', async ({ page }) => {
    await page.goto('/')
    
    // 点击删除按钮
    await page.click('[data-testid="delete-trip"]').first()
    
    // 确认删除
    await page.click('button:has-text("确认")')
    
    // 验证行程已删除
    await expect(page.locator('text=北京五日游')).not.toBeVisible()
  })
})

test.describe('用户认证', () => {
  test('用户登录', async ({ page }) => {
    await page.goto('/')
    
    // 点击登录按钮
    await page.click('text=登录')
    
    // 填写登录信息
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // 提交登录
    await page.click('button:has-text("登录")')
    
    // 验证登录成功
    await expect(page.locator('text=我的行程')).toBeVisible()
  })
})
```

## 测试脚本

### package.json测试脚本

更新 `package.json` 中的测试脚本：

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

### 持续集成配置

创建 `.github/workflows/test.yml`：

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:run
    
    - name: Run coverage
      run: npm run test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
    
    - name: Install Playwright
      run: npx playwright install
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

## 测试最佳实践

### 1. 测试命名规范

```typescript
// 好的命名
describe('UserAuthentication', () => {
  it('should log in with valid credentials', () => {})
  it('should show error with invalid credentials', () => {})
})

// 避免的命名
describe('Test login', () => {
  it('test1', () => {})
})
```

### 2. 测试数据管理

```typescript
// 使用测试工厂函数
const createMockTrip = (overrides = {}) => ({
  id: '1',
  title: '测试行程',
  destination: '北京',
  start_date: '2024-01-10',
  end_date: '2024-01-15',
  budget: 5000,
  ...overrides
})
```

### 3. 异步测试处理

```typescript
it('should load trips data', async () => {
  render(<TripsPage />)
  
  await waitFor(() => {
    expect(screen.getByText('北京五日游')).toBeInTheDocument()
  })
})
```

### 4. 模拟外部依赖

```typescript
// 模拟API调用
vi.mock('../api/trips', () => ({
  fetchTrips: vi.fn(() => Promise.resolve([]))
}))
```

## 测试覆盖率目标

- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **函数覆盖率**: ≥ 85%
- **行覆盖率**: ≥ 80%

## 运行测试

```bash
# 运行所有测试
npm run test:all

# 运行单元测试（监听模式）
npm run test

# 运行单元测试（单次）
npm run test:run

# 运行覆盖率测试
npm run test:coverage

# 运行E2E测试
npm run test:e2e

# 运行E2E测试（有界面）
npm run test:e2e:headed
```

## 故障排除

### 常见问题

1. **测试环境问题**
   ```bash
   # 清理缓存
   npm run test -- --no-cache
   ```

2. **时间相关问题**
   ```typescript
   // 使用假定时器
   vi.useFakeTimers()
   // 测试代码
   vi.useRealTimers()
   ```

3. **异步测试超时**
   ```typescript
   it('should complete within timeout', async () => {
     await waitFor(() => {
       expect(element).toBeInTheDocument()
     }, { timeout: 5000 })
   })
   ```

---

通过完整的测试覆盖，我们确保AI旅行规划助手应用的稳定性和可靠性。
import { beforeAll, afterEach, afterAll } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'
import { server } from './mocks/server'

expect.extend(matchers)

// 启动MSW服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
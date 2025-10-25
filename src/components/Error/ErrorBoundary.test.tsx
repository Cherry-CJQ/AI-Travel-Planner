import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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
    
    expect(screen.getByText('正常内容')).toBeTruthy()
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
    
    expect(screen.getByText('出错了')).toBeTruthy()
    expect(screen.getByText('抱歉，发生了意外错误')).toBeTruthy()
    
    consoleError.mockRestore()
  })
})
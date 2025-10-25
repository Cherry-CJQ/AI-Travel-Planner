import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner, { PageLoading, CardLoading, InlineLoading } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('渲染默认加载状态', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('加载中...')).toBeTruthy()
  })

  it('渲染自定义提示文本', () => {
    render(<LoadingSpinner tip="正在处理..." />)
    expect(screen.getByText('正在处理...')).toBeTruthy()
  })

  it('渲染全屏加载状态', () => {
    render(<LoadingSpinner fullScreen tip="页面加载中..." />)
    expect(screen.getByText('页面加载中...')).toBeTruthy()
  })
})

describe('PageLoading', () => {
  it('渲染页面级加载状态', () => {
    render(<PageLoading />)
    expect(screen.getByText('页面加载中...')).toBeTruthy()
  })

  it('渲染自定义消息', () => {
    render(<PageLoading message="正在初始化..." />)
    expect(screen.getByText('正在初始化...')).toBeTruthy()
  })
})

describe('CardLoading', () => {
  it('渲染卡片级加载状态', () => {
    render(<CardLoading />)
    // 检查是否渲染了加载组件
    expect(document.querySelector('.ant-spin')).toBeTruthy()
  })
})

describe('InlineLoading', () => {
  it('渲染内联加载状态', () => {
    render(<InlineLoading text="处理中" />)
    expect(screen.getByText('处理中')).toBeTruthy()
  })

  it('渲染无文本的内联加载状态', () => {
    render(<InlineLoading />)
    // 检查是否渲染了加载组件
    expect(document.querySelector('.ant-spin')).toBeTruthy()
  })
})
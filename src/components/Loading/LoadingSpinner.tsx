import React from 'react'
import { Spin, Typography, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  fullScreen?: boolean
  overlay?: boolean
  delay?: number
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  tip = '加载中...',
  fullScreen = false,
  overlay = false,
  delay = 300
}) => {
  const spinnerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: fullScreen ? '100px 0' : '50px 0',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
      zIndex: 9999
    })
  }

  const indicator = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'default' ? 32 : 24 }} spin />

  return (
    <div style={spinnerStyle}>
      <Spin 
        indicator={indicator}
        size={size}
        tip={tip}
        delay={delay}
      />
    </div>
  )
}

// 页面级加载组件
export const PageLoading: React.FC<{ message?: string }> = ({ message = '页面加载中...' }) => (
  <div style={{ 
    minHeight: '400px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }}>
    <Space direction="vertical" align="center" size="large">
      <Spin size="large" />
      <Text type="secondary">{message}</Text>
    </Space>
  </div>
)

// 卡片级加载组件
export const CardLoading: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <div style={{ 
    height, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  }}>
    <Spin size="default" />
  </div>
)

// 内联加载组件
export const InlineLoading: React.FC<{ text?: string }> = ({ text }) => (
  <Space>
    <Spin size="small" />
    {text && <Text type="secondary">{text}</Text>}
  </Space>
)

// 骨架屏加载组件
export const SkeletonLoading: React.FC<{ type?: 'card' | 'list' | 'text' }> = ({ type = 'card' }) => {
  const getSkeletonStyle = () => {
    switch (type) {
      case 'card':
        return {
          height: '120px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          borderRadius: '6px'
        }
      case 'list':
        return {
          height: '60px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          borderRadius: '4px',
          marginBottom: '8px'
        }
      case 'text':
        return {
          height: '16px',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'loading 1.5s infinite',
          borderRadius: '2px',
          marginBottom: '8px'
        }
      default:
        return {}
    }
  }

  return (
    <div>
      <style>
        {`
          @keyframes loading {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}
      </style>
      <div style={getSkeletonStyle()} />
    </div>
  )
}

export default LoadingSpinner
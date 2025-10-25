import React, { useState, useEffect } from 'react'
import { Alert, Space, Typography, Button } from 'antd'
import { WifiOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text } = Typography

interface NetworkStatusProps {
  showAlert?: boolean
  onStatusChange?: (isOnline: boolean) => void
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  showAlert = true,
  onStatusChange 
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [showOfflineAlert, setShowOfflineAlert] = useState<boolean>(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
      onStatusChange?.(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
      onStatusChange?.(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onStatusChange])

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOnline(true)
      setShowOfflineAlert(false)
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowOfflineAlert(false)
  }

  if (!isOnline && showAlert && showOfflineAlert) {
    return (
      <Alert
        message={
          <Space>
            <CloseCircleOutlined />
            <Text strong>网络连接已断开</Text>
          </Space>
        }
        description="当前处于离线状态，部分功能可能无法正常使用。请检查网络连接后重试。"
        type="warning"
        showIcon
        action={
          <Space>
            <Button size="small" onClick={handleRetry} icon={<ReloadOutlined />}>
              重试
            </Button>
            <Button size="small" onClick={handleDismiss}>
              忽略
            </Button>
          </Space>
        }
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          border: 'none'
        }}
      />
    )
  }

  if (isOnline && !navigator.onLine) {
    // 网络恢复时的短暂提示
    return (
      <Alert
        message={
          <Space>
            <WifiOutlined />
            <Text strong>网络连接已恢复</Text>
          </Space>
        }
        description="网络连接已恢复正常。"
        type="success"
        showIcon
        closable
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          border: 'none'
        }}
        afterClose={() => setIsOnline(true)}
      />
    )
  }

  return null
}

// 网络状态指示器组件
export const NetworkIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <Space>
      {isOnline ? (
        <WifiOutlined style={{ color: '#52c41a' }} />
      ) : (
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      )}
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {isOnline ? '在线' : '离线'}
      </Text>
    </Space>
  )
}

// 网络连接质量检测
export const useNetworkQuality = () => {
  const [quality, setQuality] = useState<'good' | 'fair' | 'poor'>('good')

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      const updateQuality = () => {
        const effectiveType = connection.effectiveType
        const downlink = connection.downlink
        
        if (effectiveType === '4g' && downlink > 5) {
          setQuality('good')
        } else if (effectiveType === '4g' || effectiveType === '3g') {
          setQuality('fair')
        } else {
          setQuality('poor')
        }
      }

      connection.addEventListener('change', updateQuality)
      updateQuality()

      return () => {
        connection.removeEventListener('change', updateQuality)
      }
    }
  }, [])

  return quality
}

export default NetworkStatus
import React from 'react'
import { Result, Button, Typography, Space } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text, Paragraph } = Typography

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
    
    // 可以在这里集成错误报告服务
    // this.reportError(error, errorInfo)
  }

  // 报告错误到监控服务
  // private reportError(error: Error, errorInfo: React.ErrorInfo) {
  //   // 集成Sentry、LogRocket等错误监控服务
  // }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        onReset={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
      />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  onReset: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset }) => {
  const navigate = useNavigate()

  const handleReload = () => {
    onReset()
    window.location.reload()
  }

  const handleGoHome = () => {
    onReset()
    navigate('/')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <Result
        status="500"
        title="页面遇到了一些问题"
        subTitle="抱歉，发生了意外的错误。请尝试刷新页面或返回首页。"
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleReload}
              size="large"
            >
              刷新页面
            </Button>
            <Button 
              icon={<HomeOutlined />} 
              onClick={handleGoHome}
              size="large"
            >
              返回首页
            </Button>
          </Space>
        }
      >
        {error && (
          <div style={{ 
            background: '#fff', 
            padding: '16px', 
            borderRadius: '6px',
            marginTop: '24px',
            border: '1px solid #f0f0f0'
          }}>
            <Text strong>错误详情：</Text>
            <Paragraph 
              code 
              style={{ 
                marginTop: '8px', 
                fontSize: '12px',
                wordBreak: 'break-all'
              }}
            >
              {error.message}
            </Paragraph>
            {errorInfo?.componentStack && (
              <>
                <Text strong style={{ marginTop: '16px', display: 'block' }}>
                  组件堆栈：
                </Text>
                <pre style={{ 
                  fontSize: '10px', 
                  background: '#f6f8fa', 
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  marginTop: '8px'
                }}>
                  {errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
        )}
      </Result>
    </div>
  )
}

export default ErrorBoundary
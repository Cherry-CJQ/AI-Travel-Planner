import React from 'react'
import { Empty, Button, Typography, Space } from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined, 
  SearchOutlined,
  FileSearchOutlined,
  InboxOutlined
} from '@ant-design/icons'

const { Text, Title } = Typography

interface EmptyStateProps {
  type?: 'no-data' | 'no-results' | 'error' | 'not-found' | 'custom'
  title?: string
  description?: string
  image?: React.ReactNode
  actions?: React.ReactNode[]
  height?: string | number
  compact?: boolean
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  image,
  actions,
  height = 400,
  compact = false
}) => {
  const getDefaultConfig = () => {
    const configs = {
      'no-data': {
        image: <InboxOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
        title: '暂无数据',
        description: '当前没有数据，点击下方按钮开始创建',
        defaultActions: [
          <Button type="primary" icon={<PlusOutlined />} key="create">
            创建数据
          </Button>
        ]
      },
      'no-results': {
        image: <SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
        title: '未找到结果',
        description: '没有找到匹配的数据，请尝试调整搜索条件',
        defaultActions: [
          <Button type="primary" icon={<ReloadOutlined />} key="reload">
            重新搜索
          </Button>
        ]
      },
      'error': {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
        title: '加载失败',
        description: '数据加载失败，请检查网络连接后重试',
        defaultActions: [
          <Button type="primary" icon={<ReloadOutlined />} key="retry">
            重新加载
          </Button>
        ]
      },
      'not-found': {
        image: <FileSearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />,
        title: '页面不存在',
        description: '您访问的页面不存在或已被移除',
        defaultActions: [
          <Button type="primary" key="home">
            返回首页
          </Button>
        ]
      },
      'custom': {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
        title: '自定义空状态',
        description: '这里可以显示自定义的空状态信息',
        defaultActions: []
      }
    }

    return configs[type] || configs['no-data']
  }

  const config = getDefaultConfig()
  const finalTitle = title || config.title
  const finalDescription = description || config.description
  const finalImage = image || config.image
  const finalActions = actions || config.defaultActions

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: compact ? 'auto' : height,
    padding: compact ? '20px' : '40px 20px',
    textAlign: 'center'
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: compact ? '100%' : 400
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {finalImage && (
          <div style={{ marginBottom: compact ? 16 : 24 }}>
            {finalImage}
          </div>
        )}
        
        {finalTitle && (
          <Title 
            level={compact ? 5 : 4} 
            style={{ 
              marginBottom: compact ? 8 : 16,
              color: 'rgba(0, 0, 0, 0.45)'
            }}
          >
            {finalTitle}
          </Title>
        )}
        
        {finalDescription && (
          <Text 
            type="secondary" 
            style={{ 
              display: 'block',
              marginBottom: compact ? 16 : 24,
              lineHeight: 1.6
            }}
          >
            {finalDescription}
          </Text>
        )}
        
        {finalActions && finalActions.length > 0 && (
          <Space>
            {finalActions.map((action, index) => 
              React.cloneElement(action as React.ReactElement, { key: index })
            )}
          </Space>
        )}
      </div>
    </div>
  )
}

// 特定场景的空状态组件
export const NoDataEmpty: React.FC<{ onCreate?: () => void; entity?: string }> = ({ 
  onCreate, 
  entity = '数据' 
}) => (
  <EmptyState
    type="no-data"
    title={`暂无${entity}`}
    description={`当前没有${entity}，点击下方按钮开始创建`}
    actions={[
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={onCreate}
        key="create"
      >
        创建{entity}
      </Button>
    ]}
  />
)

export const NoResultsEmpty: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    type="no-results"
    actions={[
      <Button 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={onRetry}
        key="retry"
      >
        重新搜索
      </Button>
    ]}
  />
)

export const ErrorEmpty: React.FC<{ onRetry?: () => void; error?: string }> = ({ 
  onRetry, 
  error 
}) => (
  <EmptyState
    type="error"
    description={error || '数据加载失败，请检查网络连接后重试'}
    actions={[
      <Button 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={onRetry}
        key="retry"
      >
        重新加载
      </Button>
    ]}
  />
)

export const NotFoundEmpty: React.FC<{ onHome?: () => void }> = ({ onHome }) => (
  <EmptyState
    type="not-found"
    actions={[
      <Button 
        type="primary" 
        onClick={onHome}
        key="home"
      >
        返回首页
      </Button>
    ]}
  />
)

export default EmptyState
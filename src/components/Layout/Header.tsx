import React from 'react'
import { Layout, Typography, Button, Space, Avatar, Dropdown, message } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/appStore'

const { Header: AntHeader } = Layout
const { Title, Text } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAppStore()

  const handleLogout = async () => {
    try {
      await logout()
      message.success('已成功退出登录')
      navigate('/')
    } catch (error) {
      message.error('退出登录失败')
    }
  }

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 12px' }}>
          <Text strong>{user?.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ]

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        lineHeight: '64px'
      }}
      className="mobile-padding-sm"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title
          level={3}
          style={{
            margin: 0,
            color: '#1890ff',
            cursor: 'pointer',
            fontSize: 'clamp(16px, 4vw, 20px)'
          }}
          onClick={() => navigate('/')}
          className="mobile-text-center"
        >
          <span className="desktop-hidden">🗺️</span>
          <span className="mobile-hidden">🗺️ AI旅行规划助手</span>
          <span className="desktop-hidden tablet-hidden">AI旅行助手</span>
        </Title>
      </div>

      <Space size="middle" wrap>
        {isAuthenticated && user ? (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
            trigger={['click']}
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 'auto',
                padding: '8px 12px'
              }}
              className="mobile-full-width"
            >
              <span className="mobile-hidden" style={{ marginLeft: 8 }}>
                {user.name}
              </span>
            </Button>
          </Dropdown>
        ) : (
          <Space size="small" wrap>
            <Button
              type="text"
              onClick={() => navigate('/login')}
              className="mobile-full-width"
            >
              登录
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/register')}
              className="mobile-full-width"
            >
              注册
            </Button>
          </Space>
        )}
      </Space>
    </AntHeader>
  )
}

export default Header
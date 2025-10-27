import React from 'react'
import { Layout, Typography, Button, Space, Avatar, Dropdown, message, Tag } from 'antd'
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

      {/* 广告栏 - 柔和流光版 */}
      <div
        style={{
          flex: 1,
          textAlign: 'center',
          margin: '0 16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            padding: '10px 28px',
            borderRadius: '18px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1677ff',
            maxWidth: '640px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            border: '1px solid rgba(24,144,255,0.25)',
            background:
              'linear-gradient(135deg, rgba(24,144,255,0.08), rgba(24,144,255,0.12))',
            boxShadow: '0 4px 12px rgba(24,144,255,0.12)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            animation: 'subtlePulse 6s ease-in-out infinite',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(24,144,255,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(24,144,255,0.12)';
          }}
        >
          ✨ <span style={{ opacity: 0.95 }}>这么近，那么美，周末到河北！</span>

          {/* 柔光流动层 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '200%',
              height: '100%',
              background:
                'radial-gradient(circle at 0% 50%, rgba(24,144,255,0.25), transparent 60%)',
              animation: 'softSweep 8s linear infinite',
              pointerEvents: 'none',
              filter: 'blur(12px)',
              opacity: 0.6,
            }}
          />
        </div>

        <style>
          {`
            @keyframes subtlePulse {
              0%, 100% {
                box-shadow: 0 4px 12px rgba(24,144,255,0.12);
              }
              50% {
                box-shadow: 0 6px 18px rgba(24,144,255,0.22);
              }
            }

            @keyframes softSweep {
              0% {
                transform: translateX(-50%);
              }
              100% {
                transform: translateX(50%);
              }
            }
          `}
        </style>
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
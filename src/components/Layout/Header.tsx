import React from 'react'
import { Layout, Typography, Button, Space, Avatar, Dropdown } from 'antd'
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Title } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const isLoggedIn = false // 暂时硬编码，后续从状态管理获取

  const userMenuItems = [
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
      onClick: () => {
        // 后续实现退出登录逻辑
        console.log('退出登录')
      }
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
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          🗺️ AI旅行规划助手
        </Title>
      </div>

      <Space>
        {isLoggedIn ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              用户
            </Button>
          </Dropdown>
        ) : (
          <Space>
            <Button type="text" onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </Space>
    </AntHeader>
  )
}

export default Header
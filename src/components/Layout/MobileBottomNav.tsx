import React from 'react'
import { Menu } from 'antd'
import {
  HomeOutlined,
  CompassOutlined,
  UserOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/trips',
      icon: <CompassOutlined />,
      label: '行程',
    },
    {
      key: '/trip/new',
      icon: <PlusOutlined />,
      label: '新建',
    },
    {
      key: '/account',
      icon: <UserOutlined />,
      label: '账户',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        zIndex: 1000,
        height: '56px',
      }}
      className="desktop-hidden"
    >
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '100%',
          border: 'none',
          background: 'transparent',
        }}
      />
    </div>
  )
}

export default MobileBottomNav
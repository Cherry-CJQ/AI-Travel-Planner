import React from 'react'
import { Layout, Menu } from 'antd'
import { 
  HomeOutlined, 
  CompassOutlined, 
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

const Sidebar: React.FC = () => {
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
      label: '我的行程',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ]

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          height: '100%',
          borderRight: 0,
          paddingTop: '16px',
        }}
      />
    </Sider>
  )
}

export default Sidebar
import React, { useState } from 'react'
import { Layout, Menu, Button, Tooltip } from 'antd'
import { 
  HomeOutlined, 
  CompassOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [siderWidth, setSiderWidth] = useState(200)

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

  const handleCollapse = (collapsed: boolean) => {
    onCollapse?.(collapsed)
  }

  return (
    <Sider
      width={siderWidth}
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        position: 'relative',
      }}
      breakpoint="lg"
      collapsedWidth="0"
      zeroWidthTriggerStyle={{
        top: 12,
        right: -36,
        color: '#1890ff',
        background: '#fff',
        border: '1px solid #f0f0f0',
      }}
      className="mobile-hidden"
      trigger={null}
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
      
      {/* 自定义折叠按钮 */}
      <Tooltip title={collapsed ? '展开侧边栏' : '折叠侧边栏'} placement="right">
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          style={{
            position: 'absolute',
            top: 12,
            right: -36,
            zIndex: 1000,
            color: '#1890ff',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => handleCollapse(!collapsed)}
        />
      </Tooltip>
      
      {/* 可调节宽度的拖拽条 */}
      {!collapsed && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            cursor: 'col-resize',
            backgroundColor: 'transparent',
            zIndex: 100,
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = siderWidth
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX
              const newWidth = Math.max(150, Math.min(400, startWidth + deltaX))
              setSiderWidth(newWidth)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}
    </Sider>
  )
}

export default Sidebar
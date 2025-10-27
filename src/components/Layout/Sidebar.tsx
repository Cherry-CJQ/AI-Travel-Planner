import React, { useState } from 'react'
import { Layout, Menu, Button, Tooltip } from 'antd'
import {
  HomeOutlined,
  CompassOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

interface SidebarProps {
  collapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
  width?: number
  onWidthChange?: (width: number) => void
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onCollapse, width = 200, onWidthChange }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [siderWidth, setSiderWidth] = useState(width)

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
      key: '/account',
      icon: <UserOutlined />,
      label: '账户管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'API设置',
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
        height: '100vh', // 确保侧边栏铺满整个屏幕高度
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
          height: '100vh', // 菜单铺满整个侧边栏高度
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
            position: 'fixed',
            top: 76, // 顶栏高度64px + 12px间距
            left: collapsed ? 12 : siderWidth - 16, // 按钮在侧边栏右侧边缘
            zIndex: 1001,
            color: '#1890ff',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'left 0.2s ease', // 添加平滑过渡效果
            pointerEvents: 'auto', // 确保按钮可点击
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
              onWidthChange?.(newWidth)
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
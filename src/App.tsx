import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout, ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import MobileBottomNav from './components/Layout/MobileBottomNav'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ErrorBoundary from './components/Error/ErrorBoundary'
import { useAppStore } from './stores/appStore'
// import NetworkStatus from './components/Network/NetworkStatus'
import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import TripCreatePage from './pages/TripCreatePage'
import SettingsPage from './pages/SettingsPage'
import AccountPage from './pages/AccountPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const { Content } = Layout

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(200)
  const { validateAuth, initializeLLMService } = useAppStore()

  // 应用启动时验证认证状态并初始化LLM服务
  useEffect(() => {
    validateAuth()
    initializeLLMService()
  }, [validateAuth, initializeLLMService])

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          wireframe: false,
        },
        components: {
          Layout: {
            bodyBg: '#f5f5f5',
            headerBg: '#fff',
            siderBg: '#fff',
          },
          Card: {
            borderRadiusLG: 8,
          },
          Button: {
            borderRadius: 6,
          },
          Input: {
            borderRadius: 6,
          },
        },
      }}
    >
      <AntdApp>
        <ErrorBoundary>
          <Router>
            <Layout style={{ minHeight: '100vh' }}>
              {/* 固定顶栏 */}
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                height: '64px'
              }}>
                <Header />
              </div>
              
              <Layout style={{ marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}>
                {/* 固定侧边栏 */}
                <div style={{
                  position: 'fixed',
                  top: '64px',
                  left: 0,
                  bottom: 0,
                  zIndex: 999,
                  width: sidebarCollapsed ? 0 : sidebarWidth,
                  transition: 'width 0.2s',
                  overflow: 'hidden',
                  height: 'calc(100vh - 64px)' // 确保侧边栏铺满整个屏幕高度
                }}>
                  <Sidebar
                    collapsed={sidebarCollapsed}
                    onCollapse={setSidebarCollapsed}
                    width={sidebarWidth}
                    onWidthChange={setSidebarWidth}
                  />
                </div>
                
                {/* 主要内容区域 */}
                <Layout style={{
                  marginLeft: sidebarCollapsed ? 0 : sidebarWidth,
                  padding: '24px',
                  paddingBottom: 'calc(80px + 24px)', // 为移动端底部导航留出空间
                  transition: 'margin-left 0.2s',
                  minHeight: 'calc(100vh - 64px)'
                }} className="mobile-padding-sm">
                  <Content
                    style={{
                      background: '#fff',
                      padding: 24,
                      margin: 0,
                      minHeight: 280,
                      borderRadius: 8,
                    }}
                    className="mobile-full-width mobile-padding-sm"
                  >
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/trips"
                        element={
                          <ProtectedRoute>
                            <TripsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/trip/:tripId"
                        element={
                          <ProtectedRoute>
                            <TripDetailPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/trip/new"
                        element={
                          <ProtectedRoute>
                            <TripCreatePage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute>
                            <SettingsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/login"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <LoginPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <ProtectedRoute requireAuth={false}>
                            <RegisterPage />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Content>
                </Layout>
              </Layout>
            </Layout>
            
            {/* 移动端底部导航 */}
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000
            }}>
              <MobileBottomNav />
            </div>
          </Router>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
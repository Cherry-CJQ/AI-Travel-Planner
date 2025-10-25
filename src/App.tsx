import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout, ConfigProvider, App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import MobileBottomNav from './components/Layout/MobileBottomNav'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ErrorBoundary from './components/Error/ErrorBoundary'
// import NetworkStatus from './components/Network/NetworkStatus'
import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import TripDetailPage from './pages/TripDetailPage'
import TripCreatePage from './pages/TripCreatePage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const { Content } = Layout

const App: React.FC = () => {
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
              <Header />
              <Layout>
                <Sidebar />
                <Layout style={{ padding: '24px', paddingBottom: '80px' }} className="mobile-padding-sm">
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
            <MobileBottomNav />
          </Router>
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
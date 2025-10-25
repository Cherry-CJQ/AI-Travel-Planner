import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import HomePage from './pages/HomePage'
import TripsPage from './pages/TripsPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

const { Content } = Layout

const App: React.FC = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                background: '#fff',
                padding: 24,
                margin: 0,
                minHeight: 280,
                borderRadius: 8,
              }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App.tsx'
import './index.css'
import { validateEnvironment } from './utils/env'

// 在应用启动前验证环境变量
if (!validateEnvironment()) {
  console.error('❌ 环境变量配置不完整，请检查必需的环境变量是否已设置')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)
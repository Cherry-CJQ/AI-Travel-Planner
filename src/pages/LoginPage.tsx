import React from 'react'
import { Card, Form, Input, Button, Typography, Space, message, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'

const { Title, Link } = Typography

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { login, loading, error, clearError } = useAppStore()

  const onFinish = async (values: { email: string; password: string }) => {
    clearError() // 清除之前的错误
    try {
      await login(values.email, values.password)
      // 只有在登录成功时才跳转页面
      message.success('登录成功！')
      navigate('/')
    } catch (error: any) {
      // 错误信息已经在store中设置，这里不需要额外处理
      // 不跳转页面，停留在登录页面
    }
  }

  // 清除错误信息当用户开始输入时（只在有错误时清除）
  const handleInputChange = () => {
    // 不再自动清除错误信息，让错误信息一直显示直到下一次登录尝试
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh'
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>登录</Title>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          {error && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="登录失败"
                description={error}
                type="error"
                showIcon
                closable
                onClose={clearError}
              />
            </div>
          )}

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱地址"
              size="large"
              autoComplete="email"
              onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
              autoComplete="current-password"
              onChange={handleInputChange}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <span>还没有账号？</span>
              <Link onClick={() => navigate('/register')}>立即注册</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
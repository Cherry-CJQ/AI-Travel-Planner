import React from 'react'
import { Card, Form, Input, Button, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Link } = Typography

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('登录:', values)
    // 后续实现登录逻辑
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
        >
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
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
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
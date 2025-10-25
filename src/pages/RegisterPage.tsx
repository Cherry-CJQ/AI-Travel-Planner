import React from 'react'
import { Card, Form, Input, Button, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Link } = Typography

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('注册:', values)
    // 后续实现注册逻辑
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
          <Title level={2}>注册</Title>
        </div>
        
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱地址" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Space>
              <span>已有账号？</span>
              <Link onClick={() => navigate('/login')}>立即登录</Link>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPage
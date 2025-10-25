import React from 'react'
import { Typography, Card, Form, Input, Button, Space, Alert } from 'antd'

const { Title, Paragraph } = Typography

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    console.log('保存设置:', values)
    // 后续实现保存到localStorage或Supabase
  }

  return (
    <div>
      <Title level={2}>设置</Title>
      <Paragraph>
        配置您的API密钥，确保应用正常运行
      </Paragraph>

      <Alert
        message="安全提示"
        description="所有API密钥将安全存储在您的浏览器本地存储中，不会上传到服务器。请妥善保管您的密钥。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="API密钥配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="阿里云百炼 LLM API Key"
            name="llmApiKey"
            rules={[{ required: true, message: '请输入LLM API Key' }]}
          >
            <Input.Password placeholder="请输入您的阿里云百炼API密钥" />
          </Form.Item>

          <Form.Item
            label="科大讯飞语音识别 API Key"
            name="voiceApiKey"
            rules={[{ required: true, message: '请输入语音识别API Key' }]}
          >
            <Input.Password placeholder="请输入您的科大讯飞API密钥" />
          </Form.Item>

          <Form.Item
            label="高德地图 API Key"
            name="mapApiKey"
            rules={[{ required: true, message: '请输入地图API Key' }]}
          >
            <Input.Password placeholder="请输入您的高德地图API密钥" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default SettingsPage
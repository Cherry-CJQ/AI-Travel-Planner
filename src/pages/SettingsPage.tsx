import React, { useEffect } from 'react'
import { Typography, Card, Form, Input, Button, Space, Alert, message, Select } from 'antd'
import { useAppStore } from '../stores/appStore'

const { Title, Paragraph } = Typography
const { Option } = Select

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm()
  const { userSettings, updateUserSettings, loading } = useAppStore()

  useEffect(() => {
    if (userSettings) {
      form.setFieldsValue({
        llmApiKey: userSettings.llm_api_key || '',
        llmModel: userSettings.llm_model || 'qwen-plus',
        voiceApiKey: userSettings.voice_api_key || '',
        mapApiKey: userSettings.map_api_key || ''
      })
    }
  }, [userSettings, form])

  const onFinish = async (values: {
    llmApiKey: string
    llmModel?: string
    voiceApiKey?: string
    mapApiKey?: string
  }) => {
    try {
      await updateUserSettings({
        llm_api_key: values.llmApiKey,
        llm_model: values.llmModel || undefined,
        voice_api_key: values.voiceApiKey || undefined,
        map_api_key: values.mapApiKey || undefined
      })
      message.success('设置保存成功！')
    } catch (error: any) {
      message.error(error.message || '保存设置失败')
    }
  }

  const handleReset = () => {
    form.resetFields()
    if (userSettings) {
      form.setFieldsValue({
        llmApiKey: userSettings.llm_api_key || '',
        llmModel: userSettings.llm_model || 'qwen-turbo',
        voiceApiKey: userSettings.voice_api_key || '',
        mapApiKey: userSettings.map_api_key || ''
      })
    }
  }

  return (
    <div>
      <Title level={2}>设置</Title>
      <Paragraph>
        配置您的API密钥，确保应用正常运行
      </Paragraph>

      <Alert
        message="配置说明"
        description="语音识别和地图服务已由系统提供，您只需配置LLM API密钥即可使用AI行程规划功能。"
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
            extra="必须配置，用于AI行程规划和预算分析"
          >
            <Input.Password placeholder="请输入您的阿里云百炼API密钥" />
          </Form.Item>

          <Form.Item
            label="AI模型选择"
            name="llmModel"
            initialValue="qwen-turbo"
            extra="qwen-turbo：响应更快，适合快速生成；qwen-plus：效果更好，但响应稍慢"
          >
            <Select placeholder="选择AI模型">
              <Option value="qwen-turbo">Qwen-Turbo（推荐，响应快）</Option>
              <Option value="qwen-plus">Qwen-Plus（效果更好）</Option>
              <Option value="qwen-max">Qwen-Max（效果最佳）</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="科大讯飞语音识别 API Key (可选)"
            name="voiceApiKey"
            extra="可选配置，如不配置将使用系统提供的语音识别服务"
          >
            <Input.Password placeholder="如需使用个人语音识别服务，请在此输入" />
          </Form.Item>

          <Form.Item
            label="高德地图 API Key (可选)"
            name="mapApiKey"
            extra="可选配置，如不配置将使用系统提供的地图服务"
          >
            <Input.Password placeholder="如需使用个人地图服务，请在此输入" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              >
                保存设置
              </Button>
              <Button onClick={handleReset}>
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
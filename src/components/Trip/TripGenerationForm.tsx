import React, { useState } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Space,
  message,
  Row,
  Col,
  Tag,
  Typography
} from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { TripGenerationRequest } from '../../types/database'
import { useTripStore } from '../../stores/tripStore'
import { useAppStore } from '../../stores/appStore'

const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography

interface TripGenerationFormProps {
  onSuccess?: (plan: any) => void
}

export const TripGenerationForm: React.FC<TripGenerationFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const { generateTripPlan, loading } = useTripStore()
  const { userSettings } = useAppStore()
  
  const [preferences, setPreferences] = useState<string[]>([])
  const [newPreference, setNewPreference] = useState('')

  const travelStyles = [
    { label: '休闲度假', value: 'relaxation' },
    { label: '冒险探索', value: 'adventure' },
    { label: '文化体验', value: 'cultural' },
    { label: '美食之旅', value: 'food' },
    { label: '购物之旅', value: 'shopping' },
    { label: '自然风光', value: 'nature' },
    { label: '城市观光', value: 'sightseeing' },
    { label: '商务出行', value: 'business' }
  ]

  const budgetRanges = [
    { label: '经济型 (¥1000以下/天)', value: 'budget' },
    { label: '舒适型 (¥1000-3000/天)', value: 'comfort' },
    { label: '豪华型 (¥3000以上/天)', value: 'luxury' }
  ]

  const addPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences([...preferences, newPreference.trim()])
      setNewPreference('')
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref))
  }

  const handleSubmit = async (values: any) => {
    try {
      // 检查是否有未添加的偏好输入
      if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
        // 自动添加未保存的偏好
        setPreferences([...preferences, newPreference.trim()])
        setNewPreference('')
        message.info(`已自动添加偏好: ${newPreference.trim()}`)
      }

      const request: TripGenerationRequest = {
        destination: values.destination,
        duration: values.duration,
        budgetRange: values.budgetRange,
        travelStyle: values.travelStyle,
        startDate: values.travelDates?.[0]?.toISOString(),
        endDate: values.travelDates?.[1]?.toISOString(),
        travelers: values.travelers,
        preferences: preferences,
        specialRequirements: values.specialRequirements
      }

      await generateTripPlan(request)
      
      message.success('旅行计划生成成功！')
      onSuccess?.(request)
    } catch (error: any) {
      message.error(error.message || '生成旅行计划失败')
    }
  }

  // 检查API Key是否配置
  const isAPIKeyConfigured = userSettings?.llm_api_key

  return (
    <Card 
      title="生成旅行计划" 
      style={{ maxWidth: 800, margin: '0 auto' }}
      extra={
        !isAPIKeyConfigured && (
          <Tag color="orange">请先在设置页面配置API Key</Tag>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={!isAPIKeyConfigured}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="目的地"
              name="destination"
              rules={[{ required: true, message: '请输入目的地' }]}
            >
              <Input placeholder="例如：北京、上海、东京" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="旅行天数"
              name="duration"
              rules={[{ required: true, message: '请输入旅行天数' }]}
            >
              <InputNumber 
                min={1} 
                max={30} 
                placeholder="1-30天" 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="旅行日期"
              name="travelDates"
              rules={[{ required: true, message: '请选择旅行日期' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="出行人数"
              name="travelers"
              rules={[{ required: true, message: '请输入出行人数' }]}
            >
              <InputNumber 
                min={1} 
                max={20} 
                placeholder="1-20人" 
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="旅行风格"
              name="travelStyle"
              rules={[{ required: true, message: '请选择旅行风格' }]}
            >
              <Select placeholder="选择旅行风格">
                {travelStyles.map(style => (
                  <Option key={style.value} value={style.value}>
                    {style.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="预算范围"
              name="budgetRange"
              rules={[{ required: true, message: '请选择预算范围' }]}
            >
              <Select placeholder="选择预算范围">
                {budgetRanges.map(budget => (
                  <Option key={budget.value} value={budget.value}>
                    {budget.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="个人偏好"
          extra={
            newPreference.trim() && !preferences.includes(newPreference.trim()) && (
              <span style={{ color: '#faad14' }}>
                提示：您有未保存的偏好 "{newPreference}"，点击"生成旅行计划"按钮时会自动添加
              </span>
            )
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="添加个人偏好（如：喜欢博物馆、不吃辣等）"
                onPressEnter={addPreference}
                onBlur={() => {
                  // 输入框失去焦点时自动添加
                  if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
                    addPreference()
                  }
                }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addPreference}
                disabled={!newPreference.trim() || preferences.includes(newPreference.trim())}
              >
                添加
              </Button>
            </Space.Compact>
            <div>
              {preferences.map(pref => (
                <Tag
                  key={pref}
                  closable
                  onClose={() => removePreference(pref)}
                  style={{ marginBottom: 8 }}
                >
                  {pref}
                </Tag>
              ))}
            </div>
          </Space>
        </Form.Item>

        <Form.Item
          label="特殊要求"
          name="specialRequirements"
        >
          <Input.TextArea 
            rows={3}
            placeholder="例如：需要无障碍设施、有小孩同行、饮食限制等"
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            disabled={!isAPIKeyConfigured}
            size="large"
            style={{ width: '100%' }}
          >
            {loading ? '正在生成计划...' : '生成旅行计划'}
          </Button>
        </Form.Item>

        {!isAPIKeyConfigured && (
          <div style={{ textAlign: 'center', color: '#faad14' }}>
            <p>请先在设置页面配置阿里云百炼API Key以使用AI旅行规划功能</p>
          </div>
        )}
      </Form>
    </Card>
  )
}
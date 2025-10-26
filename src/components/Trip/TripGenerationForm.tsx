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
  Typography,
  Tabs,
  Alert
} from 'antd'
import { PlusOutlined, MinusOutlined, BulbOutlined, FormOutlined } from '@ant-design/icons'
import { TripGenerationRequest } from '../../types/database'
import { useTripStore } from '../../stores/tripStore'
import { useAppStore } from '../../stores/appStore'
import { llmService, initializeLLMService } from '../../services/llmService'

const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography
const { TabPane } = Tabs
const { TextArea } = Input

interface TripGenerationFormProps {
  onSuccess?: (plan: any) => void
}

export const TripGenerationForm: React.FC<TripGenerationFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm()
  const { generateTripPlan, loading } = useTripStore()
  const { userSettings } = useAppStore()
  
  const [preferences, setPreferences] = useState<string[]>([])
  const [newPreference, setNewPreference] = useState('')
  const [inputMode, setInputMode] = useState<'form' | 'text'>('form')
  const [textInput, setTextInput] = useState('')
  const [parsing, setParsing] = useState(false)

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

  // 预算范围选项已移除，改为用户直接输入预算金额

  const addPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences([...preferences, newPreference.trim()])
      setNewPreference('')
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter(p => p !== pref))
  }

  // 解析自然语言输入
  const parseTextInput = async () => {
    if (!textInput.trim()) {
      message.warning('请输入您的旅行需求')
      return
    }

    setParsing(true)
    try {
      // 初始化LLM服务（如果配置了API Key）
      if (userSettings?.llm_api_key) {
        initializeLLMService(userSettings.llm_api_key, {
          modelName: userSettings.llm_model || 'qwen-plus',
          useProxy: true
        })
      }

      const parsedData = await llmService.parseNaturalLanguage(textInput)
      console.log('解析结果:', parsedData)
      
      // 更新表单字段
      if (parsedData.destination) {
        form.setFieldValue('destination', parsedData.destination)
      }
      if (parsedData.duration) {
        form.setFieldValue('duration', parsedData.duration)
      }
      if (parsedData.budgetAmount) {
        form.setFieldValue('budgetAmount', parsedData.budgetAmount)
      }
      if (parsedData.travelStyle) {
        form.setFieldValue('travelStyle', parsedData.travelStyle)
      }
      if (parsedData.travelers) {
        form.setFieldValue('travelers', parsedData.travelers)
      }
      if (parsedData.preferences && Array.isArray(parsedData.preferences)) {
        setPreferences(parsedData.preferences)
      }
      if (parsedData.specialRequirements) {
        form.setFieldValue('specialRequirements', parsedData.specialRequirements)
      }

      // 切换到表单模式
      setInputMode('form')
      message.success('已自动提取关键信息，请检查并补充完整')
    } catch (error) {
      console.error('解析失败:', error)
      message.warning('无法自动提取信息，请切换到表单模式手动填写')
    } finally {
      setParsing(false)
    }
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
        budgetAmount: values.budgetAmount,
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
      <Tabs 
        activeKey={inputMode} 
        onChange={(key) => setInputMode(key as 'form' | 'text')}
        style={{ marginBottom: 24 }}
      >
        <TabPane 
          tab={
            <span>
              <FormOutlined />
              表单输入
            </span>
          } 
          key="form"
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
                  extra="可选，如填写将根据日期特点（节假日、工作日等）优化行程安排"
                >
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['开始日期（可选）', '结束日期（可选）']}
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
                  label="预算金额"
                  name="budgetAmount"
                  rules={[{ required: true, message: '请输入预算金额' }]}
                >
                  <InputNumber
                    min={100}
                    max={100000}
                    placeholder="请输入总预算金额"
                    style={{ width: '100%' }}
                    addonBefore="¥"
                  />
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
        </TabPane>

        <TabPane
          tab={
            <span>
              <BulbOutlined />
              智能输入
            </span>
          }
          key="text"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Alert
              message="智能输入说明"
              description={
                isAPIKeyConfigured
                  ? "请用自然语言描述您的旅行需求，系统会调用AI大模型自动提取关键信息并填充到表单中。"
                  : "请用自然语言描述您的旅行需求，系统会使用本地解析器提取关键信息。如需使用AI大模型进行更准确的解析，请在设置页面配置API Key。"
              }
              type="info"
              showIcon
            />
            
            <TextArea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="例如：我和女朋友想去上海玩2天，预算3000，喜欢美食，想要打卡一下上海的标志地点"
              rows={6}
              style={{ marginBottom: 16 }}
            />
            
            <Button
              type="primary"
              loading={parsing}
              onClick={parseTextInput}
              icon={<BulbOutlined />}
              style={{ width: '100%' }}
            >
              {parsing ? '正在解析...' : '智能解析并填充表单'}
            </Button>

            <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
              <p>系统会自动提取：目的地、天数、预算、人数、旅行风格、个人偏好等信息</p>
              {!isAPIKeyConfigured && (
                <div style={{ color: '#faad14' }}>
                  <p><strong>当前使用本地解析器，准确度有限</strong></p>
                  <p>如需使用AI大模型进行智能解析，请前往设置页面配置阿里云百炼API Key</p>
                </div>
              )}
            </div>
          </Space>
        </TabPane>
      </Tabs>
    </Card>
  )
}
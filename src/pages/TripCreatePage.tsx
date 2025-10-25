import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
  message,
  Steps,
  Divider
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useTripStore } from '../stores/tripStore'

const { Title, Text } = Typography
const { Step } = Steps
const { Option } = Select
const { TextArea } = Input

const TripCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { createTrip, loading } = useTripStore()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: '基本信息',
      content: 'BasicInfoStep',
    },
    {
      title: '预算设置',
      content: 'BudgetStep',
    },
    {
      title: '偏好设置',
      content: 'PreferencesStep',
    },
  ]

  const handleSubmit = async (values: any) => {
    try {
      const tripData = {
        title: values.title,
        destination: values.destination,
        duration: values.duration,
        budget: values.budget,
        preferences: values.preferences || []
      }

      const newTrip = await createTrip(tripData as any)
      if (newTrip) {
        message.success('行程创建成功')
        navigate(`/trip/${newTrip.id}`)
      }
    } catch (error: any) {
      message.error(error.message || '创建行程失败')
    }
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const BasicInfoStep = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="行程标题"
            name="title"
            rules={[
              { required: true, message: '请输入行程标题' },
              { max: 50, message: '标题不能超过50个字符' }
            ]}
          >
            <Input placeholder="例如：北京三日游" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="目的地"
            name="destination"
            rules={[
              { required: true, message: '请输入目的地' },
              { max: 30, message: '目的地不能超过30个字符' }
            ]}
          >
            <Input placeholder="例如：北京" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="行程天数"
            name="duration"
            rules={[
              { required: true, message: '请输入行程天数' },
              { type: 'number', min: 1, max: 30, message: '行程天数应在1-30天之间' }
            ]}
          >
            <InputNumber
              placeholder="天数"
              min={1}
              max={30}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="出行人数"
            name="travelers"
            initialValue={1}
            rules={[
              { required: true, message: '请输入出行人数' },
              { type: 'number', min: 1, max: 10, message: '出行人数应在1-10人之间' }
            ]}
          >
            <InputNumber
              placeholder="人数"
              min={1}
              max={10}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="行程描述"
        name="description"
      >
        <TextArea
          placeholder="简要描述您的旅行计划（可选）"
          rows={4}
          maxLength={200}
          showCount
        />
      </Form.Item>
    </div>
  )

  const BudgetStep = () => (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="总预算"
            name="budget"
            rules={[
              { required: true, message: '请输入总预算' },
              { type: 'number', min: 100, message: '预算不能低于100元' }
            ]}
          >
            <InputNumber
              placeholder="预算金额"
              min={100}
              step={100}
              style={{ width: '100%' }}
              formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as any}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="预算范围"
            name="budgetRange"
            initialValue="中等"
          >
            <Select placeholder="选择预算范围">
              <Option value="经济">经济（¥100-500/天）</Option>
              <Option value="中等">中等（¥500-1000/天）</Option>
              <Option value="舒适">舒适（¥1000-2000/天）</Option>
              <Option value="豪华">豪华（¥2000+/天）</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '6px' }}>
        <Text type="secondary">
          预算建议：根据您的出行天数和预算范围，系统将为您推荐合适的行程安排。
        </Text>
      </div>
    </div>
  )

  const PreferencesStep = () => (
    <div>
      <Form.Item
        label="旅行风格"
        name="travelStyle"
        initialValue="休闲"
      >
        <Select placeholder="选择旅行风格">
          <Option value="休闲">休闲度假</Option>
          <Option value="探险">户外探险</Option>
          <Option value="文化">文化探索</Option>
          <Option value="美食">美食之旅</Option>
          <Option value="购物">购物娱乐</Option>
          <Option value="家庭">家庭亲子</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="旅行偏好"
        name="preferences"
      >
        <Select
          mode="multiple"
          placeholder="选择您的旅行偏好（可选）"
          allowClear
        >
          <Option value="自然风光">自然风光</Option>
          <Option value="历史古迹">历史古迹</Option>
          <Option value="现代都市">现代都市</Option>
          <Option value="美食体验">美食体验</Option>
          <Option value="购物中心">购物中心</Option>
          <Option value="夜生活">夜生活</Option>
          <Option value="博物馆">博物馆</Option>
          <Option value="主题公园">主题公园</Option>
          <Option value="海滩度假">海滩度假</Option>
          <Option value="登山徒步">登山徒步</Option>
          <Option value="温泉养生">温泉养生</Option>
          <Option value="摄影打卡">摄影打卡</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="特殊需求"
        name="specialRequirements"
      >
        <TextArea
          placeholder="如有特殊需求请在此说明（可选）"
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />
      case 1:
        return <BudgetStep />
      case 2:
        return <PreferencesStep />
      default:
        return null
    }
  }

  return (
    <div>
      {/* 头部信息 */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/trips')}
          >
            返回
          </Button>
        </Space>
        
        <Title level={2}>创建新行程</Title>
        <Text type="secondary">填写行程信息，开始规划您的旅行</Text>
      </div>

      {/* 步骤条 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps current={currentStep}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
      </Card>

      {/* 表单内容 */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            duration: 3,
            travelers: 1,
            budgetRange: '中等',
            travelStyle: '休闲'
          }}
        >
          {renderStepContent()}

          <Divider />

          {/* 操作按钮 */}
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              {currentStep > 0 && (
                <Button onClick={prevStep}>
                  上一步
                </Button>
              )}
              
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={nextStep}>
                  下一步
                </Button>
              )}
              
              {currentStep === steps.length - 1 && (
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  icon={<PlusOutlined />}
                >
                  创建行程
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default TripCreatePage
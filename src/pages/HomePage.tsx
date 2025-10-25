import React, { useState } from 'react'
import { Typography, Card, Row, Col, Space, Button, Steps, message } from 'antd'
import {
  AudioOutlined,
  CompassOutlined,
  DollarOutlined,
  TeamOutlined,
  AudioMutedOutlined
} from '@ant-design/icons'
import VoiceInput from '../components/Voice/VoiceInput'
import VoiceExpense from '../components/Voice/VoiceExpense'
import { TripGenerationForm } from '../components/Trip/TripGenerationForm'
import { TripPlanDisplay } from '../components/Trip/TripPlanDisplay'
import { useAppStore } from '../stores/appStore'
import { useTripStore } from '../stores/tripStore'
import { TripGenerationRequest } from '../types/database'

const { Title, Paragraph, Text } = Typography
const { Step } = Steps

const HomePage: React.FC = () => {
  const { user } = useAppStore()
  const { generatedPlan, clearGeneratedPlan } = useTripStore()
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showVoiceExpense, setShowVoiceExpense] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const [voiceTranscript, setVoiceTranscript] = useState('')

  const handleVoiceInputChange = (transcript: string) => {
    setVoiceTranscript(transcript)
    // TODO: 处理语音输入内容
  }

  const handleVoiceExpenseAdd = (amount: number, category: string, description?: string) => {
    message.success(`记录支出: ¥${amount} (${category})`)
    // TODO: 处理支出记录
  }

  const handleTripGenerationSuccess = (request: TripGenerationRequest) => {
    setCurrentStep(1)
    message.success('旅行计划生成成功！')
  }

  const handleSaveTrip = () => {
    message.success('行程保存成功！')
    clearGeneratedPlan()
    setCurrentStep(0)
  }

  const handleShareTrip = () => {
    message.info('分享功能开发中...')
  }

  const steps = [
    {
      title: '输入需求',
      content: (
        <div>
          <TripGenerationForm onSuccess={handleTripGenerationSuccess} />
          
          <Card title="语音输入" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="dashed" 
                icon={showVoiceInput ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                size="large"
                block
              >
                {showVoiceInput ? '关闭语音输入' : '语音输入旅行需求'}
              </Button>
              
              {showVoiceInput && (
                <VoiceInput onTranscriptChange={handleVoiceInputChange} />
              )}
            </Space>
          </Card>
        </div>
      )
    },
    {
      title: '查看计划',
      content: generatedPlan ? (
        <TripPlanDisplay 
          plan={generatedPlan}
          onSave={handleSaveTrip}
          onShare={handleShareTrip}
        />
      ) : (
        <Card>
          <Paragraph>没有生成的行程计划</Paragraph>
          <Button onClick={() => setCurrentStep(0)}>
            返回输入需求
          </Button>
        </Card>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* 欢迎区域 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1} style={{ color: '#1890ff' }}>
          🗺️ AI旅行规划助手
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          通过AI大语言模型和语音识别技术，为您打造个性化的智能旅行方案
        </Paragraph>
      </div>

      {user ? (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <div style={{ minHeight: 400 }}>
            {steps[currentStep].content}
          </div>

          {currentStep === 1 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Button onClick={() => setCurrentStep(0)}>
                重新生成计划
              </Button>
            </div>
          )}

          <Card title="其他功能">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                icon={showVoiceExpense ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={() => setShowVoiceExpense(!showVoiceExpense)}
                size="large"
                block
              >
                {showVoiceExpense ? '关闭语音记账' : '语音记账'}
              </Button>

              {showVoiceExpense && (
                <VoiceExpense onExpenseAdd={handleVoiceExpenseAdd} />
              )}
            </Space>
          </Card>
        </Space>
      ) : (
        <div>
          <Card>
            <Paragraph style={{ textAlign: 'center', fontSize: '16px' }}>
              请先登录以使用完整的旅行规划功能。
            </Paragraph>
          </Card>

          {/* 功能特性 */}
          <Row gutter={[24, 24]} style={{ marginTop: 48 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                cover={<AudioOutlined style={{ fontSize: 48, color: '#1890ff', marginTop: 24 }} />}
              >
                <Card.Meta
                  title="语音输入"
                  description="支持语音识别，快速输入旅行需求，解放双手"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                cover={<CompassOutlined style={{ fontSize: 48, color: '#52c41a', marginTop: 24 }} />}
              >
                <Card.Meta
                  title="智能规划"
                  description="AI自动生成个性化行程，包含景点、餐饮、住宿等"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                cover={<DollarOutlined style={{ fontSize: 48, color: '#faad14', marginTop: 24 }} />}
              >
                <Card.Meta
                  title="预算管理"
                  description="AI预算分析 + 语音记账，轻松控制旅行开销"
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                cover={<TeamOutlined style={{ fontSize: 48, color: '#722ed1', marginTop: 24 }} />}
              >
                <Card.Meta
                  title="云端同步"
                  description="用户系统支持，行程数据多设备同步访问"
                />
              </Card>
            </Col>
          </Row>

          {/* 技术栈说明 */}
          <Card title="技术特性" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <strong>前端技术</strong>
                <div>React + TypeScript</div>
                <div>Ant Design UI组件库</div>
                <div>高德地图集成</div>
              </Col>
              <Col xs={24} sm={8}>
                <strong>AI服务</strong>
                <div>阿里云百炼 LLM</div>
                <div>科大讯飞语音识别</div>
                <div>自然语言处理</div>
              </Col>
              <Col xs={24} sm={8}>
                <strong>后端服务</strong>
                <div>Supabase数据库</div>
                <div>用户认证系统</div>
                <div>数据云端同步</div>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  )
}

export default HomePage
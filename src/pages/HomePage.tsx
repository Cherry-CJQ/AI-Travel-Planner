import React, { useState } from 'react'
import { Typography, Card, Row, Col, Space, Button, Steps, message } from 'antd'
import {
  AudioOutlined,
  CompassOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons'
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
  const [currentStep, setCurrentStep] = useState(0)

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
    <div style={{ maxWidth: '95vw', margin: '0 auto', padding: '0px 20px', minHeight: 'calc(100vh - 80px)' }}>
      {/* 欢迎区域 */}
      <div style={{
        textAlign: 'center',
        marginBottom: 0,
        padding: '8px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={2} style={{ color: 'white', margin: 0, fontSize: '20px' }}>
          🗺️ AI旅行规划助手
        </Title>
        <Paragraph style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.9)',
          margin: '4px 0 0 0',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          textAlign: 'center'
        }}>
          通过AI大语言模型和语音识别技术，为您打造个性化的智能旅行方案
        </Paragraph>
      </div>

      {user ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Steps current={currentStep} style={{ marginBottom: 16 }}>
            {steps.map(item => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>

          <div style={{ minHeight: 300 }}>
            {steps[currentStep].content}
          </div>

          {currentStep === 1 && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <Button onClick={() => setCurrentStep(0)}>
                重新生成计划
              </Button>
            </div>
          )}
        </Space>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <Paragraph style={{ textAlign: 'center', fontSize: '14px' }}>
              请先登录以使用完整的旅行规划功能。
            </Paragraph>
          </Card>

          {/* 功能特性 */}
          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
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
          <Card title="技术特性" style={{ marginTop: 16 }}>
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
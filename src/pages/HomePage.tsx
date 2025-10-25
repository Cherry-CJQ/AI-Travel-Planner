import React, { useState } from 'react'
import { Typography, Card, Row, Col, Space, Button, Input, message } from 'antd'
import {
  AudioOutlined,
  CompassOutlined,
  DollarOutlined,
  TeamOutlined,
  SendOutlined
} from '@ant-design/icons'
import VoiceInput from '../components/Voice/VoiceInput'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

const HomePage: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleTranscriptChange = (transcript: string) => {
    setInputText(transcript)
  }

  const handleGeneratePlan = async () => {
    if (!inputText.trim()) {
      message.warning('请输入旅行需求')
      return
    }

    setIsGenerating(true)
    try {
      // 这里将集成LLM API调用
      message.info('正在生成旅行计划...')
      // 模拟生成过程
      setTimeout(() => {
        setIsGenerating(false)
        message.success('旅行计划生成成功！')
        // 这里将跳转到行程详情页面
      }, 2000)
    } catch (error) {
      setIsGenerating(false)
      message.error('生成失败，请稍后重试')
    }
  }

  const handleClearInput = () => {
    setInputText('')
  }

  const exampleQueries = [
    "下周末带8岁孩子去上海，3天，喜欢科技馆和动物园，预算5000",
    "去日本5天，1万元预算，喜欢动漫和美食",
    "和朋友去北京，4天，想看故宫和长城",
    "一个人去成都，4天，预算3000，喜欢美食和熊猫"
  ]

  const handleExampleClick = (example: string) => {
    setInputText(example)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 欢迎区域 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1} style={{ color: '#1890ff' }}>
          🗺️ AI旅行规划助手
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          通过AI大语言模型和语音识别技术，为您打造个性化的智能旅行方案
        </Paragraph>
      </div>

      {/* 主要输入区域 */}
      <Card
        title="开始规划您的旅行"
        style={{ marginBottom: 32 }}
        extra={
          <Space>
            <Button onClick={handleClearInput}>
              清空
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleGeneratePlan}
              loading={isGenerating}
              disabled={!inputText.trim()}
            >
              生成计划
            </Button>
          </Space>
        }
      >
        {/* 文本输入 */}
        <div style={{ marginBottom: 24 }}>
          <Text strong>文字输入：</Text>
          <TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入您的旅行需求，例如：下周末带8岁孩子去上海，3天，喜欢科技馆和动物园，预算5000"
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ marginTop: 8 }}
          />
        </div>

        {/* 语音输入 */}
        <div>
          <Text strong>语音输入：</Text>
          <VoiceInput
            onTranscriptChange={handleTranscriptChange}
            placeholder="点击麦克风开始说话，描述您的旅行需求..."
          />
        </div>

        {/* 示例查询 */}
        <div style={{ marginTop: 24 }}>
          <Text type="secondary">试试这样说：</Text>
          <div style={{ marginTop: 8 }}>
            {exampleQueries.map((example, index) => (
              <Button
                key={index}
                type="link"
                size="small"
                onClick={() => handleExampleClick(example)}
                style={{ margin: '4px 8px 4px 0' }}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* 功能特性 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
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
      <Card title="技术特性">
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
  )
}

export default HomePage
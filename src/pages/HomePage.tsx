import React from 'react'
import { Typography, Card, Row, Col, Space, Button } from 'antd'
import { 
  AudioOutlined, 
  CompassOutlined, 
  DollarOutlined,
  TeamOutlined 
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const HomePage: React.FC = () => {
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

      {/* 快速开始 */}
      <Card 
        title="快速开始" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Button type="primary" size="large">
              开始规划
            </Button>
            <Button size="large">
              查看示例
            </Button>
          </Space>
        }
      >
        <Paragraph>
          尝试说出您的旅行需求，例如：
        </Paragraph>
        <ul>
          <li>"下周末带8岁孩子去上海，3天，喜欢科技馆和动物园，预算5000"</li>
          <li>"去日本5天，1万元预算，喜欢动漫和美食"</li>
          <li>"和朋友去北京，4天，想看故宫和长城"</li>
        </ul>
      </Card>

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
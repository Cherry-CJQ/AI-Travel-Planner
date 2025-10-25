import React, { useState } from 'react'
import {
  Card,
  Timeline,
  Statistic,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Divider,
  Typography,
  Progress,
  Tabs
} from 'antd'
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SaveOutlined,
  ShareAltOutlined,
  CompassOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
import { TripGenerationResponse } from '../../types/database'
import { useTripStore } from '../../stores/tripStore'
import { TripMap } from '../Map/TripMap'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

interface TripPlanDisplayProps {
  plan: TripGenerationResponse
  onSave?: () => void
  onShare?: () => void
}

export const TripPlanDisplay: React.FC<TripPlanDisplayProps> = ({
  plan,
  onSave,
  onShare
}) => {
  const { saveGeneratedTrip, loading } = useTripStore()
  const [activeTab, setActiveTab] = useState('details')

  const handleSave = async () => {
    try {
      await saveGeneratedTrip()
      onSave?.()
    } catch (error) {
      console.error('保存行程失败:', error)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      TRANSPORT: '🚗',
      ACCOMMODATION: '🏨',
      FOOD: '🍽️',
      SIGHTSEEING: '🏛️',
      SHOPPING: '🛍️',
      OTHER: '📝'
    }
    return icons[type] || '📍'
  }

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      TRANSPORT: 'blue',
      ACCOMMODATION: 'green',
      FOOD: 'orange',
      SIGHTSEEING: 'purple',
      SHOPPING: 'pink',
      OTHER: 'default'
    }
    return colors[type] || 'default'
  }

  const totalBudget = Object.values(plan.budgetBreakdown).reduce((sum, amount) => sum + (amount || 0), 0)

  // 提取所有活动
  const allActivities = plan.dailyPlan.flatMap(dayPlan => dayPlan.activities)

  // 行程详情内容
  const detailsContent = (
    <div>
      {/* 预算分解 */}
      <Card title="预算分解" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="总预算"
              value={totalBudget}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              {Object.entries(plan.budgetBreakdown).map(([category, amount]) => {
                if (!amount) return null
                const percentage = (amount / totalBudget) * 100
                return (
                  <div key={category} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>
                        {category === 'flights' && '机票'}
                        {category === 'accommodation' && '住宿'}
                        {category === 'food' && '餐饮'}
                        {category === 'transportation' && '交通'}
                        {category === 'activities' && '活动'}
                        {category === 'shopping' && '购物'}
                        {category === 'other' && '其他'}
                      </Text>
                      <Text strong>¥{amount.toLocaleString()}</Text>
                    </div>
                    <Progress 
                      percent={Math.round(percentage)} 
                      size="small" 
                      showInfo={false}
                    />
                  </div>
                )
              })}
            </div>
          </Col>
        </Row>
      </Card>

      {/* 每日计划 */}
      <Card title="每日行程安排">
        {plan.dailyPlan.map((dayPlan, dayIndex) => (
          <div key={dayIndex} style={{ marginBottom: 32 }}>
            <Divider orientation="left">
              <Title level={4} style={{ margin: 0 }}>
                第{dayPlan.day}天 - {dayPlan.theme}
              </Title>
            </Divider>
            
            <Timeline>
              {dayPlan.activities.map((activity, activityIndex) => (
                <Timeline.Item
                  key={activityIndex}
                  dot={
                    <span style={{ fontSize: '16px' }}>
                      {getActivityIcon(activity.type)}
                    </span>
                  }
                >
                  <Card 
                    size="small" 
                    style={{ marginBottom: 8 }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <Row gutter={16} align="middle">
                      <Col span={3}>
                        <Text strong style={{ fontSize: '16px' }}>
                          {activity.time}
                        </Text>
                      </Col>
                      <Col span={15}>
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {activity.name}
                          </Text>
                          {activity.cost && (
                            <Text style={{ marginLeft: 8, color: '#52c41a' }}>
                              ¥{activity.cost}
                            </Text>
                          )}
                        </div>
                        <Paragraph 
                          type="secondary" 
                          style={{ margin: '4px 0 0 0', fontSize: '14px' }}
                        >
                          {activity.description}
                        </Paragraph>
                        {activity.location && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            <EnvironmentOutlined /> 位置信息
                          </Text>
                        )}
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Tag color={getActivityColor(activity.type)}>
                          {activity.type === 'TRANSPORT' && '交通'}
                          {activity.type === 'ACCOMMODATION' && '住宿'}
                          {activity.type === 'FOOD' && '餐饮'}
                          {activity.type === 'SIGHTSEEING' && '观光'}
                          {activity.type === 'SHOPPING' && '购物'}
                          {activity.type === 'OTHER' && '其他'}
                        </Tag>
                      </Col>
                    </Row>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ))}
      </Card>
    </div>
  )

  // 地图内容
  const mapContent = (
    <div>
      <TripMap
        destination={plan.tripSummary.destination}
        activities={allActivities}
        height={500}
        onLocationClick={(location) => {
          console.log('点击位置:', location)
        }}
      />
      
      {/* 活动统计 */}
      <Card title="活动统计" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="总活动数"
              value={allActivities.length}
              prefix="📝"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="行程天数"
              value={plan.tripSummary.duration}
              prefix="📅"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="目的地"
              value={plan.tripSummary.destination}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 行程概览 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Title level={2} style={{ margin: 0 }}>
              {plan.tripSummary.title}
            </Title>
            <Space size="middle" style={{ marginTop: 8 }}>
              <Text>
                <EnvironmentOutlined /> {plan.tripSummary.destination}
              </Text>
              <Text>
                <ClockCircleOutlined /> {plan.tripSummary.duration}天
              </Text>
              <Text>
                <DollarOutlined /> 总预算: ¥{plan.tripSummary.estimatedTotalCost.toLocaleString()}
              </Text>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleSave}
              >
                保存行程
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={onShare}>
                分享
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 标签页 */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'details',
            label: (
              <span>
                <UnorderedListOutlined />
                行程详情
              </span>
            ),
            children: detailsContent
          },
          {
            key: 'map',
            label: (
              <span>
                <CompassOutlined />
                行程地图
              </span>
            ),
            children: mapContent
          }
        ]}
      />

      {/* 操作按钮 */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Space>
          <Button 
            type="primary" 
            size="large"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSave}
          >
            保存此行程
          </Button>
          <Button size="large" icon={<ShareAltOutlined />} onClick={onShare}>
            分享行程
          </Button>
        </Space>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import './TripPlanDisplay.css'
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
  Alert,
  notification
} from 'antd'
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SaveOutlined,
  ShareAltOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { TripGenerationResponse } from '../../types/database'
import { useTripStore } from '../../stores/tripStore'
import { TripMap } from '../Map/TripMap'

const { Title, Text, Paragraph } = Typography

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
  const [highlightedActivity, setHighlightedActivity] = useState<{dayIndex: number, activityIndex: number} | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState(66) // 默认左侧占66%

  const handleSave = async () => {
    try {
      await saveGeneratedTrip()
      onSave?.()
    } catch (error) {
      console.error('保存行程失败:', error)
    }
  }

  // 处理时间轴活动项点击
  const handleActivityClick = (dayIndex: number, activityIndex: number) => {
    try {
      // 验证索引有效性
      if (!plan.dailyPlan[dayIndex] || !plan.dailyPlan[dayIndex].activities[activityIndex]) {
        console.warn('无效的活动索引:', { dayIndex, activityIndex })
        notification.warning({
          message: '活动信息不完整',
          description: '无法定位到该活动，请检查活动信息',
          placement: 'topRight'
        })
        return
      }

      // 直接使用原始索引，不计算平铺索引
      setHighlightedActivity({ dayIndex, activityIndex })
      setMapError(null) // 清除之前的错误
      
      // 尝试定位到活动地点
      const activity = plan.dailyPlan[dayIndex]?.activities[activityIndex]
      if (activity && (activity.location?.name || activity.name)) {
        console.log(`定位到活动: ${activity.name} - ${activity.location?.name || activity.name}`)
      } else {
        console.warn('活动缺少位置信息:', activity)
        notification.info({
          message: '位置信息待确认',
          description: '该活动缺少具体位置信息，地图将定位到目的地',
          placement: 'topRight'
        })
      }
    } catch (error) {
      console.error('活动点击处理失败:', error)
      notification.error({
        message: '活动定位失败',
        description: '无法定位到该活动，请稍后重试',
        placement: 'topRight'
      })
    }
  }

  // 处理地图位置点击
  const handleLocationClick = (location: any) => {
    try {
      // 根据位置信息找到对应的活动项
      const allActivities = plan.dailyPlan.flatMap((dayPlan, dayIndex) =>
        dayPlan.activities.map((activity, activityIndex) => ({
          ...activity,
          dayIndex,
          activityIndex
        }))
      )
      
      const matchedActivity = allActivities.find(activity =>
        activity.location?.name === location.name ||
        activity.name === location.name
      )
      
      if (matchedActivity) {
        // 计算在平铺activities数组中的索引
        let flatIndex = 0
        for (let i = 0; i < matchedActivity.dayIndex; i++) {
          flatIndex += plan.dailyPlan[i].activities.length
        }
        flatIndex += matchedActivity.activityIndex
        
        setHighlightedActivity({
          dayIndex: matchedActivity.dayIndex,
          activityIndex: flatIndex
        })
        setMapError(null) // 清除之前的错误
      } else {
        console.warn('未找到匹配的活动:', location.name)
        notification.info({
          message: '未找到匹配的活动',
          description: '该位置没有对应的行程活动',
          placement: 'topRight'
        })
      }
    } catch (error) {
      console.error('地图点击处理失败:', error)
      notification.error({
        message: '地图交互失败',
        description: '无法处理地图点击，请稍后重试',
        placement: 'topRight'
      })
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
              {dayPlan.activities.map((activity, activityIndex) => {
                // 计算当前活动在平铺数组中的索引
                let currentFlatIndex = 0
                for (let i = 0; i < dayIndex; i++) {
                  currentFlatIndex += plan.dailyPlan[i].activities.length
                }
                currentFlatIndex += activityIndex
                
                const isHighlighted = highlightedActivity?.activityIndex === currentFlatIndex
                
                return (
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
                      style={{
                        marginBottom: 8,
                        border: isHighlighted ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        boxShadow: isHighlighted ? '0 2px 8px rgba(24, 144, 255, 0.2)' : 'none'
                      }}
                      bodyStyle={{ padding: '12px 16px' }}
                      onClick={() => handleActivityClick(dayIndex, activityIndex)}
                      className={activity.location ? 'clickable-activity' : ''}
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
                )
              })}
            </Timeline>
          </div>
        ))}
      </Card>
    </div>
  )

  // 地图内容
  const mapContent = (
    <div>
      {mapError && (
        <Alert
          message="地图交互提示"
          description={mapError}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setMapError(null)}
        />
      )}
      
      <TripMap
        destination={plan.tripSummary.destination}
        activities={allActivities}
        height={500}
        onLocationClick={handleLocationClick}
        highlightedActivity={highlightedActivity}
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

      {/* 主内容区域 - 行程信息与地图并排显示 */}
      <div className="trip-plan-container" style={{ display: 'flex', height: 'calc(100vh - 200px)', position: 'relative' }}>
        {/* 左侧：行程详情 - 主要信息区域 */}
        <div
          className="trip-plan-left-panel"
          style={{
            width: `${leftPanelWidth}%`,
            height: '100%',
            overflow: 'auto',
            paddingRight: '8px'
          }}
        >
          {detailsContent}
        </div>
        
        {/* 可调节宽度的分隔条 */}
        <div
          className="resizable-divider"
          style={{
            width: '8px',
            height: '100%',
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = leftPanelWidth
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const containerWidth = (e.target as HTMLElement).parentElement?.offsetWidth || 1200
              const deltaX = moveEvent.clientX - startX
              const deltaPercent = (deltaX / containerWidth) * 100
              const newWidth = Math.max(30, Math.min(80, startWidth + deltaPercent))
              setLeftPanelWidth(newWidth)
            }
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
              document.body.style.cursor = ''
              document.body.style.userSelect = ''
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
          }}
        />
        
        {/* 右侧：行程地图 - 辅助信息区域 */}
        <div
          className="trip-plan-right-panel"
          style={{
            width: `${100 - leftPanelWidth}%`,
            height: '100%',
            overflow: 'auto',
            paddingLeft: '8px'
          }}
        >
          {mapContent}
        </div>
      </div>

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
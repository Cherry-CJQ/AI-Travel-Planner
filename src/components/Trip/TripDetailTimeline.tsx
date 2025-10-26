import React from 'react'
import {
  Card,
  Timeline,
  Tag,
  Typography,
  Space,
  Button
} from 'antd'
import {
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { DailyPlan } from '../../types/database'

const { Title, Text } = Typography

interface TripDetailTimelineProps {
  dailyPlans: DailyPlan[]
  selectedDay: number
  onDaySelect: (dayNumber: number) => void
}

export const TripDetailTimeline: React.FC<TripDetailTimelineProps> = ({
  dailyPlans,
  selectedDay,
  onDaySelect
}) => {
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

  const handleDayClick = (dayNumber: number) => {
    onDaySelect(dayNumber)
  }

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          {dailyPlans.map((plan) => (
            <Button
              key={plan.day_number}
              type={selectedDay === plan.day_number ? 'primary' : 'default'}
              size="small"
              onClick={() => handleDayClick(plan.day_number)}
            >
              第{plan.day_number}天
            </Button>
          ))}
        </Space>
      </div>

      {dailyPlans
        .filter(plan => plan.day_number === selectedDay)
        .map((plan) => (
          <div key={plan.day_number}>
            <Title level={4} style={{ marginBottom: 16 }}>
              第{plan.day_number}天 - {plan.theme}
            </Title>
            
            <Timeline>
              {plan.activities.map((activity, index) => (
                <Timeline.Item
                  key={index}
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
                      border: '1px solid #d9d9d9'
                    }}
                    bodyStyle={{ padding: '12px 16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 4 }}>
                          <Text strong style={{ fontSize: '16px' }}>
                            {activity.time}
                          </Text>
                          <Text strong style={{ fontSize: '16px', marginLeft: 8 }}>
                            {activity.name}
                          </Text>
                          {activity.cost && (
                            <Text style={{ marginLeft: 8, color: '#52c41a' }}>
                              ¥{activity.cost}
                            </Text>
                          )}
                        </div>
                        
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block' }}>
                          {activity.description}
                        </Text>
                        
                        {activity.location && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              <EnvironmentOutlined /> {activity.location.name}
                            </Text>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ marginLeft: 16 }}>
                        <Tag color={getActivityColor(activity.type)}>
                          {activity.type === 'TRANSPORT' && '交通'}
                          {activity.type === 'ACCOMMODATION' && '住宿'}
                          {activity.type === 'FOOD' && '餐饮'}
                          {activity.type === 'SIGHTSEEING' && '观光'}
                          {activity.type === 'SHOPPING' && '购物'}
                          {activity.type === 'OTHER' && '其他'}
                        </Tag>
                      </div>
                    </div>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ))}
      
      {dailyPlans.filter(plan => plan.day_number === selectedDay).length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <ClockCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div>
            <Text type="secondary">暂无第{selectedDay}天的行程安排</Text>
          </div>
        </div>
      )}
    </Card>
  )
}
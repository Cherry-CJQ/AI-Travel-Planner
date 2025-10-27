import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Button,
  Space,
  Tabs,
  List,
  Tag,
  Statistic,
  Row,
  Col,
  Spin,
  message,
  Divider
} from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTripStore } from '../stores/tripStore'
import { useBudgetStore } from '../stores/budgetStore'
import { Trip, DailyPlan, Expense } from '../types/database'
import { dailyPlanService } from '../services/supabase'
import { BudgetOverview } from '../components/Budget/BudgetOverview'
import { ExpenseManager } from '../components/Budget/ExpenseManager'
import { TripDetailMap } from '../components/Trip/TripDetailMap'

const { Title, Text } = Typography
const { TabPane } = Tabs

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { setCurrentTrip, deleteTrip, loading } = useTripStore()
  const { setCurrentTrip: setBudgetTrip } = useBudgetStore()
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([])
  const [activeTab, setActiveTab] = useState('budget')
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [highlightedActivity, setHighlightedActivity] = useState<{ dayNumber: number; activityIndex: number } | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = useState(66) // 默认左侧占66%

  useEffect(() => {
    if (tripId) {
      loadTripData()
    }
  }, [tripId])

  const loadTripData = async () => {
    try {
      // 加载用户行程列表并找到对应的行程
      const { loadUserTrips } = useTripStore.getState()
      const userTrips = await loadUserTrips()
      console.log('加载的用户行程列表:', userTrips)
      
      const foundTrip = userTrips.find(t => t.id === tripId)
      console.log('找到的行程数据:', foundTrip)
      
      if (foundTrip) {
        setTrip(foundTrip)
        setCurrentTrip(foundTrip)
        setBudgetTrip(foundTrip)
        
        // 加载每日计划
        const { data: plans } = await dailyPlanService.getTripDailyPlans(tripId!)
        if (plans) {
          setDailyPlans(plans)
        }
      } else {
        message.error('行程不存在')
        navigate('/trips')
      }
    } catch (error) {
      message.error('加载行程数据失败')
      navigate('/trips')
    }
  }

  const handleDeleteTrip = async () => {
    if (!trip) return
    
    try {
      await deleteTrip(trip.id)
      message.success('行程删除成功')
      navigate('/trips')
    } catch (error) {
      message.error('删除行程失败')
    }
  }

  const formatBudget = (budget: number) => {
    return `¥${budget.toLocaleString()}`
  }

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TRANSPORT: 'blue',
      ACCOMMODATION: 'green',
      FOOD: 'orange',
      SIGHTSEEING: 'purple',
      SHOPPING: 'magenta',
      OTHER: 'default'
    }
    return colors[type] || 'default'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>行程不存在</Title>
        <Button type="primary" onClick={() => navigate('/trips')}>
          返回行程列表
        </Button>
      </div>
    )
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
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能开发中')}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDeleteTrip}
          >
            删除
          </Button>
        </Space>
        
        <Title level={2}>{trip.title}</Title>
        <Text type="secondary">{trip.destination} · {trip.duration} 天行程</Text>
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总预算"
              value={trip.budget}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="行程天数"
              value={trip.duration}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="创建时间"
              value={new Date(trip.created_at).toLocaleDateString()}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最后更新"
              value={new Date(trip.updated_at).toLocaleDateString()}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 主内容区域 - 行程信息与地图并排显示 */}
      <div className="trip-plan-container" style={{ display: 'flex', position: 'relative' }}>
        {/* 左侧：行程信息 - 主要信息区域 */}
        <div
          className="trip-plan-left-panel"
          style={{
            width: `${leftPanelWidth}%`,
            paddingRight: '8px'
          }}
        >
          <Card title="行程信息" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{trip.title}</Title>
              <Text type="secondary">{trip.destination} · {trip.duration} 天行程</Text>
            </div>
            
            {/* 天数选择器 */}
            <div style={{ marginBottom: 16 }}>
              <Space wrap>
                {dailyPlans.map((plan) => (
                  <Button
                    key={plan.day_number}
                    type={selectedDay === plan.day_number ? 'primary' : 'default'}
                    size="small"
                    onClick={() => setSelectedDay(plan.day_number)}
                  >
                    第{plan.day_number}天
                  </Button>
                ))}
              </Space>
            </div>

            {/* 当前选中天数的行程安排 */}
            {dailyPlans
              .filter(plan => plan.day_number === selectedDay)
              .map((plan) => (
                <div key={plan.day_number}>
                  <Title level={5} style={{ marginBottom: 16, color: '#1890ff' }}>
                    {plan.theme}
                  </Title>
                  
                  <List
                    dataSource={plan.activities}
                    renderItem={(activity) => (
                      <List.Item
                        style={{
                          cursor: activity.location ? 'pointer' : 'default',
                          padding: '12px 0',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onClick={() => {
                          if (activity.location) {
                            // 设置高亮活动并定位到地图位置
                            setHighlightedActivity({
                              dayNumber: plan.day_number,
                              activityIndex: plan.activities.indexOf(activity)
                            })
                            message.info(`已定位到: ${activity.location.name}`)
                          } else {
                            // 即使没有location信息，也尝试定位
                            setHighlightedActivity({
                              dayNumber: plan.day_number,
                              activityIndex: plan.activities.indexOf(activity)
                            })
                            message.info(`尝试定位: ${activity.name}`)
                          }
                        }}
                      >
                        <div style={{ width: '100%' }}>
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
                                    📍 {activity.location.name}
                                  </Text>
                                </div>
                              )}
                            </div>
                            
                            <div style={{ marginLeft: 16 }}>
                              <Tag color={getActivityTypeColor(activity.type)}>
                                {activity.type === 'TRANSPORT' && '交通'}
                                {activity.type === 'ACCOMMODATION' && '住宿'}
                                {activity.type === 'FOOD' && '餐饮'}
                                {activity.type === 'SIGHTSEEING' && '观光'}
                                {activity.type === 'SHOPPING' && '购物'}
                                {activity.type === 'OTHER' && '其他'}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            
            {dailyPlans.filter(plan => plan.day_number === selectedDay).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">暂无第{selectedDay}天的行程安排</Text>
              </div>
            )}
          </Card>
        </div>
        
        {/* 可调节宽度的分隔条 */}
        <div
          className="resizable-divider"
          style={{
            width: '8px',
            height: '500px',
            alignSelf: 'flex-start',
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
        
        {/* 右侧：地图 - 辅助信息区域 */}
        <div
          className="trip-plan-right-panel"
          style={{
            width: `${100 - leftPanelWidth}%`,
            paddingLeft: '8px'
          }}
        >
          <TripDetailMap
            dailyPlans={dailyPlans}
            selectedDay={selectedDay}
            destination={trip.destination}
            onMarkerClick={setSelectedDay}
            highlightedActivity={highlightedActivity}
          />
        </div>
      </div>

      {/* 其他功能标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 24 }}>
        <TabPane tab="预算管理" key="budget">
          <Row gutter={16}>
            <Col span={8}>
              <BudgetOverview tripId={tripId!} />
            </Col>
            <Col span={16}>
              <ExpenseManager tripId={tripId!} />
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="行程偏好" key="preferences">
          <Card>
            <Title level={4}>旅行偏好</Title>
            {trip.preferences && trip.preferences.length > 0 ? (
              <Space wrap>
                {trip.preferences.map((preference, index) => (
                  <Tag key={index} color="blue">
                    {preference}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">暂无偏好设置</Text>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default TripDetailPage
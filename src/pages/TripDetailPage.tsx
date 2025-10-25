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

const { Title, Text } = Typography
const { TabPane } = Tabs

const TripDetailPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { setCurrentTrip, deleteTrip, loading } = useTripStore()
  const { setCurrentTrip: setBudgetTrip } = useBudgetStore()
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (tripId) {
      loadTripData()
    }
  }, [tripId])

  const loadTripData = async () => {
    try {
      // 加载用户行程列表并找到对应的行程
      const userTrips = await useTripStore.getState().loadUserTrips()
      const foundTrip = userTrips.find(t => t.id === tripId)
      
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

      {/* 标签页内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="行程概览" key="overview">
          <Row gutter={16}>
            <Col span={16}>
              {/* 每日计划 */}
              <Card title="每日行程安排" style={{ marginBottom: 16 }}>
                {dailyPlans.length > 0 ? (
                  dailyPlans.map((plan) => (
                    <div key={plan.id} style={{ marginBottom: 24 }}>
                      <Title level={4}>第 {plan.day_number} 天 - {plan.theme}</Title>
                      <List
                        dataSource={plan.activities}
                        renderItem={(activity) => (
                          <List.Item>
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <Text strong>{activity.time}</Text>
                                  <Text style={{ marginLeft: 8 }}>{activity.name}</Text>
                                  <Tag 
                                    color={getActivityTypeColor(activity.type)} 
                                    style={{ marginLeft: 8 }}
                                  >
                                    {activity.type}
                                  </Tag>
                                </div>
                                {activity.cost && (
                                  <Text type="secondary">¥{activity.cost}</Text>
                                )}
                              </div>
                              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                {activity.description}
                              </Text>
                            </div>
                          </List.Item>
                        )}
                      />
                      {plan.day_number < dailyPlans.length && <Divider />}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Text type="secondary">暂无行程安排</Text>
                  </div>
                )}
              </Card>
            </Col>
            <Col span={8}>
              {/* 预算概览 */}
              <BudgetOverview tripId={tripId!} />
            </Col>
          </Row>
        </TabPane>

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
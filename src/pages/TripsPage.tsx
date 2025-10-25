import React, { useEffect, useState } from 'react'
import { Typography, Button, Card, List, Tag, Space, Modal, message, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useTripStore } from '../stores/tripStore'
import { Trip } from '../types/database'
import { useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

const TripsPage: React.FC = () => {
  const navigate = useNavigate()
  const { loadUserTrips, deleteTrip, loading } = useTripStore()
  const [trips, setTrips] = useState<Trip[]>([])
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const userTrips = await loadUserTrips()
      setTrips(userTrips)
    } catch (error) {
      message.error('加载行程失败')
    }
  }

  const handleViewTrip = (trip: Trip) => {
    navigate(`/trip/${trip.id}`)
  }

  const handleEditTrip = (trip: Trip) => {
    // 跳转到编辑页面或打开编辑模态框
    message.info('编辑功能开发中')
  }

  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!selectedTrip) return
    
    try {
      await deleteTrip(selectedTrip.id)
      message.success('行程删除成功')
      setDeleteModalVisible(false)
      setSelectedTrip(null)
      await loadTrips()
    } catch (error) {
      message.error('删除行程失败')
    }
  }

  const formatBudget = (budget: number) => {
    return `¥${budget.toLocaleString()}`
  }

  const getBudgetLevel = (budget: number) => {
    if (budget < 1000) return 'success'
    if (budget < 5000) return 'warning'
    return 'error'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>我的行程</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/trip/new')}
        >
          新建行程
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : trips.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Title level={4} type="secondary">暂无行程记录</Title>
            <Text type="secondary">开始规划您的第一个旅行行程</Text>
            <br />
            <Button
              type="primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/trip/new')}
            >
              开始规划
            </Button>
          </div>
        </Card>
      ) : (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={trips}
          renderItem={(trip) => (
            <List.Item>
              <Card
                title={trip.title}
                extra={
                  <Space>
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewTrip(trip)}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditTrip(trip)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteTrip(trip)}
                    />
                  </Space>
                }
                actions={[
                  <Button
                    type="link"
                    onClick={() => handleViewTrip(trip)}
                  >
                    查看详情
                  </Button>
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong>目的地：</Text>
                  <Text>{trip.destination}</Text>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>行程天数：</Text>
                  <Text>{trip.duration} 天</Text>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>预算：</Text>
                  <Tag color={getBudgetLevel(trip.budget)}>
                    {formatBudget(trip.budget)}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary">
                    创建时间：{new Date(trip.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}

      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false)
          setSelectedTrip(null)
        }}
        okText="删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除行程 "{selectedTrip?.title}" 吗？此操作不可恢复。</p>
      </Modal>
    </div>
  )
}

export default TripsPage
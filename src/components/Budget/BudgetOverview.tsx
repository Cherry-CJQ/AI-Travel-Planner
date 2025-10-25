import React from 'react'
import { 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Progress, 
  Alert, 
  Space, 
  Typography,
  Tag,
  List
} from 'antd'
import { 
  DollarOutlined, 
  WalletOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import { useBudgetStore } from '../../stores/budgetStore'

const { Title, Text } = Typography

interface BudgetOverviewProps {
  tripId: string
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ tripId }) => {
  const { 
    budgetSummary, 
    getBudgetAlerts, 
    getCategoryStats,
    loading 
  } = useBudgetStore()

  const alerts = getBudgetAlerts()
  const categoryStats = getCategoryStats()

  const { totalBudget, totalSpent, remainingBudget } = budgetSummary
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // 获取预算状态颜色
  const getBudgetStatusColor = () => {
    if (remainingBudget < 0) return '#ff4d4f' // 红色 - 超支
    if (usagePercentage > 80) return '#faad14' // 黄色 - 警告
    return '#52c41a' // 绿色 - 正常
  }

  // 获取预算状态文本
  const getBudgetStatusText = () => {
    if (remainingBudget < 0) return '预算超支'
    if (usagePercentage > 80) return '预算紧张'
    return '预算充足'
  }

  return (
    <div>
      {/* 预算概览卡片 */}
      <Card title="预算概览" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="总预算"
              value={totalBudget}
              prefix="¥"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="已支出"
              value={totalSpent}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="剩余预算"
              value={remainingBudget}
              prefix="¥"
              valueStyle={{ 
                color: remainingBudget >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Col>
        </Row>

        {/* 预算使用进度 */}
        <div style={{ marginTop: 24 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 8 
          }}>
            <Text>预算使用情况</Text>
            <Space>
              <Text>{Math.round(usagePercentage)}%</Text>
              <Tag color={getBudgetStatusColor()}>
                {getBudgetStatusText()}
              </Tag>
            </Space>
          </div>
          <Progress 
            percent={Math.min(usagePercentage, 100)}
            strokeColor={getBudgetStatusColor()}
            showInfo={false}
          />
        </div>
      </Card>

      {/* 预算警报 */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              type={alert.type === 'danger' ? 'error' : alert.type}
              showIcon
              icon={alert.type === 'danger' ? <ExclamationCircleOutlined /> : <ExclamationCircleOutlined />}
              style={{ marginBottom: 8 }}
            />
          ))}
        </div>
      )}

      {/* 类别支出统计 */}
      <Card title="类别支出统计" style={{ marginBottom: 24 }}>
        {categoryStats.length > 0 ? (
          <List
            dataSource={categoryStats}
            renderItem={(stat) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: 8 
                  }}>
                    <Text strong>{stat.category}</Text>
                    <Space>
                      <Text>¥{stat.spent.toLocaleString()}</Text>
                      <Text type="secondary">
                        / ¥{stat.budget.toLocaleString()}
                      </Text>
                    </Space>
                  </div>
                  <Progress 
                    percent={Math.round(stat.percentage)}
                    status={stat.percentage > 100 ? 'exception' : 'active'}
                    size="small"
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: 4 
                  }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      使用率: {Math.round(stat.percentage)}%
                    </Text>
                    <Text 
                      type={stat.percentage > 100 ? 'danger' : 'secondary'} 
                      style={{ fontSize: '12px' }}
                    >
                      {stat.percentage > 100 ? '超支' : '正常'}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <WalletOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <div>
              <Text type="secondary">暂无支出记录</Text>
            </div>
          </div>
        )}
      </Card>

      {/* 预算建议 */}
      <Card title="预算建议">
        <Space direction="vertical" style={{ width: '100%' }}>
          {remainingBudget > 0 ? (
            <>
              <Alert
                message="预算充足"
                description={`您还有 ¥${remainingBudget.toLocaleString()} 的剩余预算，可以继续享受旅行。`}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
              {usagePercentage > 50 && (
                <Alert
                  message="合理规划"
                  description="预算使用已过半，建议关注后续支出，避免超支。"
                  type="info"
                  showIcon
                />
              )}
            </>
          ) : (
            <Alert
              message="预算超支"
              description="您的支出已超过预算，建议调整后续消费计划。"
              type="warning"
              showIcon
            />
          )}

          {/* 通用建议 */}
          <div>
            <Text strong>预算管理小贴士：</Text>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>
                <Text type="secondary">
                  记录每一笔支出，保持预算意识
                </Text>
              </li>
              <li>
                <Text type="secondary">
                  优先保障住宿和交通等必要支出
                </Text>
              </li>
              <li>
                <Text type="secondary">
                  购物和娱乐支出可以适当灵活调整
                </Text>
              </li>
              <li>
                <Text type="secondary">
                  定期查看预算报告，及时调整消费计划
                </Text>
              </li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  )
}

// 预算摘要卡片（紧凑版）
interface BudgetSummaryCardProps {
  tripId: string
  compact?: boolean
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({ 
  tripId, 
  compact = false 
}) => {
  const { budgetSummary } = useBudgetStore()
  const { totalBudget, totalSpent, remainingBudget } = budgetSummary
  const usagePercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  if (compact) {
    return (
      <Card size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>预算: ¥{totalBudget.toLocaleString()}</Text>
            <Text>已用: ¥{totalSpent.toLocaleString()}</Text>
          </div>
          <Progress 
            percent={Math.min(usagePercentage, 100)}
            size="small"
            status={remainingBudget < 0 ? 'exception' : 'active'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type={remainingBudget >= 0 ? 'success' : 'danger'}>
              剩余: ¥{Math.abs(remainingBudget).toLocaleString()}
            </Text>
            <Text type="secondary">{Math.round(usagePercentage)}%</Text>
          </div>
        </Space>
      </Card>
    )
  }

  return (
    <Card>
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="总预算"
            value={totalBudget}
            prefix="¥"
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="已支出"
            value={totalSpent}
            prefix="¥"
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="剩余"
            value={remainingBudget}
            prefix="¥"
            valueStyle={{ 
              color: remainingBudget >= 0 ? '#52c41a' : '#ff4d4f' 
            }}
          />
        </Col>
      </Row>
      <div style={{ marginTop: 16 }}>
        <Progress 
          percent={Math.min(usagePercentage, 100)}
          status={remainingBudget < 0 ? 'exception' : 'active'}
        />
      </div>
    </Card>
  )
}
import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  message,
  Popconfirm,
  Typography,
  DatePicker
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { Expense } from '../../types/database'
import { useBudgetStore } from '../../stores/budgetStore'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

interface ExpenseManagerProps {
  tripId: string
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ tripId }) => {
  const [form] = Form.useForm()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  
  const { 
    expenses, 
    loading, 
    addExpense, 
    updateExpense, 
    deleteExpense 
  } = useBudgetStore()

  // 过滤支出记录
  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    getCategoryName(expense.category).toLowerCase().includes(searchKeyword.toLowerCase())
  )

  // 处理添加/编辑支出
  const handleSubmit = async (values: any) => {
    try {
      const expenseData = {
        trip_id: tripId,
        amount: values.amount,
        category: values.category,
        description: values.description || undefined
      }

      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData)
        message.success('支出记录更新成功')
      } else {
        await addExpense(expenseData)
        message.success('支出记录添加成功')
      }

      setIsModalVisible(false)
      setEditingExpense(null)
      form.resetFields()
    } catch (error: any) {
      message.error(error.message || '操作失败')
    }
  }

  // 处理编辑
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    form.setFieldsValue({
      amount: expense.amount,
      category: expense.category,
      description: expense.description
    })
    setIsModalVisible(true)
  }

  // 处理删除
  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId)
      message.success('支出记录删除成功')
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  // 打开添加模态框
  const showAddModal = () => {
    setEditingExpense(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false)
    setEditingExpense(null)
    form.resetFields()
  }

  // 获取类别名称
  const getCategoryName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      TRANSPORT: '交通',
      ACCOMMODATION: '住宿',
      FOOD: '餐饮',
      SIGHTSEEING: '景点',
      SHOPPING: '购物',
      OTHER: '其他'
    }
    return categoryNames[category] || category
  }

  // 获取类别颜色
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      TRANSPORT: 'blue',
      ACCOMMODATION: 'green',
      FOOD: 'orange',
      SIGHTSEEING: 'purple',
      SHOPPING: 'pink',
      OTHER: 'default'
    }
    return colors[category] || 'default'
  }

  // 表格列定义
  const columns = [
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#cf1322', fontSize: '16px' }}>
          ¥{amount.toLocaleString()}
        </Text>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={getCategoryColor(category)}>
          {getCategoryName(category)}
        </Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
      ellipsis: true
    },
    {
      title: '记录时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Expense) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这条支出记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>支出管理</Title>
          <Space>
            <Search
              placeholder="搜索支出记录..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              添加支出
            </Button>
          </Space>
        </div>
      </Card>

      {/* 支出表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredExpenses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingExpense ? '编辑支出记录' : '添加支出记录'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="金额"
            name="amount"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0' }
            ]}
          >
            <InputNumber
              placeholder="请输入金额"
              style={{ width: '100%' }}
              min={0.01}
              step={0.01}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            label="类别"
            name="category"
            rules={[{ required: true, message: '请选择支出类别' }]}
          >
            <Select placeholder="选择支出类别">
              <Option value="TRANSPORT">交通</Option>
              <Option value="ACCOMMODATION">住宿</Option>
              <Option value="FOOD">餐饮</Option>
              <Option value="SIGHTSEEING">景点</Option>
              <Option value="SHOPPING">购物</Option>
              <Option value="OTHER">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea
              placeholder="请输入支出描述（可选）"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingExpense ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

// 快速支出组件
interface QuickExpenseProps {
  tripId: string
  onExpenseAdded?: () => void
}

export const QuickExpense: React.FC<QuickExpenseProps> = ({ 
  tripId, 
  onExpenseAdded 
}) => {
  const [form] = Form.useForm()
  const { addExpense, loading } = useBudgetStore()

  const handleSubmit = async (values: any) => {
    try {
      await addExpense({
        trip_id: tripId,
        amount: values.amount,
        category: values.category,
        description: values.description || undefined
      })
      
      message.success('支出记录添加成功')
      form.resetFields()
      onExpenseAdded?.()
    } catch (error: any) {
      message.error(error.message || '添加失败')
    }
  }

  return (
    <Card title="快速记账" size="small">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="金额"
          name="amount"
          rules={[
            { required: true, message: '请输入金额' },
            { type: 'number', min: 0.01, message: '金额必须大于0' }
          ]}
        >
          <InputNumber
            placeholder="输入金额"
            style={{ width: '100%' }}
            min={0.01}
            step={0.01}
            precision={2}
          />
        </Form.Item>

        <Form.Item
          label="类别"
          name="category"
          rules={[{ required: true, message: '请选择类别' }]}
        >
          <Select placeholder="选择类别" size="small">
            <Option value="TRANSPORT">交通</Option>
            <Option value="ACCOMMODATION">住宿</Option>
            <Option value="FOOD">餐饮</Option>
            <Option value="SIGHTSEEING">景点</Option>
            <Option value="SHOPPING">购物</Option>
            <Option value="OTHER">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
        >
          <Input placeholder="简要描述（可选）" size="small" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            记录支出
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}
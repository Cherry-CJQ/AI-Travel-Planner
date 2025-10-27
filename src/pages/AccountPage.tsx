import React, { useState } from 'react'
import { Typography, Card, Form, Input, Button, Space, Alert, message, Modal, Tabs } from 'antd'
import { ExclamationCircleOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { useAppStore } from '../stores/appStore'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { TabPane } = Tabs

const AccountPage: React.FC = () => {
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { user, updateUserInfo, deleteAccount, changePassword } = useAppStore()
  const navigate = useNavigate()

  const onFinish = async (values: {
    name: string
    email: string
  }) => {
    if (!user) return
    
    setUpdateLoading(true)
    try {
      await updateUserInfo({
        name: values.name,
        email: values.email
      })
      message.success('用户信息更新成功！')
    } catch (error: any) {
      message.error(error.message || '更新用户信息失败')
    } finally {
      setUpdateLoading(false)
    }
  }

  const onPasswordChange = async (values: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('新密码和确认密码不一致')
      return
    }

    setChangePasswordLoading(true)
    try {
      await changePassword(values.currentPassword, values.newPassword)
      message.success('密码修改成功！')
      passwordForm.resetFields()
    } catch (error: any) {
      message.error(error.message || '修改密码失败')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      message.error('请输入 DELETE 确认删除账户')
      return
    }

    setDeleteLoading(true)
    try {
      await deleteAccount()
      message.success('账户已成功删除')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '删除账户失败')
    } finally {
      setDeleteLoading(false)
      setDeleteModalVisible(false)
      setConfirmText('')
    }
  }

  const showDeleteConfirm = () => {
    setDeleteModalVisible(true)
  }

  const handleDeleteModalCancel = () => {
    setDeleteModalVisible(false)
    setConfirmText('')
  }

  return (
    <div>
      <Title level={2}>账户管理</Title>
      <Paragraph>
        管理您的账户信息和安全设置
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="个人信息" key="profile">
          {/* 账户信息 */}
          <Card
            title="个人信息"
            style={{ marginBottom: 24 }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ maxWidth: 600 }}
              initialValues={{
                name: user?.name || '',
                email: user?.email || ''
              }}
            >
              <Form.Item
                label="用户名"
                name="name"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入您的用户名"
                />
              </Form.Item>

              <Form.Item
                label="邮箱地址"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入您的邮箱地址"
                  disabled // 邮箱通常不允许修改
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateLoading}
                  >
                    更新信息
                  </Button>
                  <Button onClick={() => form.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="修改密码" key="password">
          {/* 修改密码 */}
          <Card
            title="修改密码"
            style={{ marginBottom: 24 }}
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordChange}
              style={{ maxWidth: 600 }}
            >
              <Form.Item
                label="当前密码"
                name="currentPassword"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入当前密码"
                />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度至少6位' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入新密码"
                />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={changePasswordLoading}
                  >
                    修改密码
                  </Button>
                  <Button onClick={() => passwordForm.resetFields()}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="注销账户" key="security">
          {/* 账户安全 */}
          <Card
            title="账户安全"
            headStyle={{ borderBottom: '1px solid #f0f0f0' }}
          >
            <div style={{ padding: '16px 0' }}>
              <Alert
                message="危险操作"
                description="删除账户将永久删除您的所有数据，此操作不可撤销。"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              
              <Button
                type="primary"
                danger
                onClick={showDeleteConfirm}
                loading={deleteLoading}
              >
                注销账户
              </Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 删除账户确认模态框 */}
      <Modal
        title="确认删除账户"
        open={deleteModalVisible}
        onOk={handleDeleteAccount}
        onCancel={handleDeleteModalCancel}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{
          danger: true,
          disabled: confirmText !== 'DELETE',
          loading: deleteLoading
        }}
      >
        <div>
          <p style={{ color: '#ff4d4f', marginBottom: 16 }}>
            <strong>警告：此操作不可撤销！</strong>
          </p>
          <p>删除账户将永久删除：</p>
          <ul style={{ marginLeft: 20, marginBottom: 16 }}>
            <li>您的所有行程数据</li>
            <li>所有费用记录</li>
            <li>用户设置</li>
            <li>账户信息</li>
          </ul>
          <p>请在下方输入 <strong>DELETE</strong> 确认删除：</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="输入 DELETE 确认删除"
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  )
}

export default AccountPage
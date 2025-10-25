import React from 'react'
import { Typography, Empty, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Title } = Typography

const TripsPage: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>我的行程</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          新建行程
        </Button>
      </div>
      
      <Empty 
        description="暂无行程记录"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <Button type="primary">开始规划第一个行程</Button>
      </Empty>
    </div>
  )
}

export default TripsPage
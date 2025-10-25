import React, { useState } from 'react'
import { Button, Space, Typography, Alert, message } from 'antd'
import { AudioOutlined, AudioMutedOutlined, PlusOutlined } from '@ant-design/icons'
import { useVoiceRecognition } from '../../services/voiceRecognition'

const { Text, Title } = Typography

interface VoiceExpenseProps {
  onExpenseAdd: (amount: number, category: string, description?: string) => void
  tripId?: string
}

const VoiceExpense: React.FC<VoiceExpenseProps> = ({ 
  onExpenseAdd,
  tripId 
}) => {
  const {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isSupported
  } = useVoiceRecognition()

  const [parsedExpense, setParsedExpense] = useState<{
    amount?: number
    category?: string
    description?: string
  } | null>(null)

  // 解析语音输入的费用信息
  const parseExpenseFromText = (text: string) => {
    // 简单的规则解析，实际项目中可以使用更复杂的NLP
    const patterns = [
      // 格式：花了XX元 [类别] [描述]
      /花了\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：支出XX元 [类别] [描述]
      /支出\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：消费XX元 [类别] [描述]
      /消费\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：买了XX元 [类别] [描述]
      /买了\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:的)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 简单格式：XX元 [类别]
      /(\d+(?:\.\d+)?)\s*元(?:\s*(?:的)?\s*([^，。！？]+))?/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const amount = parseFloat(match[1])
        const category = match[2] ? categorizeExpense(match[2]) : 'OTHER'
        const description = match[3] || match[2] || undefined

        return { amount, category, description }
      }
    }

    return null
  }

  // 分类费用
  const categorizeExpense = (text: string): string => {
    const categories: { [key: string]: string[] } = {
      TRANSPORT: ['打车', '交通', '地铁', '公交', '出租车', '机票', '火车'],
      ACCOMMODATION: ['住宿', '酒店', '旅馆', '民宿'],
      FOOD: ['吃饭', '餐饮', '餐厅', '美食', '早餐', '午餐', '晚餐', '小吃'],
      SIGHTSEEING: ['门票', '景点', '游览', '观光', '博物馆', '公园'],
      SHOPPING: ['购物', '买', '购买', '商品', '纪念品'],
      OTHER: ['其他', '杂项']
    }

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category
      }
    }

    return 'OTHER'
  }

  // 处理识别结果
  React.useEffect(() => {
    if (transcript) {
      const expense = parseExpenseFromText(transcript)
      setParsedExpense(expense)
    }
  }, [transcript])

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
      setParsedExpense(null)
    } else {
      startRecording()
      setParsedExpense(null)
    }
  }

  const handleAddExpense = () => {
    if (parsedExpense && parsedExpense.amount) {
      onExpenseAdd(
        parsedExpense.amount,
        parsedExpense.category || 'OTHER',
        parsedExpense.description
      )
      setParsedExpense(null)
      message.success('费用记录添加成功！')
    }
  }

  // 如果不支持语音识别
  if (!isSupported) {
    return (
      <Alert
        message="语音记账不可用"
        description="您的浏览器不支持语音识别功能，无法使用语音记账。"
        type="warning"
        showIcon
      />
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <Title level={4}>语音记账</Title>
      
      {/* 语音控制按钮 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <Space>
          <Button
            type={isRecording ? "primary" : "default"}
            danger={isRecording}
            icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
            onClick={handleToggleRecording}
            className={isRecording ? 'voice-recording' : ''}
            size="large"
          >
            {isRecording ? '停止录音' : '开始语音记账'}
          </Button>
          
          {isRecording && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ff4d4f',
                  marginRight: 8,
                  animation: 'pulse 1.5s infinite'
                }} 
              />
              <Text type="secondary">正在聆听...</Text>
            </div>
          )}
        </Space>
      </div>

      {/* 识别结果显示 */}
      {transcript && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          border: '1px solid #d9d9d9',
          marginBottom: 16
        }}>
          <Text strong>识别结果：</Text>
          <br />
          <Text>{transcript}</Text>
        </div>
      )}

      {/* 解析的费用信息 */}
      {parsedExpense && parsedExpense.amount && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f6ffed',
          borderRadius: '6px',
          border: '1px solid #b7eb8f',
          marginBottom: 16
        }}>
          <Title level={5} style={{ marginBottom: 12 }}>解析的费用信息</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>金额：</Text>
              <Text style={{ color: '#cf1322', fontSize: '16px', marginLeft: 8 }}>
                ¥{parsedExpense.amount}
              </Text>
            </div>
            <div>
              <Text strong>类别：</Text>
              <Text style={{ marginLeft: 8 }}>
                {getCategoryName(parsedExpense.category || 'OTHER')}
              </Text>
            </div>
            {parsedExpense.description && (
              <div>
                <Text strong>描述：</Text>
                <Text style={{ marginLeft: 8 }}>{parsedExpense.description}</Text>
              </div>
            )}
          </Space>
          
          <div style={{ marginTop: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddExpense}
            >
              确认添加费用
            </Button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 使用提示 */}
      <Alert
        message="语音记账使用说明"
        description={
          <div>
            <Text>请尝试说出类似：</Text>
            <br />
            • "打车花了50元"
            <br />
            • "吃饭消费120元在海底捞"
            <br />
            • "买了80元纪念品"
            <br />
            • "门票支出200元"
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  )
}

// 获取类别名称
const getCategoryName = (category: string): string => {
  const categoryNames: { [key: string]: string } = {
    TRANSPORT: '交通',
    ACCOMMODATION: '住宿',
    FOOD: '餐饮',
    SIGHTSEEING: '景点',
    SHOPPING: '购物',
    OTHER: '其他'
  }
  return categoryNames[category] || category
}

export default VoiceExpense
import React, { useState } from 'react'
import { Button, Space, Typography, Alert, message, InputNumber, Select, Form, Input } from 'antd'
import { AudioOutlined, AudioMutedOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useVoiceRecognition } from '../../services/voiceRecognition'
import { llmService } from '../../services/llmService'

const { Text, Title } = Typography
const { Option } = Select
const { TextArea } = Input

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
    clearTranscript,
    isSupported
  } = useVoiceRecognition()

  const [parsedExpense, setParsedExpense] = useState<{
    amount?: number
    category?: string
    description?: string
  } | null>(null)
  const [manualForm] = Form.useForm()
  const [showManualForm, setShowManualForm] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  // 解析语音输入的费用信息 - 使用大模型
  const parseExpenseFromText = async (text: string) => {
    console.log('开始解析语音输入:', text)
    console.log('LLM服务状态:', llmService)
    
    try {
      const result = await llmService.parseExpenseFromText(text)
      console.log('大模型解析结果:', result)
      return result
    } catch (error) {
      console.error('大模型解析失败:', error)
      console.log('回退到本地解析')
      // 如果大模型解析失败，使用本地解析作为备选
      return parseExpenseLocally(text)
    }
  }

  // 本地解析器作为备选方案
  const parseExpenseLocally = (text: string) => {
    // 改进的规则解析，覆盖更多用户表达方式
    const patterns = [
      // 格式：花了XX元 [类别] [描述]
      /花了\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：支出XX元 [类别] [描述]
      /支出\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：消费XX元 [类别] [描述]
      /消费\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：买了XX元 [类别] [描述]
      /买了\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:的)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：支付XX元 [类别] [描述]
      /支付\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：付了XX元 [类别] [描述]
      /付了\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：用掉XX元 [类别] [描述]
      /用掉\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 格式：花费XX元 [类别] [描述]
      /花费\s*(\d+(?:\.\d+)?)\s*元(?:\s*(?:在)?\s*([^，。！？]+))?(?:\s*，?\s*(.+))?/,
      // 简单格式：XX元 [类别]
      /(\d+(?:\.\d+)?)\s*元(?:\s*(?:的)?\s*([^，。！？]+))?/,
      // 格式：XX块钱 [类别]
      /(\d+(?:\.\d+)?)\s*块钱?(?:\s*(?:的)?\s*([^，。！？]+))?/,
      // 格式：XX块 [类别]
      /(\d+(?:\.\d+)?)\s*块(?:\s*(?:的)?\s*([^，。！？]+))?/,
      // 格式：XX [类别] 花了XX元
      /([^，。！？]+)\s*花了\s*(\d+(?:\.\d+)?)\s*元/,
      // 格式：XX [类别] 消费XX元
      /([^，。！？]+)\s*消费\s*(\d+(?:\.\d+)?)\s*元/,
      // 新增：更简单的格式，只匹配金额
      /(\d+(?:\.\d+)?)\s*(?:元|块钱|块)/,
      // 新增：包含金额和简单描述
      /(\d+(?:\.\d+)?)\s*(?:元|块钱|块)\s*(.+)/,
      // 新增：包含金额和类别关键词
      /(\d+(?:\.\d+)?)\s*(?:元|块钱|块)\s*(?:的)?\s*(.+)/,
      // 新增：包含金额和"在"字描述
      /(\d+(?:\.\d+)?)\s*(?:元|块钱|块)\s*(?:在)?\s*(.+)/
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        let amount, category, description
        
        // 处理不同的匹配组顺序
        if (pattern.source.includes('花了') || pattern.source.includes('支出') ||
            pattern.source.includes('消费') || pattern.source.includes('买了') ||
            pattern.source.includes('支付') || pattern.source.includes('付了') ||
            pattern.source.includes('用掉') || pattern.source.includes('花费')) {
          amount = parseFloat(match[1])
          // 使用整个文本进行类别识别，提高准确性
          category = categorizeExpense(text)
          description = match[3] || match[2] || undefined
        } else if (pattern.source.includes('花了') || pattern.source.includes('消费')) {
          // 处理反向格式：类别 花了XX元
          category = categorizeExpense(match[1])
          amount = parseFloat(match[2])
          description = match[1] || undefined
        } else {
          // 简单格式
          amount = parseFloat(match[1])
          // 使用整个文本进行类别识别，提高准确性
          category = categorizeExpense(text)
          description = match[2] || undefined
        }

        console.log('本地解析结果:', { amount, category, description, pattern: pattern.source })
        return { amount, category, description }
      }
    }

    // 后备解析：尝试提取任何数字作为金额
    const fallbackAmountMatch = text.match(/(\d+(?:\.\d+)?)/)
    if (fallbackAmountMatch) {
      const amount = parseFloat(fallbackAmountMatch[1])
      console.log('后备解析：找到金额', amount)
      return { amount, category: 'OTHER', description: text }
    }

    return null
  }

  // 分类费用 - 增强版
  const categorizeExpense = (text: string): string => {
    const categories: { [key: string]: string[] } = {
      TRANSPORT: [
        '打车', '打的', '叫车', '网约车', '交通', '地铁', '公交', '出租车', '机票', '火车', '高铁', '动车',
        '汽车', '巴士', '专车', '滴滴', 'uber', '的士', '船票', '轮渡', '停车费',
        '油费', '过路费', '租车', '共享单车', '自行车', '摩托车'
      ],
      ACCOMMODATION: [
        '住宿', '酒店', '旅馆', '民宿', '宾馆', '客栈', '青旅', '公寓', '房间',
        '住宿费', '房费', '酒店费', '旅馆费', '民宿费'
      ],
      FOOD: [
        '吃饭', '餐饮', '餐厅', '美食', '早餐', '午餐', '晚餐', '小吃', '零食',
        '饮料', '咖啡', '茶', '奶茶', '水果', '超市', '买菜', '食材', '外卖',
        '快餐', '火锅', '烧烤', '自助餐', '西餐', '中餐', '日料', '韩餐',
        '面包', '蛋糕', '甜点', '冰淇淋', '酒水', '酒吧'
      ],
      SIGHTSEEING: [
        '门票', '景点', '游览', '观光', '博物馆', '公园', '动物园', '植物园',
        '游乐园', '海洋馆', '展览', '演出', '电影', '剧院', '音乐会', '演唱会',
        '温泉', '滑雪', '登山', '徒步', '旅游', '旅行', '参观', '门票费'
      ],
      SHOPPING: [
        '购物', '买', '购买', '商品', '纪念品', '礼物', '衣服', '鞋子', '包包',
        '化妆品', '护肤品', '首饰', '手表', '电子产品', '手机', '电脑', '相机',
        '家电', '家具', '日用品', '百货', '商场', '超市', '便利店', '网购',
        '淘宝', '京东', '拼多多', '衣服', '鞋子', '包包', '化妆品'
      ],
      OTHER: ['其他', '杂项', '费用', '支出', '花费', '消费']
    }

    // 将文本转换为小写进行匹配
    const lowerText = text.toLowerCase()
    
    // 计算每个类别的匹配分数
    const scores: { [key: string]: number } = {}
    
    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += 1
          // 如果关键词完全匹配，增加权重
          if (lowerText === keyword.toLowerCase()) {
            score += 2
          }
        }
      }
      scores[category] = score
    }
    
    // 找到最高分数的类别
    let bestCategory = 'OTHER'
    let highestScore = 0
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score
        bestCategory = category
      }
    }
    
    console.log('类别识别结果:', { text, scores, bestCategory })
    
    return bestCategory
  }

  // 处理识别结果
  React.useEffect(() => {
    const handleTranscript = async () => {
      if (transcript) {
        console.log('语音识别结果:', transcript)
        setIsParsing(true)
        try {
          const expense = await parseExpenseFromText(transcript)
          console.log('解析的费用信息:', expense)
          setParsedExpense(expense)
        } catch (error) {
          console.error('解析失败:', error)
          setParsedExpense(null)
        } finally {
          setIsParsing(false)
        }
      }
    }
    
    handleTranscript()
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
      clearTranscript() // 添加成功后清除识别内容
      message.success('费用记录添加成功！')
    }
  }

  const handleManualSubmit = async (values: any) => {
    try {
      await onExpenseAdd(
        values.amount,
        values.category || 'OTHER',
        values.description
      )
      manualForm.resetFields()
      setShowManualForm(false)
      message.success('手动添加费用成功！')
    } catch (error: any) {
      message.error(error.message || '添加失败')
    }
  }

  const toggleManualForm = () => {
    setShowManualForm(!showManualForm)
    if (!showManualForm) {
      manualForm.resetFields()
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
          
          {transcript && (
            <Button
              type="default"
              icon={<DeleteOutlined />}
              onClick={clearTranscript}
              disabled={isRecording}
              size="large"
            >
              清除内容
            </Button>
          )}
          
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
          {isParsing && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <i>正在使用大模型解析费用信息...</i>
              </Text>
            </div>
          )}
          {!isParsing && parsedExpense && (
            <div style={{ marginTop: 8 }}>
              <Text type="success" style={{ fontSize: '12px' }}>
                <i>✓ 大模型解析完成</i>
              </Text>
            </div>
          )}
          {!isParsing && !parsedExpense && (
            <div style={{ marginTop: 8 }}>
              <Text type="warning" style={{ fontSize: '12px' }}>
                <i>⚠ 使用本地解析</i>
              </Text>
            </div>
          )}
        </div>
      )}

      {/* 解析的费用信息 */}
      {parsedExpense && parsedExpense.amount ? (
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
              <Select
                value={parsedExpense.category || 'OTHER'}
                onChange={(value) => setParsedExpense(prev => prev ? { ...prev, category: value } : null)}
                size="small"
                style={{ marginLeft: 8, width: 120 }}
              >
                <Option value="TRANSPORT">交通</Option>
                <Option value="ACCOMMODATION">住宿</Option>
                <Option value="FOOD">餐饮</Option>
                <Option value="SIGHTSEEING">景点</Option>
                <Option value="SHOPPING">购物</Option>
                <Option value="OTHER">其他</Option>
              </Select>
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
      ) : transcript && (
        <Alert
          message="未能识别费用信息"
          description={
            <div>
              <Text>请尝试说出包含金额的语句，例如：</Text>
              <br />
              • "打车花了50元"
              <br />
              • "吃饭消费120元"
              <br />
              • "买了80元纪念品"
              <br />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: 8 }}>
                当前识别内容: "{transcript}"
              </Text>
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
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

      {/* 手动输入表单 */}
      <div style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          onClick={toggleManualForm}
          block
        >
          {showManualForm ? '隐藏手动输入' : '手动输入费用'}
        </Button>
        
        {showManualForm && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fafafa',
            borderRadius: '6px',
            marginTop: 8,
            border: '1px solid #d9d9d9'
          }}>
            <Form
              form={manualForm}
              layout="vertical"
              onFinish={handleManualSubmit}
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
                <Select placeholder="选择类别">
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
                <TextArea
                  placeholder="简要描述（可选）"
                  rows={2}
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button onClick={() => setShowManualForm(false)}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    添加费用
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>

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
            <br />
            • "支付150元住宿费"
            <br />
            • "付了60块钱地铁票"
            <br />
            • "用掉300块买衣服"
            <br />
            • "交通花了80元打车"
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
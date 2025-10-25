import React from 'react'
import { Button, Space, Typography, Alert } from 'antd'
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons'
import { useVoiceRecognition } from '../../services/voiceRecognition'

const { Text } = Typography

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void
  placeholder?: string
  disabled?: boolean
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscriptChange, 
  placeholder = "点击麦克风开始说话...",
  disabled = false
}) => {
  const {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isSupported
  } = useVoiceRecognition()

  // 当识别结果变化时通知父组件
  React.useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript)
    }
  }, [transcript, onTranscriptChange])

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // 如果不支持语音识别
  if (!isSupported) {
    return (
      <Alert
        message="语音识别不可用"
        description="您的浏览器不支持语音识别功能，请使用最新版本的Chrome、Edge或Safari浏览器。"
        type="warning"
        showIcon
      />
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 语音控制按钮 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <Space>
          <Button
            type={isRecording ? "primary" : "default"}
            danger={isRecording}
            icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
            onClick={handleToggleRecording}
            disabled={disabled}
            className={isRecording ? 'voice-recording' : ''}
          >
            {isRecording ? '停止录音' : '开始录音'}
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
              <Text type="secondary">录音中...</Text>
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
          marginBottom: 8,
          minHeight: '40px'
        }}>
          <Text>{transcript}</Text>
        </div>
      )}

      {/* 占位符提示 */}
      {!transcript && !isRecording && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fafafa',
          borderRadius: '6px',
          border: '1px dashed #d9d9d9',
          marginBottom: 8,
          minHeight: '40px',
          color: '#bfbfbf'
        }}>
          <Text type="secondary">{placeholder}</Text>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 8 }}
        />
      )}

      {/* 使用提示 */}
      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
        <Text type="secondary">
          提示：点击麦克风按钮开始说话，系统会自动将语音转换为文字
        </Text>
      </div>
    </div>
  )
}

export default VoiceInput
// 语音识别服务
// 支持科大讯飞语音识别API和浏览器原生Web Speech API

import { VoiceRecognitionResult } from '../types/database'

// 科大讯飞语音识别配置
interface IFlyTekConfig {
  appId?: string
  apiKey?: string
  apiSecret?: string
}

class VoiceRecognitionService {
  private recognition: any = null
  private isRecording = false
  private onResultCallback: ((result: VoiceRecognitionResult) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  // 初始化语音识别
  initialize(config?: IFlyTekConfig) {
    // 优先使用用户配置的科大讯飞API
    if (config?.apiKey) {
      this.initializeIFlyTek(config)
    } else {
      // 使用浏览器原生Web Speech API作为备用方案
      this.initializeWebSpeech()
    }
  }

  // 初始化科大讯飞语音识别
  private initializeIFlyTek(config: IFlyTekConfig) {
    console.log('初始化科大讯飞语音识别', config)
    // 这里需要集成科大讯飞Web API
    // 由于科大讯飞SDK需要特定的引入方式，这里先使用模拟实现
    this.recognition = {
      start: () => this.simulateIFlyTekRecognition(),
      stop: () => { this.isRecording = false }
    }
  }

  // 初始化Web Speech API
  private initializeWebSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      
      this.recognition.continuous = true  // 使用连续模式
      this.recognition.interimResults = true
      this.recognition.lang = 'zh-CN'

      this.recognition.onresult = (event: any) => {
        // 获取最新的结果
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        const confidence = result[0].confidence
        
        if (this.onResultCallback) {
          this.onResultCallback({
            text: transcript,
            confidence,
            isFinal: result.isFinal
          })
        }
      }

      this.recognition.onerror = (event: any) => {
        this.isRecording = false
        if (this.onErrorCallback) {
          this.onErrorCallback(this.getErrorMessage(event.error))
        }
      }

      this.recognition.onend = () => {
        this.isRecording = false
      }
    } else {
      console.warn('浏览器不支持Web Speech API')
    }
  }

  // 模拟科大讯飞语音识别（开发环境使用）
  private simulateIFlyTekRecognition() {
    console.log('模拟科大讯飞语音识别')
    this.isRecording = true
    
    // 模拟识别过程
    setTimeout(() => {
      if (this.onResultCallback) {
        this.onResultCallback({
          text: '这是一个模拟的语音识别结果',
          confidence: 0.9,
          isFinal: true
        })
      }
      this.isRecording = false
    }, 2000)
  }

  // 开始录音
  startRecording(onResult: (result: VoiceRecognitionResult) => void, onError: (error: string) => void) {
    if (this.isRecording) {
      onError('正在录音中，请先停止当前录音')
      return
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError

    if (this.recognition) {
      try {
        this.recognition.start()
        this.isRecording = true
      } catch (error) {
        onError('启动语音识别失败')
      }
    } else {
      onError('语音识别未初始化')
    }
  }

  // 停止录音
  stopRecording() {
    if (this.recognition && this.isRecording) {
      this.recognition.stop()
      this.isRecording = false
    }
  }

  // 检查是否支持语音识别
  isSupported(): boolean {
    return !!(this.recognition || ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window))
  }

  // 获取错误信息
  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': '未检测到语音输入',
      'audio-capture': '无法访问麦克风',
      'not-allowed': '麦克风访问被拒绝',
      'network': '网络连接错误',
      'aborted': '语音识别被中止',
      'bad-grammar': '语法错误',
      'language-not-supported': '不支持的语言'
    }
    return errorMessages[error] || '语音识别发生未知错误'
  }

  // 获取当前录音状态
  getRecordingStatus(): boolean {
    return this.isRecording
  }

  // 清理资源
  destroy() {
    if (this.recognition) {
      this.recognition.stop()
      this.recognition = null
    }
    this.isRecording = false
    this.onResultCallback = null
    this.onErrorCallback = null
  }
}

// 创建全局语音识别服务实例
export const voiceRecognitionService = new VoiceRecognitionService()

// 语音识别Hook
export const useVoiceRecognition = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(() => {
    setError(null)
    // 开始录音时不清空之前的识别结果
    setIsRecording(true)

    voiceRecognitionService.startRecording(
      (result) => {
        // 只累积最终结果，不累积临时结果
        if (result.isFinal) {
          setTranscript(prev => prev + (prev ? ' ' : '') + result.text)
        }
      },
      (errorMsg) => {
        setError(errorMsg)
        setIsRecording(false)
      }
    )
  }, [])

  const stopRecording = useCallback(() => {
    voiceRecognitionService.stopRecording()
    setIsRecording(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  useEffect(() => {
    // 初始化语音识别服务
    voiceRecognitionService.initialize()

    return () => {
      voiceRecognitionService.destroy()
    }
  }, [])

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported: voiceRecognitionService.isSupported()
  }
}

// 为了使用useState和useEffect，需要导入React
import { useState, useCallback, useEffect } from 'react'
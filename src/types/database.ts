// 数据库表结构定义

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  user_id: string
  title: string
  destination: string
  duration: number
  budget: number
  preferences?: string[]
  created_at: string
  updated_at: string
}

export interface DailyPlan {
  id: string
  trip_id: string
  day_number: number
  theme: string
  activities: Activity[]
  created_at: string
  updated_at: string
}

// LLM响应中的DailyPlan结构
export interface LLMDailyPlan {
  day: number
  theme: string
  activities: Activity[]
}

export interface Activity {
  time: string
  name: string
  description: string
  location?: MapLocation
  type: 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD' | 'SIGHTSEEING' | 'SHOPPING' | 'OTHER'
  cost?: number
}

export interface Expense {
  id: string
  trip_id: string
  amount: number
  category: 'TRANSPORT' | 'ACCOMMODATION' | 'FOOD' | 'SIGHTSEEING' | 'SHOPPING' | 'OTHER'
  description?: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  llm_api_key?: string
  voice_api_key?: string
  map_api_key?: string
  created_at: string
  updated_at: string
}

// LLM行程生成请求和响应类型
export interface TripGenerationRequest {
  destination: string
  duration: number
  budgetRange: string
  travelStyle: string
  startDate?: string
  endDate?: string
  travelers: number
  preferences: string[]
  specialRequirements?: string
}

export interface TripGenerationResponse {
  tripSummary: {
    title: string
    estimatedTotalCost: number
    destination: string
    duration: number
  }
  budgetBreakdown: {
    flights?: number
    accommodation?: number
    food?: number
    transportation?: number
    activities?: number
    shopping?: number
    other?: number
  }
  dailyPlan: LLMDailyPlan[]
}

// 语音识别相关类型
export interface VoiceRecognitionResult {
  text: string
  confidence: number
  isFinal: boolean
}

// 地图相关类型
export interface MapLocation {
  lat: number
  lng: number
  name: string
  address?: string
}

// 状态管理相关类型
export interface AppState {
  user: User | null
  isAuthenticated: boolean
  currentTrip: Trip | null
  userSettings: UserSettings | null
  loading: boolean
  error: string | null
}
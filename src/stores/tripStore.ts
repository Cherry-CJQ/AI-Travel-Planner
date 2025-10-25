import { create } from 'zustand'
import { Trip, TripGenerationRequest, TripGenerationResponse } from '../types/database'
import { llmService, initializeLLMService } from '../services/llmService'
import { tripService } from '../services/supabase'
import { useAppStore } from './appStore'

interface TripStore {
  // 状态
  currentTrip: Trip | null
  generatedPlan: TripGenerationResponse | null
  loading: boolean
  error: string | null
  
  // 行程生成
  generateTripPlan: (request: TripGenerationRequest) => Promise<void>
  saveGeneratedTrip: (title?: string) => Promise<string | null>
  clearGeneratedPlan: () => void
  
  // 行程管理
  setCurrentTrip: (trip: Trip | null) => void
  loadUserTrips: () => Promise<Trip[]>
  createTrip: (tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => Promise<Trip | null>
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>
  deleteTrip: (tripId: string) => Promise<void>
}

export const useTripStore = create<TripStore>((set, get) => ({
  // 初始状态
  currentTrip: null,
  generatedPlan: null,
  loading: false,
  error: null,

  // 生成旅行计划
  generateTripPlan: async (request: TripGenerationRequest) => {
    set({ loading: true, error: null })
    
    try {
      const { userSettings } = useAppStore.getState()
      
      // 检查API Key配置
      if (!userSettings?.llm_api_key) {
        throw new Error('请先在设置页面配置阿里云百炼API Key')
      }

      // 初始化LLM服务
      initializeLLMService(userSettings.llm_api_key)

      // 调用LLM生成计划
      const plan = await llmService.generateTripPlan(request)
      
      set({ 
        generatedPlan: plan,
        loading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || '生成旅行计划失败',
        loading: false 
      })
      throw error
    }
  },

  // 保存生成的行程
  saveGeneratedTrip: async (title?: string) => {
    const { generatedPlan } = get()
    const { user } = useAppStore.getState()

    if (!generatedPlan || !user) {
      throw new Error('没有可保存的行程计划或用户未登录')
    }

    set({ loading: true })

    try {
      const tripData = {
        user_id: user.id,
        title: title || generatedPlan.tripSummary.title,
        destination: generatedPlan.tripSummary.destination,
        duration: generatedPlan.tripSummary.duration,
        budget: generatedPlan.tripSummary.estimatedTotalCost,
        preferences: [] // 可以从请求中获取，这里简化处理
      }

      const { data, error } = await tripService.createTrip(tripData)
      
      if (error) {
        throw new Error(error.message)
      }

      if (data && data[0]) {
        const savedTrip = data[0]
        set({ 
          currentTrip: savedTrip,
          loading: false 
        })
        return savedTrip.id
      }

      throw new Error('保存行程失败')
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 清除生成的计划
  clearGeneratedPlan: () => {
    set({ generatedPlan: null, error: null })
  },

  // 设置当前行程
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip })
  },

  // 加载用户行程
  loadUserTrips: async () => {
    const { user } = useAppStore.getState()
    
    if (!user) {
      return []
    }

    set({ loading: true })

    try {
      const { data, error } = await tripService.getUserTrips(user.id)
      
      if (error) {
        throw new Error(error.message)
      }

      set({ loading: false })
      return data || []
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      return []
    }
  },

  // 创建行程
  createTrip: async (tripData) => {
    const { user } = useAppStore.getState()
    
    if (!user) {
      throw new Error('用户未登录')
    }

    set({ loading: true })

    try {
      const { data, error } = await tripService.createTrip({
        ...tripData,
        user_id: user.id
      })
      
      if (error) {
        throw new Error(error.message)
      }

      set({ loading: false })
      return data ? data[0] : null
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 更新行程
  updateTrip: async (tripId: string, updates: Partial<Trip>) => {
    set({ loading: true })

    try {
      const { error } = await tripService.updateTrip(tripId, updates)
      
      if (error) {
        throw new Error(error.message)
      }

      // 更新当前行程状态
      const { currentTrip } = get()
      if (currentTrip && currentTrip.id === tripId) {
        set({ 
          currentTrip: { ...currentTrip, ...updates },
          loading: false 
        })
      } else {
        set({ loading: false })
      }
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 删除行程
  deleteTrip: async (tripId: string) => {
    set({ loading: true })

    try {
      const { error } = await tripService.deleteTrip(tripId)
      
      if (error) {
        throw new Error(error.message)
      }

      // 如果删除的是当前行程，清空状态
      const { currentTrip } = get()
      if (currentTrip && currentTrip.id === tripId) {
        set({ currentTrip: null })
      }

      set({ loading: false })
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  }
}))
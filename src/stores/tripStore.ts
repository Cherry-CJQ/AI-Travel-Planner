import { create } from 'zustand'
import { Trip, TripGenerationRequest, TripGenerationResponse } from '../types/database'
import { llmService, initializeLLMService } from '../services/llmService'
import { tripService, dailyPlanService, expenseService } from '../services/supabase'
import { useAppStore } from './appStore'

interface TripStore {
  // 状态
  currentTrip: Trip | null
  generatedPlan: TripGenerationResponse | null
  originalRequest: TripGenerationRequest | null
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
  originalRequest: null,
  loading: false,
  error: null,

  // 生成旅行计划
  generateTripPlan: async (request: TripGenerationRequest) => {
    set({ loading: true, error: null })
    
    try {
      const { userSettings } = useAppStore.getState()
      
      // 如果有API Key，使用真实服务；否则使用模拟数据
      if (userSettings?.llm_api_key) {
        // 初始化LLM服务，启用代理并使用用户选择的模型
        initializeLLMService(userSettings.llm_api_key, {
          modelName: import.meta.env.VITE_LLM_MODEL || 'qwen-plus', // 使用环境变量中的模型名称
          useProxy: true
        })
      } else {
        console.log('未配置API Key，使用模拟数据生成旅行计划')
      }

      // 调用LLM生成计划（会自动使用模拟数据）
      const plan = await llmService.generateTripPlan(request)
      
      set({
        generatedPlan: plan,
        originalRequest: request, // 保存原始请求数据
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
    const { generatedPlan, originalRequest } = get()
    const { user } = useAppStore.getState()

    if (!generatedPlan || !user) {
      throw new Error('没有可保存的行程计划或用户未登录')
    }

    set({ loading: true })

    try {
      // 保存基本行程信息 - 从原始请求中获取用户输入的数据
      const tripData = {
        user_id: user.id,
        title: title || generatedPlan.tripSummary.title,
        destination: generatedPlan.tripSummary.destination,
        duration: generatedPlan.tripSummary.duration,
        budget: generatedPlan.tripSummary.estimatedTotalCost,
        preferences: originalRequest?.preferences || [],
        travel_style: originalRequest?.travelStyle || '',
        travelers: originalRequest?.travelers || 1,
        start_date: originalRequest?.startDate,
        end_date: originalRequest?.endDate,
        special_requirements: originalRequest?.specialRequirements
      }

      console.log('保存行程数据:', tripData)

      const { data: tripDataResult, error: tripError } = await tripService.createTrip(tripData)
      
      if (tripError) {
        console.error('保存行程失败:', tripError)
        throw new Error(tripError.message)
      }

      if (!tripDataResult || !tripDataResult[0]) {
        console.error('保存行程失败: 没有返回数据')
        throw new Error('保存行程失败')
      }

      console.log('行程保存成功:', tripDataResult[0])

      const savedTrip = tripDataResult[0]

      // 保存每日计划
      for (const dayPlan of generatedPlan.dailyPlan) {
        const dailyPlanData = {
          trip_id: savedTrip.id,
          day_number: dayPlan.day,
          theme: dayPlan.theme,
          activities: dayPlan.activities
        }

        const { error: dailyPlanError } = await dailyPlanService.createDailyPlan(dailyPlanData)
        
        if (dailyPlanError) {
          console.error('保存每日计划失败:', dailyPlanError)
          // 继续保存其他每日计划，不中断整个流程
        }
      }

      // 注意：预算分解只是预算规划，不是实际支出记录
      // 实际支出记录应该由用户在行程中手动添加
      console.log('预算分解信息（仅用于展示，不保存为支出记录）:', generatedPlan.budgetBreakdown)

      set({
        currentTrip: savedTrip,
        loading: false
      })
      return savedTrip.id
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
    set({ generatedPlan: null, originalRequest: null, error: null })
  },

  // 设置当前行程
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip })
  },

  // 加载用户行程
  loadUserTrips: async () => {
    const { user } = useAppStore.getState()
    
    if (!user) {
      console.log('用户未登录，无法加载行程')
      return []
    }

    console.log('开始加载用户行程，用户ID:', user.id)
    set({ loading: true })

    try {
      const { data, error } = await tripService.getUserTrips(user.id)
      
      if (error) {
        console.error('加载用户行程失败:', error)
        throw new Error(error.message)
      }

      console.log('用户行程加载成功，数量:', data?.length || 0)
      set({ loading: false })
      return data || []
    } catch (error: any) {
      console.error('加载用户行程异常:', error)
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
import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表名常量
export const TABLES = {
  USERS: 'users',
  TRIPS: 'trips',
  DAILY_PLANS: 'daily_plans',
  EXPENSES: 'expenses',
  USER_SETTINGS: 'user_settings'
} as const

// 导入本地认证服务
import { localAuthService } from './localAuthService'

// 用户认证相关操作 - 使用本地认证服务
export const authService = localAuthService

// 用户账户管理操作
export const userAccountService = {
  // 删除用户账户及其所有数据
  async deleteUserAccount(userId: string) {
    try {
      // 首先获取用户的所有行程ID
      const { data: trips, error: tripsQueryError } = await supabase
        .from(TABLES.TRIPS)
        .select('id')
        .eq('user_id', userId)

      if (tripsQueryError) {
        return { error: tripsQueryError }
      }

      const tripIds = trips?.map(trip => trip.id) || []

      // 删除相关数据（按依赖关系顺序）
      if (tripIds.length > 0) {
        // 删除费用记录
        const { error: expensesError } = await supabase
          .from(TABLES.EXPENSES)
          .delete()
          .in('trip_id', tripIds)

        // 删除每日计划
        const { error: dailyPlansError } = await supabase
          .from(TABLES.DAILY_PLANS)
          .delete()
          .in('trip_id', tripIds)

        if (expensesError || dailyPlansError) {
          return { error: expensesError || dailyPlansError }
        }
      }

      // 删除行程
      const { error: tripsError } = await supabase
        .from(TABLES.TRIPS)
        .delete()
        .eq('user_id', userId)

      // 删除用户设置
      const { error: settingsError } = await supabase
        .from(TABLES.USER_SETTINGS)
        .delete()
        .eq('user_id', userId)

      // 删除用户
      const { error: userError } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', userId)

      // 如果有任何错误，返回第一个错误
      const errors = [tripsError, settingsError, userError]
      const firstError = errors.find(error => error)
      
      if (firstError) {
        return { error: firstError }
      }

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  },

  // 更新用户信息
  async updateUserInfo(userId: string, updates: {
    name?: string
    email?: string
  }) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
      
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // 修改密码
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // 首先验证当前密码
      const { data: user, error: userError } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return { data: null, error: new Error('用户不存在') }
      }

      // 验证当前密码
      const bcrypt = await import('bcryptjs')
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isCurrentPasswordValid) {
        return { data: null, error: new Error('当前密码错误') }
      }

      // 加密新密码
      const saltRounds = 10
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

      // 更新密码
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
      
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  }
}

// 行程数据操作
export const tripService = {
  // 获取用户的所有行程
  async getUserTrips(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // 创建新行程
  async createTrip(tripData: {
    user_id: string
    title: string
    destination: string
    duration: number
    budget: number
    preferences?: string[]
    travel_style?: string
    travelers?: number
    start_date?: string
    end_date?: string
    special_requirements?: string
  }) {
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .insert([tripData])
      .select()
    
    return { data, error }
  },

  // 更新行程
  async updateTrip(tripId: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLES.TRIPS)
      .update(updates)
      .eq('id', tripId)
      .select()
    
    return { data, error }
  },

  // 删除行程
  async deleteTrip(tripId: string) {
    const { error } = await supabase
      .from(TABLES.TRIPS)
      .delete()
      .eq('id', tripId)
    
    return { error }
  }
}

// 每日计划操作
export const dailyPlanService = {
  // 获取行程的每日计划
  async getTripDailyPlans(tripId: string) {
    const { data, error } = await supabase
      .from(TABLES.DAILY_PLANS)
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number', { ascending: true })
    
    return { data, error }
  },

  // 创建每日计划
  async createDailyPlan(planData: {
    trip_id: string
    day_number: number
    theme: string
    activities: any[]
  }) {
    const { data, error } = await supabase
      .from(TABLES.DAILY_PLANS)
      .insert([planData])
      .select()
    
    return { data, error }
  }
}

// 费用管理操作
export const expenseService = {
  // 获取行程的所有费用
  async getTripExpenses(tripId: string) {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // 添加费用记录
  async addExpense(expenseData: {
    trip_id: string
    amount: number
    category: string
    description?: string
  }) {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .insert([expenseData])
      .select()
    
    return { data, error }
  },

  // 更新费用记录
  async updateExpense(expenseId: string, updates: {
    amount?: number
    category?: string
    description?: string
  }) {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .update(updates)
      .eq('id', expenseId)
      .select()
    
    return { data, error }
  },

  // 删除费用记录
  async deleteExpense(expenseId: string) {
    const { error } = await supabase
      .from(TABLES.EXPENSES)
      .delete()
      .eq('id', expenseId)
    
    return { error }
  }
}

// 用户设置操作
export const userSettingsService = {
  // 获取用户设置
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .select('*')
      .eq('user_id', userId)
      .single()
    
    return { data, error }
  },

  // 更新用户设置
  async updateUserSettings(userId: string, settings: {
    llm_api_key?: string
    voice_api_key?: string
    map_api_key?: string
  }) {
    try {
      // 首先检查用户设置记录是否存在
      const { data: existingSettings } = await supabase
        .from(TABLES.USER_SETTINGS)
        .select('id')
        .eq('user_id', userId)
        .single()

      let data, error

      if (existingSettings) {
        // 更新现有记录
        const result = await supabase
          .from(TABLES.USER_SETTINGS)
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
        data = result.data
        error = result.error
      } else {
        // 创建新记录
        const result = await supabase
          .from(TABLES.USER_SETTINGS)
          .insert([{
            user_id: userId,
            ...settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
        data = result.data
        error = result.error
      }
      
      return { data, error }
    } catch (error: any) {
      return { data: null, error }
    }
  }
}

export default supabase
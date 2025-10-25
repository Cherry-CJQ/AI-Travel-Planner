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

// 用户认证相关操作
export const authService = {
  // 用户注册
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    return { data, error }
  },

  // 用户登录
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 用户登出
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 获取当前用户
  getCurrentUser() {
    return supabase.auth.getUser()
  },

  // 监听认证状态变化
  onAuthStateChange(callback: any) {
    return supabase.auth.onAuthStateChange(callback)
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
    const { data, error } = await supabase
      .from(TABLES.USER_SETTINGS)
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
    
    return { data, error }
  }
}

export default supabase
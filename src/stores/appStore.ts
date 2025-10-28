import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserSettings, Trip, AppState } from '../types/database'
import { authService, userSettingsService, userAccountService, supabase, TABLES } from '../services/supabase'
import { initializeLLMService } from '../services/llmService'

interface AppStore extends AppState {
  // 认证相关
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: () => Promise<void>
  updateUserInfo: (updates: { name?: string; email?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  validateAuth: () => Promise<void>
  initializeLLMService: () => Promise<void>
  
  // 用户设置
  setUserSettings: (settings: UserSettings | null) => void
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>
  
  // 行程管理
  setCurrentTrip: (trip: Trip | null) => void
  
  // 通用状态
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      currentTrip: null,
      userSettings: null,
      loading: false,
      error: null,

      // 认证相关方法
      setUser: (user) => set({ user }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      // 验证当前认证状态
      validateAuth: async () => {
        const { user } = get()
        if (!user) {
          set({ isAuthenticated: false })
          return
        }
        
        try {
          // 对于本地认证，我们只需要检查用户是否仍然存在于数据库中
          const { data: userData, error } = await supabase
            .from(TABLES.USERS)
            .select('id')
            .eq('id', user.id)
            .single()
            
          if (error || !userData) {
            set({ isAuthenticated: false, user: null })
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null })
        }
      },
      
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await authService.signIn(email, password)
          
          if (error) {
            set({ error: error.message, loading: false })
            throw new Error(error.message) // 抛出异常让调用方捕获
          }
          
          if (data && data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || '用户',
              created_at: data.user.created_at || new Date().toISOString(),
              updated_at: data.user.updated_at || new Date().toISOString()
            }
            
            set({
              user,
              isAuthenticated: true,
              loading: false
            })

            // 加载用户设置
            const { data: settings } = await userSettingsService.getUserSettings(user.id)
            if (settings) {
              set({ userSettings: settings })
              
              // 如果用户有LLM API Key，初始化LLM服务
              if (settings.llm_api_key) {
                initializeLLMService(settings.llm_api_key, {
                  useProxy: import.meta.env.VITE_USE_PROXY === 'true'
                })
              }
            }
          } else {
            set({ error: '登录失败，请重试', loading: false })
            throw new Error('登录失败，请重试')
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
          throw error // 重新抛出异常
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await authService.signUp(email, password, name)
          
          if (error) {
            set({ error: error.message, loading: false })
            return
          }
          
          if (data && data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || '用户',
              created_at: data.user.created_at || new Date().toISOString(),
              updated_at: data.user.updated_at || new Date().toISOString()
            }
            
            set({
              user,
              isAuthenticated: true,
              loading: false
            })
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      logout: async () => {
        set({ loading: true })
        try {
          await authService.signOut()
          set({
            user: null,
            isAuthenticated: false,
            currentTrip: null,
            userSettings: null,
            loading: false
          })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      // 删除账户
      deleteAccount: async () => {
        const { user } = get()
        if (!user) return
        
        set({ loading: true })
        try {
          const { error } = await userAccountService.deleteUserAccount(user.id)
          
          if (error) {
            set({ error: error.message, loading: false })
            return
          }
          
          // 清除所有状态
          set({
            user: null,
            isAuthenticated: false,
            currentTrip: null,
            userSettings: null,
            loading: false
          })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      // 更新用户信息
      updateUserInfo: async (updates) => {
        const { user } = get()
        if (!user) return
        
        set({ loading: true })
        try {
          const { data, error } = await userAccountService.updateUserInfo(user.id, updates)
          
          if (error) {
            set({ error: error.message, loading: false })
            return
          }
          
          if (data && data[0]) {
            // 更新本地用户状态
            set({
              user: { ...user, ...data[0] },
              loading: false
            })
            return
          }
          
          set({ loading: false })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      // 修改密码
      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user } = get()
        if (!user) return
        
        set({ loading: true })
        try {
          const { data, error } = await userAccountService.changePassword(user.id, currentPassword, newPassword)
          
          if (error) {
            set({ error: error.message, loading: false })
            return
          }
          
          if (data && data[0]) {
            set({ loading: false })
            return
          }
          
          set({ loading: false })
        } catch (error: any) {
          set({ error: error.message, loading: false })
        }
      },

      // 初始化LLM服务
      initializeLLMService: async () => {
        const { userSettings } = get()
        
        if (userSettings?.llm_api_key) {
          console.log('自动初始化LLM服务')
          initializeLLMService(userSettings.llm_api_key, {
            useProxy: import.meta.env.VITE_USE_PROXY === 'true'
          })
        }
      },

      // 用户设置方法
      setUserSettings: (settings) => set({ userSettings: settings }),
      
      updateUserSettings: async (settings) => {
        const { user } = get()
        if (!user) {
          set({ error: '用户未登录', loading: false })
          return
        }
        
        set({ loading: true, error: null })
        try {
          const { data, error } = await userSettingsService.updateUserSettings(user.id, settings)
          
          if (error) {
            console.error('更新用户设置失败:', error)
            set({ error: `保存设置失败: ${error.message}`, loading: false })
            throw new Error(`保存设置失败: ${error.message}`)
          }

          if (data && data[0]) {
            set({ userSettings: data[0], loading: false })
            
            // 如果更新了LLM API Key，重新初始化LLM服务
            if (settings.llm_api_key) {
              console.log('重新初始化LLM服务')
              initializeLLMService(settings.llm_api_key, {
                useProxy: import.meta.env.VITE_USE_PROXY === 'true'
              })
            }
          } else {
            set({ error: '保存设置失败: 未返回数据', loading: false })
            throw new Error('保存设置失败: 未返回数据')
          }
        } catch (error: any) {
          console.error('更新用户设置异常:', error)
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // 行程管理方法
      setCurrentTrip: (trip) => set({ currentTrip: trip }),

      // 通用状态方法
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userSettings: state.userSettings
      })
    }
  )
)

// 本地认证不需要监听状态变化
// 认证状态由zustand的持久化存储管理
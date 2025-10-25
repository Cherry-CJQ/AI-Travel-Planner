import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, UserSettings, Trip, AppState } from '../types/database'
import { authService, userSettingsService } from '../services/supabase'

interface AppStore extends AppState {
  // 认证相关
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  
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
      
      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await authService.signIn(email, password)
          
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

            // 加载用户设置
            const { data: settings } = await userSettingsService.getUserSettings(user.id)
            if (settings) {
              set({ userSettings: settings })
            }
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
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

      // 用户设置方法
      setUserSettings: (settings) => set({ userSettings: settings }),
      
      updateUserSettings: async (settings) => {
        const { user } = get()
        if (!user) return
        
        set({ loading: true })
        try {
          const { data, error } = await userSettingsService.updateUserSettings(user.id, settings)
          
          if (error) {
            set({ error: error.message, loading: false })
            return
          }
          
          if (data) {
            set({ userSettings: data[0], loading: false })
          }
        } catch (error: any) {
          set({ error: error.message, loading: false })
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
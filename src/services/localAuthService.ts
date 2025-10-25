import { supabase, TABLES } from './supabase'
import bcrypt from 'bcryptjs'

// 本地认证服务 - 使用独立的users表
export const localAuthService = {
  // 用户注册
  async signUp(email: string, password: string, name: string) {
    try {
      // 检查邮箱是否已存在
      const { data: existingUser } = await supabase
        .from(TABLES.USERS)
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return { data: null, error: new Error('该邮箱已被注册') }
      }

      // 加密密码
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // 创建用户
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([{
          email,
          password_hash: passwordHash,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) {
        return { data: null, error }
      }

      // 创建用户设置记录
      if (data && data[0]) {
        await supabase
          .from(TABLES.USER_SETTINGS)
          .insert([{
            user_id: data[0].id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
      }

      return { data: { user: data[0] }, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // 用户登录
  async signIn(email: string, password: string) {
    try {
      // 查找用户
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return { data: null, error: new Error('邮箱或密码错误') }
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password_hash)
      if (!isPasswordValid) {
        return { data: null, error: new Error('邮箱或密码错误') }
      }

      // 更新最后登录时间
      await supabase
        .from(TABLES.USERS)
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      return { data: { user }, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  },

  // 用户登出
  async signOut() {
    // 本地认证不需要服务器端登出
    return { error: null }
  },

  // 获取当前用户（从本地存储）
  getCurrentUser() {
    // 返回一个模拟的Promise，实际用户状态由zustand管理
    return Promise.resolve({ data: { user: null }, error: null })
  },

  // 监听认证状态变化（本地版本）
  onAuthStateChange(callback: any) {
    // 本地认证不需要监听状态变化
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}
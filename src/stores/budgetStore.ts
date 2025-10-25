import { create } from 'zustand'
import { Expense, Trip } from '../types/database'
import { expenseService } from '../services/supabase'
import { useAppStore } from './appStore'

interface BudgetStore {
  // 状态
  currentTrip: Trip | null
  expenses: Expense[]
  budgetSummary: {
    totalBudget: number
    totalSpent: number
    remainingBudget: number
    categoryBreakdown: Record<string, number>
  }
  loading: boolean
  error: string | null
  
  // 预算管理
  setCurrentTrip: (trip: Trip | null) => void
  calculateBudgetSummary: () => void
  
  // 支出管理
  loadExpenses: (tripId: string) => Promise<void>
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => Promise<void>
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>
  deleteExpense: (expenseId: string) => Promise<void>
  
  // 预算分析
  getBudgetAlerts: () => Array<{
    type: 'warning' | 'danger'
    message: string
    category?: string
  }>
  
  // 统计功能
  getCategoryStats: () => Array<{
    category: string
    spent: number
    budget: number
    percentage: number
  }>
  
  getDailySpending: () => Array<{
    date: string
    amount: number
  }>
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  // 初始状态
  currentTrip: null,
  expenses: [],
  budgetSummary: {
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    categoryBreakdown: {}
  },
  loading: false,
  error: null,

  // 设置当前行程
  setCurrentTrip: (trip) => {
    set({ currentTrip: trip })
    if (trip) {
      get().calculateBudgetSummary()
      get().loadExpenses(trip.id)
    }
  },

  // 计算预算摘要
  calculateBudgetSummary: () => {
    const { currentTrip, expenses } = get()
    
    if (!currentTrip) {
      set({
        budgetSummary: {
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          categoryBreakdown: {}
        }
      })
      return
    }

    const totalBudget = currentTrip.budget || 0
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const remainingBudget = totalBudget - totalSpent

    // 按类别统计支出
    const categoryBreakdown: Record<string, number> = {}
    expenses.forEach(expense => {
      const category = expense.category
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + expense.amount
    })

    set({
      budgetSummary: {
        totalBudget,
        totalSpent,
        remainingBudget,
        categoryBreakdown
      }
    })
  },

  // 加载支出记录
  loadExpenses: async (tripId: string) => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await expenseService.getTripExpenses(tripId)
      
      if (error) {
        throw new Error(error.message)
      }

      set({ 
        expenses: data || [],
        loading: false 
      })
      
      // 重新计算预算摘要
      get().calculateBudgetSummary()
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
    }
  },

  // 添加支出
  addExpense: async (expenseData) => {
    const { user } = useAppStore.getState()
    
    if (!user) {
      throw new Error('用户未登录')
    }

    set({ loading: true, error: null })

    try {
      const { data, error } = await expenseService.addExpense(expenseData)
      
      if (error) {
        throw new Error(error.message)
      }

      if (data && data[0]) {
        const newExpense = data[0]
        set(state => ({
          expenses: [...state.expenses, newExpense],
          loading: false
        }))
        
        // 重新计算预算摘要
        get().calculateBudgetSummary()
      } else {
        throw new Error('添加支出失败')
      }
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 更新支出
  updateExpense: async (expenseId: string, updates: Partial<Expense>) => {
    set({ loading: true, error: null })

    try {
      const { error } = await expenseService.updateExpense(expenseId, updates)
      
      if (error) {
        throw new Error(error.message)
      }

      // 更新本地状态
      set(state => ({
        expenses: state.expenses.map(expense =>
          expense.id === expenseId ? { ...expense, ...updates } : expense
        ),
        loading: false
      }))
      
      // 重新计算预算摘要
      get().calculateBudgetSummary()
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 删除支出
  deleteExpense: async (expenseId: string) => {
    set({ loading: true, error: null })

    try {
      const { error } = await expenseService.deleteExpense(expenseId)
      
      if (error) {
        throw new Error(error.message)
      }

      // 更新本地状态
      set(state => ({
        expenses: state.expenses.filter(expense => expense.id !== expenseId),
        loading: false
      }))
      
      // 重新计算预算摘要
      get().calculateBudgetSummary()
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 获取预算警报
  getBudgetAlerts: () => {
    const { budgetSummary, currentTrip } = get()
    const alerts: Array<{
      type: 'warning' | 'danger'
      message: string
      category?: string
    }> = []

    if (!currentTrip) return alerts

    const { totalBudget, totalSpent, remainingBudget } = budgetSummary

    // 预算超支警报
    if (remainingBudget < 0) {
      alerts.push({
        type: 'danger',
        message: `预算超支 ¥${Math.abs(remainingBudget).toLocaleString()}`
      })
    }

    // 预算使用率警报
    const usagePercentage = (totalSpent / totalBudget) * 100
    if (usagePercentage > 80) {
      alerts.push({
        type: 'warning',
        message: `预算使用率已达 ${Math.round(usagePercentage)}%`
      })
    }

    // 类别超支警报
    Object.entries(budgetSummary.categoryBreakdown).forEach(([category, spent]) => {
      // 这里可以根据预设的类别预算比例来检查
      // 暂时使用简单的阈值检查
      if (spent > totalBudget * 0.3) { // 如果某个类别超过总预算的30%
        alerts.push({
          type: 'warning',
          message: `${getCategoryName(category)}支出较高: ¥${spent.toLocaleString()}`,
          category
        })
      }
    })

    return alerts
  },

  // 获取类别统计
  getCategoryStats: () => {
    const { budgetSummary, currentTrip } = get()
    
    if (!currentTrip) return []

    const totalBudget = currentTrip.budget || 0
    const stats = Object.entries(budgetSummary.categoryBreakdown).map(([category, spent]) => {
      // 计算类别预算比例（这里使用简单的分配逻辑）
      // 实际项目中可以根据行程类型动态分配
      const categoryBudgetRatio = getCategoryBudgetRatio(category)
      const categoryBudget = totalBudget * categoryBudgetRatio
      const percentage = (spent / categoryBudget) * 100

      return {
        category: getCategoryName(category),
        spent,
        budget: categoryBudget,
        percentage: Math.min(percentage, 100) // 限制最大100%
      }
    })

    return stats
  },

  // 获取每日支出
  getDailySpending: () => {
    const { expenses } = get()
    
    const dailySpending: Record<string, number> = {}
    
    expenses.forEach(expense => {
      const date = expense.created_at.split('T')[0] // 提取日期部分
      dailySpending[date] = (dailySpending[date] || 0) + expense.amount
    })

    return Object.entries(dailySpending)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}))

// 获取类别名称
const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    TRANSPORT: '交通',
    ACCOMMODATION: '住宿',
    FOOD: '餐饮',
    SIGHTSEEING: '景点',
    SHOPPING: '购物',
    OTHER: '其他'
  }
  return categoryNames[category] || category
}

// 获取类别预算比例
const getCategoryBudgetRatio = (category: string): number => {
  const ratios: Record<string, number> = {
    TRANSPORT: 0.2,    // 20%
    ACCOMMODATION: 0.3, // 30%
    FOOD: 0.25,        // 25%
    SIGHTSEEING: 0.15, // 15%
    SHOPPING: 0.05,    // 5%
    OTHER: 0.05        // 5%
  }
  return ratios[category] || 0.05
}
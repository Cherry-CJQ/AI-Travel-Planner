import { describe, it, expect } from 'vitest'
import { formatDate, calculateDuration, isDateInRange, getDateRange, isValidDate } from '../dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('格式化日期', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    it('格式化单数月份和日期', () => {
      const date = new Date('2024-09-05')
      expect(formatDate(date)).toBe('2024-09-05')
    })
  })

  describe('calculateDuration', () => {
    it('计算日期差', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(calculateDuration(start, end)).toBe(5)
    })

    it('计算同一天的日期差', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-10')
      expect(calculateDuration(start, end)).toBe(0)
    })
  })

  describe('isDateInRange', () => {
    it('检查日期是否在范围内', () => {
      const date = new Date('2024-01-12')
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(isDateInRange(date, start, end)).toBe(true)
    })

    it('检查边界日期', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(isDateInRange(start, start, end)).toBe(true)
      expect(isDateInRange(end, start, end)).toBe(true)
    })

    it('检查范围外日期', () => {
      const date = new Date('2024-01-20')
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-15')
      expect(isDateInRange(date, start, end)).toBe(false)
    })
  })

  describe('getDateRange', () => {
    it('获取日期范围内的所有日期', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-12')
      const range = getDateRange(start, end)
      
      expect(range).toHaveLength(3)
      expect(formatDate(range[0])).toBe('2024-01-10')
      expect(formatDate(range[1])).toBe('2024-01-11')
      expect(formatDate(range[2])).toBe('2024-01-12')
    })

    it('获取单日范围', () => {
      const start = new Date('2024-01-10')
      const end = new Date('2024-01-10')
      const range = getDateRange(start, end)
      
      expect(range).toHaveLength(1)
      expect(formatDate(range[0])).toBe('2024-01-10')
    })
  })

  describe('isValidDate', () => {
    it('验证有效日期', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('2024-12-31')).toBe(true)
    })

    it('验证无效日期', () => {
      expect(isValidDate('2024-13-01')).toBe(false)
      expect(isValidDate('2024-01-32')).toBe(false)
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate('2024/01/15')).toBe(false)
    })
  })
})
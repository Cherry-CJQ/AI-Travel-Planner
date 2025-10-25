/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 计算两个日期之间的天数差
 */
export const calculateDuration = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * 检查日期是否在指定范围内
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const time = date.getTime()
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()
  return time >= startTime && time <= endTime
}

/**
 * 获取日期范围的所有日期
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * 验证日期格式
 */
export const isValidDate = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}
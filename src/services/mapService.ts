// 地图服务 - 高德地图API集成
import { MapLocation } from '../types/database'

class MapService {
  private apiKey: string = ''
  private apiSecret: string = ''
  private baseUrl: string = 'https://restapi.amap.com/v3'

  constructor() {
    // 从环境变量中获取默认API配置
    // Web服务API只有Key，没有Secret
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      if (import.meta.env.VITE_AMAP_API_KEY) {
        this.apiKey = import.meta.env.VITE_AMAP_API_KEY
      }
      // Web服务不需要Secret，所以这里不设置apiSecret
    }
  }

  // 设置API配置
  setApiConfig(apiKey: string, apiSecret?: string) {
    this.apiKey = apiKey
    if (apiSecret) {
      this.apiSecret = apiSecret
    }
  }

  // 生成签名
  private generateSignature(params: Record<string, string>): string {
    if (!this.apiSecret) {
      return ''
    }

    // 按参数名排序
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    // 生成签名
    const signString = `${sortedParams}${this.apiSecret}`
    return this.md5(signString)
  }

  // MD5实现（用于签名）
  private md5(str: string): string {
    // 使用标准的MD5算法实现
    function rotateLeft(lValue: number, iShiftBits: number): number {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
    }

    function addUnsigned(lX: number, lY: number): number {
      const lX8 = lX & 0x80000000
      const lY8 = lY & 0x80000000
      const lX4 = lX & 0x40000000
      const lY4 = lY & 0x40000000
      const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF)
      
      if (lX4 & lY4) {
        return lResult ^ 0x80000000 ^ lX8 ^ lY8
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return lResult ^ 0xC0000000 ^ lX8 ^ lY8
        } else {
          return lResult ^ 0x40000000 ^ lX8 ^ lY8
        }
      } else {
        return lResult ^ lX8 ^ lY8
      }
    }

    function F(x: number, y: number, z: number): number {
      return (x & y) | (~x & z)
    }

    function G(x: number, y: number, z: number): number {
      return (x & z) | (y & ~z)
    }

    function H(x: number, y: number, z: number): number {
      return x ^ y ^ z
    }

    function I(x: number, y: number, z: number): number {
      return y ^ (x | ~z)
    }

    function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
      a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
      a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
      a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
      a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
      return addUnsigned(rotateLeft(a, s), b)
    }

    function convertToWordArray(str: string): number[] {
      let lWordCount
      const lMessageLength = str.length
      const lNumberOfWordsTemp1 = lMessageLength + 8
      const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64
      const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16
      const lWordArray: number[] = Array(lNumberOfWords - 1)
      let lBytePosition = 0
      let lByteCount = 0
      
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4
        lBytePosition = (lByteCount % 4) * 8
        lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition))
        lByteCount++
      }
      
      lWordCount = (lByteCount - (lByteCount % 4)) / 4
      lBytePosition = (lByteCount % 4) * 8
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition)
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29
      
      return lWordArray
    }

    function wordToHex(lValue: number): string {
      let wordToHexValue = ''
      let wordToHexValueTemp = ''
      let lByte: number
      let lCount: number
      
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255
        wordToHexValueTemp = '0' + lByte.toString(16)
        wordToHexValue = wordToHexValue + wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2)
      }
      
      return wordToHexValue
    }

    let x = convertToWordArray(str)
    let a = 0x67452301
    let b = 0xEFCDAB89
    let c = 0x98BADCFE
    let d = 0x10325476

    for (let k = 0; k < x.length; k += 16) {
      const AA = a
      const BB = b
      const CC = c
      const DD = d

      a = FF(a, b, c, d, x[k + 0], 7, 0xD76AA478)
      d = FF(d, a, b, c, x[k + 1], 12, 0xE8C7B756)
      c = FF(c, d, a, b, x[k + 2], 17, 0x242070DB)
      b = FF(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE)
      a = FF(a, b, c, d, x[k + 4], 7, 0xF57C0FAF)
      d = FF(d, a, b, c, x[k + 5], 12, 0x4787C62A)
      c = FF(c, d, a, b, x[k + 6], 17, 0xA8304613)
      b = FF(b, c, d, a, x[k + 7], 22, 0xFD469501)
      a = FF(a, b, c, d, x[k + 8], 7, 0x698098D8)
      d = FF(d, a, b, c, x[k + 9], 12, 0x8B44F7AF)
      c = FF(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1)
      b = FF(b, c, d, a, x[k + 11], 22, 0x895CD7BE)
      a = FF(a, b, c, d, x[k + 12], 7, 0x6B901122)
      d = FF(d, a, b, c, x[k + 13], 12, 0xFD987193)
      c = FF(c, d, a, b, x[k + 14], 17, 0xA679438E)
      b = FF(b, c, d, a, x[k + 15], 22, 0x49B40821)

      a = GG(a, b, c, d, x[k + 1], 5, 0xF61E2562)
      d = GG(d, a, b, c, x[k + 6], 9, 0xC040B340)
      c = GG(c, d, a, b, x[k + 11], 14, 0x265E5A51)
      b = GG(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA)
      a = GG(a, b, c, d, x[k + 5], 5, 0xD62F105D)
      d = GG(d, a, b, c, x[k + 10], 9, 0x2441453)
      c = GG(c, d, a, b, x[k + 15], 14, 0xD8A1E681)
      b = GG(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8)
      a = GG(a, b, c, d, x[k + 9], 5, 0x21E1CDE6)
      d = GG(d, a, b, c, x[k + 14], 9, 0xC33707D6)
      c = GG(c, d, a, b, x[k + 3], 14, 0xF4D50D87)
      b = GG(b, c, d, a, x[k + 8], 20, 0x455A14ED)
      a = GG(a, b, c, d, x[k + 13], 5, 0xA9E3E905)
      d = GG(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8)
      c = GG(c, d, a, b, x[k + 7], 14, 0x676F02D9)
      b = GG(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A)

      a = HH(a, b, c, d, x[k + 5], 4, 0xFFFA3942)
      d = HH(d, a, b, c, x[k + 8], 11, 0x8771F681)
      c = HH(c, d, a, b, x[k + 11], 16, 0x6D9D6122)
      b = HH(b, c, d, a, x[k + 14], 23, 0xFDE5380C)
      a = HH(a, b, c, d, x[k + 1], 4, 0xA4BEEA44)
      d = HH(d, a, b, c, x[k + 4], 11, 0x4BDECFA9)
      c = HH(c, d, a, b, x[k + 7], 16, 0xF6BB4B60)
      b = HH(b, c, d, a, x[k + 10], 23, 0xBEBFBC70)
      a = HH(a, b, c, d, x[k + 13], 4, 0x289B7EC6)
      d = HH(d, a, b, c, x[k + 0], 11, 0xEAA127FA)
      c = HH(c, d, a, b, x[k + 3], 16, 0xD4EF3085)
      b = HH(b, c, d, a, x[k + 6], 23, 0x4881D05)
      a = HH(a, b, c, d, x[k + 9], 4, 0xD9D4D039)
      d = HH(d, a, b, c, x[k + 12], 11, 0xE6DB99E5)
      c = HH(c, d, a, b, x[k + 15], 16, 0x1FA27CF8)
      b = HH(b, c, d, a, x[k + 2], 23, 0xC4AC5665)

      a = II(a, b, c, d, x[k + 0], 6, 0xF4292244)
      d = II(d, a, b, c, x[k + 7], 10, 0x432AFF97)
      c = II(c, d, a, b, x[k + 14], 15, 0xAB9423A7)
      b = II(b, c, d, a, x[k + 5], 21, 0xFC93A039)
      a = II(a, b, c, d, x[k + 12], 6, 0x655B59C3)
      d = II(d, a, b, c, x[k + 3], 10, 0x8F0CCC92)
      c = II(c, d, a, b, x[k + 10], 15, 0xFFEFF47D)
      b = II(b, c, d, a, x[k + 1], 21, 0x85845DD1)
      a = II(a, b, c, d, x[k + 8], 6, 0x6FA87E4F)
      d = II(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0)
      c = II(c, d, a, b, x[k + 6], 15, 0xA3014314)
      b = II(b, c, d, a, x[k + 13], 21, 0x4E0811A1)
      a = II(a, b, c, d, x[k + 4], 6, 0xF7537E82)
      d = II(d, a, b, c, x[k + 11], 10, 0xBD3AF235)
      c = II(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB)
      b = II(b, c, d, a, x[k + 9], 21, 0xEB86D391)

      a = addUnsigned(a, AA)
      b = addUnsigned(b, BB)
      c = addUnsigned(c, CC)
      d = addUnsigned(d, DD)
    }

    const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)
    return temp.toLowerCase()
  }

  // 构建带签名的URL
  private buildSignedUrl(endpoint: string, params: Record<string, string>): string {
    const baseParams: Record<string, string> = {
      key: this.apiKey,
      ...params
    }

    if (this.apiSecret) {
      const sig = this.generateSignature(baseParams)
      return `${this.baseUrl}${endpoint}?${Object.keys(baseParams)
        .map(key => `${key}=${encodeURIComponent(baseParams[key])}`)
        .join('&')}&sig=${sig}`
    } else {
      return `${this.baseUrl}${endpoint}?${Object.keys(baseParams)
        .map(key => `${key}=${encodeURIComponent(baseParams[key])}`)
        .join('&')}`
    }
  }

  // 地址转坐标（地理编码）
  async geocode(address: string): Promise<MapLocation | null> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置，请在设置页面配置您的高德地图API Key')
    }

    try {
      const url = this.buildSignedUrl('/geocode/geo', {
        address: address
      })
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`地理编码请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      // 检查API返回的错误信息
      if (data.status !== '1') {
        const errorMsg = data.info || `API错误: ${data.infocode || '未知错误'}`
        throw new Error(`高德地图API错误: ${errorMsg}`)
      }
      
      if (data.geocodes && data.geocodes.length > 0) {
        const geocode = data.geocodes[0]
        return {
          lat: parseFloat(geocode.location.split(',')[1]),
          lng: parseFloat(geocode.location.split(',')[0]),
          name: address,
          address: geocode.formatted_address
        }
      }
      
      return null
    } catch (error: any) {
      console.error('地理编码失败:', error)
      // 如果已经是具体的API错误，直接抛出；否则包装通用错误
      if (error.message && error.message.includes('高德地图API错误')) {
        throw error
      }
      throw new Error(`地址解析失败: ${error.message || '请检查网络连接和API配置'}`)
    }
  }

  // 坐标转地址（逆地理编码）
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置')
    }

    try {
      const url = this.buildSignedUrl('/geocode/regeo', {
        location: `${lng},${lat}`,
        extensions: 'base'
      })
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`逆地理编码请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === '1' && data.regeocode) {
        return data.regeocode.formatted_address
      }
      
      return null
    } catch (error) {
      console.error('逆地理编码失败:', error)
      throw new Error('坐标解析失败')
    }
  }

  // 搜索地点
  async searchPlaces(keyword: string, city?: string): Promise<MapLocation[]> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置')
    }

    try {
      const params: Record<string, string> = {
        keywords: keyword
      }
      if (city) {
        params.city = city
      }
      const url = this.buildSignedUrl('/place/text', params)

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`地点搜索请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === '1' && data.pois && data.pois.length > 0) {
        return data.pois.map((poi: any) => ({
          lat: parseFloat(poi.location.split(',')[1]),
          lng: parseFloat(poi.location.split(',')[0]),
          name: poi.name,
          address: poi.address
        }))
      }
      
      return []
    } catch (error) {
      console.error('地点搜索失败:', error)
      throw new Error('地点搜索失败，请检查网络连接')
    }
  }

  // 计算路径规划
  async calculateRoute(
    origin: MapLocation,
    destination: MapLocation,
    mode: 'driving' | 'walking' | 'transit' = 'driving'
  ): Promise<{
    distance: number // 米
    duration: number // 秒
    polyline: string // 路径坐标点
  } | null> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置')
    }

    try {
      const originStr = `${origin.lng},${origin.lat}`
      const destinationStr = `${destination.lng},${destination.lat}`

      const url = this.buildSignedUrl(`/direction/${mode}`, {
        origin: originStr,
        destination: destinationStr
      })
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`路径规划请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
        const path = data.route.paths[0]
        return {
          distance: path.distance,
          duration: path.duration,
          polyline: path.polyline
        }
      }
      
      return null
    } catch (error) {
      console.error('路径规划失败:', error)
      throw new Error('路径规划失败')
    }
  }

  // 批量获取地点坐标
  async batchGeocode(addresses: string[]): Promise<MapLocation[]> {
    const locations: MapLocation[] = []
    
    for (const address of addresses) {
      try {
        const location = await this.geocode(address)
        if (location) {
          locations.push(location)
        }
      } catch (error) {
        console.warn(`地址解析失败: ${address}`, error)
      }
    }
    
    return locations
  }

  // 计算多个地点之间的最优路径
  async calculateOptimalRoute(locations: MapLocation[]): Promise<MapLocation[]> {
    if (locations.length <= 1) {
      return locations
    }

    // 这里可以实现旅行商问题(TSP)的简化版本
    // 实际项目中可以使用更复杂的算法
    return this.simpleRouteOptimization(locations)
  }

  // 简单的路径优化（按距离排序）
  private simpleRouteOptimization(locations: MapLocation[]): MapLocation[] {
    if (locations.length <= 2) {
      return locations
    }

    const optimized: MapLocation[] = [locations[0]]
    const remaining = [...locations.slice(1)]

    while (remaining.length > 0) {
      const lastLocation = optimized[optimized.length - 1]
      let closestIndex = 0
      let closestDistance = this.calculateDistance(lastLocation, remaining[0])

      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(lastLocation, remaining[i])
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = i
        }
      }

      optimized.push(remaining[closestIndex])
      remaining.splice(closestIndex, 1)
    }

    return optimized
  }

  // 计算两点间直线距离（简化版）
  private calculateDistance(loc1: MapLocation, loc2: MapLocation): number {
    const R = 6371e3 // 地球半径（米）
    const φ1 = (loc1.lat * Math.PI) / 180
    const φ2 = (loc2.lat * Math.PI) / 180
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // 获取静态地图图片URL
  getStaticMapUrl(
    center: MapLocation,
    markers: MapLocation[] = [],
    zoom: number = 13,
    size: string = '800x400'
  ): string {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置')
    }

    const params: Record<string, string> = {
      location: `${center.lng},${center.lat}`,
      zoom: zoom.toString(),
      size: size
    }
    
    let url = `https://restapi.amap.com/v3/staticmap?`
    if (this.apiSecret) {
      const sig = this.generateSignature(params)
      url += Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `&key=${this.apiKey}&sig=${sig}`
    } else {
      url += Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `&key=${this.apiKey}`
    }

    // 添加标记点
    markers.forEach((marker, index) => {
      url += `&markers=${index + 1}:,,:${marker.lng},${marker.lat}`
    })

    return url
  }
}

// 创建全局地图服务实例
export const mapService = new MapService()

// 初始化地图服务（在应用启动时调用）
export const initializeMapService = (apiKey: string, apiSecret?: string) => {
  mapService.setApiConfig(apiKey, apiSecret)
}
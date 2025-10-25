// 地图服务 - 高德地图API集成
import { MapLocation } from '../types/database'

class MapService {
  private apiKey: string = ''
  private baseUrl: string = 'https://restapi.amap.com/v3'

  // 设置API Key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // 地址转坐标（地理编码）
  async geocode(address: string): Promise<MapLocation | null> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置，请在设置页面配置您的高德地图API Key')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/geo?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`地理编码请求失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
        const geocode = data.geocodes[0]
        return {
          lat: parseFloat(geocode.location.split(',')[1]),
          lng: parseFloat(geocode.location.split(',')[0]),
          name: address,
          address: geocode.formatted_address
        }
      }
      
      return null
    } catch (error) {
      console.error('地理编码失败:', error)
      throw new Error('地址解析失败，请检查网络连接和API配置')
    }
  }

  // 坐标转地址（逆地理编码）
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('地图API Key未配置')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/regeo?location=${lng},${lat}&key=${this.apiKey}&extensions=base`
      )
      
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
      let url = `${this.baseUrl}/place/text?keywords=${encodeURIComponent(keyword)}&key=${this.apiKey}`
      if (city) {
        url += `&city=${encodeURIComponent(city)}`
      }

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

      const response = await fetch(
        `${this.baseUrl}/direction/${mode}?origin=${originStr}&destination=${destinationStr}&key=${this.apiKey}`
      )
      
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

    let url = `https://restapi.amap.com/v3/staticmap?location=${center.lng},${center.lat}&zoom=${zoom}&size=${size}&key=${this.apiKey}`

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
export const initializeMapService = (apiKey: string) => {
  mapService.setApiKey(apiKey)
}
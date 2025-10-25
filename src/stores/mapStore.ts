import { create } from 'zustand'
import { MapLocation } from '../types/database'
import { mapService, initializeMapService } from '../services/mapService'
import { useAppStore } from './appStore'

interface MapStore {
  // 状态
  currentLocation: MapLocation | null
  selectedLocation: MapLocation | null
  searchResults: MapLocation[]
  routeInfo: {
    distance: number // 米
    duration: number // 秒
    polyline: string
  } | null
  loading: boolean
  error: string | null
  
  // 位置服务
  getCurrentLocation: () => Promise<MapLocation | null>
  setSelectedLocation: (location: MapLocation | null) => void
  
  // 搜索功能
  searchPlaces: (keyword: string, city?: string) => Promise<void>
  clearSearchResults: () => void
  
  // 路径规划
  calculateRoute: (origin: MapLocation, destination: MapLocation, mode?: 'driving' | 'walking' | 'transit') => Promise<void>
  clearRoute: () => void
  
  // 地理编码
  geocode: (address: string) => Promise<MapLocation | null>
  reverseGeocode: (lat: number, lng: number) => Promise<string | null>
  
  // 批量处理
  batchGeocode: (addresses: string[]) => Promise<MapLocation[]>
  calculateOptimalRoute: (locations: MapLocation[]) => Promise<MapLocation[]>
}

export const useMapStore = create<MapStore>((set, get) => ({
  // 初始状态
  currentLocation: null,
  selectedLocation: null,
  searchResults: [],
  routeInfo: null,
  loading: false,
  error: null,

  // 获取当前位置
  getCurrentLocation: async (): Promise<MapLocation | null> => {
    const { userSettings } = useAppStore.getState()
    
    // 检查API Key配置
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    // 初始化地图服务
    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('浏览器不支持地理位置服务'))
          return
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords
              
              // 逆地理编码获取地址
              const address = await mapService.reverseGeocode(latitude, longitude)
              
              const location: MapLocation = {
                lat: latitude,
                lng: longitude,
                name: '当前位置',
                address: address || '未知位置'
              }

              set({ 
                currentLocation: location,
                loading: false 
              })
              resolve(location)
            } catch (error: any) {
              set({ 
                error: error.message,
                loading: false 
              })
              reject(error)
            }
          },
          (error) => {
            const errorMessage = getGeolocationError(error.code)
            set({ 
              error: errorMessage,
              loading: false 
            })
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 设置选中位置
  setSelectedLocation: (location) => {
    set({ selectedLocation: location })
  },

  // 搜索地点
  searchPlaces: async (keyword: string, city?: string) => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const results = await mapService.searchPlaces(keyword, city)
      set({ 
        searchResults: results,
        loading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 清除搜索结果
  clearSearchResults: () => {
    set({ searchResults: [] })
  },

  // 计算路径
  calculateRoute: async (origin: MapLocation, destination: MapLocation, mode: 'driving' | 'walking' | 'transit' = 'driving') => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const route = await mapService.calculateRoute(origin, destination, mode)
      
      if (route) {
        set({ 
          routeInfo: route,
          loading: false 
        })
      } else {
        throw new Error('无法计算路径')
      }
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 清除路径
  clearRoute: () => {
    set({ routeInfo: null })
  },

  // 地理编码
  geocode: async (address: string): Promise<MapLocation | null> => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const location = await mapService.geocode(address)
      set({ loading: false })
      return location
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 逆地理编码
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const address = await mapService.reverseGeocode(lat, lng)
      set({ loading: false })
      return address
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 批量地理编码
  batchGeocode: async (addresses: string[]): Promise<MapLocation[]> => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const locations = await mapService.batchGeocode(addresses)
      set({ loading: false })
      return locations
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // 计算最优路径
  calculateOptimalRoute: async (locations: MapLocation[]): Promise<MapLocation[]> => {
    const { userSettings } = useAppStore.getState()
    
    if (!userSettings?.map_api_key) {
      throw new Error('请先在设置页面配置高德地图API Key')
    }

    initializeMapService(userSettings.map_api_key)

    set({ loading: true, error: null })

    try {
      const optimizedRoute = await mapService.calculateOptimalRoute(locations)
      set({ loading: false })
      return optimizedRoute
    } catch (error: any) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  }
}))

// 获取地理位置错误信息
const getGeolocationError = (code: number): string => {
  switch (code) {
    case 1:
      return '位置服务被拒绝，请在浏览器设置中允许位置访问'
    case 2:
      return '无法获取位置信息，请检查网络连接'
    case 3:
      return '位置请求超时，请重试'
    default:
      return '无法获取当前位置'
  }
}
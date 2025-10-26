import React, { useEffect, useRef, useState } from 'react'
import { Card, Spin, Alert, Button, Space, Typography } from 'antd'
import { EnvironmentOutlined, CompassOutlined } from '@ant-design/icons'
import { DailyPlan } from '../../types/database'
import { mapService } from '../../services/mapService'

const { Title, Text } = Typography

interface TripDetailMapProps {
  dailyPlans: DailyPlan[]
  selectedDay: number
  onMarkerClick?: (dayNumber: number) => void
}

declare global {
  interface Window {
    AMap: any
  }
}

export const TripDetailMap: React.FC<TripDetailMapProps> = ({
  dailyPlans,
  selectedDay,
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        setLoading(true)
        setError(null)

        // 等待高德地图API加载
        if (!window.AMap) {
          await loadAMapScript()
        }

        // 获取所有活动地点
        const allActivities = dailyPlans.flatMap(plan => plan.activities)
        const activityAddresses = allActivities
          .filter(activity => activity.location?.name || activity.name)
          .map(activity => activity.location?.name || activity.name)

        // 获取默认目的地（从行程中提取或使用北京作为默认）
        let defaultDestination = '北京'
        if (dailyPlans.length > 0) {
          // 尝试从活动地点推断目的地
          const firstActivity = allActivities[0]
          if (firstActivity && firstActivity.location?.name) {
            defaultDestination = firstActivity.location.name
          }
        }

        // 获取默认目的地的坐标
        let centerLocation
        try {
          centerLocation = await mapService.geocode(defaultDestination)
          if (!centerLocation) {
            throw new Error('地理编码返回空结果')
          }
        } catch (error) {
          console.warn(`无法获取目的地坐标: ${defaultDestination}`, error)
          // 使用北京的默认坐标作为备选
          centerLocation = { lat: 39.9042, lng: 116.4074, name: '北京', address: '北京市' }
        }

        // 初始化地图
        mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
          zoom: 12,
          center: [centerLocation.lng, centerLocation.lat],
          mapStyle: 'amap://styles/normal'
        })

        // 添加目的地标记
        addMarker(
          centerLocation,
          defaultDestination,
          '#1890ff',
          0,
          '目的地',
          false
        )

        // 如果有活动地点，添加活动标记
        if (activityAddresses.length > 0) {
          try {
            const activityLocations = await mapService.batchGeocode(activityAddresses)
            
            activityLocations.forEach((location, index) => {
              const activity = allActivities[index]
              const dayNumber = dailyPlans.findIndex(plan =>
                plan.activities.includes(activity)
              ) + 1
              
              const isSelected = dayNumber === selectedDay
              
              addMarker(
                location,
                activity.name,
                getActivityColor(activity.type),
                dayNumber,
                activity.description,
                isSelected
              )
            })

            // 自动调整地图视野（包含目的地和所有活动地点）
            const allLocations = [centerLocation, ...activityLocations.filter(loc => loc !== null)]
            if (allLocations.length > 0) {
              // 使用更简单的方法设置地图视野
              const bounds = new window.AMap.Bounds()
              allLocations.forEach(loc => {
                bounds.extend(new window.AMap.LngLat(loc.lng, loc.lat))
              })
              mapInstanceRef.current.setBounds(bounds)
            }
          } catch (error) {
            console.warn('活动地点地理编码失败:', error)
          }
        }

        setLoading(false)
      } catch (err: any) {
        console.error('地图初始化失败:', err)
        setError(err.message || '地图加载失败')
        setLoading(false)
      }
    }

    initMap()

    // 清理函数
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
      markersRef.current = []
    }
  }, [dailyPlans])

  // 当选中天数变化时，更新标记高亮
  useEffect(() => {
    if (!mapInstanceRef.current || !window.AMap) return
    
    // 清除所有活动标记（保留目的地标记）
    const destinationMarker = markersRef.current.find(marker =>
      marker.getTitle() === '上海' || marker.getTitle() === '目的地'
    )
    markersRef.current.forEach(marker => {
      if (marker !== destinationMarker) {
        marker.setMap(null)
      }
    })
    markersRef.current = destinationMarker ? [destinationMarker] : []
    
    // 重新添加活动标记
    const allActivities = dailyPlans.flatMap(plan => plan.activities)
    const activityAddresses = allActivities
      .filter(activity => activity.location?.name || activity.name)
      .map(activity => activity.location?.name || activity.name)

    if (activityAddresses.length === 0) return

    // 批量获取坐标并重新添加标记
    mapService.batchGeocode(activityAddresses).then(activityLocations => {
      activityLocations.forEach((location, index) => {
        const activity = allActivities[index]
        const dayNumber = dailyPlans.findIndex(plan =>
          plan.activities.includes(activity)
        ) + 1
        
        const isSelected = dayNumber === selectedDay
        
        addMarker(
          location,
          activity.name,
          getActivityColor(activity.type),
          dayNumber,
          activity.description,
          isSelected
        )
      })
    })
  }, [selectedDay, dailyPlans])

  // 加载高德地图脚本
  const loadAMapScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.AMap) {
        resolve()
        return
      }

      const script = document.createElement('script')
      // Web端(JS API)需要单独的Key，优先使用JS API专用Key，如果没有则使用通用Key
      // Web端(JS API)有Key和Secret，但JS加载时只需要Key
      const jsApiKey = import.meta.env.VITE_AMAP_JS_API_KEY || import.meta.env.VITE_AMAP_API_KEY || ''
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${jsApiKey}&plugin=AMap.Geocoder`
      script.async = true
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('高德地图脚本加载失败'))
      
      document.head.appendChild(script)
    })
  }

  // 添加标记点
  const addMarker = (location: any, title: string, color: string, dayNumber: number, content?: string, isSelected: boolean = false) => {
    if (!mapInstanceRef.current) return

    const marker = new window.AMap.Marker({
      position: [location.lng, location.lat],
      title: title,
      offset: new window.AMap.Pixel(-13, -30),
      zIndex: isSelected ? 100 : 10,
      // 高亮标记的样式
      ...(isSelected && {
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(32, 32),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          imageSize: new window.AMap.Size(32, 32)
        })
      })
    })

    // 创建信息窗口
    const infoWindow = new window.AMap.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${title}</div>
          ${content ? `<div style="color: #666; font-size: 12px;">${content}</div>` : ''}
          <div style="color: #999; font-size: 12px; margin-top: 4px;">第${dayNumber}天</div>
          <div style="color: #999; font-size: 12px;">${location.address || ''}</div>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30)
    })

    // 点击标记显示信息窗口
    marker.on('click', () => {
      infoWindow.open(mapInstanceRef.current, marker.getPosition())
      onMarkerClick?.(dayNumber)
    })

    marker.setMap(mapInstanceRef.current)
    markersRef.current.push(marker)
  }

  // 获取活动类型对应的颜色
  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      TRANSPORT: '#1890ff', // 蓝色
      ACCOMMODATION: '#52c41a', // 绿色
      FOOD: '#faad14', // 橙色
      SIGHTSEEING: '#722ed1', // 紫色
      SHOPPING: '#eb2f96', // 粉色
      OTHER: '#8c8c8c' // 灰色
    }
    return colors[type] || '#8c8c8c'
  }

  // 重新加载地图
  const handleReload = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy()
      mapInstanceRef.current = null
    }
    markersRef.current = []
    setError(null)
    setLoading(true)
    
    // 重新初始化
    setTimeout(() => {
      const initMap = async () => {
        if (!mapRef.current) return
        // 重新初始化逻辑...
      }
      initMap()
    }, 100)
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="地图加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleReload}>
              重试
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <Card>
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">正在加载地图...</Text>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          height: loading ? 0 : 500, 
          width: '100%',
          borderRadius: 6,
          overflow: 'hidden'
        }}
      />

      {!loading && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            当前显示第 {selectedDay} 天的活动地点
          </Text>
        </div>
      )}
    </Card>
  )
}
import React, { useEffect, useRef, useState } from 'react'
import { Card, Spin, Alert, Button, Space, Typography } from 'antd'
import { EnvironmentOutlined, CompassOutlined } from '@ant-design/icons'
import { DailyPlan } from '../../types/database'
import { mapService } from '../../services/mapService'

const { Title, Text } = Typography

interface TripDetailMapProps {
  dailyPlans: DailyPlan[]
  selectedDay: number
  destination?: string
  onMarkerClick?: (dayNumber: number) => void
  highlightedActivity?: { dayNumber: number; activityIndex: number } | null
}

declare global {
  interface Window {
    AMap: any
  }
}

export const TripDetailMap: React.FC<TripDetailMapProps> = ({
  dailyPlans,
  selectedDay,
  destination,
  onMarkerClick,
  highlightedActivity
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
        
        console.log('活动地点列表:', activityAddresses)

        // 获取目的地（优先使用传入的目的地参数）
        let defaultDestination = destination || ''
        if (!defaultDestination && dailyPlans.length > 0) {
          // 尝试从活动地点推断目的地
          const firstActivity = allActivities[0]
          if (firstActivity && firstActivity.location?.name) {
            defaultDestination = firstActivity.location.name
          }
        }
        
        // 如果没有找到目的地，使用第一个活动的名称
        if (!defaultDestination && allActivities.length > 0) {
          defaultDestination = allActivities[0].name
        }
        
        // 如果还是没有目的地，使用北京作为默认
        if (!defaultDestination) {
          defaultDestination = '北京'
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
            // 使用目的地城市限定地理编码范围，避免跨城市标注错误
            const activityLocations = await mapService.batchGeocode(activityAddresses, defaultDestination)
            
            console.log('地理编码结果:', activityLocations)
            
            // 创建活动与位置的映射（用于调试）
            const activityLocationMap = new Map()
            allActivities.forEach((activity, index) => {
              const location = activityLocations[index]
              if (location) {
                activityLocationMap.set(activity, location)
              }
            })
            console.log('活动位置映射:', activityLocationMap)
            
            // 过滤掉无效的坐标和重复的地点
            const validLocations = activityLocations.filter((location, index) => {
              if (!location) return false
              
              // 检查坐标是否有效（放宽条件，只排除明显无效的坐标）
              const isValidCoordinate =
                location.lat !== 0 && location.lng !== 0 &&
                !isNaN(location.lat) && !isNaN(location.lng) &&
                location.lat >= -90 && location.lat <= 90 &&
                location.lng >= -180 && location.lng <= 180 &&
                // 排除明显的默认坐标
                !(location.lat === 39.9042 && location.lng === 116.4074) // 北京默认坐标
              
              // 检查是否与目的地坐标相同（避免重复标记，放宽判断条件）
              const isSameAsDestination =
                Math.abs(location.lat - centerLocation.lat) < 0.05 &&
                Math.abs(location.lng - centerLocation.lng) < 0.05
              
              // 检查是否与之前的地点重复（进一步放宽重复判断条件）
              const isDuplicate = activityLocations.slice(0, index).some(prevLoc =>
                prevLoc &&
                Math.abs(prevLoc.lat - location.lat) < 0.05 &&
                Math.abs(prevLoc.lng - location.lng) < 0.05
              )
              
              return isValidCoordinate && !isSameAsDestination && !isDuplicate
            })
            
            console.log('有效地点数量:', validLocations.length)
            
            // 为每个有效位置添加标记
            validLocations.forEach((location, index) => {
              const originalIndex = activityLocations.indexOf(location)
              const activity = allActivities[originalIndex]
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
            
            // 为地理编码失败的活动创建备用标记（使用目的地坐标）
            allActivities.forEach((activity, index) => {
              const location = activityLocations[index]
              if (!location || !validLocations.includes(location)) {
                const dayNumber = dailyPlans.findIndex(plan =>
                  plan.activities.includes(activity)
                ) + 1
                
                const isSelected = dayNumber === selectedDay
                
                // 使用目的地坐标作为备用标记
                addMarker(
                  centerLocation,
                  activity.name,
                  getActivityColor(activity.type),
                  dayNumber,
                  activity.description,
                  isSelected
                )
              }
            })

            // 自动调整地图视野（包含目的地和所有活动地点）
            const allLocations = [centerLocation, ...validLocations]
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
    mapService.batchGeocode(activityAddresses, destination).then(activityLocations => {
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

  // 当高亮活动变化时，定位到具体位置
  useEffect(() => {
    if (!mapInstanceRef.current || !highlightedActivity) return
    
    const { dayNumber, activityIndex } = highlightedActivity
    const dayPlan = dailyPlans.find(plan => plan.day_number === dayNumber)
    if (!dayPlan || !dayPlan.activities[activityIndex]) return
    
    const activity = dayPlan.activities[activityIndex]
    
    // 尝试从活动地点名称获取坐标
    const locationName = activity.location?.name || activity.name
    if (!locationName) {
      console.warn('活动没有有效的地点名称:', activity)
      return
    }
    
    console.log('尝试定位活动:', activity.name, '地点:', locationName)
    
    // 获取活动地点的坐标并定位
    const locateActivity = async () => {
      try {
        // 首先尝试使用活动地点名称
        let location = await mapService.geocode(locationName, destination)
        
        // 如果失败，尝试使用活动名称
        if (!location && activity.name !== locationName) {
          console.log('尝试使用活动名称定位:', activity.name)
          location = await mapService.geocode(activity.name, destination)
        }
        
        if (location && mapInstanceRef.current) {
          // 定位到该位置并放大
          mapInstanceRef.current.setCenter([location.lng, location.lat])
          mapInstanceRef.current.setZoom(15) // 放大到更详细的级别
          
          // 高亮对应的标记点
          markersRef.current.forEach(marker => {
            const markerPosition = marker.getPosition()
            if (markerPosition &&
                Math.abs(markerPosition.lng - location.lng) < 0.01 &&
                Math.abs(markerPosition.lat - location.lat) < 0.01) {
              // 添加高亮效果，比如闪烁动画
              marker.setAnimation('AMAP_ANIMATION_BOUNCE')
              setTimeout(() => {
                marker.setAnimation('')
              }, 2000)
            }
          })
        } else {
          console.warn('无法获取活动地点的坐标:', locationName)
        }
      } catch (error) {
        console.warn('定位活动地点失败:', error)
      }
    }
    
    locateActivity()
  }, [highlightedActivity, dailyPlans, destination])

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
            当前显示第 {selectedDay} 天的活动地点（地图信息仅供参考）
          </Text>
        </div>
      )}
    </Card>
  )
}
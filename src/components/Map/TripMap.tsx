import React, { useEffect, useRef, useState } from 'react'
import { Card, Spin, Alert, Button, Space, Typography } from 'antd'
import { EnvironmentOutlined, CompassOutlined } from '@ant-design/icons'
import { MapLocation, Activity } from '../../types/database'
import { mapService } from '../../services/mapService'

const { Title, Text } = Typography

interface TripMapProps {
  destination: string
  activities: Activity[]
  height?: number
  onLocationClick?: (location: MapLocation) => void
  highlightedActivity?: { dayIndex: number; activityIndex: number } | null
}

declare global {
  interface Window {
    AMap: any
  }
}

export const TripMap: React.FC<TripMapProps> = ({
  destination,
  activities,
  height = 400,
  onLocationClick,
  highlightedActivity
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locations, setLocations] = useState<MapLocation[]>([])

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

        // 获取目的地坐标
        let destinationLocation = await mapService.geocode(destination)
        
        // 如果目的地坐标获取失败，使用默认的中国中心点
        if (!destinationLocation) {
          console.warn(`无法找到目的地: ${destination}，使用默认中国视图`)
          destinationLocation = {
            lat: 39.9042,  // 北京纬度
            lng: 116.4074, // 北京经度
            name: destination,
            address: '中国'
          }
        }

        // 初始化地图
        mapInstanceRef.current = new window.AMap.Map(mapRef.current, {
          zoom: 12,
          center: [destinationLocation.lng, destinationLocation.lat],
          mapStyle: 'amap://styles/normal'
        })

        // 添加目的地标记
        addMarker(destinationLocation, '目的地', '#1890ff')

        // 批量获取活动地点坐标
        const activityAddresses = activities
          .filter(activity => activity.location?.name || activity.name)
          .map(activity => activity.location?.name || activity.name)

        console.log('活动地点列表:', activityAddresses)

        // 使用目的地城市限定地理编码范围，避免跨城市标注错误
        const activityLocations = await mapService.batchGeocode(activityAddresses, destination)
        
        console.log('地理编码结果:', activityLocations)
        
        // 创建活动与位置的映射（用于调试）
        const activityLocationMap = new Map()
        activities.forEach((activity, index) => {
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
            Math.abs(location.lat - destinationLocation.lat) < 0.05 &&
            Math.abs(location.lng - destinationLocation.lng) < 0.05
          
          // 检查是否与之前的地点重复（进一步放宽重复判断条件）
          const isDuplicate = activityLocations.slice(0, index).some(prevLoc =>
            prevLoc &&
            Math.abs(prevLoc.lat - location.lat) < 0.05 &&
            Math.abs(prevLoc.lng - location.lng) < 0.05
          )
          
          return isValidCoordinate && !isSameAsDestination && !isDuplicate
        })
        
        console.log('有效地点数量:', validLocations.length)
        
        setLocations(validLocations)

        // 为每个有效位置添加标记
        validLocations.forEach((location, index) => {
          const originalIndex = activityLocations.indexOf(location)
          const activity = activities[originalIndex]
          const isHighlighted = highlightedActivity?.activityIndex === originalIndex
          
          addMarker(
            location,
            activity.name,
            getActivityColor(activity.type),
            activity.description,
            isHighlighted
          )
        })

        // 为地理编码失败的活动创建备用标记（使用目的地坐标）
        activities.forEach((activity, index) => {
          const location = activityLocations[index]
          if (!location || !validLocations.includes(location)) {
            // 使用目的地坐标作为备用标记
            addMarker(
              destinationLocation,
              activity.name,
              getActivityColor(activity.type),
              `${activity.description} (位置信息待确认)`,
              false
            )
          }
        })

        // 自动调整地图视野
        if (activityLocations.length > 0) {
          const allLocations = [destinationLocation, ...activityLocations]
          if (allLocations.length > 0) {
            // 使用更简单的方法设置地图视野
            const bounds = new window.AMap.Bounds()
            allLocations.forEach(loc => {
              bounds.extend(new window.AMap.LngLat(loc.lng, loc.lat))
            })
            mapInstanceRef.current.setBounds(bounds)
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
  }, [destination, activities])

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
  const addMarker = (location: MapLocation, title: string, color: string, content?: string, isHighlighted: boolean = false) => {
    if (!mapInstanceRef.current) return

    const marker = new window.AMap.Marker({
      position: [location.lng, location.lat],
      title: title,
      offset: new window.AMap.Pixel(-13, -30),
      zIndex: isHighlighted ? 100 : 10,
      // 高亮标记的样式
      ...(isHighlighted && {
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
          <div style="color: #999; font-size: 12px; margin-top: 4px;">${location.address || ''}</div>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30)
    })

    // 点击标记显示信息窗口
    marker.on('click', () => {
      infoWindow.open(mapInstanceRef.current, marker.getPosition())
      onLocationClick?.(location)
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

  // 当高亮活动变化时，只定位到活动位置，不重新渲染标记
  useEffect(() => {
    if (!mapInstanceRef.current || !window.AMap || !highlightedActivity) return
    
    const { dayIndex, activityIndex } = highlightedActivity
    
    // 查找对应的活动 - 使用平铺的activities数组
    let targetActivity = null
    let currentIndex = 0
    
    // 遍历所有活动，找到对应索引的活动
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i]
      // 检查这个活动是否在指定的平铺索引位置
      if (i === activityIndex) {
        targetActivity = activity
        break
      }
    }
    
    if (!targetActivity) {
      console.warn('无法找到对应的活动:', highlightedActivity)
      return
    }
    
    // 尝试从活动地点名称获取坐标
    const locationName = targetActivity.location?.name || targetActivity.name
    if (!locationName) {
      console.warn('活动没有有效的地点名称:', targetActivity)
      return
    }
    
    console.log('尝试定位活动:', targetActivity.name, '地点:', locationName, '平铺索引:', activityIndex)
    
    // 获取活动地点的坐标并定位
    const locateActivity = async () => {
      try {
        // 首先尝试使用活动地点名称
        let location = await mapService.geocode(locationName, destination)
        
        // 如果失败，尝试使用活动名称
        if (!location && targetActivity.name !== locationName) {
          console.log('尝试使用活动名称定位:', targetActivity.name)
          location = await mapService.geocode(targetActivity.name, destination)
        }
        
        if (location && mapInstanceRef.current) {
          // 定位到该位置并放大，确保位置固定
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
          
          // 确保地图不会自动调整视野
          mapInstanceRef.current.setFitView(false)
        } else {
          console.warn('无法获取活动地点的坐标:', locationName)
          // 使用目的地作为备用位置
          let destLocation = await mapService.geocode(destination)
          if (!destLocation) {
            // 如果目的地坐标获取失败，使用默认的中国中心点
            destLocation = {
              lat: 39.9042,  // 北京纬度
              lng: 116.4074, // 北京经度
              name: destination,
              address: '中国'
            }
          }
          if (destLocation && mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([destLocation.lng, destLocation.lat])
            mapInstanceRef.current.setZoom(12)
            mapInstanceRef.current.setFitView(false)
          }
        }
      } catch (error) {
        console.warn('定位活动地点失败:', error)
        // 使用目的地作为备用位置
        let destLocation = await mapService.geocode(destination)
        if (!destLocation) {
          // 如果目的地坐标获取失败，使用默认的中国中心点
          destLocation = {
            lat: 39.9042,  // 北京纬度
            lng: 116.4074, // 北京经度
            name: destination,
            address: '中国'
          }
        }
        if (destLocation && mapInstanceRef.current) {
          mapInstanceRef.current.setCenter([destLocation.lng, destLocation.lat])
          mapInstanceRef.current.setZoom(12)
          mapInstanceRef.current.setFitView(false)
        }
      }
    }
    
    locateActivity()
  }, [highlightedActivity, activities, destination])

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
    <Card 
      title={
        <Space>
          <CompassOutlined />
          <span>行程地图</span>
        </Space>
      }
      extra={
        <Text type="secondary">
          目的地: {destination}
        </Text>
      }
    >
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
          height: loading ? 0 : height, 
          width: '100%',
          borderRadius: 6,
          overflow: 'hidden'
        }}
      />

      {!loading && locations.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            共标记了 {locations.length} 个活动地点
          </Text>
        </div>
      )}

      {!loading && locations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <EnvironmentOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div>
            <Text type="secondary">暂无活动地点信息</Text>
          </div>
        </div>
      )}
    </Card>
  )
}

// 静态地图组件（用于快速预览）
interface StaticMapProps {
  center: MapLocation
  markers?: MapLocation[]
  width?: number
  height?: number
}

export const StaticMap: React.FC<StaticMapProps> = ({
  center,
  markers = [],
  width = 400,
  height = 200
}) => {
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    try {
      const url = mapService.getStaticMapUrl(center, markers, 13, `${width}x${height}`)
      setImageUrl(url)
    } catch (error) {
      console.error('生成静态地图失败:', error)
    }
  }, [center, markers, width, height])

  if (!imageUrl) {
    return (
      <div 
        style={{ 
          width, 
          height, 
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6
        }}
      >
        <Text type="secondary">地图加载中...</Text>
      </div>
    )
  }

  return (
    <img 
      src={imageUrl} 
      alt="行程地图" 
      style={{ 
        width, 
        height, 
        borderRadius: 6,
        objectFit: 'cover'
      }}
    />
  )
}
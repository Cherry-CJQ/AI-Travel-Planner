import React, { useState, useEffect } from 'react'
import { 
  Input, 
  Button, 
  List, 
  Card, 
  Space, 
  Typography, 
  Tag, 
  Spin,
  Alert,
  Empty
} from 'antd'
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  CompassOutlined,
  AimOutlined
} from '@ant-design/icons'
import { MapLocation } from '../../types/database'
import { useMapStore } from '../../stores/mapStore'

const { Text } = Typography
const { Search } = Input

interface LocationSearchProps {
  onLocationSelect?: (location: MapLocation) => void
  placeholder?: string
  city?: string
  showCurrentLocation?: boolean
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "搜索地点...",
  city,
  showCurrentLocation = true
}) => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const { 
    searchResults, 
    currentLocation, 
    loading, 
    error,
    searchPlaces,
    getCurrentLocation,
    clearSearchResults
  } = useMapStore()

  // 搜索地点
  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      clearSearchResults()
      return
    }

    setIsSearching(true)
    try {
      await searchPlaces(value, city)
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // 获取当前位置
  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation()
      if (location && onLocationSelect) {
        onLocationSelect(location)
      }
    } catch (error) {
      console.error('获取当前位置失败:', error)
    }
  }

  // 选择地点
  const handleSelectLocation = (location: MapLocation) => {
    onLocationSelect?.(location)
  }

  // 格式化距离显示
  const formatDistance = (distance?: number): string => {
    if (!distance) return ''
    
    if (distance < 1000) {
      return `${Math.round(distance)}米`
    } else {
      return `${(distance / 1000).toFixed(1)}公里`
    }
  }

  // 清空搜索
  const handleClearSearch = () => {
    setSearchKeyword('')
    clearSearchResults()
  }

  return (
    <Card 
      title={
        <Space>
          <CompassOutlined />
          <span>地点搜索</span>
        </Space>
      }
      size="small"
    >
      {/* 搜索输入框 */}
      <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
        <Search
          placeholder={placeholder}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          enterButton={
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              loading={isSearching}
            >
              搜索
            </Button>
          }
          allowClear
          onClear={handleClearSearch}
        />
      </Space.Compact>

      {/* 当前位置按钮 */}
      {showCurrentLocation && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            icon={<AimOutlined />}
            onClick={handleGetCurrentLocation}
            loading={loading}
            block
          >
            使用当前位置
          </Button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 搜索结果 */}
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {isSearching ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">搜索中...</Text>
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          <List
            dataSource={searchResults}
            renderItem={(location, index) => (
              <List.Item
                key={index}
                style={{ 
                  padding: '12px 0',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onClick={() => handleSelectLocation(location)}
                actions={[
                  <Button 
                    type="link" 
                    size="small"
                    onClick={() => handleSelectLocation(location)}
                  >
                    选择
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                  title={
                    <Space>
                      <Text strong>{location.name}</Text>
                      {location.address && (
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          详细
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {location.address}
                      </Text>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          坐标: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : searchKeyword && !isSearching ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="未找到相关地点"
          />
        ) : null}
      </div>

      {/* 当前选中位置信息 */}
      {currentLocation && (
        <div style={{ 
          marginTop: 16, 
          padding: 12, 
          backgroundColor: '#f6ffed',
          borderRadius: 6,
          border: '1px solid #b7eb8f'
        }}>
          <Text strong>当前位置:</Text>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentLocation.address}
            </Text>
          </div>
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              坐标: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </Text>
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          提示: 输入地点名称进行搜索，或使用当前位置功能
        </Text>
      </div>
    </Card>
  )
}

// 地点选择器组件
interface LocationPickerProps {
  value?: MapLocation
  onChange?: (location: MapLocation) => void
  placeholder?: string
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  placeholder = "选择地点..."
}) => {
  const [showSearch, setShowSearch] = useState(false)

  const handleLocationSelect = (location: MapLocation) => {
    onChange?.(location)
    setShowSearch(false)
  }

  return (
    <div>
      {/* 显示选中的地点 */}
      {value ? (
        <Card 
          size="small" 
          style={{ marginBottom: 8 }}
          bodyStyle={{ padding: '8px 12px' }}
        >
          <Space>
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            <div>
              <Text strong>{value.name}</Text>
              {value.address && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {value.address}
                  </Text>
                </div>
              )}
            </div>
            <Button 
              type="link" 
              size="small" 
              onClick={() => setShowSearch(!showSearch)}
            >
              更改
            </Button>
          </Space>
        </Card>
      ) : (
        <Button 
          icon={<EnvironmentOutlined />}
          onClick={() => setShowSearch(!showSearch)}
          block
        >
          {placeholder}
        </Button>
      )}

      {/* 搜索面板 */}
      {showSearch && (
        <div style={{ marginTop: 8 }}>
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            placeholder={placeholder}
            showCurrentLocation={true}
          />
        </div>
      )}
    </div>
  )
}
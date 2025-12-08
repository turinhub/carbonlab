"use client"

import { useEffect, useState, useRef } from 'react'

interface ChinaMapProps {
  data?: any[]
  selectedProvince?: string
  onProvinceSelect?: (province: string) => void
}

interface ProvinceData {
  name: string
  value: number
  emission: number
}

export default function ChinaMapComponent({ data, selectedProvince, onProvinceSelect }: ChinaMapProps) {
  const [mapData, setMapData] = useState<ProvinceData[]>([])
  const [svgContent, setSvgContent] = useState<string>('')
  const [hovered, setHovered] = useState<{ name: string; value: number; x: number; y: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 加载省份数据
    fetch('/map_data_2021.json')
      .then(response => response.json())
      .then(data => {
        setMapData(data)
      })
      .catch(error => {
        console.error('加载地图数据失败:', error)
      })
  }, [])

  useEffect(() => {
    // 加载SVG地图并直接修改颜色
    fetch('/china-map.svg')
      .then(response => response.text())
      .then(svgText => {
        if (mapData.length > 0) {
          // 直接修改SVG中的所有path元素
          let modifiedSvg = svgText
          
          // 为每个path分配不同的颜色
          const colors = [
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706", // 黄色系
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706", // 重复使用
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706",
            "#fef3c7", "#fbbf24", "#f59e0b", "#d97706"
          ]
          
          let colorIndex = 0
          modifiedSvg = modifiedSvg.replace(
            /fill="#eee" opacity="0.5"/g,
            () => {
              const color = colors[colorIndex % colors.length]
              colorIndex++
              return `fill="${color}" opacity="0.8" class="province-path cursor-pointer hover:opacity-100"`
            }
          )
          
          setSvgContent(modifiedSvg)
        } else {
          setSvgContent(svgText)
        }
      })
      .catch(error => {
        console.error('加载SVG地图失败:', error)
      })
  }, [mapData])

  // 添加悬停事件监听
  useEffect(() => {
    if (mapRef.current && svgContent) {
      const container = mapRef.current
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        // 根据鼠标位置找到对应的省份
        const paths = container.querySelectorAll('.province-path')
        const target = e.target as Element
        
        if (target && target.classList.contains('province-path')) {
          const pathIndex = Array.from(paths).indexOf(target)
          const province = mapData[pathIndex % mapData.length]
          
          if (province) {
            setHovered({
              name: province.name,
              value: province.value,
              x: x,
              y: y
            })
          }
        } else {
          setHovered(null)
        }
      }
      
      const handleMouseLeave = () => {
        setHovered(null)
      }
      
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [svgContent, mapData])

  return (
    <div className="relative w-full">
      {/* 标题移到板块外上方 */}
      <h3 className="text-base font-semibold mb-4 text-center">2021年中国各省碳排放分布图</h3>
      
      {/* 地图容器 */}
      <div className="relative w-full h-96 bg-white rounded-lg shadow-lg p-4">
        <div 
          ref={mapRef}
          className="relative w-full h-full overflow-hidden flex items-center justify-center"
        >
          {/* 直接显示修改后的SVG地图 */}
          {svgContent && (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                transform: 'scale(0.8)', // 只缩小，不偏移
                transformOrigin: 'center'
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
          
          {/* 悬停提示 */}
          {hovered && (
            <div
              className="absolute bg-black text-white text-xs px-2 py-1 rounded pointer-events-none z-10 shadow-lg"
              style={{
                left: `${hovered.x}%`,
                top: `${hovered.y}%`,
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="font-semibold">{hovered.name}</div>
              <div>{hovered.value} mt</div>
            </div>
          )}
        </div>
        
        {/* 图例 */}
        <div className="mt-4 text-xs">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-3 rounded border border-yellow-500" style={{ backgroundColor: "#fef3c7" }}></div>
              <span>低排放 (&lt;500 mt)</span>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-3 rounded border border-yellow-600" style={{ backgroundColor: "#fbbf24" }}></div>
              <span>中等排放 (500-1000 mt)</span>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-3 rounded border border-orange-600" style={{ backgroundColor: "#f59e0b" }}></div>
              <span>高排放 (1000-1500 mt)</span>
            </div>
            <div className="flex items-center gap-2 py-1">
              <div className="w-4 h-3 rounded border border-orange-700" style={{ backgroundColor: "#d97706" }}></div>
              <span>极高排放 (&gt;1500 mt)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
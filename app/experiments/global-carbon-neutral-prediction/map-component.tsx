"use client"

import { useEffect, useRef, useState } from "react"
import { Scene, PointLayer, HeatmapLayer } from '@antv/l7'
import { GaodeMap } from '@antv/l7-maps'

// 高德地图API密钥
const AMAP_API_KEY = "3af88788bc82b4f8ea7c9d1d3cac3dbf"

// 组件Props类型定义
type MapComponentProps = {
  mapStyle: string
  visualizationType: string
  filteredData: any[]
  generateHeatmapData: () => any[]
}

export default function MapComponent({ 
  mapStyle, 
  visualizationType, 
  filteredData,
  generateHeatmapData
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const [mapLoaded, setMapLoaded] = useState<boolean>(false)
  const layersRef = useRef<any[]>([]) // 用于追踪添加的图层

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return

    try {
      // 创建场景
      const scene = new Scene({
        id: mapRef.current,
        map: new GaodeMap({
          style: mapStyle,
          center: [108.9, 34.2],
          zoom: 3,
          pitch: visualizationType === "3dcolumn" ? 45 : 0,
          token: AMAP_API_KEY
        }),
        logoVisible: false
      })

      sceneRef.current = scene

      // 设置场景加载事件
      scene.on('loaded', () => {
        setMapLoaded(true)
      })

      return () => {
        // 清理逻辑，确保在组件卸载时正确销毁地图
        clearAllLayers()
        if (sceneRef.current) {
          try {
            sceneRef.current.destroy()
          } catch (e) {
            console.warn("销毁地图时出错:", e)
          }
          sceneRef.current = null
        }
        setMapLoaded(false)
        layersRef.current = []
      }
    } catch (error) {
      console.error("地图初始化失败:", error)
    }
  // 注意：这里只监听mapStyle变化，不监听visualizationType
  }, [mapStyle])

  // 清除所有图层的辅助函数
  const clearAllLayers = () => {
    if (!sceneRef.current) return
    
    try {
      // 移除所有已添加的图层
      layersRef.current.forEach(layer => {
        try {
          if (sceneRef.current) {
            sceneRef.current.removeLayer(layer)
          }
        } catch (e) {
          console.warn("移除图层时出错:", e)
        }
      })
      layersRef.current = []
    } catch (error) {
      console.error("清除图层时出错:", error)
    }
  }

  // 添加图层的辅助函数
  const updateVisualization = () => {
    if (!mapLoaded || !sceneRef.current) return
    
    try {
      // 先清除所有现有图层
      clearAllLayers()
      
      // 根据类型添加新图层
      let newLayer
      if (visualizationType === "point") {
        newLayer = addPointLayer(sceneRef.current)
      } else if (visualizationType === "heatmap") {
        newLayer = addHeatmapLayer(sceneRef.current)
      } else if (visualizationType === "3dcolumn") {
        newLayer = add3DColumnLayer(sceneRef.current)
      }
      
      // 如果添加了新图层，记录到引用中
      if (newLayer) {
        layersRef.current.push(newLayer)
      }
    } catch (error) {
      console.error("更新可视化类型时出错:", error)
    }
  }

  // 更新地图样式
  useEffect(() => {
    if (mapLoaded && sceneRef.current) {
      try {
        sceneRef.current.setMapStyle(mapStyle)
      } catch (error) {
        console.error("更新地图样式时出错:", error)
      }
    }
  }, [mapStyle, mapLoaded])

  // 更新可视化类型和数据
  useEffect(() => {
    if (mapLoaded) {
      updateVisualization()
    }
  }, [visualizationType, filteredData, mapLoaded])

  // 更新3D视角
  useEffect(() => {
    if (mapLoaded && sceneRef.current) {
      try {
        // 更新地图的俯仰角度
        sceneRef.current.setPitch(visualizationType === "3dcolumn" ? 45 : 0)
      } catch (error) {
        console.error("更新地图视角时出错:", error)
      }
    }
  }, [visualizationType, mapLoaded])

  // 添加点图层
  const addPointLayer = (scene: Scene) => {
    const pointLayer = new PointLayer({
      name: "pointLayer"
    })
      .source(filteredData, {
        parser: {
          type: "json",
          coordinates: "lnglat"
        }
      })
      .shape("circle")
      .size("value", [5, 25])
      .color("value", [
        "#feedde",
        "#fdbe85",
        "#fd8d3c",
        "#e6550d",
        "#a63603"
      ])
      .style({
        opacity: 0.8,
        strokeWidth: 1,
        stroke: "#fff"
      })
      
    scene.addLayer(pointLayer)
    return pointLayer
  }

  // 添加热力图层
  const addHeatmapLayer = (scene: Scene) => {
    const heatmapData = generateHeatmapData()
    const heatmapLayer = new HeatmapLayer({
      name: "heatmapLayer"
    })
      .source(heatmapData, {
        parser: {
          type: "json",
          x: "lng",
          y: "lat"
        }
      })
      .shape("heatmap")
      .size("count", [0, 1.0])
      .color("count", [
        "#0A3161",
        "#0F5257",
        "#167A54",
        "#4C9F38",
        "#8CBB26",
        "#DEBB26",
        "#F49D1A",
        "#E4632D",
        "#BC2025"
      ])
      .style({
        intensity: 2,
        radius: 15,
        opacity: 0.8,
        rampColors: {
          colors: [
            "#0A3161",
            "#0F5257",
            "#167A54",
            "#4C9F38",
            "#8CBB26",
            "#DEBB26",
            "#F49D1A",
            "#E4632D",
            "#BC2025"
          ],
          positions: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0]
        }
      })
      
    scene.addLayer(heatmapLayer)
    return heatmapLayer
  }

  // 添加3D柱状图层
  const add3DColumnLayer = (scene: Scene) => {
    const columnLayer = new PointLayer({
      name: "3dColumnLayer"
    })
      .source(filteredData, {
        parser: {
          type: "json",
          coordinates: "lnglat"
        }
      })
      .shape("cylinder")
      .size("value", (val: number) => [4, 4, val / 10])
      .color("value", [
        "#feedde",
        "#fdbe85",
        "#fd8d3c",
        "#e6550d",
        "#a63603"
      ])
      .style({
        opacity: 0.8
      })
      
    scene.addLayer(columnLayer)
    return columnLayer
  }

  return (
    <div 
      ref={mapRef} 
      className="map-container" 
      style={{ width: "100%", height: "100%" }}
    />
  )
} 
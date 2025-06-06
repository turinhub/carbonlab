"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export function HeroBanner() {
  const router = useRouter()
  // 背景图片列表
  const backgroundImages = [
    "/banner-1.webp",
    "/banner-2.webp",
    "/banner-3.webp",
    "/banner-4.webp"
  ]

  // 当前显示的图片索引
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // 定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 清除定时器的函数
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 启动自动轮播定时器
  const startTimer = () => {
    clearTimer()
    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // 改为5秒切换一次，更流畅
  }

  // 自动切换背景图片
  useEffect(() => {
    startTimer()
    return () => clearTimer()
  }, []) // 移除依赖，只在组件挂载时启动

  // 手动切换图片
  const handleDotClick = (idx: number) => {
    if (idx === currentImageIndex) return
    setCurrentImageIndex(idx)
    // 重置定时器
    startTimer()
  }

  const handleScrollToCategories = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const categoriesElement = document.getElementById('categories')
    if (categoriesElement) {
      categoriesElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div 
      id="intro" 
      className="relative h-[600px] overflow-hidden flex items-center justify-center text-white mb-12"
    >
      {/* 滑动容器 */}
      <div 
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`,
        }}
      >
        {/* 背景图片 */}
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-full h-full"
            style={{
              backgroundImage: `url("${image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* 黑色遮罩层 */}
            <div className="absolute inset-0 bg-black opacity-50"></div>
          </div>
        ))}
      </div>

      <div className="relative z-0 text-center space-y-6 max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          碳经济与管理AI实训平台
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          领航新一代绿色未来
        </h2>
        <p className="text-xl md:text-2xl">
          全链条低碳实训，让你成为"双碳"时代的专业人才
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <a
            href="#categories"
            onClick={handleScrollToCategories}
            className="inline-block bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition duration-300 transform hover:scale-105"
          >
            <i className="fas fa-play-circle mr-2"></i>开始探索
          </a>
          <a
            href="/resources"
            className="inline-block bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-indigo-800 transition duration-300 transform hover:scale-105 border border-white/20"
          >
            <i className="fas fa-book mr-2"></i>浏览资源
          </a>
        </div>
      </div>
      
      {/* 进度条/小圆点，绝对定位到底部 */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex justify-center items-center gap-3 z-0">
        {backgroundImages.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 focus:outline-none hover:scale-110 ${
              idx === currentImageIndex 
                ? 'bg-white border-white shadow-lg scale-125' 
                : 'bg-white/40 border-white/40 hover:bg-white/60 hover:border-white/60'
            }`}
            onClick={() => handleDotClick(idx)}
            aria-label={`切换到第${idx + 1}张图片`}
          />
        ))}
      </div>
    </div>
  )
}

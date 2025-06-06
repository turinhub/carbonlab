"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, BarChart3, Globe, Calendar, ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 模拟数据
const policies = [
  {
    id: 1,
    title: "《碳排放权交易管理办法（试行）》",
    level: "国家级",
    date: "2021-01-05",
    summary: "规范全国碳排放权交易市场的运行管理，推动温室气体减排。",
    url: "#"
  },
  {
    id: 2,
    title: "《2030年前碳达峰行动方案》",
    level: "国家级", 
    date: "2021-10-26",
    summary: "明确2030年前碳达峰的总体要求、主要目标和重点任务。",
    url: "#"
  },
  {
    id: 3,
    title: "北京市碳达峰实施方案",
    level: "地方级",
    date: "2022-11-03",
    summary: "北京市实现碳达峰目标的具体实施路径和保障措施。",
    url: "#"
  },
  {
    id: 4,
    title: "上海市碳达峰实施方案",
    level: "地方级",
    date: "2022-07-28",
    summary: "上海市碳达峰行动的时间表、路线图和施工图。",
    url: "#"
  }
]

// 政策法规轮播数据
const policySlides = [
  {
    id: 1,
    image: "/policies/policy-1.webp",
    title: "全国碳市场建设方案",
    description: "深化全国碳市场建设，完善碳排放权交易制度"
  },
  {
    id: 2,
    image: "/policies/policy-2.webp",
    title: "碳达峰碳中和标准体系建设指南",
    description: "建立健全碳达峰碳中和标准体系，支撑双碳目标实现"
  },
  {
    id: 3,
    image: "/policies/policy-3.webp",
    title: "碳关税政策解读",
    description: "欧盟碳边境调节机制（CBAM）对中国企业的影响分析"
  }
]

const articles = [
  {
    id: 1,
    title: "全国碳市场运行两周年：制度体系日趋完善",
    author: "生态环境部",
    date: "2023-07-16",
    category: "市场动态",
    summary: "全国碳排放权交易市场自2021年7月16日启动以来，运行平稳有序，各项制度不断完善。",
    url: "#"
  },
  {
    id: 2,
    title: "碳中和目标下的绿色金融创新路径",
    author: "中国人民银行研究局",
    date: "2023-06-20",
    category: "政策解读",
    summary: "探讨绿色金融在支持碳中和目标实现过程中的创新模式和发展路径。",
    url: "#"
  },
  {
    id: 3,
    title: "企业碳核算方法学与实践案例分析",
    author: "中国标准化研究院",
    date: "2023-05-15",
    category: "技术指南",
    summary: "详细介绍企业层面碳排放核算的方法学体系和典型行业实践案例。",
    url: "#"
  },
  {
    id: 4,
    title: "CCER重启对碳市场的影响分析",
    author: "清华大学能源环境经济研究所",
    date: "2023-04-10",
    category: "研究报告",
    summary: "分析国家核证自愿减排量（CCER）重启对全国碳市场发展的积极影响。",
    url: "#"
  }
]

const datasets = [
  {
    id: 1,
    title: "全国碳排放权交易市场数据",
    provider: "全国碳排放权交易市场",
    updateTime: "2023-12-01",
    description: "包含全国碳市场交易价格、成交量、履约情况等核心数据。",
    format: "CSV, JSON",
    url: "#"
  },
  {
    id: 2,
    title: "中国省级碳排放数据集",
    provider: "中科院大气物理研究所",
    updateTime: "2023-11-15",
    description: "1997-2022年中国各省份分行业碳排放数据，支持学术研究使用。",
    format: "Excel, NetCDF",
    url: "#"
  },
  {
    id: 3,
    title: "全球碳预算数据",
    provider: "Global Carbon Project",
    updateTime: "2023-12-05",
    description: "全球碳循环年度预算数据，包含化石燃料排放、土地利用变化等。",
    format: "CSV, NetCDF",
    url: "#"
  },
  {
    id: 4,
    title: "企业碳披露数据库",
    provider: "CDP全球环境信息研究中心",
    updateTime: "2023-10-30",
    description: "全球主要企业的碳排放披露数据和气候行动信息。",
    format: "Excel, API",
    url: "#"
  }
]

export default function ConsultingPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const getLevelColor = (level: string) => {
    return level === "国家级" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "市场动态": "bg-green-100 text-green-800",
      "政策解读": "bg-blue-100 text-blue-800", 
      "技术指南": "bg-purple-100 text-purple-800",
      "研究报告": "bg-orange-100 text-orange-800"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // 自动轮播
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % policySlides.length)
    }, 5000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 手动切换轮播
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + policySlides.length) % policySlides.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % policySlides.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回首页
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">碳经济资讯</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">碳经济信息中心</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              汇聚最新的碳经济政策法规、权威研究文章和公开数据资源，为您提供全面、及时、准确的碳经济信息服务，助力双碳目标实现。
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="搜索政策、文章或数据..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("policies")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "policies"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FileText className="h-5 w-5 inline-block mr-2" />
                政策法规
              </button>
              <button
                onClick={() => setActiveTab("articles")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "articles"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Globe className="h-5 w-5 inline-block mr-2" />
                公开文章
              </button>
              <button
                onClick={() => setActiveTab("datasets")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "datasets"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <BarChart3 className="h-5 w-5 inline-block mr-2" />
                公开数据
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Policies Tab */}
            {activeTab === "policies" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">政策法规</h3>
                  <p className="text-gray-600">国家和地方层面的碳经济相关政策法规文件</p>
                </div>
                <div className="relative">
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    {policySlides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                          <h3 className="text-lg font-semibold mb-2">{slide.title}</h3>
                          <p className="text-sm">{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handlePrevSlide}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={handleNextSlide}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === "articles" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">公开文章</h3>
                  <p className="text-gray-600">权威机构发布的碳经济研究文章和报告</p>
                </div>
                <div className="grid gap-6">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{article.title}</h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          <a 
                            href={article.url}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>作者：{article.author}</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {article.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Datasets Tab */}
            {activeTab === "datasets" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">公开数据</h3>
                  <p className="text-gray-600">碳经济相关的公开数据集和统计资料</p>
                </div>
                <div className="grid gap-6">
                  {datasets.map((dataset) => (
                    <div key={dataset.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{dataset.title}</h4>
                        <a 
                          href={dataset.url}
                          className="text-blue-600 hover:text-blue-800 transition-colors ml-4"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="text-gray-600 mb-3">{dataset.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">数据提供方：</span>
                          {dataset.provider}
                        </div>
                        <div>
                          <span className="font-medium">更新时间：</span>
                          {dataset.updateTime}
                        </div>
                        <div>
                          <span className="font-medium">数据格式：</span>
                          {dataset.format}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">需要更多信息？</h3>
          <p className="text-lg mb-6 opacity-90">
            如果您需要特定的政策解读、数据分析或咨询服务，欢迎联系我们的专业团队。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              联系咨询团队
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors">
              提交数据需求
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, BarChart3, Globe, Calendar, ExternalLink, Search, ChevronLeft, ChevronRight, Users, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/stores/user-store"
import { LoginRequiredModal } from "@/components/ui/login-required-modal"
import { FeedbackForm } from "@/components/news/FeedbackForm"

// 政策法规轮播数据
const policySlides = [
  {
    id: 1,
    image: "/national-carbon-market-plan.webp",
    title: "全国碳市场建设方案",
    description: "深化全国碳市场建设，完善碳排放权交易制度",
    tag: "最新发布"
  },
  {
    id: 2,
    image: "/carbon-emission-trading-regulation.webp",
    title: "碳排放权交易管理暂行条例",
    description: "国务院发布《碳排放权交易管理暂行条例》，构建全国碳市场法律框架",
    tag: "重要政策"
  },
  {
    id: 3,
    image: "/carbon-tariff-policy.webp",
    title: "碳关税政策解读",
    description: "欧盟碳边境调节机制（CBAM）对中国企业的影响分析",
    tag: "政策解读"
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
    url: "#",
    readCount: "2.3k",
    tags: ["碳市场", "制度建设"]
  },
  {
    id: 2,
    title: "碳中和目标下的绿色金融创新路径",
    author: "中国人民银行研究局",
    date: "2023-06-20",
    category: "政策解读",
    summary: "探讨绿色金融在支持碳中和目标实现过程中的创新模式和发展路径。",
    url: "#",
    readCount: "1.8k",
    tags: ["绿色金融", "碳中和"]
  },
  {
    id: 3,
    title: "企业碳核算方法学与实践案例分析",
    author: "中国标准化研究院",
    date: "2023-05-15",
    category: "技术指南",
    summary: "详细介绍企业层面碳排放核算的方法学体系和典型行业实践案例。",
    url: "#",
    readCount: "3.1k",
    tags: ["碳核算", "方法学"]
  },
  {
    id: 4,
    title: "CCER重启对碳市场的影响分析",
    author: "清华大学能源环境经济研究所",
    date: "2023-04-10",
    category: "研究报告",
    summary: "分析国家核证自愿减排量（CCER）重启对全国碳市场发展的积极影响。",
    url: "#",
    readCount: "2.7k",
    tags: ["CCER", "碳市场"]
  }
]



export default function NewsPage() {
  const [activeTab, setActiveTab] = useState("policies")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { isLoggedIn } = useUserStore()

  const getCategoryColor = (category: string) => {
    const colors = {
      "市场动态": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "政策解读": "bg-blue-100 text-blue-800 border-blue-200", 
      "技术指南": "bg-purple-100 text-purple-800 border-purple-200",
      "研究报告": "bg-orange-100 text-orange-800 border-orange-200"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
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

  // 处理建议反馈按钮点击
  const handleFeedbackClick = () => {
    if (isLoggedIn) {
      setShowFeedbackForm(true)
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              返回首页
            </Link>
            <div className="h-6 w-px bg-gradient-to-b from-gray-300 to-transparent"></div>
            <h1 className="text-3xl font-bold text-gray-900">
              双碳快讯
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">碳经济信息中心</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              汇聚最新的碳经济政策法规、权威研究文章和公开数据资源，为您提供全面、及时、准确的碳经济信息服务，助力双碳目标实现。
            </p>
          </div>
        </div>



        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          <div className="border-b border-white/20 bg-gradient-to-r from-gray-50 to-blue-50">
            <nav className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab("policies")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "policies"
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                <FileText className="h-5 w-5 inline-block mr-2" />
                政策法规
              </button>
              <button
                onClick={() => setActiveTab("articles")}
                className={`py-6 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === "articles"
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
                }`}
              >
                <Globe className="h-5 w-5 inline-block mr-2" />
                公开文章
              </button>
            </nav>
          </div>

          <div className="p-8">
            {/* Policies Tab */}
            {activeTab === "policies" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">政策法规</h3>
                  <p className="text-gray-600 text-lg">国家和地方层面的碳经济相关政策法规文件</p>
                </div>
                <div className="relative">
                  <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl">
                    {policySlides.map((slide, index) => (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 transition-all duration-700 ${
                          index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-8">
                          <div className="flex items-center mb-3">
                            <span className="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                              {slide.tag}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold mb-3">{slide.title}</h3>
                          <p className="text-lg opacity-90">{slide.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    onClick={handlePrevSlide}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    onClick={handleNextSlide}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                  
                  {/* 轮播指示器 */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {policySlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentSlide 
                            ? "bg-white scale-125" 
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === "articles" && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">公开文章</h3>
                  <p className="text-gray-600 text-lg">权威机构发布的碳经济研究文章和报告</p>
                </div>
                <div className="grid gap-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{article.title}</h4>
                          <div className="flex items-center space-x-3 ml-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(article.category)}`}>
                              {article.category}
                            </span>
                            <a 
                              href={article.url}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 text-lg leading-relaxed">{article.summary}</p>
                        
                        {/* 标签 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {article.author}
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              {article.readCount} 阅读
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {article.date}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-10 text-center text-white relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-700/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">有建议或需要帮助？</h3>
            <p className="text-xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed">
              如果您对平台有任何建议反馈，或需要专业的政策解读、数据分析服务，欢迎联系我们。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg">
                联系咨询团队
              </Button>
              <Button 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={handleFeedbackClick}
              >
                提交建议反馈
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 登录拦截弹窗 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        featureName="提交建议反馈"
      />

      {/* 建议反馈收集表单 */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  )
} 
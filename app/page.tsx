"use client"

import { useEffect, useState, useRef } from "react"
import ModulesGrid from "@/components/home/ModulesGrid"
import Footer from "@/components/home/Footer"
import HomeHeader from "@/components/home/HomeHeader"
import { CourseCard } from "@/components/course/CourseCard"
import { experiments } from "@/lib/database"
import { getCourses } from "@/lib/courses"
import { HeroBanner } from "@/components/home/HeroBanner"
import Link from "next/link"
import { BookOpen, FileText, BarChart3, Globe, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 获取模块背景样式
const getModuleBgClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "bg-emerald-50";
    case "carbon-calculate":
      return "bg-blue-50";
    case "carbon-trading":
      return "bg-purple-50";
    case "carbon-neutral":
      return "bg-orange-50";
    default:
      return "bg-gray-50";
  }
};

// 获取模块图标样式
const getModuleIconClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "text-emerald-600";
    case "carbon-calculate":
      return "text-blue-600";
    case "carbon-trading":
      return "text-purple-600";
    case "carbon-neutral":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case "开发中":
      return "bg-yellow-100 text-yellow-800";
    case "维护中":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "基础":
      return "bg-green-100 text-green-800";
    case "中级":
      return "bg-blue-100 text-blue-800";
    case "高级":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 获取模块按钮样式
const getModuleButtonClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "bg-gradient-to-r from-green-600 to-emerald-700";
    case "carbon-calculate":
      return "bg-gradient-to-r from-blue-600 to-indigo-700";
    case "carbon-trading":
      return "bg-gradient-to-r from-purple-600 to-violet-700";
    case "carbon-neutral":
      return "bg-gradient-to-r from-orange-600 to-amber-700";
    default:
      return "bg-gradient-to-r from-gray-600 to-gray-700";
  }
};

// 政策法规轮播数据
const policySlides = [
  {
    id: 1,
    image: "/中国碳市场大会.webp",
    title: "2024中国碳市场大会在汉开幕",
    description: "以\"深化碳市场交流合作，应对全球气候变化\"为主题。会上正式发布《全国碳市场发展报告（2024）》。"
  },
  {
    id: 2,
    image: "/国务院发布《碳排放权交易管理暂行条例》.webp",
    title: "国务院发布《碳排放权交易管理暂行条例》",
    description: "我国首部应对气候变化专门行政法规，构建全国碳市场法律框架，规范配额分配、交易、核查及数据管理，明确对数据造假行为的严惩措施。"
  },
  {
    id: 3,
    image: "/碳关税政策解读.webp",
    title: "碳关税政策解读",
    description: "2022年12月13日，欧盟理事会和欧洲议会经过第四次三方协商就碳边境调节机制（CBAM）法规的最终文本达成临时协议，将于2026年开始全面起征。"
  }
]

// 公开文章数据
const articles = [
  {
    id: 1,
    title: "碳市场交易机制创新研究",
    date: "2024-03-15",
    url: "/articles/carbon-market-innovation"
  },
  {
    id: 2,
    title: "企业碳资产管理实践指南",
    date: "2024-03-10",
    url: "/articles/carbon-asset-management"
  },
  {
    id: 3,
    title: "碳金融产品创新与发展趋势",
    date: "2024-03-05",
    url: "/articles/carbon-finance-trends"
  }
]

// 公开数据
const datasets = [
  {
    id: 1,
    title: "中国统计年鉴（国家统计局）",
    updateTime: "2024-03-15",
    url: "https://www.stats.gov.cn/sj/ndsj/"
  },
  {
    id: 2,
    title: "中国碳核算数据库",
    updateTime: "2024-03-10",
    url: "https://www.ceads.net.cn/"
  },
  {
    id: 3,
    title: "碳价指数分析报告",
    updateTime: "2024-03-05",
    url: "/data/carbon-price-index"
  }
]

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const mobileMenu = document.getElementById("mobile-menu")

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden")
      })
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const href = anchor.getAttribute("href");
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });

            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
              mobileMenu.classList.add("hidden");
            }
          }
        }
      });
    })

    // 获取课程数据
    async function fetchCourses() {
      setLoading(true);
      const coursesData = await getCourses();
      // 只显示已上线的课程，并且限制为4个
      const availableCourses = coursesData
        .filter(course => course.status !== "draft" && course.status !== "archived")        
        .slice(0, 4);
      setCourses(availableCourses);
      setLoading(false);
    }

    fetchCourses();

    // 自动轮播
    if (!isHovering) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % policySlides.length)
      }, 5000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isHovering])

  // 手动切换轮播
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + policySlides.length) % policySlides.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % policySlides.length)
  }

  const handleSlideClick = () => {
    switch (currentSlide) {
      case 0:
        window.open('https://www.wucea.com/news/5228.html', '_blank', 'noopener,noreferrer');
        break;
      case 1:
        window.open('https://mp.weixin.qq.com/s/M5QtJCSOg8dHemzRYu_mJQ', '_blank', 'noopener,noreferrer');
        break;
      case 2:
        window.open('https://ofdi.sww.sh.gov.cn/zcfg/19826.jhtml', '_blank', 'noopener,noreferrer');
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-20 py-12">
        <HeroBanner />

        {/* 碳经济资讯 */}
        <section id="consulting" className="py-9 bg-gray-50">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">碳经济资讯</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* 左侧：政策法规轮播 */}
            <div className="lg:col-span-3 space-y-4">
              <div className="relative">
                <div 
                  className="relative h-[400px] rounded-lg overflow-hidden"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {policySlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                      onClick={handleSlideClick}
                      style={{ cursor: 'pointer' }}
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
              {/* 底部切换栏 - 移到图片外部 */}
              <div className="flex justify-center space-x-2 mt-2">
                {policySlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 transition-all duration-300 ${
                      index === currentSlide ? "w-8 bg-gray-800" : "w-4 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 右侧：公开文章和公开数据 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 公开文章 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">公开文章</h3>
                <Card className="p-3">
                  <div className="space-y-2">
                    {articles.slice(0, 2).map((article) => (
                      <a
                        key={article.id}
                        href={article.url}
                        className="block py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-gray-800 font-medium text-sm">{article.title}</h4>
                          <span className="text-xs text-gray-500">{article.date}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Link
                      href="/articles"
                      className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
                    >
                      <span>查看更多文章</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </Card>
              </div>

              {/* 公开数据 */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">公开数据</h3>
                <Card className="p-3">
                  <div className="space-y-2">
                    {datasets.slice(0, 2).map((dataset) => (
                      <a
                        key={dataset.id}
                        href={dataset.url}
                        className="block py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-gray-800 font-medium text-sm">{dataset.title}</h4>
                          <span className="text-xs text-gray-500">更新：{dataset.updateTime}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Link
                      href="/datasets"
                      className="flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
                    >
                      <span>查看更多数据</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <ModulesGrid />

        <section id="courses" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">热门课程</h2>
          <p className="mb-8 text-gray-600">探索我们平台上的精选课程，每个课程都包含了系统化的学习路径和丰富的实践内容，帮助您从零开始掌握碳经济相关知识。</p>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">加载课程中...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        <section id="experiments" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">热门实验</h2>
          <p className="mb-8 text-gray-600">探索我们平台上的精选模拟实验，每个实验都提供了交互控制，让您能够调整参数，观察变化。更多实验可在各领域模块页面中找到。</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className="card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
              >
                <div className="h-48 overflow-hidden relative">
                  {experiment.image ? (
                    <img 
                      src={experiment.image.startsWith('/') ? experiment.image : `/${experiment.image}`}
                      alt={experiment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`h-full ${getModuleBgClass(experiment.module)} flex items-center justify-center`}>
                      {experiment.icon && <i className={`fas fa-${experiment.icon} text-6xl ${getModuleIconClass(experiment.module)}`}></i>}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{experiment.title}</h3>
                    <div className="flex items-center gap-2">
                      {experiment.status && (experiment.status === "开发中" || experiment.status === "维护中") && (
                        <span className={`text-xs font-medium ${getStatusColor(experiment.status)} px-2 py-1 rounded`}>
                          {experiment.status}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${getDifficultyColor(experiment.difficulty)} px-2 py-1 rounded`}>
                        {experiment.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{experiment.description}</p>
                  <Link
                    href={experiment.route || '#'}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    <BookOpen className="h-4 w-4 inline-block mr-2" />
                    开始实验
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 关于平台 */}   
        <section id="about" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">关于平台</h2>
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="md:flex items-stretch gap-8">
              <div className="md:flex-1">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-full">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">平台简介</h3>
                  <p className="text-gray-600 text-lg leading-relaxed indent-8 text-justify">
                    为积极践行国家双碳战略，助力高校、行业机构、企业决策者提升"双碳"知识、能力和战略高度，设计涵盖应用场景、知识模块以及系统资源的碳经济与管理AI实训平台，加强学生对碳排放、碳交易、碳足迹等关键知识的理解和应用能力，推动教学内容的改革和教学创新。
                  </p>
                </div>
              </div>
              <div className="md:flex-1 mt-6 md:mt-0">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 h-full">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">平台优势</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <span>从碳监测、核算、管理到碳市场、金融、规则，打造闭环式碳能力实训体系，培育市场急需的"双碳"精英人才。</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <span>整合数字教材、真实案例、虚拟实验与AI智能助教，突破传统局限，支持按需组合的个性化教学与学习体验。</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <span>构建绿色交通、零碳园区等高仿真多元化场景，赋能学生跨学科应用能力，无缝对接产业真实挑战。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
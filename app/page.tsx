"use client"

import { useEffect, useState, useRef } from "react"
import Footer from "@/components/home/Footer"
import HomeHeader from "@/components/home/HomeHeader"
import { CourseCard } from "@/components/course/CourseCard"
import { getCoursesForComponent, Course } from "@/lib/api/courses"
import { HeroBanner } from "@/components/home/HeroBanner"
import Link from "next/link"
import Image from "next/image"
import { FileText, BarChart3, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { experiments } from "@/lib/database"
import { ExperimentLink } from "@/components/ui/feature-link"

// 实验相关函数（暂时保留，等待实验功能开发）
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
    image: "/china-carbon-market-conference.webp",
    title: "2024 China Carbon Market Conference Opens in Wuhan",
    description: "Themed 'Deepening Carbon Market Exchange and Cooperation, Responding to Global Climate Change'. The 'National Carbon Market Development Report (2024)' was officially released at the conference."
  },
  {
    id: 2,
    image: "/carbon-emission-trading-regulation.webp",
    title: "State Council Releases 'Interim Regulations on Carbon Emission Trading Management'",
    description: "China's first specialized administrative regulation on responding to climate change, constructing the legal framework for the national carbon market, regulating quota allocation, trading, verification, and data management, and clarifying severe penalties for data falsification."
  },
  {
    id: 3,
    image: "/carbon-tariff-policy.webp",
    title: "Interpretation of Carbon Tariff Policy",
    description: "On December 13, 2022, the Council of the European Union and the European Parliament reached a provisional agreement on the final text of the Carbon Border Adjustment Mechanism (CBAM) regulation after the fourth trilogue, which will be fully implemented starting in 2026."
  }
]


// 公开数据（暂时保留，等待后续开发）
const datasets = [
  {
    id: 1,
    title: "China Statistical Yearbook (NBS)",
    updateTime: "2024-03-15",
    url: "https://www.stats.gov.cn/sj/ndsj/"
  },
  {
    id: 2,
    title: "China Carbon Accounting Database (CEADs)",
    updateTime: "2024-03-10",
    url: "https://www.ceads.net.cn/"
  },
  {
    id: 3,
    title: "Carbon Price Index Analysis Report",
    updateTime: "2024-03-05",
    url: "/data/carbon-price-index"
  }
]



function NewsCarousel({ newsData }: { newsData: Array<any> }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (newsData.length > 0) {
      const timer = setInterval(() => setCurrent((prev) => (prev + 1) % newsData.length), 5000)
      return () => clearInterval(timer)
    }
  }, [newsData.length])

  const handleNewsClick = (url: string) => {
    if (url && url !== '#') {
      window.open(url, '_blank')
    }
  }

  if (newsData.length === 0) {
    return (
      <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-md h-[400px] bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2" />
          <p>暂无快讯内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-md h-[400px]">
      {newsData.map((item, idx) => (
        <div key={idx} className={`carousel-item absolute inset-0 transition-opacity duration-1000 ${current === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          {item.preview_image_url ? (
            <img src={item.preview_image_url} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <FileText className="h-24 w-24 text-blue-600" />
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 cursor-pointer hover:from-black/80 transition-all duration-300"
            onClick={() => handleNewsClick(item.url)}
          >
            <span className="text-white text-xs px-3 py-1 rounded-full inline-block mb-3 w-fit bg-blue-600">{item.source || '双碳快讯'}</span>
            <h3 className="text-xl font-bold text-white mb-2 hover:text-blue-200 transition-colors">{item.title}</h3>
            <p className="text-white/80 text-sm mb-3 line-clamp-2">{item.description || '暂无描述'}</p>
            <div className="flex items-center text-white/60 text-xs">
              <span>{item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '未知日期'}</span>
              <span className="mx-2">•</span>
              <span>{item.source || '双碳快讯'}</span>
            </div>
          </div>
        </div>
      ))}
      {/* 指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {newsData.map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} className={`w-3 h-3 rounded-full bg-white/50 cursor-pointer transition-all duration-300 ${current === idx ? 'w-8 bg-blue-600' : ''}`}></button>
        ))}
      </div>
      {/* 控制按钮 */}
      <button onClick={() => setCurrent((current - 1 + newsData.length) % newsData.length)} className="carousel-control prev absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-blue-600 transition-colors z-20">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => setCurrent((current + 1 + newsData.length) % newsData.length)} className="carousel-control next absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-blue-600 transition-colors z-20">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isHovering] = useState(false)

  // 从资料库同步的内容数据
  const [newsCarouselData, setNewsCarouselData] = useState<Array<any>>([]);
  const [latestPolicies, setLatestPolicies] = useState<Array<{title: string; desc?: string; date: string; source: string; url: string}>>([]);
  const [hotNews, setHotNews] = useState<Array<{title: string; desc?: string; url: string}>>([]);
  const [latestData, setLatestData] = useState<Array<{title: string; desc?: string; tag: string; date: string; source: string; url: string; fileType?: string}>>([]);
  const [reportCovers, setReportCovers] = useState<Array<{img: string; title: string; date: string; url: string}>>([]);

  // 同步资料库内容
  useEffect(() => {
    const syncContent = async () => {
      try {
        // 动态导入内容同步服务
        const { contentSyncService } = await import('@/lib/services/content-sync-service');
        
        // 同步双碳快讯、最新政策、热点新闻、最新数据和研究报告
        const newsCarousel = await contentSyncService.getNewsCarouselContent();
        const policies = await contentSyncService.getLatestPolicyContent();
        const hotNewsData = await contentSyncService.getHotNewsContent();
        const data = await contentSyncService.getDataInsightContent();
        const reports = await contentSyncService.getResearchReportContent();

        if (newsCarousel.length > 0) {
          setNewsCarouselData(newsCarousel.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            url: item.url,
            date: item.date,
            source: item.source,
            preview_image_url: item.preview_image_url
          })));
        }
        
        if (policies.length > 0) {
          setLatestPolicies(policies.map(item => ({
            title: item.title,
            desc: item.description || '暂无描述',
            date: item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '未知日期',
            source: item.source || '未知来源',
            url: item.url || '#'
          })));
        }
        
        if (hotNewsData.length > 0) {
          setHotNews(hotNewsData.map(item => ({
            title: item.title,
            desc: item.description || '暂无描述',
            url: item.url || '#'
          })));
        }
        
        if (data.length > 0) {
          setLatestData(data.map(item => ({
            title: item.title,
            desc: item.description || '暂无描述',
            tag: '数据洞察',
            date: item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '未知日期',
            source: item.source || '未知来源',
            url: item.url || '#',
            fileType: item.fileType || 'unknown'
          })));
        }
        
        if (reports.length > 0) {
          setReportCovers(reports.slice(0, 4).map(item => ({
            img: item.preview_image_url || '',
            title: item.title,
            date: item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '未知日期',
            url: item.url || `/admin/libraries/${item.repositoryId}/files/${item.id}/viewer`
          })));
        }
      } catch (error) {
        console.error('Failed to sync content:', error);
      }
    };

    syncContent();
  }, []);

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
      try {
        const coursesData = await getCoursesForComponent();
        // 只显示已上线的课程
        const availableCourses = coursesData
          .filter(course => course.isEnabled);
        setCourses(availableCourses);
      } catch (error) {
        console.error('获取课程数据失败:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
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
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    title: course.title,
                    description: course.description,
                    difficulty: "beginner", // 默认难度
                    status: course.isEnabled ? "已上线" : "开发中",
                    icon: "book",
                    module: "carbon-monitor", // 默认模块
                    image: course.coverUrl || undefined,
                    coverImageKey: course.coverImageKey || undefined,
                  }}
                />
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
                  <ExperimentLink
                    href={experiment.route || '#'}
                    experimentName={experiment.title}
                    moduleId={experiment.module}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    <BookOpen className="h-4 w-4 inline-block mr-2" />
                    开始实验
                  </ExperimentLink>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 双碳快讯（新版） */}
        <section id="news" className="mb-12">
          {/* 双碳快讯板块 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">双碳快讯</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左侧重点新闻轮播 */}
            <div className="lg:col-span-3">
              <NewsCarousel newsData={newsCarouselData} />
            </div>
            {/* 右侧政策新闻列表 */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col lg:h-[400px] lg:overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">最新政策</h3>
                <div className="flex items-center gap-2">
                  <Link 
                    href="/news" 
                    className="text-blue-600 text-sm hover:underline"
                  >
                    更多
                  </Link>
                </div>
              </div>
              <ul className="space-y-4">
                {latestPolicies.map((item: any, idx: number) => (
                  <li key={idx} className="pb-4 border-b border-gray-100">
                    <a
                      href={item.url}
                      className="transition-all duration-300 hover:text-blue-600 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.url, '_blank');
                      }}
                    >
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      {item.desc && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{item.desc}</p>
                      )}
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{item.date}</span>
                        <span>{item.source}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-8 mb-4">
                <h3 className="font-bold text-lg">热点新闻</h3>
                <div className="flex items-center gap-2">
                  <Link 
                    href="/news" 
                    className="text-blue-600 text-sm hover:underline"
                  >
                    更多
                  </Link>
                </div>
              </div>
              <ul className="space-y-3">
                {hotNews.map((item: any, idx: number) => (
                  <li key={idx}>
                    <a
                      href={item.url}
                      className="flex items-start transition-all duration-300 hover:text-blue-600 hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(item.url, '_blank');
                      }}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${idx < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} text-xs`}>{idx + 1}</span>
                      <div className="flex-1">
                        <span className="font-medium">{item.title}</span>
                        {item.desc && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.desc}</p>
                        )}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 数智洞察板块 */}
          <section id="insight" className="mt-12 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">数智洞察</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧报告封面展示 */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">研究报告</h3>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {reportCovers.map((report: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="rounded-lg overflow-hidden shadow card-hover cursor-pointer"
                        onClick={() => {
                          if (report.url.startsWith('http')) {
                            window.open(report.url, '_blank');
                          } else {
                            window.open(report.url, '_blank');
                          }
                        }}
                      >
                        <div className="aspect-[3/4] bg-gray-100 relative">
                          {report.img ? (
                            <img src={report.img} alt={report.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                              <FileText className="h-16 w-16 text-blue-600" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              size="sm" 
                              className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (report.url.startsWith('http')) {
                                  window.open(report.url, '_blank');
                                } else {
                                  window.open(report.url, '_blank');
                                }
                              }}
                            >
                              <FileText className="mr-1 h-4 w-4" /> 查看
                            </Button>
                          </div>
                        </div>
                        <h4 className="mt-2 text-sm font-medium line-clamp-2">{report.title}</h4>
                        <p className="text-xs text-gray-400">{report.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Link 
                    href="/reports" 
                    className="text-green-600 text-sm hover:underline"
                  >
                    <Button variant="outline" className="border-green-500 text-green-600 rounded-full text-sm hover:bg-green-500 hover:text-white transition-colors px-4 py-2">
                      查看更多报告
                    </Button>
                  </Link>
                </div>
              </div>
              {/* 右侧数据条目 */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">数据洞察</h3>
                  <div className="flex items-center gap-2">
                    <Link 
                      href="/datasets" 
                      className="text-green-600 text-sm hover:underline"
                    >
                      更多
                    </Link>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-xl mb-4 flex items-center">
                    <BarChart3 className="text-green-600 mr-2 h-4 w-4" /> 最新数据发布
                  </h4>
                  <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <ul className="space-y-4">
                      {latestData.map((item: any, idx: number) => (
                        <li key={idx} className="pb-3 border-b border-gray-100">
                          <a 
                            href={item.url} 
                            className="flex justify-between items-start transition-all duration-300 hover:text-green-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              const { handleFileClick } = require('@/lib/utils/file-navigation');
                              handleFileClick({
                                url: item.url,
                                fileType: (item as any).fileType,
                                title: item.title
                              }, e);
                            }}
                          >
                            <div>
                              <h5 className="font-medium">{item.title}</h5>
                            </div>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{item.tag}</span>
                          </a>
                          <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                            <span>{item.date}</span>
                            <span>{item.source}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* 可选：数据可视化区，可后续补充 */}
              </div>
            </div>
          </section>
        </section>

        {/* 关于平台 */}
        <section id="about" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">关于平台</h2>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {/* Hero 图片展示区域 */}
            <div className="mb-8 w-full aspect-[1510/780] relative overflow-hidden rounded-xl">
              <Image
                src="/hero-1.webp"
                alt="碳经济与管理AI实训平台"
                fill
                className="object-cover"
              />
            </div>

            {/* 平台简介和优势内容区域 */}
            <div className="w-full space-y-8">
              {/* 平台简介 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-blue-400 opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">平台简介</h3>
                  </div>
                  
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-800 mb-6">用心打造培根铸魂、启智增慧的精品平台</h4>
                    <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto mb-8">
                      为积极践行国家双碳战略，助力高校、行业机构、企业决策者提升"双碳"知识、能力和战略高度，设计涵盖应用场景、知识模块以及系统资源的碳经济与管理AI实训平台，加强学生对碳排放、碳交易、碳足迹等关键知识的理解和应用能力，推动教学内容的改革和教学创新。
                    </p>
                    
                    <div className="flex justify-center">
                      <a href="/resources" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md flex items-center shadow-lg">
                        了解更多平台信息
                        <span className="ml-2 text-lg">{">>"}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 平台优势 */}
              <div className="relative overflow-hidden bg-transparent p-8 rounded-2xl border border-green-200 shadow-lg">
                <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-green-400 to-teal-400 opacity-10 rounded-full -translate-y-14 -translate-x-14"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-400 opacity-10 rounded-full translate-y-10 translate-x-10"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">平台优势</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 闭环式实训体系 */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                        <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center animate-bounce">
                          <i className="fas fa-link text-white text-sm"></i>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-3 text-lg">闭环式实训体系</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        从碳监测、核算、管理到碳市场、金融、规则，打造闭环式碳能力实训体系，培育市场急需的"双碳"精英人才。
                      </p>
                    </div>
                    
                    {/* AI智能助教 */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                        <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center relative animate-spin">
                          <i className="fas fa-brain text-white text-sm"></i>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-3 text-lg">AI智能助教</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        整合数字教材、真实案例、虚拟实验与AI智能助教，突破传统局限，支持按需组合的个性化教学与学习体验。
                      </p>
                    </div>
                    
                    {/* 多元化场景 */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                        <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center animate-ping">
                          <i className="fas fa-leaf text-white text-sm"></i>
                        </div>
                      </div>
                      <h4 className="font-bold text-gray-800 mb-3 text-lg">多元化场景</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        构建绿色交通、零碳园区等高仿真多元化场景，赋能学生跨学科应用能力，无缝对接产业真实挑战。
                      </p>
                    </div>
                  </div>
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
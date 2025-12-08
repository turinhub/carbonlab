"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Globe, Database, Search, FileText } from "lucide-react"
import { useState, useEffect } from "react"

// 报告数据接口
interface ReportDataset {
  title: string;
  url: string;
  description: string;
  fileType?: string;
  preview_image_url?: string | null;
  repositoryId?: string;
  id?: string;
}

interface ReportCategory {
  id: string;
  title: string;
  icon: any;
  datasets: ReportDataset[];
}

// 报告数据分类
const reportCategories = [
  {
    id: "international",
    title: "International Reports",
    icon: Globe,
    datasets: [
      {
        title: "World Energy Investment 2025",
        url: "https://www.iea.org/reports/world-energy-investment-2025",
        description: "IEA: Global energy investment reaches $3.3 trillion, clean energy investment doubles fossil fuels for the first time."
      },
      {
        title: "State and Trends of Carbon Pricing 2024",
        url: "https://www.shihang.org/zh/news/press-release/2024/05/21/global-carbon-pricing-revenues-top-a-record-100-billion",
        description: "World Bank: Global carbon pricing revenues top $104 billion, covering 24% of global emissions."
      },
      {
        title: "Advancing a Just Transition in Climate Policy",
        url: "https://unfccc.int/news/un-climate-change-launches-new-report-on-advancing-a-just-transition-in-climate-policy",
        description: "UNFCCC: Proposes a four-dimensional monitoring framework to ensure fairness in employment, gender, and regional aspects during low-carbon transition."
      },
      {
        title: "ICAP Status Report 2023",
        url: "https://icapcarbonaction.com/zh/publications/2023-nian-icap-quanqiutanshichangjinzhanbaogao",
        description: "ICAP: Global carbon market auction revenues reach $63 billion, with 3 new carbon markets added."
      },
      {
        title: "Tracking SDG 7: The Energy Progress Report 2025",
        url: "https://www.irena.org/Publications/2025/Jun/Tracking-SDG-7-The-Energy-Progress-Report-2025",
        description: "IRENA: Some progress in 2023 indicators but gaps remain, 666 million people lack electricity."
      },
      {
        title: "Low-Carbon City Development in China: Evaluation Results",
        url: "https://www.wri.org/research/low-carbon-city-development-china-evaluation-results-more-100-cities-around-world",
        description: "WRI: Evaluation of world cities' low-carbon development based on a 15-indicator system across four dimensions, with Chinese cities in the top three."
      },
      {
        title: "The Role of CFOs in Driving Low-Carbon Transition",
        url: "https://www.climatebonds.net/data-insights/publications/role-chief-financial-officer-driving-low-carbon-transition",
        description: "CBI: Interviews with over 30 CFOs representing a total market capitalization of $930 billion."
      },
      {
        title: "The Role of Carbon Markets in Facilitating Carbon Neutrality",
        url: "https://www.adb.org/publications/the-role-of-carbon-markets-in-facilitating-carbon-neutrality",
        description: "ADB: Carbon credit quality varies; Asia needs to promote carbon credit and market interoperability, requiring companies to understand relevant frameworks."
      }
    ]
  },
  {
    id: "china",
    title: "China Reports",
    icon: Database,
    datasets: [
      {
        title: "National Carbon Market Development Report 2024",
        url: "https://www.mee.gov.cn/ywdt/xwfb/202407/t20240722_1082192.shtml",
        description: "MEE: National carbon market covers 5.1 billion tons of CO2, quota price rises to 78 RMB/ton."
      },
      {
        title: "Guangdong Carbon Market Development Report 2024",
        url: "https://gdee.gd.gov.cn/ydqhbh/xwdt/content/post_4499898.html",
        description: "Guangdong Department of Ecology and Environment: Guangdong carbon market cumulative turnover 415 million tons, carbon inclusion users exceed 1 million."
      },
      {
        title: "Beijing Ecological Environment Statement 2024",
        url: "https://sthjj.beijing.gov.cn/bjhrb/index/xxgk69/zfxxgk43/fdzdgknr2/ywdt28/xwfb/743619512/index.html",
        description: "Beijing Municipal Ecology and Environment Bureau: Carbon intensity drops by 3% year-on-year, maintaining the lowest level among provincial units nationwide."
      },
      {
        title: "Shanghai Carbon Market 10th Anniversary Assessment Report",
        url: "https://sthj.sh.gov.cn/hbzhywpt1272/hbzhywpt1158/20240726/3fbbddcbd80149b18418a85baa3a62b2.html",
        description: "Shanghai Ecology and Environment Bureau: Shanghai carbon market cumulative turnover 249 million tons, quota price steadily increasing."
      },
      {
        title: "Hubei Carbon Market Development Report 2024",
        url: "https://sthjt.hubei.gov.cn/hjsj/ztzl/qsydwxxgk/hbgg/202503/t20250318_5579829.shtml",
        description: "Hubei Department of Ecology and Environment: Hubei carbon market turnover exceeds 10 billion RMB, serving the whole country."
      },
      {
        title: "National Carbon Market Quota Allocation Plan (2023-2024)",
        url: "https://www.mee.gov.cn/zcwj/zcjd/202410/t20241021_1089825.shtml",
        description: "MEE: Steel and cement industries included in the national carbon market, benchmarks lowered by 15%."
      },
      {
        title: "Shenzhen White Paper on Responding to Climate Change",
        url: "https://meeb.sz.gov.cn/ztfw/ztzl/ydqhbh/qhsy/content/post_12250687.html",
        description: "Shenzhen Ecology and Environment Bureau: Clean energy installed capacity >80% in 2024, NEV penetration 76.9%, carbon market turnover 108 million tons."
      },
      {
        title: "Chengdu-Chongqing Twin City Economic Circle Carbon Peaking and Carbon Neutrality Joint Action Plan",
        url: "https://mp.weixin.qq.com/s/FHfLB0tOSp_eKENy82GU7w",
        description: "Chongqing and Sichuan Governments: Establish cross-regional carbon quota mutual recognition mechanism, targeting 5 billion RMB annual transaction volume."
      }
    ]
  },
]

const reportSites = [
  {
    title: "ICAP Report Library",
    url: "https://icapcarbonaction.com/zh",
    description: "Global carbon market tracking, providing in-depth analysis of carbon pricing mechanisms worldwide."
  },
  {
    title: "World Bank Carbon Pricing Dashboard",
    url: "https://carbonpricingdashboard.worldbank.org/",
    description: "Covers 75 carbon pricing mechanism databases, providing visualization tools for revenue usage."
  },
  {
    title: "China Carbon Market Network",
    url: "http://www.tanjiaoyi.com/",
    description: "Official information platform for the national carbon market, providing quota allocation and trading data queries."
  },
  {
    title: "Institute for Carbon Neutrality, Tsinghua University",
    url: "https://www.icon.tsinghua.edu.cn/",
    description: "Publishes 'Annual Report on Global Carbon Neutrality Progress', providing in-depth research on regional carbon markets."
  },
  {
    title: "IEA Energy Report Center",
    url: "https://www.iea.org/analysis?type=report",
    description: "Covers annual flagship reports in energy investment, renewable energy, hydrogen energy, etc."
  },
  {
    title: "UNFCCC Library",
    url: "https://unfccc.int/zh",
    description: "Contains COP meeting outcome documents, authoritative documents on global carbon credit mechanism standards."
  },
  {
    title: "BloombergNEF (BNEF) Report Library",
    url: "https://about.bnef.com/",
    description: "Global energy transition investment trend analysis, providing clean energy technology cost forecasts."
  }
]

export default function ReportsPage() {
  const [dynamicReportCategories, setDynamicReportCategories] = useState<ReportCategory[]>(reportCategories);
  const [loading, setLoading] = useState(true);

  // 从资料库加载研究报告数据
  useEffect(() => {
    const loadReports = async () => {
      try {
        // 动态导入内容同步服务
        const { contentSyncService } = await import('@/lib/services/content-sync-service');
        
        // 获取研究报告数据
        const reports = await contentSyncService.getResearchReportContent();
        
        if (reports.length > 0) {
          // 更新中国报告分类的数据
          const updatedCategories = reportCategories.map(category => {
            if (category.id === 'china') {
              return {
                ...category,
                datasets: reports.map(report => ({
                  title: report.title,
                  url: report.url || `/admin/libraries/${report.repositoryId}/files/${report.id}/viewer`,
                  description: report.description || 'No description',
                  fileType: report.fileType,
                  preview_image_url: report.preview_image_url || null,
                  repositoryId: report.repositoryId,
                  id: report.id
                }))
              };
            }
            return category;
          });
          setDynamicReportCategories(updatedCategories);
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
        // 保持默认数据
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-20 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-20 py-12">
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-600 hover:text-gray-900">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-gray-400" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900">双碳公开报告资源库</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 顶部 Banner */}
      <div className="relative w-full mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-100 via-white to-green-100 p-8 flex flex-col md:flex-row items-center gap-6 shadow">
          <FileText className="h-14 w-14 text-blue-700 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">双碳公开报告资源库</h1>
            <p className="text-lg text-gray-700">精选全球与中国权威碳中和、碳市场、能源转型等报告，助力学术研究与政策决策。</p>
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {dynamicReportCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-blue-900" />
                <CardTitle className="text-2xl text-blue-900 font-bold">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.datasets.map((report, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      if (report.url.startsWith('http')) {
                        window.open(report.url, '_blank');
                      } else {
                        window.open(report.url, '_blank');
                      }
                    }}
                    className="block rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                  >
                    {/* 封面图片区域 */}
                    {report.preview_image_url && (
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img
                          src={report.preview_image_url}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                            <FileText className="mr-1 h-4 w-4 inline" /> 查看报告
                          </button>
                        </div>
                      </div>
                    )}
                    {/* 内容区域 */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{report.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {/* 专业报告网站区 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-900" />
              <CardTitle className="text-2xl text-blue-900 font-bold">专业报告网站</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {reportSites.map((site, index) => (
                <a
                  key={index}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">{site.title}</h3>
                  <p className="text-sm text-gray-600">{site.description}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
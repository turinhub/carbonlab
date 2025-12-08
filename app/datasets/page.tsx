"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Database, FileText, BarChart3, Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"

// 数据洞察接口
interface DatasetItem {
  title: string;
  url: string;
  description: string;
  fileType?: string;
  preview_image_url?: string | null;
  repositoryId?: string;
  id?: string;
}

const datasets: DatasetItem[] = [
  {
    title: "China Carbon Accounting Database (CEADs)",
    url: "https://www.ceads.net.cn/",
    description: "Provides the most up-to-date and complete energy and carbon emission data for China.",
  },
  {
    title: "Our World in Data - CO2 and Greenhouse Gas Emissions",
    url: "https://ourworldindata.org/co2-and-other-greenhouse-gas-emissions",
    description: "Global long-term series data on CO2 and greenhouse gas emissions, supporting interactive visualization.",
  },
  {
    title: "Renewable Energy Capacity Statistics 2025 (IRENA)",
    url: "https://www.irena.org/Publications/2025/Mar/Renewable-capacity-statistics-2025",
    description: "This publication provides renewable energy capacity statistics for the past decade (2015-2024) in trilingual tables."
  },
  {
    title: "IEA Energy Data",
    url: "https://www.iea.org/data-and-statistics",
    description: "Global energy data provided by the International Energy Agency, including carbon emissions, renewable energy, etc."
  },
  {
    title: "World Bank Climate Data",
    url: "https://climateknowledgeportal.worldbank.org/",
    description: "Global climate data provided by the World Bank."
  },
  {
    title: "Global Carbon Budget",
    url: "https://www.globalcarbonproject.org/carbonbudget/",
    description: "Provides global and national annual carbon emission data and carbon sink information."
  },
  {
    title: "UN Environment Programme (UNEP)",
    url: "https://www.unep.org/explore-topics/climate-action",
    description: "Provides global environmental policies and carbon emission trend reports."
  },
  {
    title: "EDGAR (Global Carbon Emissions Database)",
    url: "https://edgar.jrc.ec.europa.eu/",
    description: "Global carbon emissions database developed by the Joint Research Centre (JRC) of the European Commission."
  },
  {
    title: "CDP (Global Corporate Carbon Disclosure Platform)",
    url: "https://www.cdp.net/en",
    description: "Provides corporate carbon emissions and climate action data."
  },
  {
    title: "Our World in Data",
    url: "https://ourworldindata.org/co2-emissions",
    description: "Visualization of global carbon emissions and energy data."
  }
]

interface DatasetCategory {
  id: string;
  title: string;
  icon: any;
  datasets: DatasetItem[];
}

// 数据源分类
const dataCategories: DatasetCategory[] = [
  {
    id: "insights",
    title: "Data Insights",
    icon: BarChart3,
    datasets: [] // 将通过API动态填充
  },
  {
    id: "global",
    title: "Global Data",
    icon: Globe,
    datasets: [
      {
        title: "Renewable Energy Capacity Statistics 2025 (IRENA)",
        url: "https://www.irena.org/Publications/2025/Mar/Renewable-capacity-statistics-2025",
        description: "This publication provides renewable energy capacity statistics for the past decade (2015-2024) in trilingual tables."
      },
      {
        title: "IEA Energy Data",
        url: "https://www.iea.org/data-and-statistics",
        description: "Global energy data provided by the International Energy Agency, including carbon emissions, renewable energy, etc."
      },
      {
        title: "World Bank Climate Data",
        url: "https://climateknowledgeportal.worldbank.org/",
        description: "Global climate data provided by the World Bank."
      },
      {
        title: "Global Carbon Budget",
        url: "https://www.globalcarbonproject.org/carbonbudget/",
        description: "Provides global and national annual carbon emission data and carbon sink information."
      },
      {
        title: "UN Environment Programme (UNEP)",
        url: "https://www.unep.org/explore-topics/climate-action",
        description: "Provides global environmental policies and carbon emission trend reports."
      },
      {
        title: "EDGAR (Global Carbon Emissions Database)",
        url: "https://edgar.jrc.ec.europa.eu/",
        description: "Global carbon emissions database developed by the Joint Research Centre (JRC) of the European Commission."
      },
      {
        title: "CDP (Global Corporate Carbon Disclosure Platform)",
        url: "https://www.cdp.net/en",
        description: "Provides corporate carbon emissions and climate action data."
      },
      {
        title: "Our World in Data",
        url: "https://ourworldindata.org/co2-emissions",
        description: "Visualization of global carbon emissions and energy data."
      }
    ]
  },
  {
    id: "china",
    title: "China Data",
    icon: Database,
    datasets: [
      {
        title: "China Carbon Accounting Database (CEADs)",
        url: "https://www.ceads.net.cn/",
        description: "Provides the most up-to-date and complete energy and carbon emission data for China."
      },
      {
        title: "National Bureau of Statistics",
        url: "http://www.stats.gov.cn/",
        description: "Provides official China Statistical Yearbook and energy statistics data."
      },
      {
        title: "Ministry of Ecology and Environment",
        url: "https://www.mee.gov.cn/",
        description: "Provides China's ecological environment bulletins and carbon emission policies."
      },
      {
        title: "China Carbon Trading Platform",
        url: "http://www.cneeex.com/",
        description: "Data related to China's national carbon emission trading market."
      }
    ]
  },
  {
    id: "policies",
    title: "Policy Documents",
    icon: FileText,
    datasets: [
      {
        title: "Dual Carbon Policy Database",
        url: "http://www.gov.cn/zhengce/",
        description: "Policy documents related to Carbon Peaking and Carbon Neutrality released by the State Council."
      },
      {
        title: "CCER Management Measures",
        url: "https://www.mee.gov.cn/xxgk2018/xxgk/xxgk02/202310/t20231020_1043694.html",
        description: "Administrative Measures for Voluntary Greenhouse Gas Emission Reduction Trading (Trial)."
      }
    ]
  }
]

export default function DatasetsPage() {
  const [dynamicDataCategories, setDynamicDataCategories] = useState<DatasetCategory[]>(dataCategories);
  const [loading, setLoading] = useState(true);

  // 从资料库加载数据洞察数据
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        // 动态导入内容同步服务
        const { contentSyncService } = await import('@/lib/services/content-sync-service');

        // 获取数据洞察内容
        const insights = await contentSyncService.getDataInsightContent();

        if (insights.length > 0) {
          // 更新数据洞察分类的数据
          const updatedCategories = dataCategories.map(category => {
            if (category.id === 'insights') {
              return {
                ...category,
                datasets: insights.map(insight => ({
                  title: insight.title,
                  url: insight.url || `/admin/libraries/${insight.repositoryId}/files/${insight.id}/viewer`,
                  description: insight.description || '暂无描述',
                  fileType: insight.fileType,
                  preview_image_url: insight.preview_image_url || null,
                  repositoryId: insight.repositoryId,
                  id: insight.id
                }))
              };
            }
            return category;
          });
          setDynamicDataCategories(updatedCategories);
        }
      } catch (error) {
        console.error('Failed to load datasets:', error);
        // 保持默认数据
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
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
            <BreadcrumbPage className="text-gray-900">碳排放数据资源</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 顶部 Banner */}
      <div className="relative w-full mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-green-100 via-white to-blue-100 p-8 flex flex-col md:flex-row items-center gap-6 shadow">
          <BarChart3 className="h-14 w-14 text-blue-700 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">碳排放数据资源</h1>
            <p className="text-lg text-gray-700">权威碳排放与能源数据集，支持科研、教学与政策分析，助力双碳目标实现。</p>
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {dynamicDataCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-blue-900" />
                <CardTitle className="text-2xl text-blue-900 font-bold">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {category.datasets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无数据</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.datasets.map((dataset, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        if (dataset.url && dataset.url.startsWith('http')) {
                          window.open(dataset.url, '_blank');
                        } else if (dataset.url) {
                          window.open(dataset.url, '_blank');
                        }
                      }}
                      className="block rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                    >
                    {/* 封面图片区域 */}
                    {dataset.preview_image_url && (
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img
                          src={dataset.preview_image_url}
                          alt={dataset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                            <FileText className="mr-1 h-4 w-4 inline" /> 查看数据
                          </button>
                        </div>
                      </div>
                    )}
                    {/* 内容区域 */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{dataset.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{dataset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 
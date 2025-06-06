import { NextResponse } from "next/server"

// 模拟数据库
const mockDatabase = [
  {
    id: 1,
    title: "碳核算基础课程",
    description: "学习企业碳核算的基本方法和标准",
    type: "course",
    url: "/courses/carbon-accounting",
    tags: ["碳核算", "基础课程", "企业碳管理"]
  },
  {
    id: 2,
    title: "碳市场交易模拟实验",
    description: "通过模拟交易平台学习碳市场运作机制",
    type: "experiment",
    url: "/experiments/carbon-trading",
    tags: ["碳市场", "交易模拟", "实践操作"]
  },
  {
    id: 3,
    title: "碳资产管理最佳实践",
    description: "企业碳资产管理的策略和方法",
    type: "article",
    url: "/articles/carbon-asset-management",
    tags: ["碳资产", "管理策略", "企业实践"]
  },
  {
    id: 4,
    title: "全国碳市场最新政策解读",
    description: "2024年碳市场政策变化及影响分析",
    type: "news",
    url: "/news/carbon-market-policy",
    tags: ["政策解读", "碳市场", "行业动态"]
  },
  {
    id: 5,
    title: "碳金融创新实践",
    description: "碳金融产品创新与风险管理",
    type: "course",
    url: "/courses/carbon-finance",
    tags: ["碳金融", "创新实践", "风险管理"]
  },
  {
    id: 6,
    title: "数字时代的碳规则与碳关税",
    description: "探讨数字时代下的碳规则演变及碳关税政策影响",
    type: "course",
    url: "/courses/digital-carbon-rules",
    tags: ["碳关税", "数字时代", "政策分析", "国际贸易"]
  },
  {
    id: 7,
    title: "欧盟碳边境调节机制（CBAM）详解",
    description: "深入解析欧盟碳边境调节机制及其对中国企业的影响",
    type: "article",
    url: "/articles/cbam-analysis",
    tags: ["碳关税", "欧盟", "CBAM", "国际贸易"]
  },
  {
    id: 8,
    title: "碳关税应对策略实验",
    description: "通过模拟实验学习企业应对碳关税的策略和方法",
    type: "experiment",
    url: "/experiments/carbon-tariff-strategy",
    tags: ["碳关税", "应对策略", "企业实践", "国际贸易"]
  },
  {
    id: 9,
    title: "全球碳关税政策动态",
    description: "追踪全球主要经济体碳关税政策最新进展",
    type: "news",
    url: "/news/global-carbon-tariff",
    tags: ["碳关税", "政策动态", "全球视野"]
  },
  {
    id: 10,
    title: "碳关税对企业竞争力的影响分析",
    description: "分析碳关税政策对企业国际竞争力的影响及应对措施",
    type: "article",
    url: "/articles/carbon-tariff-impact",
    tags: ["碳关税", "企业竞争力", "影响分析"]
  },
  {
    id: 11,
    title: "碳关税计算与申报实务",
    description: "企业碳关税计算方法和申报流程详解",
    type: "course",
    url: "/courses/carbon-tariff-practice",
    tags: ["碳关税", "实务操作", "计算方法", "申报流程"]
  },
  {
    id: 12,
    title: "碳关税政策模拟实验",
    description: "通过政策模拟实验理解碳关税机制",
    type: "experiment",
    url: "/experiments/carbon-tariff-simulation",
    tags: ["碳关税", "政策模拟", "机制研究"]
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""
  const type = searchParams.get("type") || "all"

  // 搜索逻辑
  const results = mockDatabase.filter(item => {
    const matchesQuery = 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    
    const matchesType = type === "all" || item.type === type

    return matchesQuery && matchesType
  })

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json({
    results,
    total: results.length,
    query,
    type
  })
} 
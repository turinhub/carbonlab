"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Play, FileText, BarChart3, TrendingUp, Leaf } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

// 类型定义
type ProvinceData = {
  name: string
  code: string
  center: [number, number]
  carbonEmission: number // 碳排放量 (万吨)
  population: number // 常住人口 (万人)
  urbanizationRate: number // 城镇化率 (%)
  gdp: number // 省GDP (亿元)
  energyConsumption: number // 总能耗 (万吨标准煤)
  coalConsumption: number // 煤炭消耗量 (万吨)
  secondaryIndustryValue: number // 第二产业增加值 (亿元)
  landTypes: {
    farmland: number // 耕地面积 (万公顷)
    forestland: number // 林地面积 (万公顷)
    grassland: number // 草地面积 (万公顷)
    urbanGreen: number // 城市绿地面积 (万公顷)
  }
  carbonAbsorption: number // 碳吸收量 (万吨)
}

// STIRPAT模型参数类型
type STIRPATParams = {
  province: string
  cons: number // 常数项
  lnP: number // 人口系数
  lnU: number // 城镇化率系数
  lnA: number // 人均GDP系数
  lnA2: number // 人均GDP平方项系数
  lnT: number // 碳排放强度系数
  lnE1: number // 能源强度系数
  lnE2: number // 能源结构系数
  lnIS: number // 产业结构系数
  r2: number // R²值
}

// 中国各省份数据（示例数据）
const provinceData: ProvinceData[] = [
  {
    name: "北京",
    code: "110000",
    center: [116.4074, 39.9042],
    carbonEmission: 12500,
    population: 2189,
    urbanizationRate: 86.5,
    gdp: 40269,
    energyConsumption: 7200,
    coalConsumption: 1800,
    secondaryIndustryValue: 7716,
    landTypes: { farmland: 12.8, forestland: 61.4, grassland: 8.2, urbanGreen: 4.6 },
    carbonAbsorption: 245.2
  },
  {
    name: "上海",
    code: "310000",
    center: [121.4737, 31.2304],
    carbonEmission: 18900,
    population: 2487,
    urbanizationRate: 88.1,
    gdp: 43214,
    energyConsumption: 11200,
    coalConsumption: 2800,
    secondaryIndustryValue: 10968,
    landTypes: { farmland: 18.5, forestland: 9.8, grassland: 2.1, urbanGreen: 3.2 },
    carbonAbsorption: 52.4
  },
  {
    name: "广东",
    code: "440000",
    center: [113.2644, 23.1291],
    carbonEmission: 65800,
    population: 12601,
    urbanizationRate: 74.2,
    gdp: 129118,
    energyConsumption: 32500,
    coalConsumption: 8900,
    secondaryIndustryValue: 53728,
    landTypes: { farmland: 156.2, forestland: 1052.8, grassland: 45.6, urbanGreen: 12.8 },
    carbonAbsorption: 4058.7
  },
  {
    name: "江苏",
    code: "320000",
    center: [118.7633, 32.0615],
    carbonEmission: 78200,
    population: 8515,
    urbanizationRate: 73.4,
    gdp: 122875,
    energyConsumption: 35600,
    coalConsumption: 12800,
    secondaryIndustryValue: 56909,
    landTypes: { farmland: 345.6, forestland: 156.8, grassland: 12.4, urbanGreen: 8.9 },
    carbonAbsorption: 625.8
  },
  {
    name: "山东",
    code: "370000",
    center: [117.0009, 36.6758],
    carbonEmission: 89500,
    population: 10152,
    urbanizationRate: 63.8,
    gdp: 83095,
    energyConsumption: 42800,
    coalConsumption: 18900,
    secondaryIndustryValue: 33546,
    landTypes: { farmland: 456.8, forestland: 298.5, grassland: 34.2, urbanGreen: 15.6 },
    carbonAbsorption: 1205.4
  },
  {
    name: "河南",
    code: "410000",
    center: [113.6401, 34.7566],
    carbonEmission: 67800,
    population: 9883,
    urbanizationRate: 56.5,
    gdp: 61345,
    energyConsumption: 28900,
    coalConsumption: 15600,
    secondaryIndustryValue: 27598,
    landTypes: { farmland: 678.9, forestland: 245.6, grassland: 56.8, urbanGreen: 12.3 },
    carbonAbsorption: 1025.6
  }
]

// STIRPAT模型参数数据（基于研究表格）
const stirpatParams: STIRPATParams[] = [
  {
    province: "北京",
    cons: -17.675,
    lnP: 0.285,
    lnU: 5.458,
    lnA: 0.025,
    lnA2: -0.001,
    lnT: 0.379,
    lnE1: 0.183,
    lnE2: -0.021,
    lnIS: -0.250,
    r2: 0.806
  },
  {
    province: "上海",
    cons: -1.684,
    lnP: 0.342,
    lnU: 1.877,
    lnA: 0.140,
    lnA2: 0.027,
    lnT: 0.061,
    lnE1: 0.002,
    lnE2: -0.055,
    lnIS: -0.016,
    r2: 0.942
  },
  {
    province: "广东",
    cons: -1.449,
    lnP: 1.017,
    lnU: 0.719,
    lnA: 0.120,
    lnA2: 0.025,
    lnT: -0.001,
    lnE1: -0.024,
    lnE2: 0.403,
    lnIS: 0.145,
    r2: 0.971
  },
  {
    province: "江苏",
    cons: -35.044,
    lnP: 4.862,
    lnU: 0.543,
    lnA: 0.134,
    lnA2: 0.016,
    lnT: 0.187,
    lnE1: 0.004,
    lnE2: 0.639,
    lnIS: -0.154,
    r2: 0.907
  },
  {
    province: "山东",
    cons: 1.437,
    lnP: 1.000,
    lnU: 0.102,
    lnA: 0.112,
    lnA2: 0.023,
    lnT: -0.040,
    lnE1: -0.013,
    lnE2: -0.031,
    lnIS: 0.086,
    r2: 0.861
  },
  {
    province: "河南",
    cons: 61.576,
    lnP: -5.730,
    lnU: 0.501,
    lnA: 0.224,
    lnA2: 0.056,
    lnT: 0.099,
    lnE1: -0.103,
    lnE2: -0.185,
    lnIS: 0.914,
    r2: 0.930
  }
]

// 碳吸收系数
const carbonAbsorptionCoefficients = {
  farmland: 0.007, // t·hm²·a⁻¹
  forestland: 3.8096,
  grassland: 0.9482,
  urbanGreen: 2.3789 // (林地+草地)/2
}

// 动态导入地图组件
const ChinaMap = dynamic(
  () => import('./china-map-component'),
  { ssr: false }
)

export default function CarbonNeutralPredictionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProvince, setSelectedProvince] = useState<string>("全国")
  const [predictionYears, setPredictionYears] = useState(30)
  const [carbonIntensityReduction, setCarbonIntensityReduction] = useState(3.5) // 年递减率 %
  const [policyAdvice, setPolicyAdvice] = useState("")
  const [excelData, setExcelData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // 报告内容状态
  const [experimentOverview, setExperimentOverview] = useState("")
  const [predictionResults, setPredictionResults] = useState("")
  const [absorptionAnalysis, setAbsorptionAnalysis] = useState("")
  const [carbonNeutralPrediction, setCarbonNeutralPrediction] = useState("")
  
  // 时间轴控制状态
  const [timeRange, setTimeRange] = useState([2019, 2060])
  
  // 加载Excel数据
  useEffect(() => {
    const loadExcelData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/read-excel-data')
        const result = await response.json()
        if (result.success) {
          setExcelData(result.data)
        }
      } catch (error) {
        console.error('加载Excel数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadExcelData()
  }, [])
  
  // 计算碳吸收量
  const calculateCarbonAbsorption = (province: ProvinceData) => {
    const { landTypes } = province
    return (
      landTypes.farmland * 10000 * carbonAbsorptionCoefficients.farmland +
      landTypes.forestland * 10000 * carbonAbsorptionCoefficients.forestland +
      landTypes.grassland * 10000 * carbonAbsorptionCoefficients.grassland +
      landTypes.urbanGreen * 10000 * carbonAbsorptionCoefficients.urbanGreen
    ) / 10000 // 转换为万吨
  }

  // 从Excel数据计算碳吸收量 - 严格按照公式 Cᵢ = Sᵢ × Vᵢ
  const calculateCarbonAbsorptionFromExcel = (provinceData: any) => {
    const farmland = provinceData['farmland'] || 0
    const forestland = provinceData['forestland'] || 0
    const grassland = provinceData['grassland'] || 0
    const urbanGreen = provinceData['urbanGreen'] || 0
    
    // 碳吸收系数
    const carbonAbsorptionCoefficients = {
      farmland: 0.007, // t·hm²·a⁻¹
      forestland: 3.8096,
      grassland: 0.9482,
      urbanGreen: 2.3789
    }
    
    // 严格按照公式 Cᵢ = Sᵢ × Vᵢ
    const totalAbsorption = 
      farmland * carbonAbsorptionCoefficients.farmland +
      forestland * carbonAbsorptionCoefficients.forestland +
      grassland * carbonAbsorptionCoefficients.grassland +
      urbanGreen * carbonAbsorptionCoefficients.urbanGreen
    
    return totalAbsorption / 10000 // 转换为万吨
  }

  // 四种情景的碳排放强度下降率 - 基于政策文件数据
  const scenarioRates = {
    inertial: 3.85,     // 惯性发展情景 - 3.85%年均递减率（基于国家自主贡献）
    planning: 3.9,      // 规划控制情景 - 3.9%年均下降率（基于"十三五"方案）
    peak: 3.89,         // 达峰约束情景 - 3.89%年均下降率（基于相关研究）
    green: 4.1          // 绿色发展情景 - 基础4.1%，每5年调高0.5%（基于2030年碳达峰行动方案）
  }

  // 计算碳达峰年份 - 基于原文预测结果
  const calculatePeakYear = (scenario: keyof typeof scenarioRates, provinceName: string) => {
    // 基于原文的预测结果，为不同省份和情景设置达峰年份
    const peakYears: Record<string, Record<keyof typeof scenarioRates, number>> = {
      "黑龙江": { inertial: 2031, planning: 2025, peak: 2029, green: 2020 },
      "天津": { inertial: 2033, planning: 2022, peak: 2029, green: 2020 },
      "河北": { inertial: 2033, planning: 2022, peak: 2029, green: 2020 },
      "内蒙古": { inertial: 2033, planning: 2024, peak: 2029, green: 2020 },
      "新疆": { inertial: 2034, planning: 2044, peak: 2029, green: 2021 },
      "北京": { inertial: 2052, planning: 2021, peak: 2029, green: 2021 },
      "上海": { inertial: 2040, planning: 2021, peak: 2029, green: 2020 },
      "广东": { inertial: 2038, planning: 2021, peak: 2029, green: 2021 },
      "江苏": { inertial: 2036, planning: 2023, peak: 2029, green: 2021 },
      "浙江": { inertial: 2035, planning: 2023, peak: 2029, green: 2021 },
      "山东": { inertial: 2037, planning: 2023, peak: 2029, green: 2020 },
      "海南": { inertial: 2045, planning: 2048, peak: 2029, green: 2022 },
      "青海": { inertial: 2042, planning: 2040, peak: 2029, green: 2021 },
      "山西": { inertial: 2039, planning: 2032, peak: 2029, green: 2020 },
      "云南": { inertial: 2041, planning: 2031, peak: 2029, green: 2022 },
      "安徽": { inertial: 2051, planning: 2025, peak: 2029, green: 2022 },
      "贵州": { inertial: 2050, planning: 2026, peak: 2029, green: 2023 },
      "湖北": { inertial: 2044, planning: 2024, peak: 2029, green: 2021 },
      "甘肃": { inertial: 2043, planning: 2027, peak: 2029, green: 2020 },
      "辽宁": { inertial: 2035, planning: 2024, peak: 2029, green: 2020 },
      "吉林": { inertial: 2034, planning: 2025, peak: 2029, green: 2020 },
      "河南": { inertial: 2040, planning: 2025, peak: 2029, green: 2021 } // 添加河南
    }
    
    // 如果没有特定省份的数据，使用默认值
    const defaultPeakYears = {
      inertial: 2040, // 惯性发展情景默认2040年达峰
      planning: 2025, // 规划控制情景默认2025年达峰
      peak: 2029,     // 达峰约束情景统一2029年达峰
      green: 2021     // 绿色发展情景默认2021年达峰
    }
    
    return peakYears[provinceName]?.[scenario] || defaultPeakYears[scenario]
  }

  // 计算2005-2019年GDP年均增长率
  const calculateGDPGrowthRate = (provinceName: string) => {
    // 获取2005年和2019年的GDP数据
    const gdp2005 = excelData.find(item => item['省份'] === provinceName && item['年份'] === 2005)?.['gdp'] || 0
    const gdp2019 = excelData.find(item => item['省份'] === provinceName && item['年份'] === 2019)?.['gdp'] || 0
    
    if (gdp2005 > 0 && gdp2019 > 0) {
      // 计算年均增长率：(2019年GDP/2005年GDP)^(1/14) - 1
      const years = 2019 - 2005
      const growthRate = Math.pow(gdp2019 / gdp2005, 1/years) - 1
      return growthRate
    }
    
    // 如果没有数据，使用默认值
    return 0.05 // 默认5%
  }

  // 获取2015年碳排放强度数据
  const get2015CarbonIntensity = (provinceName: string) => {
    const data2015 = excelData.find(item => item['省份'] === provinceName && item['年份'] === 2015)
    if (data2015) {
      const carbonEmission2015 = data2015['co2Emission'] || 0 // 万吨
      const gdp2015 = data2015['gdp'] || 0 // 亿元
      const baseEmission2015 = carbonEmission2015 * 10000 // 转换为吨
      const baseGDP2015 = gdp2015 * 10000 // 转换为万元
      return baseEmission2015 / baseGDP2015 // 碳排放强度（t/万元）
    }
    return null
  }

  // 获取2020年碳排放强度数据
  const get2020CarbonIntensity = (provinceName: string) => {
    const data2020 = excelData.find(item => item['省份'] === provinceName && item['年份'] === 2020)
    if (data2020) {
      return data2020['carbonIntensity'] || null
    }
    return null
  }

  // 严格按照文档方法实现碳排放预测 - 所有数据从原始文件获取
  const predictCarbonEmissionFromExcel = (provinceData: any, year: number, scenario: keyof typeof scenarioRates = 'inertial') => {
    const baseYear = 2019
    const yearDiff = year - baseYear
    const provinceName = provinceData['省份'] || "全国"
    
    // 从Excel数据获取基础信息 - 所有数据都从原始文件获取
    const carbonEmission = provinceData['co2Emission'] || 0 // 万吨
    const population = provinceData['population'] || 0 // 万人
    const urbanizationRate = provinceData['urbanizationRate'] || 0 // %
    const gdp = provinceData['gdp'] || 0 // 亿元
    const energyConsumption = provinceData['energyConsumption'] || 0 // 万吨标准煤
    const coalConsumption = provinceData['coalConsumption'] || 0 // 万吨
    const secondaryIndustryValue = provinceData['secondaryIndustryRatio'] || 0 // %
    
    // 对于基准年（2019年），直接返回原始数据，不应用预测公式
    if (year === baseYear) {
      return carbonEmission // 直接返回2019年的实际碳排放量
    }
    
    // 基于2019年基准数据
    const baseEmission = carbonEmission * 10000 // 转换为吨
    const baseGDP = gdp * 10000 // 转换为万元
    const basePopulation = population * 10000 // 转换为人
    const basePerCapitaGDP = baseGDP / basePopulation // 人均GDP（元）
    const baseCarbonIntensity = baseEmission / baseGDP // 碳排放强度（t/万元）
    const baseEnergyIntensity = energyConsumption * 10000 / baseGDP // 能源强度（tce/万元）
    const baseEnergyStructure = coalConsumption / energyConsumption * 100 // 能源结构（煤炭占比%）
    const baseIndustryStructure = secondaryIndustryValue // 产业结构（第二产业占比%）
    
    // 计算2005-2019年GDP年均增长率 - 从原始数据获取
    const gdpGrowthRate = calculateGDPGrowthRate(provinceName)
    
    // 预测GDP（基于2005-2019年的真实年均变化量）
    const predictedGDP = baseGDP * Math.pow(1 + gdpGrowthRate, yearDiff)
    
    // 根据情景计算碳排放强度下降率 - 基于原始数据计算
    let carbonIntensityReductionRate = 0
    
    switch (scenario) {
      case 'inertial':
        // 惯性发展情景：GDP以2005-2019年的年均变化量平稳递增，碳排放强度以中国国家自主贡献中的承诺为依据递减
        // 根据中国国家自主贡献：为实现2030年单位GDP二氧化碳排放比2005年下降60%至65%的目标，
        // 2015-2030年中国碳强度下降率将连续25年保持年均3.6%至4.1%
        // 取中间值3.85%作为惯性发展情景的碳排放强度年均递减率
        carbonIntensityReductionRate = 0.0385 // 3.85%年均递减率（基于国家自主贡献）
        break
        
      case 'planning':
        // 规划控制情景：根据"十三五"控制温室气体排放方案
        // T₂ = T₁(1 - u), v₁ = (T₂ / T₁)^(1/5) - 1
        // 从原始数据获取2015年和2020年碳排放强度
        const T1 = get2015CarbonIntensity(provinceName) || baseCarbonIntensity
        const T2 = get2020CarbonIntensity(provinceName) || baseCarbonIntensity
        
        if (T1 && T2 && T1 > 0) {
          // 使用真实的2020年数据计算年均下降率
          carbonIntensityReductionRate = Math.pow(T2 / T1, 1/5) - 1 // 年均下降率
        } else {
          // 如果数据不完整，使用政策默认值
          // 根据"十三五"控制温室气体排放方案，每个五年计划碳排放强度下降18%
          carbonIntensityReductionRate = 0.039 // 3.9%年均下降率（基于"十三五"方案）
        }
        break
        
      case 'peak':
        // 达峰约束情景：根据中国"CO₂排放力争于2030年达到峰值"的目标计算
        // 根据相关研究：若每个五年计划碳排放强度下降18%，碳达峰时经济增速上限为4.05%，
        // 此时碳排放强度年算术平均下降3.6%，年几何平均下降3.89%
        // 碳排放强度下降率系数与经济增速上限存在一定关联，大致在3.6%至3.89%左右
        const gdpGrowthRate2030 = Math.log(predictedGDP / baseGDP) / yearDiff
        // 使用3.89%作为达峰约束情景的碳排放强度下降率系数
        carbonIntensityReductionRate = Math.min(gdpGrowthRate2030, 0.0389) // 取GDP增长率和3.89%的较小值
        break
        
      case 'green':
        // 绿色发展情景：在惯性发展情景的基础上，放缓GDP增长速度，将GDP的增长率调低1个百分点
        // 根据《2030年前碳达峰行动方案》：到2030年，单位国内生产总值二氧化碳排放比2005年下降65%以上
        // 基于65%的下降目标，计算得到碳排放强度年均下降率为4.1%
        // 在此基础上，以5年为周期将下降率调高0.5个百分点
        const baseReductionRate = 0.041 // 基础下降率4.1%（基于2030年碳达峰行动方案）
        const cycle = Math.floor(yearDiff / 5)
        carbonIntensityReductionRate = baseReductionRate + cycle * 0.005 // 每5年调高0.5个百分点
        
        // 绿色发展情景下，GDP增长率调低1个百分点
        const greenGDPGrowthRate = gdpGrowthRate - 0.01
        const greenPredictedGDP = baseGDP * Math.pow(1 + greenGDPGrowthRate, yearDiff)
        const greenPredictedEmission = greenPredictedGDP * baseCarbonIntensity * Math.pow(1 - carbonIntensityReductionRate, yearDiff)
        return greenPredictedEmission / 10000 // 转换回万吨
    }
    
    // 预测碳排放强度
    const predictedCarbonIntensity = baseCarbonIntensity * Math.pow(1 - carbonIntensityReductionRate, yearDiff)
    
    // 使用公式 Cₜ = GDPₜ × Tₜ
    const predictedEmission = predictedGDP * predictedCarbonIntensity
    
    return predictedEmission / 10000 // 转换回万吨
  }

  // 计算碳中和年份 - 当碳排放量等于碳吸收量时
  const calculateCarbonNeutralYear = (provinceData: any, scenario: keyof typeof scenarioRates = 'inertial') => {
    const baseAbsorption = calculateCarbonAbsorptionFromExcel(provinceData)
    
    // 从2019年开始逐年检查，找到碳排放量首次小于等于碳吸收量的年份
    for (let year = 2019; year <= 2100; year++) {
      const emission = predictCarbonEmissionFromExcel(provinceData, year, scenario)
      if (emission <= baseAbsorption) {
        return year
      }
    }
    
    return 2100 // 如果2100年仍未达到碳中和，返回2100
  }

  // 碳中和度计算 - 严格按照公式 N₂₀₆₀ = (S₂₀₆₀ / C₂₀₆₀) × 100%
  const calculateCarbonNeutralityDegree = (absorption: number, emission: number) => {
    if (emission <= 0) return 100 // 如果排放为0或负数，碳中和度为100%
    return (absorption / emission) * 100
  }

  // 生成预测数据 - 使用Excel数据，支持四种情景
  const generatePredictionData = () => {
    const currentYear = 2019 // 改为使用2019年作为基准
    const data = []
    
    // 获取2019年的数据作为基准
    const baseData2019 = excelData.filter(item => item['年份'] === 2019)
    
    // 生成到2100年的数据，确保有足够的数据供时间轴控制使用
    const maxYears = Math.max(predictionYears, 81) // 至少生成到2100年 (2019+81)
    
    for (let i = 0; i <= maxYears; i++) {
      const year = currentYear + i
      let totalEmissionInertial = 0
      let totalEmissionPlanning = 0
      let totalEmissionPeak = 0
      let totalEmissionGreen = 0
      let totalAbsorption = 0
      
      if (selectedProvince === "全国") {
        // 计算全国数据
        baseData2019.forEach(provinceData => {
          totalEmissionInertial += predictCarbonEmissionFromExcel(provinceData, year, 'inertial')
          totalEmissionPlanning += predictCarbonEmissionFromExcel(provinceData, year, 'planning')
          totalEmissionPeak += predictCarbonEmissionFromExcel(provinceData, year, 'peak')
          totalEmissionGreen += predictCarbonEmissionFromExcel(provinceData, year, 'green')
          totalAbsorption += calculateCarbonAbsorptionFromExcel(provinceData)
        })
      } else {
        // 计算特定省份数据
        const provinceData = baseData2019.find(p => p['省份'] === selectedProvince)
        if (provinceData) {
          totalEmissionInertial = predictCarbonEmissionFromExcel(provinceData, year, 'inertial')
          totalEmissionPlanning = predictCarbonEmissionFromExcel(provinceData, year, 'planning')
          totalEmissionPeak = predictCarbonEmissionFromExcel(provinceData, year, 'peak')
          totalEmissionGreen = predictCarbonEmissionFromExcel(provinceData, year, 'green')
          totalAbsorption = calculateCarbonAbsorptionFromExcel(provinceData)
        }
      }
      
      data.push({
        year,
        emissionInertial: Math.round(totalEmissionInertial),
        emissionPlanning: Math.round(totalEmissionPlanning),
        emissionPeak: Math.round(totalEmissionPeak),
        emissionGreen: Math.round(totalEmissionGreen),
        absorption: Math.round(totalAbsorption),
        netInertial: Math.round(totalEmissionInertial - totalAbsorption),
        netPlanning: Math.round(totalEmissionPlanning - totalAbsorption),
        netPeak: Math.round(totalEmissionPeak - totalAbsorption),
        netGreen: Math.round(totalEmissionGreen - totalAbsorption)
      })
    }
    
    return data
  }

  const predictionData = generatePredictionData()
  const carbonNeutralYear = predictionData.find(d => d.netInertial <= 0)?.year || null

  const steps = [
    { id: 1, title: "实验介绍", icon: Play },
    { id: 2, title: "数据探索", icon: BarChart3 },
    { id: 3, title: "碳排放预测", icon: TrendingUp },
    { id: 4, title: "碳吸收预测", icon: Leaf },
    { id: 5, title: "碳中和预测", icon: TrendingUp },
    { id: 6, title: "报告撰写", icon: FileText }
  ]

  // 获取Excel数据中的省份列表
  const getProvinceList = () => {
    const provinces = [...new Set(excelData.map(item => item['省份']).filter(Boolean))]
    return provinces.sort()
  }

  // 数据下载功能
  const downloadData = () => {
    const csvContent = [
      ["省份", "碳排放量(万吨)", "常住人口(万人)", "城镇化率(%)", "GDP(亿元)", "总能耗(万吨标准煤)", "煤炭消耗量(万吨)", "第二产业增加值(亿元)", "碳吸收量(万吨)"],
      ...provinceData.map(province => [
        province.name,
        province.carbonEmission,
        province.population,
        province.urbanizationRate,
        province.gdp,
        province.energyConsumption,
        province.coalConsumption,
        province.secondaryIndustryValue,
        calculateCarbonAbsorption(province).toFixed(1)
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "carbon_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 报告下载功能
  const downloadReport = () => {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>碳中和预测实验报告</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { 
            font-family: "Microsoft YaHei", "SimSun", serif; 
            line-height: 1.6; 
            margin: 40px; 
            max-width: 800px; 
            margin: 40px auto;
        }
        h1 { 
            text-align: center; 
            color: #333; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px; 
            font-size: 24px;
        }
        h2 { 
            color: #444; 
            margin-top: 30px; 
            margin-bottom: 15px; 
            font-size: 18px;
        }
        p { 
            text-indent: 2em; 
            margin-bottom: 10px; 
            font-size: 14px;
        }
        .report-info { 
            text-align: right; 
            color: #666; 
            font-size: 12px; 
            margin-top: 30px; 
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .highlight { 
            font-weight: bold; 
            color: #2c5aa0; 
        }
        .print-instructions {
            background: #f0f8ff;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <strong>打印说明：</strong>按 Ctrl+P (Windows) 或 Cmd+P (Mac) 打开打印对话框，选择"另存为PDF"即可保存为PDF文件。
    </div>
    
    <h1>碳中和预测实验报告</h1>
    
    <h2>一、实验概述</h2>
    <p>${experimentOverview || `本实验基于STIRPAT模型对${selectedProvince}的碳排放进行预测，结合土地利用类型计算碳吸收量，分析碳中和实现路径。`}</p>
    
    <h2>二、碳排放预测结果</h2>
    <p>${predictionResults || `根据STIRPAT模型预测，在当前发展趋势下，${selectedProvince}的碳排放量将在未来${predictionYears}年内呈现${carbonIntensityReduction > 3 ? "快速" : "缓慢"}下降趋势。年均递减率设定为${carbonIntensityReduction}%。`}</p>
    
    <h2>三、碳吸收量分析</h2>
    <p>${absorptionAnalysis || `基于土地利用类型和碳吸收系数计算，${selectedProvince}当前碳吸收能力为${predictionData[0]?.absorption.toLocaleString()}万吨/年。其中林地贡献最大，碳吸收系数为3.8096 t·hm²·a⁻¹。`}</p>
    
    <h2>四、碳中和预测</h2>
    <p>${carbonNeutralPrediction || `综合碳排放和碳吸收预测结果，${selectedProvince}预计在${carbonNeutralYear || "2060年后"}实现碳中和目标。当前净排放量为${predictionData[0]?.netInertial.toLocaleString()}万吨。`}</p>
    
    <h2>五、政策建议</h2>
    <p>${policyAdvice || "请在实验中填写政策建议"}</p>
    
    <div class="report-info">
        报告生成时间：${new Date().toLocaleString()}
    </div>
</body>
</html>
    `.trim()
    
    const blob = new Blob([reportContent], { type: "text/html;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `碳中和预测报告_${selectedProvince}_${new Date().toISOString().split('T')[0]}.html`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 下载省份相关数据Excel文件
  const downloadProvinceData = () => {
    try {
      // 直接下载public目录中的文件
      const link = document.createElement('a')
      link.href = '/carbon-neutrality-prediction-data.xlsx'
      link.download = 'carbon-neutrality-prediction-data.xlsx'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 步骤导航 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            碳中和预测实验
          </CardTitle>
          <CardDescription>
            基于机器学习和大数据分析的全球碳中和路径预测与情景模拟
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step.id)}
                className="flex items-center gap-2"
              >
                <step.icon className="h-4 w-4" />
                {step.title}
              </Button>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* 步骤1: 实验介绍 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              实验介绍
            </CardTitle>
            <CardDescription>了解碳中和预测实验的背景、目标和方法</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 实验背景 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">01</span>
                  <span className="ml-2">实验背景</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  在全球气候变化和碳减排的国际背景下，开展区域碳收支核算并预测碳中和未来演变态势，不仅有助于综合评估区域碳平衡状况、预估碳中和实现程度，也是推动经济社会绿色低碳转型发展的迫切需求。从省域尺度开展碳达峰碳中和预测、评估不同省份"双碳"目标的实现程度，对于区域差别化碳减排、增汇政策的设计、推动区域公平协同减排、促进"双碳"目标的实现具有重要意义。
                </p>
              </div>
              
              {/* 实验目的 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">02</span>
                  <span className="ml-2">实验目的</span>
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 leading-relaxed">
                    实验目的在于从理论上进一步深化省域尺度碳达峰碳中和评价和情景预测研究，揭示未来碳达峰及碳中和实现程度的省际差异，为区域差别化碳减排、增汇政策的制定提供参考和实践指导。
                  </p>
                </div>
              </div>
              
              {/* 实验方法 */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">03</span>
                  <span className="ml-2">实验方法</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">第一步：碳收支核算</span>
                    </div>
                    <p className="text-gray-700 text-sm">从省域尺度对2005-2019年不同省份的碳收支进行核算</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">第二步：影响因素分析</span>
                    </div>
                    <p className="text-gray-700 text-sm">基于STIRPAT模型分析各地区碳排放的影响因素</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">第三步：情景预测</span>
                    </div>
                    <p className="text-gray-700 text-sm">基于惯性发展、规划控制、达峰约束和绿色发展等4种不同情景，对2020-2060年度各地区碳达峰和碳中和实现程度进行预测</p>
                  </div>
                </div>
              </div>

              {/* 实验特色 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Leaf className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-700 mb-2">碳中和目标</h4>
                    <p className="text-sm text-gray-600">预测2060年碳中和实现路径</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-700 mb-2">多情景分析</h4>
                    <p className="text-sm text-gray-600">四种不同发展情景对比</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-700 mb-2">省域尺度</h4>
                    <p className="text-sm text-gray-600">精确到省级的碳收支核算</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                开始实验 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤2: 相关数据 */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>相关数据及下载</CardTitle>
            <CardDescription>基于中国地图的各省碳排放量和相关指标可视化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 中国各省碳排放分布图 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">中国各省碳排放分布图</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/china-provincial-carbon-emissions.webp" 
                      alt="中国各省碳排放分布图" 
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    <p className="mb-2">
                      注：该图基于国家测绘地理信息局标准地图服务网站下载的审图号为GS(2020)4619的标准地图制作，底图无修改。
                    </p>
                    <p className="font-bold">
                      图1  
                    </p>
                  </div>
                </div>
              </div>

              {/* 省份相关数据 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">省份相关数据</h3>
                  <Button size="sm" variant="outline" onClick={downloadProvinceData}>
                    <Download className="h-4 w-4 mr-2" />
                    下载完整数据
                  </Button>
                </div>
                
                {/* 情景设置表格 */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">情景设置</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left"></th>
                          <th className="border border-gray-300 px-4 py-2 text-center">惯性发展情景</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">规划控制情景</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">达峰约束情景</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">绿色发展情景</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-medium">碳排放强度下降率 (%)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.32%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.05%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">12.60%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.11%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <h4 className="text-md font-semibold mb-3">各省份关键指标数据表</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-center">省份</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">碳排放量(万吨)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">常住人口(万人)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">城镇化率(%)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">GDP(亿元)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">总能耗(万吨标准煤)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">煤炭消耗量(万吨)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">第二产业增加值(亿元)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">碳吸收量(万吨)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinceData.map(province => (
                        <tr key={province.code} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">{province.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.carbonEmission.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.population.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.urbanizationRate}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.gdp.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.energyConsumption.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.coalConsumption.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.secondaryIndustryValue.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{calculateCarbonAbsorption(province).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-4 mt-6">
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>数据说明：</strong>"各省份关键指标数据表"展示了各省份的关键指标数据，完整数据请下载Excel文件查看。</p>
                    <p><strong>数据来源：</strong>国家统计局、各省统计年鉴、生态环境部等官方数据</p>
                    <p><strong>更新时间：</strong>2023年</p>
                  </div>
                </div>
              </div>

              {/* 地图可视化 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">中国各省碳排放可视化地图</h3>
                
                <div className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
                  <ChinaMap 
                    selectedProvince={selectedProvince === "全国" ? undefined : selectedProvince}
                    onProvinceSelect={(province) => setSelectedProvince(province)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                ← 上一步
              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                下一步 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤3: 碳排放预测 */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>碳排放量预测</CardTitle>
            <CardDescription>基于STIRPAT模型的碳排放预测分析</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 模型介绍 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  将变量先纳入STIRPAT模型再筛选，构建扩展的STIRPAT模型如表达式（如下）, 为避免影响因素之间存在多重共线性，在SPSS软件环境下进行岭回归分析，获得各省碳排放的主控因素。
                </p>
              </div>

              {/* 模型公式 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">STIRPAT模型公式</h3>
                <div className="font-mono text-sm bg-white p-3 rounded border">
                  ln I = ln a + b ln P + c ln U + d ln A + f (ln A)² + g ln T + h ln E₁ + j ln E₂ + k ln I₂
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>式中：</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>I: CO₂排放量(单位:t)</li>
                    <li>P: 常住人口(单位:万人)</li>
                    <li>U: 城镇化率(单位:%)</li>
                    <li>A: 人均GDP(单位:元)</li>
                    <li>T: 碳排放强度(单位:t/万元)</li>
                    <li>E₁: 能源强度(单位:tce/万元)</li>
                    <li>E₂: 能源结构(单位:%，煤炭消耗占比)</li>
                    <li>I₂: 产业结构(单位:%，第二产业增加值占GDP比重)</li>
                    <li>a: 模型系数</li>
                    <li>b, c, d, f, g, h, j, k, A: 各变量的弹性系数</li>
                  </ul>
                </div>
              </div>

              {/* 公式及计算步骤 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">公式及计算步骤</h3>
                <p className="text-gray-700 mb-4">
                  本研究以2019年为基期 ，预测不同情景下2020-2060年中国各省的碳排放量。计算方法如下：
                </p>
                
                <div className="font-mono text-sm bg-white p-3 rounded border mb-4">
                  Cₜ = GDPₜ × Tₜ
                </div>
                
                <div className="text-sm text-gray-600 mb-6">
                  <p><strong>式中：</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Cₜ: 预测年的碳排放量（单位：t）</li>
                    <li>GDPₜ: 预测年的地区生产总值（单位：万元）</li>
                    <li>Tₜ: 预测年的碳排放强度（单位：t/万元）</li>
                    <li>t ∈ [2020, 2060]</li>
                  </ul>
                </div>

                <p className="text-gray-700 mb-4">
                  同时本研究设置惯性发展、规划控制、达峰约束和绿色发展等4种不同情景，预测2020-2060年各省碳排放量。各情景模式设定如下：
                </p>

                <div className="space-y-4">
                  {/* 惯性发展情景 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-red-600 mb-2">(1) 惯性发展情景</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      GDP以2005-2019年的年均变化量平稳递增，碳排放强度以中国国家自主贡献中的承诺为依据递减。
                    </p>
                  </div>

                  {/* 规划控制情景 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-blue-600 mb-2">(2) 规划控制情景</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      根据各省市"十四五"规划中GDP年均增长率预测GDP，结合"十三五"控制温室气体排放方案中各省市碳排放强度下降指标计算碳排放强度年均下降率。计算方法如下：
                    </p>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      T₂ = T₁(1 - u)
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      v₁ = (T₂ / T₁)^(1/5) - 1
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>式中：</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>T₁、T₂: 分别为2015、2020年规划控制情景下的碳排放强度（单位：t/万元）</li>
                        <li>u: "十三五"控制温室气体排放方案碳排放强度下降指标（单位：%）</li>
                        <li>v₁: 规划控制情景下的碳排放强度下降率（单位：％）</li>
                      </ul>
                    </div>
                  </div>

                  {/* 达峰约束情景 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-green-600 mb-2">(3) 达峰约束情景</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      GDP以2005-2019年的年均变化量平稳递增，根据中国"CO₂排放力争于2030年达到峰值"的目标计算碳排放强度年均下降率。计算方法如下：
                    </p>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      v₂ ∈ [ln(GDPₗ₊₁ / GDPₗ), ln(GDPₘ₊₁ / GDPₘ)]
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>式中：</strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>v₂: 达峰约束情景下的碳排放强度下降率（单位：%）</li>
                        <li>GDP: 地区生产总值（单位：万元）</li>
                        <li>l ∈ [2030, 2059], m ∈ [2020, 2029]</li>
                        <li>为保证各省在2030年前实现碳达峰，v₂取最大值</li>
                      </ul>
                    </div>
                  </div>

                  {/* 绿色发展情景 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-yellow-600 mb-2">(4) 绿色发展情景</h4>
                    <p className="text-sm text-gray-700">
                      在惯性发展情景的基础上，放缓GDP增长速度，将GDP的增长率调低1个百分点。根据中国国家自主贡献中"2030年单位国内生产总值CO₂排放量比2005年下降60%～65%"的承诺设置碳排放强度下降目标为65%，参照规划控制情景下的公式计算得到碳排放强度年均下降率为4.11%，在此基础上，以5年为周期将下降率调高0.5个百分点，作为各省碳排放强度的下降率。
                    </p>
                  </div>
                </div>
              </div>

              {/* 预测参数设置 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>预测年限: {predictionYears} 年</Label>
                  <Slider
                    value={[predictionYears]}
                    min={10}
                    max={50}
                    step={5}
                    onValueChange={([value]) => setPredictionYears(value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>碳排放强度年递减率: {carbonIntensityReduction}%</Label>
                  <Slider
                    value={[carbonIntensityReduction]}
                    min={1}
                    max={10}
                    step={0.5}
                    onValueChange={([value]) => setCarbonIntensityReduction(value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>GDP年均增长率: {(calculateGDPGrowthRate(selectedProvince) * 100).toFixed(2)}%</Label>
                  <div className="text-sm text-gray-600 mt-2">
                    基于{selectedProvince}2005-2019年GDP数据计算
                  </div>
                </div>
              </div>

              {/* 原始数据显示 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">原始数据信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {(() => {
                    const currentProvinceData = excelData.find(item => item['省份'] === selectedProvince && item['年份'] === 2019)
                    const gdp2005 = excelData.find(item => item['省份'] === selectedProvince && item['年份'] === 2005)?.['gdp'] || 0
                    const gdp2019 = currentProvinceData?.['gdp'] || 0
                    const carbonIntensity2015 = get2015CarbonIntensity(selectedProvince)
                    
                    return (
                      <>
                        <div>
                          <div className="font-semibold">2019年GDP</div>
                          <div className="text-blue-600">{gdp2019.toFixed(0)} 亿元</div>
                        </div>
                        <div>
                          <div className="font-semibold">2005年GDP</div>
                          <div className="text-blue-600">{gdp2005.toFixed(0)} 亿元</div>
                        </div>
                        <div>
                          <div className="font-semibold">2019年碳排放强度</div>
                          <div className="text-red-600">{currentProvinceData ? (currentProvinceData['co2Emission'] * 10000 / (currentProvinceData['gdp'] * 10000)).toFixed(4) : 0} t/万元</div>
                        </div>
                        <div>
                          <div className="font-semibold">2015年碳排放强度</div>
                          <div className="text-red-600">{carbonIntensity2015 ? carbonIntensity2015.toFixed(4) : '无数据'} t/万元</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* 预测结果图表 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">碳排放预测结果</h3>
                  <div className="flex gap-2">
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全国">全国</SelectItem>
                        {getProvinceList().map(province => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">正在加载数据...</p>
                    </div>
                  </div>
                ) : excelData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-600">暂无数据</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="emissionInertial" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="惯性发展情景(万吨)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="emissionPlanning" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="规划控制情景(万吨)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="emissionPeak" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="达峰约束情景(万吨)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="emissionGreen" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="绿色发展情景(万吨)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* 预测结果分析 */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">预测结果分析</h3>
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    预测2020 - 2060年各省在惯性发展、规划控制、达峰约束和绿色发展4种情景下的碳排放量，分析不同情景下各省的达峰时间和碳峰值。
                  </p>
                  
                  <div>
                    <p className="font-semibold text-red-600 mb-2">惯性发展情景下</p>
                    <p>
                      各省均在2030年后实现碳达峰。黑龙江将于 2031 年实现达峰，达峰最早，碳峰值为 2. 56× 10⁸ t , 其后是天津、河北、内蒙古( 2033 )、新疆( 2034)等。北京将于2052年实现达峰，达峰最晚，碳峰值为1.14×10⁸ t , 其后为安徽(2051 )、贵州(2050)、湖北(2044)等。
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-blue-600 mb-2">规划控制情景下</p>
                    <p>
                      各省达峰时间相对分散，25个省市在2030年及之前实现碳达峰。整体上看，东部地区较早实现碳达峰，西部地区较晚实现，中部、东北地区的达峰时间相对集中。北京、上海、广东均在2021年实现碳达峰，达峰最早，其后是江苏、浙江、山东(2023)等。海南在2048年实现碳达峰，达峰最晚，此外，新疆(2044 )、青海( 2040 )、山西(2032)、云南( 2031)也将在2030年后达峰。
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-green-600 mb-2">达峰约束情景下</p>
                    <p>
                      各省均在2029年实现碳达峰，但碳峰值存在明显差异，其中山东碳峰值最高，共计8. 94×10⁸ t , 海南碳峰值最低，共计5941 . 20×10⁴ t。
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-yellow-600 mb-2">绿色发展情景下</p>
                    <p>
                      各省均在2020 ~ 2023年实现达峰，整体来看，该情景达峰时间早于其它3种情景。其中天津、河北、山西、内蒙古、辽宁、吉林、黑龙江、上海、山东、甘肃达峰时间最早，在2020年达到 碳峰值，贵州在2023年达到碳峰值，是该情景下达峰最晚的省份。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                ← 上一步
              </Button>
              <Button onClick={() => setCurrentStep(4)}>
                下一步 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤4: 碳吸收预测 */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>碳吸收量预测</CardTitle>
            <CardDescription>基于土地利用类型的碳吸收量计算</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 计算公式 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">碳吸收量计算公式</h3>
                <div className="font-mono text-sm bg-white p-3 rounded border">
                  Cᵢ = Sᵢ × Vᵢ
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>式中：</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Cᵢ: 第i类土地利用类型的碳吸收量(单位：t) </li>
                    <li>Sᵢ: 第i类土地利用类型的面积(单位:hm²)</li>
                    <li>Vᵢ: 第i类土地利用类型的碳吸收系数(单位:t·hm²·a⁻¹)</li>
                    <li>i = 1,2,3,4 分别为耕地、林地、草地、城市绿地</li>
                  </ul>
                </div>
              </div>

              {/* 碳吸收系数表 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">碳吸收系数</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">0.007</div>
                      <div className="text-sm text-gray-600">耕地</div>
                      <div className="text-xs text-gray-500">t·hm²·a⁻¹</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">3.8096</div>
                      <div className="text-sm text-gray-600">林地</div>
                      <div className="text-xs text-gray-500">t·hm²·a⁻¹</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-lime-600">0.9482</div>
                      <div className="text-sm text-gray-600">草地</div>
                      <div className="text-xs text-gray-500">t·hm²·a⁻¹</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">2.3789</div>
                      <div className="text-sm text-gray-600">城市绿地</div>
                      <div className="text-xs text-gray-500">t·hm²·a⁻¹</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 各省碳吸收量对比 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">各省碳吸收量结果对比</h3>
                
                {/* 分析内容 */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    中国碳吸收量相对稳定，但整体上呈上升趋势，2005-2019年由16.43×10⁸ t增长至16.62×10⁸ t，共增长1817.68×10⁴ t，年均增长率达到0.08%，变化幅度小。2019年东部、中部、西部、东北地区碳吸收量分别为1.87×10⁸、2.33×10⁸、9.80×10⁸、2.62×10⁸ t，呈现"西部＞东北＞中部＞东部"的"西高东低"格局。西部地区碳吸收远高于其他地区，占全国碳吸收的58.97%。与2005年相比，2019年东部、中部、西部地区碳吸收量分别增长了1.77%、0.02%、1.88%，而东北地区降低了1.20%。
                  </p>
                </div>

                {/* 区域碳吸收量对比 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-blue-600">1.87×10⁸</div>
                      <div className="text-sm text-gray-600">东部地区</div>
                      <div className="text-xs text-gray-500">2019年碳吸收量(t)</div>
                      <div className="text-xs text-green-600 mt-1">+1.77%</div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-green-600">2.33×10⁸</div>
                      <div className="text-sm text-gray-600">中部地区</div>
                      <div className="text-xs text-gray-500">2019年碳吸收量(t)</div>
                      <div className="text-xs text-green-600 mt-1">+0.02%</div>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-orange-600">9.80×10⁸</div>
                      <div className="text-sm text-gray-600">西部地区</div>
                      <div className="text-xs text-gray-500">2019年碳吸收量(t)</div>
                      <div className="text-xs text-green-600 mt-1">+1.88%</div>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="text-lg font-bold text-purple-600">2.62×10⁸</div>
                      <div className="text-sm text-gray-600">东北地区</div>
                      <div className="text-xs text-gray-500">2019年碳吸收量(t)</div>
                      <div className="text-xs text-red-600 mt-1">-1.20%</div>
                    </CardContent>
                  </Card>
                </div>

                {/* 各省碳吸收量柱状图 */}
                <div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={excelData
                        .filter((item: any) => item['年份'] === 2019)
                        .map((provinceData: any) => ({
                          name: provinceData['省份'],
                          absorption: calculateCarbonAbsorptionFromExcel(provinceData)
                        }))
                        .sort((a: any, b: any) => b.absorption - a.absorption)
                        .slice(0, 10) // 只显示前10个省份
                      }>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="absorption" fill="#22c55e" name="碳吸收量(万吨)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <h4 className="text-base font-semibold mt-4 text-center">2019年碳吸收量前十省份</h4>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                ← 上一步
              </Button>
              <Button onClick={() => setCurrentStep(5)}>
                下一步 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤5: 碳中和预测 */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>碳中和预测</CardTitle>
            <CardDescription>基于碳排放和碳吸收的碳中和时间轴预测</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 碳中和度计算方法说明 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed mb-4">
                  将2060年各省在惯性发展、规划控制、达峰约束和绿色发展4种情景下碳排放量与碳吸收量的预测值进行比对，获得2060各省在不同情景模式下的碳中和度，以探讨2060年各省是否达到碳中和。计算方法如下：
                </p>
                
                <div className="bg-white p-4 rounded-lg border mb-4">
                  <div className="font-mono text-lg text-center">
                    N<sub>2060</sub> = (S<sub>2060</sub> / C<sub>2060</sub>) × 100%
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>式中：</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>N<sub>2060</sub> 为2060年碳中和度预测值（单位：%）</li>
                    <li>S<sub>2060</sub> 为2060年碳吸收预测值（单位：t）</li>
                    <li>C<sub>2060</sub> 为2060年碳排放预测值（单位：t）</li>
                  </ul>
                </div>
              </div>


              {/* 碳中和时间轴图 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">碳中和时间轴预测</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">时间范围:</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{timeRange[0]}</span>
                        <Slider
                          value={timeRange}
                          min={2019}
                          max={Math.max(...predictionData.map(d => d.year))}
                          step={1}
                          onValueChange={setTimeRange}
                          className="w-32"
                        />
                        <span className="text-sm font-medium">{timeRange[1]}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setTimeRange([2019, 2060])}
                    >
                      重置
                    </Button>
                  </div>
                </div>
                
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionData.filter(d => d.year >= timeRange[0] && d.year <= timeRange[1])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="emissionInertial" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="惯性发展情景(万吨)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emissionPlanning" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="规划控制情景(万吨)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emissionPeak" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="达峰约束情景(万吨)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emissionGreen" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="绿色发展情景(万吨)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="absorption" 
                        stroke="#22c55e" 
                        strokeWidth={2}
                        name="碳吸收量(万吨)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p><strong>时间轴控制说明：</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>拖动滑块可以调整时间轴的显示范围</li>
                    <li>默认显示2019-2060年的预测数据</li>
                    <li>可以扩展到{Math.max(...predictionData.map(d => d.year))}年查看更长期的预测趋势</li>
                    <li>点击"重置"按钮可恢复到默认时间范围</li>
                    <li>数据范围：2019年 - {Math.max(...predictionData.map(d => d.year))}年</li>
                  </ul>
                </div>
              </div>

              {/* 情景对比 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">不同减排情景对比</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-600">惯性发展情景</CardTitle>
                      <CardDescription className="text-xs">年递减率 3.85%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round(predictionData[0]?.emissionInertial || 0)}
                      </div>
                      <div className="text-xs text-gray-500">万吨</div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-600">规划控制情景</CardTitle>
                      <CardDescription className="text-xs">年递减率 3.9%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(predictionData[0]?.emissionPlanning || 0)}
                      </div>
                      <div className="text-xs text-gray-500">万吨</div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-600">达峰约束情景</CardTitle>
                      <CardDescription className="text-xs">年递减率 3.89%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(predictionData[0]?.emissionPeak || 0)}
                      </div>
                      <div className="text-xs text-gray-500">万吨</div>
                    </CardContent>
                  </Card>
                  <Card className="border-yellow-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-600">绿色发展情景</CardTitle>
                      <CardDescription className="text-xs">年递减率 4.1%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.round(predictionData[0]?.emissionGreen || 0)}
                      </div>
                      <div className="text-xs text-gray-500">万吨</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* 碳中和预测时间轴 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">碳中和预测时间轴</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-yellow-100">
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">情景</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">预计碳中和年份(年)</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">当前碳排放量(万吨)</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">当前碳吸收量(万吨)</th>
                        <th className="border border-gray-300 px-4 py-3 text-center font-semibold">碳中和度(%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const currentProvinceData = excelData.find(item => item['省份'] === selectedProvince && item['年份'] === 2019)
                        const currentAbsorption = currentProvinceData ? calculateCarbonAbsorptionFromExcel(currentProvinceData) : 0
                        const currentEmissionInertial = currentProvinceData ? predictCarbonEmissionFromExcel(currentProvinceData, 2019, 'inertial') : 0
                        const currentEmissionPlanning = currentProvinceData ? predictCarbonEmissionFromExcel(currentProvinceData, 2019, 'planning') : 0
                        const currentEmissionPeak = currentProvinceData ? predictCarbonEmissionFromExcel(currentProvinceData, 2019, 'peak') : 0
                        const currentEmissionGreen = currentProvinceData ? predictCarbonEmissionFromExcel(currentProvinceData, 2019, 'green') : 0
                        
                        const neutralYearInertial = currentProvinceData ? calculateCarbonNeutralYear(currentProvinceData, 'inertial') : 2100
                        const neutralYearPlanning = currentProvinceData ? calculateCarbonNeutralYear(currentProvinceData, 'planning') : 2100
                        const neutralYearPeak = currentProvinceData ? calculateCarbonNeutralYear(currentProvinceData, 'peak') : 2100
                        const neutralYearGreen = currentProvinceData ? calculateCarbonNeutralYear(currentProvinceData, 'green') : 2100
                        
                        return (
                          <>
                            <tr className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-center font-medium">惯性发展情景</td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {neutralYearInertial === 2100 ? "未实现" : `${neutralYearInertial}年`}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentEmissionInertial.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentAbsorption.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {calculateCarbonNeutralityDegree(currentAbsorption, currentEmissionInertial).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-center font-medium">规划控制情景</td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {neutralYearPlanning === 2100 ? "未实现" : `${neutralYearPlanning}年`}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentEmissionPlanning.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentAbsorption.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {calculateCarbonNeutralityDegree(currentAbsorption, currentEmissionPlanning).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-center font-medium">达峰约束情景</td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {neutralYearPeak === 2100 ? "未实现" : `${neutralYearPeak}年`}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentEmissionPeak.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentAbsorption.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {calculateCarbonNeutralityDegree(currentAbsorption, currentEmissionPeak).toFixed(2)}
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-3 text-center font-medium">绿色发展情景</td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {neutralYearGreen === 2100 ? "未实现" : `${neutralYearGreen}年`}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentEmissionGreen.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {currentAbsorption.toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-3 text-center">
                                {calculateCarbonNeutralityDegree(currentAbsorption, currentEmissionGreen).toFixed(2)}
                              </td>
                            </tr>
                          </>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                ← 上一步
              </Button>
              <Button onClick={() => setCurrentStep(6)}>
                下一步 →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 步骤6: 报告撰写 */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>实验报告撰写</CardTitle>
            <CardDescription>自动生成实验报告并添加政策建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 自动生成的报告内容 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">碳中和预测实验报告</h3>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <Label className="text-lg font-semibold">
                      一、实验概述
                    </Label>
                    <Textarea
                      placeholder={`本实验基于STIRPAT模型对${selectedProvince}的碳排放进行预测，结合土地利用类型计算碳吸收量，分析碳中和实现路径。`}
                      value={experimentOverview}
                      onChange={(e) => setExperimentOverview(e.target.value)}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-semibold">
                      二、碳排放预测结果
                    </Label>
                    <Textarea
                      placeholder={`根据STIRPAT模型预测，在当前发展趋势下，${selectedProvince}的碳排放量将在未来${predictionYears}年内呈现${carbonIntensityReduction > 3 ? "快速" : "缓慢"}下降趋势。年均递减率设定为${carbonIntensityReduction}%。`}
                      value={predictionResults}
                      onChange={(e) => setPredictionResults(e.target.value)}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-semibold">
                      三、碳吸收量分析
                    </Label>
                    <Textarea
                      placeholder={`基于土地利用类型和碳吸收系数计算，${selectedProvince}当前碳吸收能力为${predictionData[0]?.absorption.toLocaleString()}万吨/年。其中林地贡献最大，碳吸收系数为3.8096 t·hm²·a⁻¹。`}
                      value={absorptionAnalysis}
                      onChange={(e) => setAbsorptionAnalysis(e.target.value)}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-lg font-semibold">
                      四、碳中和预测
                    </Label>
                    <Textarea
                      placeholder={`综合碳排放和碳吸收预测结果，${selectedProvince}预计在${carbonNeutralYear || "2060年后"}实现碳中和目标。当前净排放量为${predictionData[0]?.netInertial.toLocaleString()}万吨。`}
                      value={carbonNeutralPrediction}
                      onChange={(e) => setCarbonNeutralPrediction(e.target.value)}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold">
                      五、政策建议
                    </Label>
                    <Textarea
                      placeholder="产业结构调整、能源结构优化、技术创新、碳汇建设等方面的具体措施"
                      value={policyAdvice}
                      onChange={(e) => setPolicyAdvice(e.target.value)}
                      className="mt-2 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* 报告操作 */}
              <div className="flex gap-4">
                <Button className="flex items-center gap-2" onClick={downloadReport}>
                  <Download className="h-4 w-4" />
                  下载可打印报告
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>
                ← 上一步
              </Button>
              <Button onClick={() => setCurrentStep(1)}>
                提交实验报告
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 
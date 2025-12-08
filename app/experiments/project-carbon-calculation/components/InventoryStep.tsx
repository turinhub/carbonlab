import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Image as ImageIcon, X, ChevronDown, ChevronUp, Building2, Truck, Calculator, BarChart3, Info, Download, Users, Leaf } from "lucide-react"
import { ExperimentStep } from "./types"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface InventoryStepProps {
  onComplete: () => void
  onNext: (step: ExperimentStep) => void
  onPrevious: (step: ExperimentStep) => void
}

// 静态项目数据
const staticProjectData = {
  name: "健康谷路",
  description: "该项目为某市生态城道路建设工程，道路全长445.617m，红线宽40m，设计速度30km/h，机动车道采用双向四车道建设。健康谷路为兼有有轨电车的道，横断面具体布置为中央12米绿化带（远期有轨电车廊道）+2×7米机动车道+2×1.5米下沉式绿化带+2×2.5米非机动车道+2×3米人行道。有轨电车廊道实施前控制为绿化带。健康谷路全线采用沥青路面，路面总厚度90.6cm，路建结构方案为改性沥青混凝土面层+水泥稳定碎石基层+低剂量水泥稳定碎石底基层。"
}

// 运输距离配置数据
const transportConfig = {
  roadbed: {
    onSiteDistance: 220, // 场内运输运距
    spoilDistance: 21,   // 外弃土方运距
    unit: "米/千米"
  },
  pavement: {
    waterStabilizedDistance: 20, // 水稳运距
    asphaltDistance: 38,         // 沥青运距
    truckCapacity: "30-36吨每车",
    unit: "千米"
  }
}

// 详细的工程量清单数据
const detailedInventory = [
  { 
    id: "1", 
    serialNumber: "1",
    projectCode: "010101",
    projectName: "健康谷路",
    unitProject: "路基工程",
    subProject: "土方工程",
    subItemProject: "挖一般土方",
    projectFeatureDescription: "1.土壤类别：三类土\n2.挖土深度：2m以内\n3.弃土运距：21km",
    material: "材料",
    unit: "m³",
    quantity: 125000, 
    materialName: "土方",
    totalMaterialQuantity: 125000,
    materialUnit: "m³",
    materialCarbonEmissionFactor: 8,
    materialCarbonEmissionUnit: "kg CO2/m³",
    materialCarbonEmission: 1000000,
    transportedMaterial: "土方",
    transportUnit: "m³",
    transportQuantity: 125000,
    materialWeight: 187500,
    transportDistance: 21,
    transportVehicleType: "重型柴油货车运输(载重30t)",
    transportCarbonEmissionFactor: 0.078,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 306.5625,
    totalCarbonEmission: 1000306.56,
    remarks: "弃土运输"
  },
  { 
    id: "2", 
    serialNumber: "2",
    projectCode: "010201",
    projectName: "健康谷路",
    unitProject: "路基工程",
    subProject: "坡面防护及排水沟",
    subItemProject: "排水沟、截水沟",
    projectFeatureDescription: "1.预制排水沟安装，预制块采用C25砼预制，预制块厚度8cm\n2.M7.5水泥砂浆砌缝\n3.5cm砂砾石垫层",
    material: "材料",
    unit: "m³",
    quantity: 155.28,
    materialName: "C25混凝土预制块",
    totalMaterialQuantity: 155.28,
    materialUnit: "m³",
    materialCarbonEmissionFactor: 255,
    materialCarbonEmissionUnit: "kg CO2/m³",
    materialCarbonEmission: 39596.1,
    transportedMaterial: "C25混凝土",
    transportUnit: "m³",
    transportQuantity: 155.28,
    materialWeight: 372.672,
    transportDistance: 10,
    transportVehicleType: "重型柴油货车运输(载重30t)",
    transportCarbonEmissionFactor: 0.078,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 290.68,
    totalCarbonEmission: 39886.78,
    remarks: "预制块运输"
  },
  { 
    id: "3", 
    serialNumber: "3",
    projectCode: "020101",
    projectName: "健康谷路",
    unitProject: "路面工程",
    subProject: "基层",
    subItemProject: "水泥稳定碎石基层",
    projectFeatureDescription: "1.水泥稳定碎石基层，厚度20cm\n2.水泥含量：5%\n3.压实度：≥98%",
    material: "材料",
    unit: "m³",
    quantity: 3562.34,
    materialName: "水泥稳定碎石",
    totalMaterialQuantity: 3562.34,
    materialUnit: "m³",
    materialCarbonEmissionFactor: 180,
    materialCarbonEmissionUnit: "kg CO2/m³",
    materialCarbonEmission: 641221.2,
    transportedMaterial: "水泥稳定碎石",
    transportUnit: "m³",
    transportQuantity: 3562.34,
    materialWeight: 8549.616,
    transportDistance: 20,
    transportVehicleType: "重型柴油货车运输(载重30t)",
    transportCarbonEmissionFactor: 0.078,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 13337.4,
    totalCarbonEmission: 654558.6,
    remarks: "水稳材料运输"
  },
  { 
    id: "4", 
    serialNumber: "4",
    projectCode: "020201",
    projectName: "健康谷路",
    unitProject: "路面工程",
    subProject: "面层",
    subItemProject: "沥青混凝土面层",
    projectFeatureDescription: "1.改性沥青混凝土面层，厚度8cm\n2.沥青含量：4.5%\n3.压实度：≥96%",
    material: "材料",
    unit: "m²",
    quantity: 17811.7,
    materialName: "改性沥青混凝土",
    totalMaterialQuantity: 1424.936,
    materialUnit: "m³",
    materialCarbonEmissionFactor: 450,
    materialCarbonEmissionUnit: "kg CO2/m³",
    materialCarbonEmission: 641221.2,
    transportedMaterial: "改性沥青混凝土",
    transportUnit: "m³",
    transportQuantity: 1424.936,
    materialWeight: 3419.846,
    transportDistance: 38,
    transportVehicleType: "重型柴油货车运输(载重30t)",
    transportCarbonEmissionFactor: 0.078,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 10125.5,
    totalCarbonEmission: 651346.7,
    remarks: "沥青材料运输"
  },
  { 
    id: "5", 
    serialNumber: "5",
    projectCode: "030101",
    projectName: "健康谷路",
    unitProject: "绿化工程",
    subProject: "植被种植",
    subItemProject: "乔木种植",
    projectFeatureDescription: "1.香樟种植，胸径8-10cm\n2.种植密度：6m×6m\n3.养护期：1年",
    material: "材料",
    unit: "株",
    quantity: 128,
    materialName: "香樟",
    totalMaterialQuantity: 128,
    materialUnit: "株",
    materialCarbonEmissionFactor: 344.076,
    materialCarbonEmissionUnit: "kg CO2/株",
    materialCarbonEmission: 44041.73,
    transportedMaterial: "香樟苗木",
    transportUnit: "株",
    transportQuantity: 128,
    materialWeight: 25.6,
    transportDistance: 15,
    transportVehicleType: "中型货车运输(载重10t)",
    transportCarbonEmissionFactor: 0.12,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 46.08,
    totalCarbonEmission: 44087.81,
    remarks: "苗木运输"
  },
  {
    id: "6",
    serialNumber: "6",
    projectCode: "030201",
    projectName: "健康谷路",
    unitProject: "绿化工程",
    subProject: "植被种植",
    subItemProject: "地被植物",
    projectFeatureDescription: "1.地被植物种植，覆盖率≥95%\n2.植物种类：麦冬、鸢尾\n3.种植密度：25株/m²",
    material: "材料",
    unit: "m²",
    quantity: 4614.26,
    materialName: "地被植物",
    totalMaterialQuantity: 4614.26,
    materialUnit: "m²",
    materialCarbonEmissionFactor: 3.4127,
    materialCarbonEmissionUnit: "kg CO2/m²",
    materialCarbonEmission: 15747.09,
    transportedMaterial: "地被植物",
    transportUnit: "m²",
    transportQuantity: 4614.26,
    materialWeight: 461.426,
    transportDistance: 8,
    transportVehicleType: "轻型货车运输(载重5t)",
    transportCarbonEmissionFactor: 0.15,
    transportCarbonEmissionUnit: "kgCO2/t-km",
    transportCarbonEmission: 553.71,
    totalCarbonEmission: 16300.8,
    remarks: "植被运输"
  }
]

export function InventoryStep({
  onComplete,
  onNext,
  onPrevious
}: InventoryStepProps) {
  const [showImage, setShowImage] = useState(false)

  // 计算统计数据
  const totalMaterials = detailedInventory.length
  const totalQuantity = detailedInventory.reduce((sum, item) => sum + item.quantity, 0)
  const totalCarbonEmission = detailedInventory.reduce((sum, item) => sum + item.totalCarbonEmission, 0)

  return (
    <div className="space-y-6">
      {/* 页面标题区域 */}
      <div className="text-center space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">工程清单内容</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          查看项目工程量数据，为后续碳核算计算提供基础数据支撑
        </p>
      </div>

      {/* 项目基本信息 */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
          <CardTitle className="flex items-center text-emerald-800">
            <FileText className="w-5 h-5 mr-2" />
            项目基本信息
          </CardTitle>
          <CardDescription className="text-emerald-700">
            项目概况和建设内容描述
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <span className="font-semibold text-gray-700">项目名称：</span>
                <p className="text-gray-900 mt-1">{staticProjectData.name}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <span className="font-semibold text-gray-700">项目描述：</span>
                <p className="text-gray-900 mt-1 text-sm leading-relaxed">{staticProjectData.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 工程量清单卡片 */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center text-blue-800">
            <BarChart3 className="w-5 h-5 mr-2" />
            清单一：交通基础设施项目工程量清单
          </CardTitle>
          <CardDescription className="text-blue-700">
            项目主要工程量数据和碳排放因子信息
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 font-medium">包含6个主要工程项目的详细数据</span>
            </div>
            <Button 
              onClick={() => {
                const link = document.createElement('a')
                link.href = '/list-1-transport-infrastructure-bq.xlsx'
                link.download = 'list-1-transport-infrastructure-bq.xlsx'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4" />
              下载完整表格
            </Button>
          </div>

          {/* 运输距离配置 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Truck className="w-4 h-4 mr-2" />
              运输距离配置
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 路基工程运输 */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-700 mb-2 text-sm">路基工程运输车运距</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">场内运输运距：</span>
                    <span className="font-mono font-semibold text-blue-800">{transportConfig.roadbed.onSiteDistance}米</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">外弃土方运距：</span>
                    <span className="font-mono font-semibold text-blue-800">{transportConfig.roadbed.spoilDistance}千米</span>
                  </div>
                </div>
              </div>

              {/* 路面工程运输 */}
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <h5 className="font-medium text-blue-700 mb-2 text-sm">路面工程运输车运距</h5>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">水稳运距：</span>
                    <span className="font-mono font-semibold text-blue-800">{transportConfig.pavement.waterStabilizedDistance}千米</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">沥青运距：</span>
                    <span className="font-mono font-semibold text-blue-800">{transportConfig.pavement.asphaltDistance}千米</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600">货车吨位：</span>
                    <span className="font-mono font-semibold text-blue-800">{transportConfig.pavement.truckCapacity}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 表格说明 */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">表格说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• <span className="bg-white px-2 py-1 rounded">白色背景</span>：项目识别与描述信息</li>
                  <li>• <span className="bg-yellow-100 px-2 py-1 rounded">黄色背景</span>：材料与数量信息</li>
                  <li>• <span className="bg-blue-100 px-2 py-1 rounded">蓝色背景</span>：运输详情信息</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr>
                  {/* 第一组：白色背景 - 项目识别与描述 */}
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[60px]">序号</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[100px]">项目编码</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[80px]">单位工程</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[80px]">分部工程</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[80px]">分项工程</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-white min-w-[200px]">项目特征描述</th>
                  
                  {/* 第二组：黄色背景 - 材料与数量信息 */}
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[60px]">材料</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[80px]">计量单位</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[80px]">工程量</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[120px]">材料名称</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[80px]">材料总量</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[60px]">单位</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[100px]">材料碳排放因子</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[80px]">单位</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-yellow-100 min-w-[150px]">碳排放量=材料消耗量*材料碳排放因子</th>
                  
                  {/* 第三组：浅蓝色背景 - 运输详情 */}
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[100px]">运输材料</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[80px]">计量单位</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[80px]">工程量</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[100px]">材料重量(t)</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[100px]">运输距离(KM)</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[180px]">运输汽车类型</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[200px]">运输碳排放因子(运输汽车运输单位重量或体积材料每千米所消耗碳排放量)</th>
                  <th className="border border-gray-300 px-3 py-3 text-center bg-blue-100 min-w-[100px]">单位</th>
                  
                  {/* 第四组：白色背景 - 总碳排放和备注 */}
                </tr>
              </thead>
              <tbody>
                {/* 第1行 - 排水沟、截水沟 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">1</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">040201022<br />001</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">路基工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">坡面防护<br />及排水沟</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">排水沟、截水<br />沟</td>
                  <td className="border border-gray-300 px-3 py-3 text-left text-xs whitespace-pre-line">1.预制排水沟安装,预制块采用C25砼预制,预制块厚度8cm<br />2.M7.5水泥砂浆砌缝<br />3.3.5cm砂砾石垫层</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C25砼预制</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">155.28</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C25砼预制</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">155.28</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">255</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kg CO2/m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">39596.4</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C25混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">155.28</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">372.672</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">40</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">重型柴油货车运输(载重30t)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">0.078</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kgCO2/t·km</td>
                </tr>
                
                {/* 第2行 - 施工便道 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">2</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">040203007<br />005</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">路基工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">施工便道<br />工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">水泥混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-left text-xs whitespace-pre-line">1.混凝土强度等级: C30混凝土<br />2.厚度: 20cm厚<br />3.部位: 施工便道<br />4.含道路切灌缝,养护,防滑条</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C30混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">4206</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">841.2</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">295</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kg CO2e/m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">248154</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C30混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">4206</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">1985.232</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">40</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">重型柴油货车运输(载重30t)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">0.078</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kgCO2/t·km</td>
                </tr>
                
                {/* 第3行 - 保通路 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">3</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">040202015<br />005</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">路基工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">保通路</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">水泥稳定碎<br />(砾)石</td>
                  <td className="border border-gray-300 px-3 py-3 text-left text-xs whitespace-pre-line">1.部位:保通路<br />2.水泥含量:4%<br />3.厚度:20cm<br />4.其他:详施工图设计</td>
                  <td className="border border-gray-300 px-3 py-3 text-center text-xs">水泥(标准号GB/T208-94,如普通硅酸盐水泥密度3.0~3.15g/cm³,普通硅酸盐水泥1.2-1.3吨/立方米)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">546.55</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">普通硅酸盐水泥(市场平均)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">5.4655</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">t</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">735</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kg CO2/t</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">4017.1425</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">水泥</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">546.55</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">5.24688</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">500</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">重型柴油货车运输(载重30t)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">0.078</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kgCO2/t·km</td>
                </tr>
                
                {/* 第4行 - 保通路水泥混凝土 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">4</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">040203007<br />004</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">路基工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">保通路</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">水泥混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-left text-xs whitespace-pre-line">1.混凝土强度等级: C30混凝土<br />2.厚度: 20cm厚<br />3.部位: 保通路<br />4.含切灌缝</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C30混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">501.81</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C30混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">100.362</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">295</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kg CO2/m³</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">29606.79</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">C30混凝土</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">m²</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">501.81</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">236.85432</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">40</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">重型柴油货车运输(载重30t)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">0.078</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">kgCO2/t·km</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 清单二卡片 */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
          <CardTitle className="flex items-center text-purple-800">
            <Users className="w-5 h-5 mr-2" />
            清单二：道路施工进度计划对应人员、机械配置
          </CardTitle>
          <CardDescription className="text-purple-700">
            人员配置、机械使用和碳排放因子数据
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-purple-600 font-medium">包含人员生活碳排放和机械施工碳排放数据</span>
            </div>
            <Button 
              onClick={() => {
                const link = document.createElement('a')
                link.href = '/list-2-road-construction-schedule.xlsx'
                link.download = 'list-2-road-construction-schedule.xlsx'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <Download className="w-4 h-4" />
              下载完整表格
            </Button>
          </div>
          
          {/* 表格说明 */}
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">表格说明：</p>
                <ul className="space-y-1 text-xs">
                  <li>• 包含人员数量、生活碳排放因子、机械类型、柴油消耗、电力消耗等详细信息</li>
                  <li>• 机械碳排放因子基于台班计算，人员碳排放基于工作日计算</li>
                  <li>• 所有数据均来自实际项目案例，具有教学参考价值</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[80px]">序号</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[120px]">分部工程</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[150px]">分项工程</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[120px]">人员数量</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[180px]">生活碳排放因子(kg/人・天)</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[300px]">碳排放量=生活碳排放因子*人员数量*有效工作日（天）</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[250px]">机械</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[100px]">机械名称</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[150px]">柴油</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[350px]">电(kWh) 【0.5810 t/(CO2/MWh)】 1 kWh = 0.001 MWh</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[350px]">机械碳排放因子(机械设备每台班碳排放量) KgCO2/台班</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[350px]">总排放量=机械碳排放因子*有效工作日(天)</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[120px]">有效工作日(天)</th>
                  <th className="border border-gray-300 px-4 py-4 text-center min-w-[120px]">建设施工阶段</th>
                </tr>
              </thead>
              <tbody>
                {/* 第1行 - 管理人员和机械操作手 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center" rowSpan={5}>1.1.1</td>
                  <td className="border border-gray-300 px-3 py-3 text-center" rowSpan={5}>路基工程</td>
                  <td className="border border-gray-300 px-3 py-3 text-center" rowSpan={5}></td>
                  <td className="border border-gray-300 px-3 py-3 text-center" rowSpan={5}>7人</td>
                  <td className="border border-gray-300 px-3 py-3 text-center" rowSpan={5}>
                    <Image
                      src="/worker-carbon-emission-factors.webp"
                      alt="劳动者生活碳排放因子"
                      width={200}
                      height={150}
                      className="w-full h-auto max-w-[200px] mx-auto"
                    />
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono" rowSpan={5}>1562.00</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">挖机两台（型号220一台，160一台）；装载机一台（型号160）；后八轮十台</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">斗容量 1.25m3 履带式单斗挖掘机</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">24908.5</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">100天</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">53279.3</td>
                </tr>
                
                {/* 第2行 - 挖机220 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">挖机一台 (型号220): 型号是220就是22吨级的斗容量在1.1立方左右。</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">斗容量 1.25m3 履带式单斗挖掘机</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">80.35</td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">249.085</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">24908.5</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">100天</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    <Image
                      src="/sinomach-changlin-excavator.webp"
                      alt="国机重工常林挖掘机"
                      width={150}
                      height={100}
                      className="w-full h-auto max-w-[150px] mx-auto"
                    />
                  </td>
                </tr>
                
                {/* 第3行 - 挖机160 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">挖机一台 (型号160): 型号是160就是16吨级的斗容量在0.65立方左右。</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">斗容量 0.6m3 履带式单斗挖掘机</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">37.45</td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">116.095</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">11609.5</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">100天</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    <Image
                      src="/komatsu-excavator.webp"
                      alt="小松挖掘机"
                      width={150}
                      height={100}
                      className="w-full h-auto max-w-[150px] mx-auto"
                    />
                  </td>
                </tr>
                
                {/* 第4行 - 装载机160 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">装载机一台 (型号160)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">斗容量 1.0m3 轮胎式装载机</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">49.03</td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">151.993</td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-mono">15199.3</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">100天</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                    <Image
                      src="/xcmg-loader-specs.webp"
                      alt="徐工轮式装载机参数配置"
                      width={150}
                      height={100}
                      className="w-full h-auto max-w-[150px] mx-auto"
                    />
                  </td>
                </tr>
                
                {/* 第5行 - 后八轮十台 */}
                <tr className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="border border-gray-300 px-3 py-3 text-center">后八轮十台 (30-36吨)</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">装载质量30t以内自卸汽车</td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center"></td>
                  <td className="border border-gray-300 px-3 py-3 text-center">100天</td>
                  <td className="border border-gray-300 px-3 py-3 text-center">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <p className="text-purple-800 text-sm">
              <strong>说明：</strong>以上工程量清单为实验教学数据，基于真实项目案例整理。在实际项目中，工程量清单应根据设计图纸和现场勘察结果进行详细计算。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 图片预览弹窗 */}
      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-4xl">
          <Image
            src="/transport-infrastructure-bq-notes.webp"
            alt="工程量清单备注"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 
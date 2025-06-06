import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Image as ImageIcon, X } from "lucide-react"
import { ExperimentStep } from "./types"
import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface InventoryStepProps {
  onComplete: () => void
  onNext: (step: ExperimentStep) => void
  onPrevious: (step: ExperimentStep) => void
}

// 静态项目数据
const staticProjectData = {
  name: "某市生态城道路建设项目",
  description: "该项目为某市生态城道路建设工程，道路全长445.617m，红线宽40m，设计速度30km/h，机动车道采用双向四车道建设。健康谷路为兼有有轨电车的道，横断面具体布置为中央12米绿化带（远期有轨电车廊道）+2×7米机动车道+2×1.5米下沉式绿化带+2×2.5米非机动车道+2×3米人行道。有轨电车廊道实施前控制为绿化带。健康谷路全线采用沥青路面，路面总厚度90.6cm，路建结构方案为改性沥青混凝土面层+水泥稳定碎石基层+低剂量水泥稳定碎石底基层。"
}

// 静态工程量清单数据
const staticInventory = [
  { 
    id: "1", 
    name: "路基土方开挖", 
    unit: "立方米", 
    quantity: 125000, 
    description: "道路路基开挖土方量，包括表土清理和基础开挖" 
  },
  { 
    id: "2", 
    name: "路面混凝土浇筑", 
    unit: "立方米", 
    quantity: 18500, 
    description: "道路路面C30混凝土浇筑，厚度25cm" 
  },
  { 
    id: "3", 
    name: "钢筋使用", 
    unit: "吨", 
    quantity: 2800, 
    description: "桥梁和结构用HRB400钢筋" 
  },
  { 
    id: "4", 
    name: "沥青路面铺设", 
    unit: "平方米", 
    quantity: 180000, 
    description: "AC-20沥青混凝土路面铺设，厚度8cm" 
  },
  { 
    id: "5", 
    name: "碎石垫层", 
    unit: "立方米", 
    quantity: 45000, 
    description: "路基级配碎石垫层，厚度30cm" 
  }
]

export function InventoryStep({
  onComplete,
  onNext,
  onPrevious
}: InventoryStepProps) {
  const [showImage, setShowImage] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          工程内容清单
        </CardTitle>
        <CardDescription>
          以下为本次实验的工程量清单数据，用于碳核算计算
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 项目基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">项目基本信息</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <span className="font-medium text-gray-700"><strong>项目名称</strong>：</span>
              <span className="text-gray-900">{staticProjectData.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700"><strong>项目描述</strong>：</span>
              <p className="text-gray-900 mt-1">{staticProjectData.description}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* 工程量清单 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">清单一：交通基础设施项目工程量清单</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-center">序号</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">单位工程</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">分部工程</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">分项工程</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">项目特征描述</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">计量单位</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">工程量</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">备注</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">路基工程</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">坡面防护及排水沟</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">排水沟、截水沟</td>
                  <td className="border border-gray-300 px-4 py-2 text-left text-sm">
                    1.预制排水沟安装，预制块采用C25砼预制，预制块厚度8cm<br />
                    2.M7.5水泥砂浆砌缝<br />
                    3.5cm砂砾石垫层
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">m³</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-mono">155.28</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => setShowImage(true)}
                    >
                      <ImageIcon className="w-6 h-6" />
                    </Button>
                    </td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* 清单二：道路施工进度计划对应人员、机械配置 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">清单二：道路施工进度计划对应人员、机械配置</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-center">序号</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">分部工程</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">分项工程</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">人员数量</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">机械</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">有效工作日（天）</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-center">1</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">路基工程</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">-</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">管理人员4人；机械操作手3人</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">挖机两台（型号220一台，160一台）；装载机一台（型号160）；后八轮十台</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">100天</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>说明：</strong>以上工程量清单为实验教学数据，基于真实项目案例整理。在实际项目中，工程量清单应根据设计图纸和现场勘察结果进行详细计算。
            </p>
          </div>
        </div>

        {/* 图片预览弹窗 */}
        <Dialog open={showImage} onOpenChange={setShowImage}>
          <DialogContent className="max-w-4xl">
            <Image
              src="/交通基础设施项目工程量清单备注.webp"
              alt="工程量清单备注"
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
} 
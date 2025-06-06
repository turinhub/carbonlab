import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Download } from "lucide-react"
import { CalculationResults, ExperimentStep } from "./types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line } from "recharts"
import { useRef } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"

interface ReportStepProps {
  projectName: string
  projectDescription: string
  calculationResults: CalculationResults
  onComplete: () => void
  onPrevious: (step: ExperimentStep) => void
  onDownloadReport: () => void
}

export function ReportStep({
  projectName,
  projectDescription,
  calculationResults,
  onComplete,
  onPrevious,
  onDownloadReport
}: ReportStepProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return

    try {
      toast.loading("正在生成报告...")
      
      // 创建 PDF 文档
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // 获取报告内容
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      })
      
      // 将 canvas 转换为图片
      const imgData = canvas.toDataURL("image/png")
      
      // 计算图片尺寸
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // 计算需要的页数
      const pageCount = Math.ceil(imgHeight / pageHeight)
      
      // 添加图片到 PDF，分页处理
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        const position = -i * pageHeight
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      }
      
      // 下载 PDF
      pdf.save(`碳核算实验报告_${projectName || "未命名项目"}.pdf`)
      
      toast.success("报告下载成功")
    } catch (error) {
      console.error("生成 PDF 失败:", error)
      toast.error("生成报告失败，请重试")
    }
  }

  // 准备饼图数据
  const scopeData = [
    {
      name: "范围一",
      value: calculationResults.scope1,
      description: "直接排放",
      color: "#ef4444"
    },
    {
      name: "范围二", 
      value: calculationResults.scope2,
      description: "间接排放-电力",
      color: "#eab308"
    },
    {
      name: "范围三",
      value: calculationResults.scope3, 
      description: "其他间接排放",
      color: "#3b82f6"
    }
  ].filter(item => item.value > 0) // 过滤掉值为0的项

  // 自定义饼图标签
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // 小于5%不显示标签
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          实验报告
        </CardTitle>
        <CardDescription>
          查看完整的碳核算分析报告和减排建议
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" ref={reportRef}>
        {/* 项目概况 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">项目概况</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p><strong>项目名称</strong>：{projectName || "未填写"}</p>
            <p><strong>项目描述</strong>：{projectDescription || "未填写"}</p>
            <p><strong>核算日期</strong>：{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* 碳排放结果分析 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">碳排放结果分析</h3>
          
          {/* 排放范围饼图 */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">排放范围分布</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 饼图 */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scopeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {scopeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} kg CO₂e`, ""]}
                      labelFormatter={(label) => {
                        const item = scopeData.find(d => d.name === label)
                        return `${label} (${item?.description})`
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        const item = scopeData.find(d => d.name === value)
                        return `${value} - ${item?.description}`
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* 数据统计 */}
              <div className="space-y-4">
                <div className="space-y-3">
                  {scopeData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{item.value} kg CO₂e</div>
                        <div className="text-sm text-gray-600">
                          {((item.value / calculationResults.total) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 总计 */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold">
                    <span>总计</span>
                    <span>{calculationResults.total} kg CO₂e</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 各类别排放量和排放结构分析 */}
          <div className="mb-8">
            <h3 className="text-md font-medium mb-4">各类别排放量和排放结构分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 饼图 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-md font-medium mb-3 text-gray-700">排放结构分布</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "材料生产", value: Math.abs(calculationResults.materials), color: "#0ea5e9" },
                          { name: "材料运输", value: Math.abs(calculationResults.transport), color: "#b45309" },
                          { name: "施工建设", value: Math.abs(calculationResults.construction), color: "#ea580c" },
                          { name: "竣工交付", value: Math.abs(calculationResults.completion), color: "#9333ea" }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "材料生产", value: Math.abs(calculationResults.materials), color: "#0ea5e9" },
                          { name: "材料运输", value: Math.abs(calculationResults.transport), color: "#b45309" },
                          { name: "施工建设", value: Math.abs(calculationResults.construction), color: "#ea580c" },
                          { name: "竣工交付", value: Math.abs(calculationResults.completion), color: "#9333ea" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} kg CO₂e`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                  </div>

              {/* 分栏展示图 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h4 className="text-md font-medium mb-3 text-gray-700">排放量分布</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { name: "材料生产", value: Math.abs(calculationResults.materials), color: "#0ea5e9" },
                        { name: "材料运输", value: Math.abs(calculationResults.transport), color: "#b45309" },
                        { name: "施工建设", value: Math.abs(calculationResults.construction), color: "#ea580c" },
                        { name: "竣工交付", value: Math.abs(calculationResults.completion), color: "#9333ea" }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} kg CO₂e`, ""]}
                        labelFormatter={(label) => label}
                        separator=""
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: "#8884d8", strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: "#8884d8" }}
                      >
                        {[
                          { name: "材料生产", value: Math.abs(calculationResults.materials), color: "#0ea5e9" },
                          { name: "材料运输", value: Math.abs(calculationResults.transport), color: "#b45309" },
                          { name: "施工建设", value: Math.abs(calculationResults.construction), color: "#ea580c" },
                          { name: "竣工交付", value: Math.abs(calculationResults.completion), color: "#9333ea" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 减排建议 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">减排建议</h3>
          
          {/* 按排放范围的减排建议 */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">按排放范围的减排策略</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg">
                <h5 className="font-medium mb-2 text-red-700">范围一减排 (直接排放)</h5>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 使用新能源施工设备</li>
                  <li>• 提高燃料使用效率</li>
                  <li>• 定期维护设备，减少排放</li>
                  <li>• 优化施工工艺流程</li>
                </ul>
              </div>
              <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg">
                <h5 className="font-medium mb-2 text-yellow-700">范围二减排 (间接排放-电力)</h5>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 采购绿色电力</li>
                  <li>• 安装太阳能发电设备</li>
                  <li>• 提高用电设备能效</li>
                  <li>• 实施智能用电管理</li>
                </ul>
              </div>
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                <h5 className="font-medium mb-2 text-blue-700">范围三减排 (其他间接排放)</h5>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• 选择低碳建材供应商</li>
                  <li>• 优化供应链运输</li>
                  <li>• 推广绿色出行方式</li>
                  <li>• 加强废料回收利用</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 具体措施建议 */}
          <div>
            <h4 className="font-medium mb-3">具体实施措施</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">材料优化</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 选择低碳水泥和混凝土</li>
                  <li>• 提高钢材回收利用率</li>
                  <li>• 使用再生骨料替代天然骨料</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">施工优化</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 优化施工工艺，提高效率</li>
                  <li>• 使用新能源施工设备</li>
                  <li>• 合理安排施工计划，减少怠速</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">能源管理</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 使用清洁能源供电</li>
                  <li>• 提高设备能效水平</li>
                  <li>• 实施能源监测管理</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">运输优化</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• 就近采购材料，减少运输距离</li>
                  <li>• 优化运输路线和装载率</li>
                  <li>• 推广新能源运输车辆</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            下载报告
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 
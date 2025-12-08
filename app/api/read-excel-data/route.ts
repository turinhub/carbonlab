import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'carbon-neutrality-prediction-data.xlsx')
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 })
    }

    const fileBuffer = readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 获取单元格范围
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    // 读取所有数据
    const processedData = []
    for (let row = range.s.r + 1; row <= range.e.r; row++) { // 跳过标题行
      const rowData: any = {}
      
      // 年份 (A列)
      const yearCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 0 })]
      rowData['年份'] = yearCell ? yearCell.v : null
      
      // 省份 (B列)
      const provinceCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 1 })]
      rowData['省份'] = provinceCell ? provinceCell.v : null
      
      // 耕地面积 (C列)
      const farmlandCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 2 })]
      rowData['farmland'] = farmlandCell ? farmlandCell.v : null
      
      // 林地面积 (D列)
      const forestlandCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 3 })]
      rowData['forestland'] = forestlandCell ? forestlandCell.v : null
      
      // 草地面积 (E列)
      const grasslandCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })]
      rowData['grassland'] = grasslandCell ? grasslandCell.v : null
      
      // 城市绿地面积 (F列)
      const urbanGreenCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })]
      rowData['urbanGreen'] = urbanGreenCell ? urbanGreenCell.v : null
      
      // CO2排放量 (G列)
      const emissionCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 6 })]
      rowData['co2Emission'] = emissionCell ? emissionCell.v : null
      
      // 常住人口 (H列)
      const populationCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 7 })]
      rowData['population'] = populationCell ? populationCell.v : null
      
      // 城镇人口 (I列)
      const urbanPopulationCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 8 })]
      rowData['urbanPopulation'] = urbanPopulationCell ? urbanPopulationCell.v : null
      
      // 城镇化率 (J列)
      const urbanizationCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 9 })]
      rowData['urbanizationRate'] = urbanizationCell ? urbanizationCell.v : null
      
      // 人均GDP (K列)
      const perCapitaGDPCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 10 })]
      rowData['perCapitaGDP'] = perCapitaGDPCell ? perCapitaGDPCell.v : null
      
      // 碳排放强度 (L列)
      const carbonIntensityCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 11 })]
      rowData['carbonIntensity'] = carbonIntensityCell ? carbonIntensityCell.v : null
      
      // 能源强度 (M列)
      const energyIntensityCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 12 })]
      rowData['energyIntensity'] = energyIntensityCell ? energyIntensityCell.v : null
      
      // 总能耗 (N列)
      const energyConsumptionCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 13 })]
      rowData['energyConsumption'] = energyConsumptionCell ? energyConsumptionCell.v : null
      
      // 煤炭消耗量 (O列)
      const coalConsumptionCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 14 })]
      rowData['coalConsumption'] = coalConsumptionCell ? coalConsumptionCell.v : null
      
      // GDP (P列)
      const gdpCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 15 })]
      rowData['gdp'] = gdpCell ? gdpCell.v : null
      
      // 第二产业增加值占GDP比重 (Q列)
      const secondaryIndustryCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 16 })]
      rowData['secondaryIndustryRatio'] = secondaryIndustryCell ? secondaryIndustryCell.v : null
      
      processedData.push(rowData)
    }

    return NextResponse.json({ 
      success: true, 
      data: processedData,
      totalRows: processedData.length,
      years: [...new Set(processedData.map(item => item['年份']))].sort(),
      provinces: [...new Set(processedData.map(item => item['省份']))].filter(Boolean).sort()
    })
    
  } catch (error) {
    console.error('读取Excel文件失败:', error)
    return NextResponse.json({ error: '读取文件失败', details: error }, { status: 500 })
  }
} 
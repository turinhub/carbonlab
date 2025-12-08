import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // 检查文件是否存在
    const filePath = join(process.cwd(), 'public', 'carbon-neutrality-prediction-data.xlsx')
    console.log('文件路径:', filePath)
    
    if (!existsSync(filePath)) {
      console.error('文件不存在:', filePath)
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      )
    }
    
    // 使用Buffer方式读取Excel文件
    const fileBuffer = readFileSync(filePath)
    const workbook = XLSX.read(fileBuffer)
    console.log('成功读取Excel文件，Sheet数量:', workbook.SheetNames.length)
    
    // 获取所有sheet的数据
    const sheets: Record<string, any[]> = {}
    workbook.SheetNames.forEach((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      sheets[sheetName] = jsonData as any[]
    })
    
    // 返回JSON数据
    return NextResponse.json({
      success: true,
      data: sheets,
      sheetNames: workbook.SheetNames
    })
  } catch (error) {
    console.error('读取Excel文件失败:', error)
    return NextResponse.json(
      { success: false, error: `读取文件失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('收到POST请求')
    
    // 检查文件是否存在
    const filePath = join(process.cwd(), 'public', 'carbon-neutrality-prediction-data.xlsx')
    console.log('下载文件路径:', filePath)
    
    if (!existsSync(filePath)) {
      console.error('文件不存在:', filePath)
      return NextResponse.json(
        { success: false, error: '文件不存在' },
        { status: 404 }
      )
    }
    
    // 读取Excel文件
    const fileBuffer = readFileSync(filePath)
    console.log('文件大小:', fileBuffer.length, 'bytes')
    
    // 直接返回原始Excel文件，不进行格式转换
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="carbon-neutrality-prediction-data.xlsx"'
      }
    })
  } catch (error) {
    console.error('下载文件失败:', error)
    return NextResponse.json(
      { success: false, error: `下载文件失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    )
  }
} 
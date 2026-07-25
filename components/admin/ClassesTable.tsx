"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { MoreHorizontal, Search, Plus, Edit, Trash2, Calendar, FileText, Eye } from "lucide-react"
import {
  Class,
  ClassesResponse,
  CreateClassRequest,
  getClasses,
  createClass,
  deleteClass
} from "@/lib/api/classes"
import { CreateClassDialog } from "./CreateClassDialog"

interface ClassesTableProps {
  onCreateClass: () => void
}

export function ClassesTable({ onCreateClass }: ClassesTableProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalClasses, setTotalClasses] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await getClasses({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined
      })

      console.log('获取到的班级数据:', response.content)
      setClasses(response.content)
      setTotalClasses(response.total)
    } catch (error) {
      console.error('获取班级列表失败:', error)
      toast.error('获取班级列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClasses()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, currentPage])

  const handleCreateClass = async (classData: CreateClassRequest) => {
    try {
      await createClass(classData)
      toast.success('班级创建成功')
      setCreateDialogOpen(false)
      fetchClasses()
    } catch (error) {
      console.error('创建班级失败:', error)
      toast.error('创建班级失败')
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('确定要删除这个班级吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteClass(classId)
      toast.success('班级删除成功')
      fetchClasses()
    } catch (error) {
      console.error('删除班级失败:', error)
      toast.error('删除班级失败')
    }
  }

  const handleViewClass = (classId: string) => {
    window.location.href = `/admin/classes/${classId}`
  }

  const filteredClasses = classes.filter(cls => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      cls.name.toLowerCase().includes(searchLower) ||
      cls.description?.toLowerCase().includes(searchLower) ||
      cls.grade.includes(searchTerm)
    )
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>班级管理</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加班级
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索班级..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>班级名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>成员数</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>备注</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? '未找到匹配的班级' : '暂无班级数据'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.groupId}>
                    <TableCell>
                      <div className="font-medium">{cls.name}</div>
                    </TableCell>
                    <TableCell>{cls.description || "-"}</TableCell>
                    <TableCell>{cls.students?.length || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(cls.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        {cls.remark || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClass(cls.groupId)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/classes/${cls.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClass(cls.groupId)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalClasses > pageSize && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              显示 {(currentPage * pageSize) + 1} 到 {Math.min((currentPage + 1) * pageSize, totalClasses)} 条，共 {totalClasses} 条
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalClasses / pageSize) - 1}
              >
                下一页
              </Button>
            </div>
          </div>
        )}

        <CreateClassDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateClass}
        />
      </CardContent>
    </Card>
  )
}
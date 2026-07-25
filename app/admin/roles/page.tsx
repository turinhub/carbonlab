"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, Shield, Users, Calendar } from 'lucide-react'
import { getRoles, createRole, updateRole, deleteRole } from '@/lib/api/roles'
import { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/tale'

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalRoles, setTotalRoles] = useState(0)
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // 表单状态
  const [createForm, setCreateForm] = useState<CreateRoleRequest>({
    role_name: '',
    role_type: '',
    remark: ''
  })

  const [editForm, setEditForm] = useState<UpdateRoleRequest>({
    role_name: '',
    role_type: '',
    remark: ''
  })

  // 角色类型选项
  const roleTypes = [
    { value: 'admin', label: '管理员' },
    { value: 'teacher', label: '教师' },
    { value: 'student', label: '学生' },
    { value: 'guest', label: '访客' }
  ]

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await getRoles({
        page: currentPage,
        size: pageSize
      })
      
      setRoles(response.data.content)
      setTotalRoles(response.data.total)
    } catch (error) {
      console.error('获取角色列表失败:', error)
      toast.error('获取角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [currentPage])

  // 处理创建角色
  const handleCreateRole = async () => {
    try {
      if (!createForm.role_name.trim()) {
        toast.error('角色名称不能为空')
        return
      }

      if (!createForm.role_type) {
        toast.error('请选择角色类型')
        return
      }

      await createRole(createForm)
      toast.success('角色创建成功')
      setCreateDialogOpen(false)
      setCreateForm({ role_name: '', role_type: '', remark: '' })
      fetchRoles()
    } catch (error) {
      console.error('创建角色失败:', error)
      toast.error('创建角色失败')
    }
  }

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setEditForm({
      role_name: role.role_name,
      role_type: role.role_type,
      remark: role.remark || ''
    })
    setEditDialogOpen(true)
  }

  // 处理保存角色编辑
  const handleSaveRoleEdit = async () => {
    if (!selectedRole) return

    try {
      if (!editForm.role_name.trim()) {
        toast.error('角色名称不能为空')
        return
      }

      if (!editForm.role_type) {
        toast.error('请选择角色类型')
        return
      }

      await updateRole(selectedRole.role_id, editForm)
      toast.success('角色更新成功')
      setEditDialogOpen(false)
      fetchRoles()
    } catch (error) {
      console.error('更新角色失败:', error)
      toast.error('更新角色失败')
    }
  }

  // 处理删除角色
  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`确定要删除角色"${roleName}"吗？此操作不可恢复。`)) {
      return
    }

    try {
      await deleteRole(roleId)
      toast.success('角色删除成功')
      fetchRoles()
    } catch (error) {
      console.error('删除角色失败:', error)
      toast.error('删除角色失败')
    }
  }

  // 获取角色类型标签
  const getRoleTypeLabel = (type: string) => {
    const roleType = roleTypes.find(rt => rt.value === type)
    return roleType ? roleType.label : type
  }

  // 获取角色类型颜色
  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'teacher':
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      case 'guest':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 开发模式权限提示 */}
      <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-sm text-orange-700 font-medium">
            开发模式：权限检查已临时禁用
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">角色管理</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              创建角色
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新角色</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="role_name">角色名称 *</Label>
                <Input
                  id="role_name"
                  value={createForm.role_name}
                  onChange={(e) => setCreateForm({ ...createForm, role_name: e.target.value })}
                  placeholder="请输入角色名称"
                />
              </div>
              <div>
                <Label htmlFor="role_type">角色类型 *</Label>
                <Select value={createForm.role_type} onValueChange={(value) => setCreateForm({ ...createForm, role_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择角色类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="remark">备注</Label>
                <Textarea
                  id="remark"
                  value={createForm.remark}
                  onChange={(e) => setCreateForm({ ...createForm, remark: e.target.value })}
                  placeholder="请输入备注信息"
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateRole} className="w-full">
                创建角色
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索角色..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 角色列表 */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : roles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">暂无角色数据</p>
            </CardContent>
          </Card>
        ) : (
          roles
            .filter(role => 
              !searchTerm || 
              role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              role.role_type.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((role) => (
              <Card key={role.role_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{role.role_name}</h3>
                          <Badge className={getRoleTypeColor(role.role_type)}>
                            {getRoleTypeLabel(role.role_type)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>权限: {role.role_privileges?.length || 0}</span>
                          </div>
                          {role.remark && (
                            <p className="text-sm text-gray-600">{role.remark}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.role_id, role.role_name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* 分页 */}
      {totalRoles > pageSize && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              上一页
            </Button>
            <span className="flex items-center px-4">
              {currentPage + 1} / {Math.ceil(totalRoles / pageSize)}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalRoles / pageSize) - 1}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 编辑角色对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑角色 - {selectedRole?.role_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_role_name">角色名称 *</Label>
              <Input
                id="edit_role_name"
                value={editForm.role_name}
                onChange={(e) => setEditForm({ ...editForm, role_name: e.target.value })}
                placeholder="请输入角色名称"
              />
            </div>
            <div>
              <Label htmlFor="edit_role_type">角色类型 *</Label>
              <Select value={editForm.role_type} onValueChange={(value) => setEditForm({ ...editForm, role_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择角色类型" />
                </SelectTrigger>
                <SelectContent>
                  {roleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit_remark">备注</Label>
              <Textarea
                id="edit_remark"
                value={editForm.remark}
                onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
                placeholder="请输入备注信息"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveRoleEdit}>
                保存更改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

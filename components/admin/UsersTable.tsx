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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { MoreHorizontal, Search, Plus, Edit, Trash2, User as UserIcon } from "lucide-react"
import { AppUser, CreateUserRequest } from "@/types/tale"
import { Role } from "@/types/tale"
import { getUsers, createUser, deleteUser, getUserDetail, saveUserRoles } from "@/lib/api/users"
import { getRoles } from "@/lib/api/roles"
import { CreateUserDialog } from "./CreateUserDialog"
import { EditUserDialog } from "./EditUserDialog"

interface UsersTableProps {
  onCreateUser: () => void
}

export function UsersTable({ onCreateUser }: UsersTableProps) {
  const [users, setUsers] = useState<AppUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined
      })

      console.log('获取到的用户数据:', response.content)
      setUsers(response.content)
      setTotalUsers(response.total)
    } catch (error) {
      console.error('获取用户列表失败:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await getRoles({
        page: 0,
        size: 100
      })

      setRoles(response.data.content)
    } catch (error) {
      console.error('获取角色列表失败:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const handleCreateUser = async (userData: CreateUserRequest & { role_ids: string[] }) => {
    try {
      const createdUser = await createUser(userData)

      // 如果选择了角色，则为新用户分配角色
      if (userData.role_ids.length > 0) {
        try {
          await saveUserRoles(createdUser.user.user_id, { role_ids: userData.role_ids })
          toast.success('用户创建成功并已分配角色')
        } catch (roleError) {
          console.error('分配角色失败:', roleError)
          toast.error('用户创建成功，但分配角色失败')
        }
      } else {
        toast.success('用户创建成功')
      }

      setCreateDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('创建用户失败:', error)
      toast.error('创建用户失败')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteUser(userId)
      toast.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除用户失败')
    }
  }

  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleSaveUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      await saveUserRoles(userId, { role_ids: roleIds })
      toast.success('用户角色保存成功')
      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('保存用户角色失败:', error)
      toast.error('保存用户角色失败')
    }
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      (user.user?.username && user.user.username.toLowerCase().includes(searchLower)) ||
      (user.user?.phone && user.user.phone.includes(searchTerm))
    )
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>用户管理</CardTitle>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加用户
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
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
                <TableHead>用户</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    暂无用户数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user?.user_id || Math.random()}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(user.user?.username || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.user?.username || '未知用户'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.user_roles?.map((role: any) => (
                          <Badge key={role.role_id} variant="secondary" className="text-xs">
                            {role.role_name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{user.user?.phone || "-"}</TableCell>
                    <TableCell>
                      {user.user?.registered_at ? new Date(user.user.registered_at).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${user.user?.user_id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.user?.user_id || '')}
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

        {totalUsers > pageSize && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              显示 {(currentPage * pageSize) + 1} 到 {Math.min((currentPage + 1) * pageSize, totalUsers)} 条，共 {totalUsers} 条
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
                disabled={currentPage >= Math.ceil(totalUsers / pageSize) - 1}
              >
                下一页
              </Button>
            </div>
          </div>
        )}

        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateUser}
          roles={roles}
        />

        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          roles={roles}
          onSave={handleSaveUserRoles}
        />
      </CardContent>
    </Card>
  )
}
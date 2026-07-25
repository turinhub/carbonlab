"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Shield, Settings, Key, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { getUserDetail, saveUserRoles, removeUserRole, updateUserPassword, deleteUser } from '@/lib/api/users'
import { getRoles } from '@/lib/api/roles'
import { AppUser, Role, UserRole } from '@/types/tale'

interface UserDetail {
  id: string
  username: string
  nickName: string
  phone: string
  email: string
  avatar: string
  status: string
  registeredAt: string
  lastLogin: string
  roles: string[]
  bio: string
  department: string
  position: string
}

interface BasicInfoForm {
  username: string
  nickname: string
  phone: string
  email: string
  bio: string
}

interface RoleInfoForm {
  roles: string[]
}

interface PasswordInfoForm {
  newPassword: string
  confirmPassword: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('basic')
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [rolesLoading, setRolesLoading] = useState(false)

  const [basicInfo, setBasicInfo] = useState<BasicInfoForm>({
    username: '',
    nickname: '',
    phone: '',
    email: '',
    bio: ''
  })

  const [roleInfo, setRoleInfo] = useState<RoleInfoForm>({
    roles: []
  })

  const [passwordInfo, setPasswordInfo] = useState<PasswordInfoForm>({
    newPassword: '',
    confirmPassword: ''
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')

  const loadUserDetail = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getUserDetail(userId)

      if (response.code !== 200 || !response.data) {
        throw new Error(response.msg || '获取用户详情失败')
      }

      const transformedUser: UserDetail = {
        id: response.data.user.user_id,
        username: response.data.user.username || '',
        nickName: response.data.user.nick_name || '',
        phone: response.data.user.phone || '',
        email: '',
        avatar: (response.data.user.username || response.data.user.nick_name || '用').charAt(0).toUpperCase(),
        status: '活跃',
        registeredAt: new Date(response.data.user.registered_at).toLocaleDateString(),
        lastLogin: '',
        roles: (response.data.user_roles || []).map((userRole: UserRole) => userRole.role_name).filter(Boolean),
        bio: response.data.user.remark || '',
        department: '',
        position: ''
      }

      setUserDetail(transformedUser)
      setBasicInfo({
        username: transformedUser.username,
        nickname: transformedUser.nickName,
        phone: transformedUser.phone,
        email: transformedUser.email,
        bio: transformedUser.bio
      })
      setRoleInfo({
        roles: transformedUser.roles
      })
    } catch (error) {
      console.error('Failed to load user detail:', error)
      toast.error('加载用户详情失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true)
      const response = await getRoles({
        page: 0,
        size: 100
      })

      setAvailableRoles(response.data.content || [])
    } catch (error) {
      console.error('Failed to load roles:', error)
      toast.error('加载角色数据失败，请稍后重试')
    } finally {
      setRolesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadUserDetail()
      loadRoles()
    }
  }, [userId, loadUserDetail, loadRoles])

  const handleSaveBasicInfo = async () => {
    try {
      setLoading(true)
      // 这里应该调用更新用户信息的API
      // await updateUser(userId, basicInfo)

      setUserDetail(prev => prev ? { ...prev, ...basicInfo } : null)
      setIsEditMode(false)
      toast.success('基础信息保存成功')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRole = async (roleName: string) => {
    if (!userDetail) return

    const isCurrentlyAssigned = roleInfo.roles.includes(roleName)
    const newRoles = isCurrentlyAssigned
      ? roleInfo.roles.filter(r => r !== roleName)
      : [...roleInfo.roles, roleName]

    try {
      setLoading(true)

      const role = availableRoles.find(r => r.role_name === roleName)
      if (!role) {
        toast.error('未找到要操作的角色')
        return
      }

      if (isCurrentlyAssigned) {
        // 移除角色
        await removeUserRole(userId, { role_ids: [role.role_id] })
        toast.success(`已移除角色：${roleName}`)
      } else {
        // 添加角色
        await saveUserRoles(userId, { role_ids: [role.role_id] })
        toast.success(`已添加角色：${roleName}`)
      }

      setRoleInfo({ roles: newRoles })
      setUserDetail(prev => prev ? { ...prev, roles: newRoles } : null)
    } catch (error) {
      console.error('Role toggle error:', error)
      toast.error('操作角色失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordInfo.newPassword || !passwordInfo.confirmPassword) {
      toast.error('请填写新密码和确认密码')
      return
    }

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (passwordInfo.newPassword.length < 6) {
      toast.error('密码长度至少为6位')
      return
    }

    try {
      setLoading(true)
      await updateUserPassword({
        user_id: userId,
        password_encrypted: passwordInfo.newPassword
      })

      toast.success('密码更新成功')
      setPasswordInfo({ newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Update password error:', error)
      toast.error('密码更新失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (confirmUsername !== userDetail?.username) {
      toast.error('输入的用户名不匹配')
      return
    }

    setDeleteLoading(true)
    try {
      await deleteUser(userId)
      toast.success('用户删除成功')
      router.push('/admin/users')
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除用户失败，请稍后重试')
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
      setConfirmUsername('')
    }
  }

  if (loading && !userDetail) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg'>加载中...</div>
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-lg text-red-600'>用户不存在或加载失败</div>
      </div>
    )
  }

  return (
    <div className='flex-1 space-y-6 p-8 pt-6'>
      {/* 头部导航 */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          返回
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>用户详情</h1>
          <p className='text-gray-600'>管理用户的基础信息和权限设置</p>
        </div>
      </div>

      {/* 用户概览卡片 */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback className='text-lg'>
                {userDetail.avatar}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-semibold'>{userDetail.username}</h2>
                <Badge variant={userDetail.status === '活跃' ? 'default' : 'secondary'}>
                  {userDetail.status}
                </Badge>
              </div>
              <p className='text-gray-600'>用户ID: {userDetail.id}</p>
              <div className='flex gap-4 text-sm text-gray-500 mt-1'>
                <span>注册时间: {userDetail.registeredAt}</span>
                {userDetail.lastLogin && <span>最后登录: {userDetail.lastLogin}</span>}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 详情标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='basic' className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            基础信息
          </TabsTrigger>
          <TabsTrigger value='roles' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            角色权限
          </TabsTrigger>
          <TabsTrigger value='settings' className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            账户设置
          </TabsTrigger>
        </TabsList>

        {/* 基础信息标签页 */}
        <TabsContent value='basic'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>基础信息</CardTitle>
                {!isEditMode ? (
                  <Button onClick={() => setIsEditMode(true)} className='flex items-center gap-2'>
                    <Edit className='h-4 w-4' />
                    编辑
                  </Button>
                ) : (
                  <div className='flex gap-2'>
                    <Button variant='outline' onClick={() => setIsEditMode(false)} className='flex items-center gap-2'>
                      <X className='h-4 w-4' />
                      取消
                    </Button>
                    <Button onClick={handleSaveBasicInfo} disabled={loading} className='flex items-center gap-2'>
                      <Save className='h-4 w-4' />
                      保存
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>用户名</Label>
                  {isEditMode ? (
                    <Input
                      value={basicInfo.username}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, username: e.target.value }))}
                    />
                  ) : (
                    <p className='p-2 bg-gray-50 rounded'>{userDetail.username}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label>昵称</Label>
                  {isEditMode ? (
                    <Input
                      value={basicInfo.nickname}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, nickname: e.target.value }))}
                    />
                  ) : (
                    <p className='p-2 bg-gray-50 rounded'>{userDetail.nickName || '-'}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label>手机号</Label>
                  {isEditMode ? (
                    <Input
                      value={basicInfo.phone}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className='p-2 bg-gray-50 rounded'>{userDetail.phone || '-'}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label>邮箱</Label>
                  {isEditMode ? (
                    <Input
                      value={basicInfo.email}
                      onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className='p-2 bg-gray-50 rounded'>{userDetail.email || '-'}</p>
                  )}
                </div>
              </div>
              <div className='space-y-2'>
                <Label>个人简介</Label>
                {isEditMode ? (
                  <Textarea
                    value={basicInfo.bio}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className='p-2 bg-gray-50 rounded min-h-[60px]'>{userDetail.bio || '-'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 角色权限标签页 */}
        <TabsContent value='roles'>
          <Card>
            <CardHeader>
              <CardTitle>角色权限</CardTitle>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <div className='text-center py-8'>加载角色数据中...</div>
              ) : (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {availableRoles.map((role) => (
                      <div key={role.role_id} className='flex items-center space-x-2 p-3 border rounded-lg'>
                        <Checkbox
                          id={`role-${role.role_id}`}
                          checked={roleInfo.roles.includes(role.role_name)}
                          onCheckedChange={() => handleToggleRole(role.role_name)}
                          disabled={loading}
                        />
                        <div className='flex-1'>
                          <Label htmlFor={`role-${role.role_id}`} className='text-sm font-medium'>
                            {role.role_name}
                          </Label>
                          <p className='text-xs text-gray-500'>{role.role_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {availableRoles.length === 0 && (
                    <div className='text-center py-8 text-gray-500'>
                      暂无可用角色
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账户设置标签页 */}
        <TabsContent value='settings'>
          <div className='space-y-6'>
            {/* 密码修改 */}
            <Card>
              <CardHeader>
                <CardTitle>修改密码</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>新密码</Label>
                    <Input
                      type='password'
                      value={passwordInfo.newPassword}
                      onChange={(e) => setPasswordInfo(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder='请输入新密码'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>确认密码</Label>
                    <Input
                      type='password'
                      value={passwordInfo.confirmPassword}
                      onChange={(e) => setPasswordInfo(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder='请再次输入新密码'
                    />
                  </div>
                </div>
                <Button onClick={handleUpdatePassword} disabled={loading}>
                  更新密码
                </Button>
              </CardContent>
            </Card>

            {/* 危险操作 */}
            <Card>
              <CardHeader>
                <CardTitle className='text-red-600'>危险操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2'>删除用户账户</h4>
                    <p className='text-sm text-gray-600 mb-4'>
                      删除用户账户将永久移除该用户的所有数据，此操作无法撤销。
                    </p>
                    <Button
                      variant='destructive'
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      删除用户账户
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 删除用户确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除用户账户</DialogTitle>
            <DialogDescription>
              此操作无法撤销。请输入用户名「{userDetail.username}」来确认删除。
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='confirmUsername'>请输入用户名确认</Label>
              <Input
                id='confirmUsername'
                placeholder='输入用户名'
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setShowDeleteDialog(false)
                setConfirmUsername('')
              }}
              disabled={deleteLoading}
            >
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteUser}
              disabled={deleteLoading || confirmUsername !== userDetail.username}
            >
              {deleteLoading ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Home,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Key,
  MessageSquare,
  Phone,
  FileText,
  FlaskConical
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AvatarUpload } from '@/components/ui/avatar-upload'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getUsers, createUser, deleteUser, getUserDetail, saveUserRoles } from '@/lib/api/users'
import { getRoles, createRole, updateRole, deleteRole, updateRolePermissions } from '@/lib/api/roles'
import { getAppTokens } from '@/lib/api/app-tokens'
import { getSmsRecords, resendSms, deleteSmsRecord, getSmsRecordDetail } from '@/lib/api/sms'
import { AppUser, CreateUserRequest } from '@/lib/types/tale'
import { Role, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/tale'
import { SmsRecord } from '@/lib/types/tale'

// 本地定义UI使用的用户类型（扁平化结构）
interface DashboardUser {
  user_id: string;
  username: string;
  phone: string | null;
  email: string | null;
  registered_at: string;
  roles: any[];
  status: string;
  avatar_url: string | null;
  [key: string]: any; // 允许其他属性
}

export default function DashboardHomePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useUserStore()
  const [activeMenu, setActiveMenu] = useState('overview')

  // 修改密码相关状态
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 头像管理相关状态
  const [showAvatarForm, setShowAvatarForm] = useState(false)



  // 用户管理相关状态
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [userLoading, setUserLoading] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [userCurrentPage, setUserCurrentPage] = useState(0)
  const [userPageSize] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // 用户管理对话框状态
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<DashboardUser | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  
  // 用户管理表单状态
  const [createUserForm, setCreateUserForm] = useState<CreateUserRequest>({
    username: '',
    phone: '',
    password_encrypted: ''
  })

  // 角色管理相关状态
  const [roleLoading, setRoleLoading] = useState(false)
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  const [roleCurrentPage, setRoleCurrentPage] = useState(0)
  const [rolePageSize] = useState(10)
  const [totalRoles, setTotalRoles] = useState(0)
  
  // 角色管理对话框状态
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false)
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null)
  
  // 角色管理表单状态
  const [createRoleForm, setCreateRoleForm] = useState<CreateRoleRequest>({
    role_name: '',
    role_type: '',
    remark: ''
  })

  const [editRoleForm, setEditRoleForm] = useState<UpdateRoleRequest>({
    role_name: '',
    role_type: '',
    remark: ''
  })

  // 权限设置表单状态
  const [permissionsForm, setPermissionsForm] = useState({
    canViewAllStudents: false,
    canViewAllExperiments: false,
    canViewAllLearningProgress: false,
    canManageUsers: false,
    canManageRoles: false,
    canViewAnalytics: false,
    canExportData: false,
    canManageSystem: false
  })

  // App Token 管理相关状态
  const [appTokens, setAppTokens] = useState<any[]>([])
  const [appTokenLoading, setAppTokenLoading] = useState(false)
  const [appTokenCurrentPage, setAppTokenCurrentPage] = useState(0)
  const [appTokenPageSize] = useState(10)
  const [totalAppTokens, setTotalAppTokens] = useState(0)

  // 短信管理相关状态
  const [smsRecords, setSmsRecords] = useState<SmsRecord[]>([])
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsCurrentPage, setSmsCurrentPage] = useState(0)
  const [smsPageSize] = useState(10)
  const [totalSmsRecords, setTotalSmsRecords] = useState(0)
  const [smsSearchTerm, setSmsSearchTerm] = useState('')
  const [smsTypeFilter, setSmsTypeFilter] = useState('all')
  const [verifiedStatusFilter, setVerifiedStatusFilter] = useState(false)
  const [selectedSmsRecord, setSelectedSmsRecord] = useState<SmsRecord | null>(null)
  const [showSmsDetail, setShowSmsDetail] = useState(false)

  // 资料库统计数据
  const [resourcesStats, setResourcesStats] = useState({
    totalRepositories: 0,
    totalDocuments: 0,
    supportedTypes: 0
  })

  // 班级统计数据
  const [classStats, setClassStats] = useState({
    totalClasses: 0,
    ongoingClasses: 0,
    totalStudents: 0
  })

  // 加载班级统计数据
  const loadClassStats = () => {
    try {
      const savedClasses = localStorage.getItem('carbonlab-classes')
      if (savedClasses) {
        const classes = JSON.parse(savedClasses)
        setClassStats({
          totalClasses: classes.length,
          ongoingClasses: classes.filter((c: any) => c.status === 'ongoing').length,
          totalStudents: classes.reduce((total: number, cls: any) => total + (cls.currentStudents || 0), 0)
        })
      }
    } catch (error) {
      console.error('Failed to load class stats:', error)
    }
  }

  // 加载资料库统计数据
  const loadResourcesStats = async () => {
    try {
      // 从 localStorage 获取资料库数据
      const repositoriesData = localStorage.getItem('mockRepositories')
      const repositories = repositoriesData ? JSON.parse(repositoriesData) : []
      
      let totalDocuments = 0
      let supportedTypes = new Set()
      
      // 计算每个资料库的文档数量和类型
      for (const repo of repositories) {
        const filesData = localStorage.getItem(`files_${repo.id}`)
        if (filesData) {
          const files = JSON.parse(filesData)
          totalDocuments += files.length
          
          // 收集支持的类型
          if (repo.folderType && Array.isArray(repo.folderType)) {
            repo.folderType.forEach((type: string) => supportedTypes.add(type))
          }
        }
      }
      
      setResourcesStats({
        totalRepositories: repositories.length,
        totalDocuments,
        supportedTypes: supportedTypes.size
      })
    } catch (error) {
      console.error('Failed to load resources stats:', error)
    }
  }

  // 角色类型选项
  const roleTypes = [
    { value: 'teacher', label: '教师' },
    { value: 'student', label: '学生' },
    { value: 'guest', label: '访客' }
  ]

  // 短信类型选项
  const smsTypes = [
    { value: 'all', label: '全部类型' },
    { value: 'login', label: '登录验证' },
    { value: 'register', label: '注册验证' },
    { value: 'reset', label: '重置密码' },
    { value: 'notification', label: '通知消息' }
  ]



  // 当切换到用户管理、角色管理、App Token管理、短信管理或资料库管理时加载数据
  useEffect(() => {
    if (activeMenu === 'user-management') {
      console.log('切换到用户管理，开始加载数据')
      fetchUsers()
      fetchRoles()
    } else if (activeMenu === 'role-management') {
      console.log('切换到角色管理，开始加载数据')
      fetchRoles()
    } else if (activeMenu === 'app-token-management') {
      console.log('切换到App Token管理，开始加载数据')
      fetchAppTokens()
    } else if (activeMenu === 'sms-management') {
      console.log('切换到短信管理，开始加载数据')
      fetchSmsRecords()
    } else if (activeMenu === 'resources-management') {
      console.log('切换到资料库管理，开始加载统计数据')
      loadResourcesStats()
    } else if (activeMenu === 'overview') {
      loadClassStats()
    }
  }, [activeMenu])





  // 如果未登录，重定向到登录页面
  if (!isLoggedIn || !user) {
    router.push('/login')
    return null
  }

  const handleLogout = () => {
    logout()
    toast.success('已退出登录')
    router.push('/login')
  }



  // 修改密码相关函数
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    // 验证表单
    if (!passwordForm.currentPassword.trim()) {
      toast.error('请输入当前密码')
      return
    }
    if (!passwordForm.newPassword.trim()) {
      toast.error('请输入新密码')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少6位')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }

    setIsChangingPassword(true)
    try {
      console.log('开始修改密码...')
      console.log('当前用户token:', useUserStore.getState().token?.token ? '存在' : '不存在')
      
      // 调用API修改密码
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token?.token || ''}`
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      })
      
      console.log('修改密码API响应状态:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('修改密码API响应数据:', data)
        
        if (data.code === 200) {
          toast.success('密码修改成功！请重新登录以使用新密码。')
          setShowPasswordForm(false)
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
          
          // 密码修改成功后，清除用户登录状态，要求重新登录
          useUserStore.getState().logout()
          
          // 延迟跳转到登录页面
          setTimeout(() => {
            router.push('/login')
          }, 1500)
        } else {
          toast.error(data.message || '密码修改失败')
        }
      } else {
        const errorText = await response.text()
        console.error('修改密码API失败:', response.status, errorText)
        toast.error(`密码修改失败: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('修改密码错误:', error)
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 头像更新处理函数
  const handleAvatarChange = (avatarUrl: string) => {
    useUserStore.getState().updateAvatar(avatarUrl)
    setShowAvatarForm(false)
  }

  // 用户管理相关函数
  const fetchUsers = async () => {
    try {
      setUserLoading(true)
      console.log('开始获取用户列表...')
      
      const response = await getUsers({
        page: userCurrentPage,
        size: userPageSize,
        search: userSearchTerm || undefined
      })
      
      console.log('用户列表API响应:', response)
      console.log('响应类型:', typeof response)
      console.log('响应键名:', Object.keys(response))
      
      // 验证响应数据格式
      if (response && response.content && Array.isArray(response.content)) {
        console.log('✅ 找到用户数据，数量:', response.content.length)
        
        // 处理每个用户对象，确保字段完整
        const processedUsers = response.content.map((user: any, index: number) => {
          console.log(`处理用户${index + 1}:`, user)
          console.log(`用户${index + 1}字段:`, Object.keys(user))
          
          // 标准化用户对象
          return {
            user_id: user.user_id || user.id || user.userId || `user_${index}`,
            username: user.username || user.name || user.nick_name || `用户${index + 1}`,
            phone: user.phone || user.phone_number || null,
            email: user.email || user.email_address || null,
            registered_at: user.registered_at || user.created_at || user.create_time || new Date().toISOString(),
            roles: user.roles || user.user_roles || user.role_ids || [],
            status: user.status || user.user_status || '活跃',
            avatar_url: user.avatar_url || user.avatar || null
          }
        })
        
        console.log('处理后的用户数据:', processedUsers)
        setUsers(processedUsers)
        setTotalUsers(response.total || processedUsers.length)
      } else {
        console.error('❌ 响应数据格式异常:', response)
        console.log('响应内容类型:', typeof response)
        setUsers([])
        setTotalUsers(0)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      toast.error('获取用户列表失败')
    } finally {
      setUserLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      setRoleLoading(true)
      console.log('开始获取角色列表...')
      
      const response = await getRoles({
        page: roleCurrentPage,
        size: rolePageSize
      })
      
      console.log('角色列表API响应:', response)
      // 根据API响应结构设置数据
      if (response.data) {
        setRoles(response.data.content || [])
        setTotalRoles(response.data.total || 0)
      } else {
        setRoles(response.content || [])
        setTotalRoles(response.total || 0)
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      toast.error('获取角色列表失败')
    } finally {
      setRoleLoading(false)
    }
  }

  // App Token 管理相关函数
  const fetchAppTokens = async () => {
    try {
      setAppTokenLoading(true)

      const response = await getAppTokens({
        page: appTokenCurrentPage,
        size: appTokenPageSize
      })
      
      console.log('App Token列表API响应:', response)
      setAppTokens(response.content)
      setTotalAppTokens(response.total)
    } catch (error) {
      console.error('获取App Token列表失败:', error)
      toast.error('获取App Token列表失败')
    } finally {
      setAppTokenLoading(false)
    }
  }

  // 短信管理相关函数
  const fetchSmsRecords = async () => {
    try {
      setSmsLoading(true)

      const response = await getSmsRecords({
        page: smsCurrentPage,
        size: smsPageSize,
        sms_type: smsTypeFilter === 'all' ? undefined : smsTypeFilter,
        verifiedStatus: verifiedStatusFilter
      })
      
      console.log('短信记录API响应:', response)
      if (response.data) {
        setSmsRecords(response.data.content || [])
        setTotalSmsRecords(response.data.total || 0)
      } else {
        setSmsRecords(response.content || [])
        setTotalSmsRecords(response.total || 0)
      }
    } catch (error) {
      console.error('获取短信记录失败:', error)
      toast.error('获取短信记录失败')
    } finally {
      setSmsLoading(false)
    }
  }

  const handleResendSms = async (recordId: string) => {
    try {
      await resendSms(recordId)
      toast.success('短信重新发送成功')
      fetchSmsRecords() // 刷新列表
    } catch (error) {
      console.error('重新发送短信失败:', error)
      toast.error('重新发送短信失败')
    }
  }

  const handleDeleteSmsRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条短信记录吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteSmsRecord(recordId)
      toast.success('短信记录删除成功')
      fetchSmsRecords() // 刷新列表
    } catch (error) {
      console.error('删除短信记录失败:', error)
      toast.error('删除短信记录失败')
    }
  }

  const handleViewSmsDetail = async (recordId: string) => {
    try {
      const record = await getSmsRecordDetail(recordId)
      setSelectedSmsRecord(record)
      setShowSmsDetail(true)
    } catch (error) {
      console.error('获取短信记录详情失败:', error)
      toast.error('获取短信记录详情失败')
    }
  }

  // 处理创建用户
  const handleCreateUser = async () => {
    console.log('=== 开始创建用户 ===')
    console.log('表单数据:', createUserForm)
    try {
      // 表单验证
      if (!createUserForm.username.trim()) {
        console.error('❌ 用户名为空')
        toast.error('用户名不能为空')
        return
      }

      // 手机号格式验证（如果提供了的话）
      if (createUserForm.phone && createUserForm.phone.trim() !== '') {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(createUserForm.phone.trim())) {
          console.error('❌ 手机号格式无效')
          toast.error('手机号格式无效，请输入11位有效手机号')
          return
        }
      }

      // 密码验证（如果提供了的话）
      if (createUserForm.password_encrypted && createUserForm.password_encrypted.trim() !== '') {
        if (createUserForm.password_encrypted.trim().length < 6) {
          console.error('❌ 密码长度不足')
          toast.error('密码长度至少6位')
          return
        }
      }

      console.log('✅ 表单验证通过，开始调用API...')
      
      // 清理数据：移除空字符串，保留undefined
      const cleanData = {
        username: createUserForm.username.trim(),
        phone: createUserForm.phone?.trim() || undefined,
        password_encrypted: createUserForm.password_encrypted?.trim() || undefined
      }
      
      console.log('清理后的数据:', cleanData)
      
      const result = await createUser(cleanData)
      console.log('✅ 用户创建成功，返回结果:', result)
      
      toast.success('用户创建成功')
      setCreateUserDialogOpen(false)
      setCreateUserForm({ username: '', phone: '', password_encrypted: '' })
      fetchUsers()
    } catch (error: any) {
      console.error('❌ 创建用户失败:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack,
        formData: createUserForm
      })
      toast.error(`创建用户失败: ${error.message}`)
    }
  }

  // 处理密码重置
  const handleResetPassword = (user: DashboardUser) => {
    setSelectedUser(user)
    setResetPasswordForm({
      newPassword: '',
      confirmPassword: ''
    })
    setResetPasswordDialogOpen(true)
  }

  // 处理密码重置提交
  const handleResetPasswordSubmit = async () => {
    if (!selectedUser) {
      toast.error('用户信息无效')
      return
    }

    if (!resetPasswordForm.newPassword.trim()) {
      toast.error('请输入新密码')
      return
    }
    if (resetPasswordForm.newPassword.length < 6) {
      toast.error('新密码长度至少6位')
      return
    }
    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }

    setIsResettingPassword(true)
    try {
      // 调用API重置密码
      const response = await fetch('/api/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token?.token || ''}`,
        },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          new_password: resetPasswordForm.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.code === 200) {
          toast.success('密码重置成功！')
          setResetPasswordDialogOpen(false)
          setResetPasswordForm({
            newPassword: '',
            confirmPassword: ''
          })
          setSelectedUser(null)
        } else {
          toast.error(data.message || '密码重置失败')
        }
      } else {
        toast.error('密码重置失败，请稍后重试')
      }
    } catch (error) {
      console.error('重置密码错误:', error)
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsResettingPassword(false)
    }
  }

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!userId) {
      console.error('❌ 删除用户时用户ID为空')
      toast.error('用户ID无效，无法删除')
      return
    }

    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return
    }

    try {
      console.log('开始删除用户，用户ID:', userId)
      await deleteUser(userId)
      toast.success('用户删除成功')
      
      // 强制刷新用户列表，清除可能的缓存
      console.log('删除用户成功，开始刷新用户列表...')
      setTimeout(() => {
        fetchUsers()
      }, 100) // 延迟100ms确保API操作完成
      
    } catch (error: any) {
      console.error('删除用户失败:', error)
      const errorMessage = error.message || '删除用户失败'
      toast.error(`删除用户失败: ${errorMessage}`)
    }
  }

  // 处理编辑用户
  const handleEditUser = (user: DashboardUser) => {
    console.log('=== 开始编辑用户 ===')
    console.log('用户对象:', user)
    console.log('用户角色字段:', {
      roles: user.roles,
      role_ids: user.role_ids,
      user_roles: user.user_roles
    })
    
    setSelectedUser(user)
    
    // 设置选中的角色ID，支持多种角色字段格式
    let userRoles: string[] = []
    
    if (user.roles && Array.isArray(user.roles)) {
      // 如果roles是数组，直接使用
      userRoles = user.roles
      console.log('使用roles字段:', userRoles)
    } else if (user.role_ids && Array.isArray(user.role_ids)) {
      // 如果role_ids是数组，直接使用
      userRoles = user.role_ids
      console.log('使用role_ids字段:', userRoles)
    } else if (user.user_roles && Array.isArray(user.user_roles)) {
      // 如果user_roles是数组，提取role_id
      userRoles = user.user_roles.map((role: any) => role.role_id || role.id || role).filter(Boolean)
      console.log('使用user_roles字段，提取后:', userRoles)
    } else if (user.roles && typeof user.roles === 'string') {
      // 如果roles是字符串，尝试解析
      try {
        userRoles = JSON.parse(user.roles)
        console.log('解析字符串roles字段:', userRoles)
      } catch (e) {
        console.log('无法解析字符串roles字段:', user.roles)
      }
    }
    
    // 确保userRoles是数组且包含有效值
    if (!Array.isArray(userRoles)) {
      userRoles = []
      console.log('角色字段不是数组，设置为空数组')
    }
    
    // 过滤掉无效的角色ID
    const validRoleIds = userRoles.filter(id => id && typeof id === 'string')
    console.log('有效的角色ID:', validRoleIds)
    
    // 用户只能有一个角色，直接使用第一个有效角色
    const finalRoleIds = validRoleIds.length > 0 ? [validRoleIds[0]] : []
    
    console.log('设置的角色ID:', finalRoleIds)
    setSelectedRoleIds(finalRoleIds)
    setEditUserDialogOpen(true)
    
    console.log('=== 编辑用户设置完成 ===')
  }



  // 处理保存用户角色
  const handleSaveUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      console.log('开始保存用户角色，用户ID:', userId, '角色IDs:', roleIds)
      
      if (!userId) {
        toast.error('用户ID无效')
        return
      }
      
      if (roleIds.length === 0) {
        toast.error('请至少选择一个角色')
        return
      }
      
      // 角色逻辑验证：确保只能选择一个角色，防止互斥角色
      if (roleIds.length > 1) {
        toast.error('每个用户只能选择一个角色')
        return
      }
      
      const selectedRoles = roles.filter(role => roleIds.includes(role.role_id))
      const roleTypes = selectedRoles.map(role => role.role_type)
      
      console.log('选中的角色:', selectedRoles)
      console.log('选中的角色类型:', roleTypes)
      console.log('角色详情:', selectedRoles.map(role => ({
        role_id: role.role_id,
        role_name: role.role_name,
        role_type: role.role_type
      })))
      
      // 检查是否有互斥角色（虽然现在只能选一个，但保留验证逻辑以防万一）
      if ((roleTypes.includes('teacher') || roleTypes.includes('admin')) && (roleTypes.includes('student') || roleTypes.includes('guest'))) {
        toast.error('教师角色不能与学生或访客角色同时存在')
        return
      }
      
      if (roleTypes.includes('student') && roleTypes.includes('guest')) {
        toast.error('学生角色不能与访客角色同时存在')
        return
      }
      
      await saveUserRoles(userId, { role_ids: roleIds })
      toast.success('用户角色保存成功')
      setEditUserDialogOpen(false)
      setSelectedRoleIds([]) // 清空选中的角色
      fetchUsers() // 刷新用户列表
    } catch (error: any) {
      console.error('保存用户角色失败:', error)
      const errorMessage = error.message || '保存用户角色失败'
      toast.error(`保存用户角色失败: ${errorMessage}`)
    }
  }

  // 处理角色选择变化 - 实现角色覆盖逻辑（每个用户只能有一个角色）
  const handleRoleSelectionChange = (roleId: string, checked: boolean) => {
    console.log('=== 角色选择变化 ===')
    console.log('角色ID:', roleId)
    console.log('是否选中:', checked)
    console.log('当前选中的角色IDs:', selectedRoleIds)
    
    if (checked) {
      // 选择新角色时，替换所有现有角色（单选模式）
      const newRoleIds = [roleId]
      setSelectedRoleIds(newRoleIds)
      console.log('选择新角色，替换现有角色:', roleId)
      console.log('新的角色IDs:', newRoleIds)
      
      // 查找对应的角色信息
      const selectedRole = roles.find(role => role.role_id === roleId)
      if (selectedRole) {
        console.log('选中的角色信息:', {
          role_id: selectedRole.role_id,
          role_name: selectedRole.role_name,
          role_type: selectedRole.role_type
        })
      }
    } else {
      // 取消选择时，从列表中移除该角色
      const newRoleIds = selectedRoleIds.filter(id => id !== roleId)
      setSelectedRoleIds(newRoleIds)
      console.log('取消选择角色:', roleId)
      console.log('新的角色IDs:', newRoleIds)
    }
  }

  // 清理历史多角色数据
  const cleanupMultipleRoles = async () => {
    try {
      console.log('开始清理历史多角色数据...')
      
      // 获取所有用户
      const allUsers = await getUsers({ size: 1000 })
      const users = allUsers.content || allUsers.data?.content || allUsers
      
      if (!Array.isArray(users)) {
        console.log('无法获取用户列表，跳过清理')
        return
      }
      
      let cleanedCount = 0
      let errorCount = 0
      
      for (const user of users) {
        const userRoles = user.roles || []
        
        // 检查是否有多个角色
        if (Array.isArray(userRoles) && userRoles.length > 1) {
          console.log(`用户 ${user.username} 有 ${userRoles.length} 个角色，开始清理...`)
          
          try {
            // 保留第一个角色，清除其他角色
            const primaryRole = userRoles[0]
            const roleId = typeof primaryRole === 'string' ? primaryRole : primaryRole.role_id || primaryRole.id
            
            if (roleId) {
              // 调用API更新用户角色，只保留一个角色
              await saveUserRoles(user.user_id, { role_ids: [roleId] })
              console.log(`用户 ${user.username} 角色清理成功，保留角色: ${roleId}`)
              cleanedCount++
            } else {
              console.error(`用户 ${user.username} 无法获取有效角色ID`)
              errorCount++
            }
          } catch (error) {
            console.error(`清理用户 ${user.username} 角色失败:`, error)
            errorCount++
          }
        }
      }
      
      console.log(`角色清理完成！成功清理: ${cleanedCount} 个用户，失败: ${errorCount} 个`)
      
      if (cleanedCount > 0) {
        toast.success(`成功清理 ${cleanedCount} 个用户的多角色数据`)
        // 刷新用户列表
        fetchUsers()
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} 个用户角色清理失败，请检查日志`)
      }
      
    } catch (error) {
      console.error('清理多角色数据失败:', error)
      toast.error('清理多角色数据失败')
    }
  }

  // 角色管理相关函数
  const handleCreateRole = async () => {
    try {
      if (!createRoleForm.role_name.trim()) {
        toast.error('角色名称不能为空')
        return
      }

      if (!createRoleForm.role_type) {
        toast.error('请选择角色类型')
        return
      }

      await createRole(createRoleForm)
      toast.success('角色创建成功')
      setCreateRoleDialogOpen(false)
      setCreateRoleForm({ role_name: '', role_type: '', remark: '' })
      fetchRoles()
    } catch (error) {
      console.error('创建角色失败:', error)
      toast.error('创建角色失败')
    }
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setEditRoleForm({
      role_name: role.role_name,
      role_type: role.role_type,
      remark: role.remark || ''
    })
    setEditRoleDialogOpen(true)
  }

  const handleSaveRoleEdit = async () => {
    if (!selectedRole) return

    try {
      if (!editRoleForm.role_name.trim()) {
        toast.error('角色名称不能为空')
        return
      }

      if (!editRoleForm.role_type) {
        toast.error('请选择角色类型')
        return
      }

      await updateRole(selectedRole.role_id, editRoleForm)
      toast.success('角色更新成功')
      setEditRoleDialogOpen(false)
      fetchRoles()
    } catch (error) {
      console.error('更新角色失败:', error)
      toast.error('更新角色失败')
    }
  }

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

  // 获取角色类型标签和颜色
  const getRoleTypeLabel = (type: string) => {
    // 特殊处理：admin 角色类型映射为教师
    if (type === 'admin') {
      return '教师'
    }
    
    const roleType = roleTypes.find(rt => rt.value === type)
    return roleType ? roleType.label : type
  }

  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'teacher':
      case 'admin': // admin 角色使用与 teacher 相同的颜色
        return 'bg-blue-100 text-blue-800'
      case 'student':
        return 'bg-green-100 text-green-800'
      case 'guest':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }



  // 添加调试信息
  console.log('当前用户信息:', {
    user,
    isLoggedIn,
    userRoles: user?.roles,
    hasAdminRole: user?.roles?.includes('admin'),
    hasTeacherRole: user?.roles?.includes('teacher'),
    username: user?.username
  })

  // 临时调试：如果是carbon用户，强制显示管理菜单
  const isCarbonUser = user?.username === 'carbon'
  console.log('是否是carbon用户:', isCarbonUser)
  
  // 获取用户主要角色
  const userRoles = user?.roles || []
  const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
  
  // 调试信息：显示当前用户的侧边栏菜单权限判断
  console.log('=== 侧边栏菜单权限判断调试 ===')
  console.log('用户名:', user?.username)
  console.log('用户角色:', userRoles)
  console.log('主要角色:', primaryRole)
  console.log('isCarbonUser:', isCarbonUser)
  console.log('是否包含teacher角色:', user?.roles?.includes('teacher'))
  console.log('是否包含student角色:', user?.roles?.includes('student'))
  console.log('主要角色是否为teacher:', primaryRole === 'teacher')
  console.log('主要角色是否为admin:', primaryRole === 'admin')

  const menuItems = [
    {
      id: 'overview',
      title: '概览',
      icon: Home
    },
    {
      id: 'settings',
      title: '账户设置',
      icon: Settings
    },
    // 教师功能 - 支持teacher角色和admin角色，包含所有管理功能
    ...((primaryRole === 'teacher' || primaryRole === 'admin' || isCarbonUser) ? [
      // 系统管理功能
      {
        id: 'user-management',
        title: '用户管理',
        icon: User
      },
      {
        id: 'role-management',
        title: '权限管理',
        icon: Shield
      },
      {
        id: 'class-management',
        title: '班级管理',
        icon: Users
      },
      {
        id: 'resources-management',
        title: '资料库管理',
        icon: FileText
      },
      {
        id: 'app-token-management',
        title: 'App Token管理',
        icon: Key
      },
      {
        id: 'sms-management',
        title: '短信管理',
        icon: MessageSquare
      },
      {
        id: 'data-analytics',
        title: '数据分析',
        icon: BarChart3
      },
      {
        id: 'system-settings',
        title: '系统设置',
        icon: Settings
      },
      // 教学管理功能
      {
        id: 'student-management',
        title: '学生管理',
        icon: Users
      },
      {
        id: 'experiment-management',
        title: '实验管理',
        icon: FlaskConical
      },
      {
        id: 'learning-progress',
        title: '学习进度',
        icon: BookOpen
      }
    ] : []),

    // 学生功能 - 支持student角色
    ...(primaryRole === 'student' ? [
      {
        id: 'my-experiments',
        title: '我的实验',
        icon: FlaskConical
      },
      {
        id: 'learning-record',
        title: '学习记录',
        icon: BarChart3
      },
      {
        id: 'personal-settings',
        title: '个人设置',
        icon: User
      }
    ] : [])
  ]

  console.log('菜单项:', menuItems)

  // 渲染不同的内容区域
  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <>
            {/* 欢迎信息 */}
            <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-0 shadow-sm mb-8">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden border-2 border-white shadow-lg">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="用户头像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    欢迎回来，{user.username}！
                  </h3>
                  
                  {/* 根据用户角色显示不同的欢迎信息 */}
                  {(() => {
                    const userRoles = user.roles || []
                    // 用户只能有一个角色，使用第一个角色进行权限判断
                    const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
                    
                    // carbon账号拥有超级权限，凌驾于所有角色之上
                    const isCarbon = user.username === 'carbon'
                    // 现在只有教师角色，管理员功能合并到教师角色中
                    const isTeacher = isCarbon || primaryRole === 'teacher'
                    const isStudent = isCarbon || primaryRole === 'student'
                    const isGuest = primaryRole === 'guest'
                    
                    // 调试信息：显示当前用户的角色信息
                    console.log('=== 欢迎信息权限判断调试 ===')
                    console.log('用户名:', user.username)
                    console.log('用户角色:', userRoles)
                    console.log('主要角色:', primaryRole)
                    console.log('isCarbon:', isCarbon)
                    console.log('isTeacher:', isTeacher)
                    console.log('isStudent:', isStudent)
                    
                    if (isTeacher) {
                      return (
                        <div className="space-y-3">
                  <p className="text-green-700 text-lg leading-relaxed max-w-2xl mx-auto">
                            这里是您的管理中心，您可以在这里管理用户、权限、App Token、短信记录和设置账户信息。
                          </p>
                          <p className="text-green-600 text-base">
                            欢迎使用管理功能！您拥有系统管理权限。
                          </p>
                        </div>
                      )
                    } else if (isStudent) {
                      return (
                        <div className="space-y-3">
                          <p className="text-green-700 text-lg leading-relaxed max-w-2xl mx-auto">
                            这里是您的学习中心，您可以查看自己的实验进度、学习记录和账户信息。
                          </p>
                          <p className="text-green-600 text-base">
                            欢迎使用学习功能！专注于您的实验和学习。
                          </p>
                        </div>
                      )
                    } else if (isGuest) {
                      return (
                        <div className="space-y-3">
                          <p className="text-green-700 text-lg leading-relaxed max-w-2xl mx-auto">
                            这里是您的访客中心，您可以查看公开信息和基本的账户设置。
                          </p>
                          <p className="text-green-600 text-base">
                            欢迎使用访客功能！如需更多权限，请联系管理员。
                          </p>
                        </div>
                      )
                    } else {
                      // 默认情况（没有角色或角色未知）
                      return (
                        <div className="space-y-3">
                          <p className="text-green-700 text-lg leading-relaxed max-w-2xl mx-auto">
                            这里是您的个人中心，您可以查看账户信息和基本设置。
                          </p>
                          <p className="text-green-600 text-base">
                            如需更多功能，请联系管理员分配相应权限。
                          </p>
                        </div>
                      )
                    }
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* 用户信息卡片 */}
            <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  账户信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">用户名</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.username}</p>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">用户ID</span>
                    </div>
                    <p className="text-lg font-mono font-semibold text-gray-900">{user.id}</p>
                  </div>

                  {user.latest_login_time && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                        <span className="font-medium">最后登录</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.latest_login_time).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {user.registered_at && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
                        <span className="font-medium">注册时间</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.registered_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {user.is_frozen !== undefined && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="font-medium">账户状态</span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        user.is_frozen 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {user.is_frozen ? '已冻结' : '正常'}
                      </div>
                    </div>
                  )}
                  
                  {user.roles && user.roles.length > 0 && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        <span className="font-medium">角色</span>
                        {/* 移除多角色警告，因为每个用户只能有一个角色 */}
                        {/* 如果将来需要支持多角色，可以重新启用这个警告 */}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* 显示用户角色（单一角色） */}
                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                          {(() => {
                            if (Array.isArray(user.roles) && user.roles.length > 0) {
                              const role = user.roles[0]
                              if (typeof role === 'string') {
                                // 如果是字符串（如 'teacher'），通过角色类型标签函数转换
                                return getRoleTypeLabel(role)
                              } else if (role && typeof role === 'object') {
                                // 如果是对象，使用 role_name 或 role_type
                                return role.role_name || getRoleTypeLabel(role.role_type) || '未知角色'
                              }
                            }
                            return '无角色'
                          })()}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>

            {/* 根据用户角色和权限动态显示功能卡片 */}
            {(() => {
              const userRoles = user.roles || []
              // 用户只能有一个角色，使用第一个角色进行权限判断
              const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
              
              // carbon账号拥有超级权限，凌驾于所有角色之上
              const isCarbon = user.username === 'carbon'
              // 现在只有教师角色，管理员功能合并到教师角色中
              const isTeacher = isCarbon || primaryRole === 'teacher' || primaryRole === 'admin'
              const isStudent = isCarbon || primaryRole === 'student'
              
              // 调试信息：显示当前用户的功能卡片权限判断
              console.log('=== 功能卡片权限判断调试 ===')
              console.log('用户名:', user.username)
              console.log('用户角色:', userRoles)
              console.log('主要角色:', primaryRole)
              console.log('isCarbon:', isCarbon)
              console.log('isTeacher:', isTeacher)
              console.log('isStudent:', isStudent)
              
              if (isCarbon) {
                // carbon账号：不显示功能卡片，只显示权限管理说明
                return (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-bold text-purple-800 mb-3">超级权限管理</h3>
                          <p className="text-purple-700 text-sm leading-relaxed max-w-2xl mx-auto">
                            您是系统的超级管理员，拥有所有权限。您可以通过权限管理功能为不同角色配置具体的功能访问权限。
                            其他用户看到的功能卡片将根据您设置的权限动态显示。
                          </p>
                          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                            <p className="text-purple-600 text-xs">
                              💡 提示：请前往"权限管理"页面为各角色配置具体权限
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              } else {
                // 非carbon账号：根据角色和权限动态显示功能卡片
                // 这里应该从权限系统获取具体的权限配置
                // 暂时使用角色基础权限，后续可以扩展为动态权限
                
                if (isTeacher) {
                  // 教师：显示所有管理功能卡片（包含原管理员功能）
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {/* 用户管理功能 */}
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-blue-800">用户管理</h4>
                          </div>
                          <p className="text-blue-700 text-sm">管理系统中的所有用户账户、权限分配和设置</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-purple-800">权限管理</h4>
                          </div>
                          <p className="text-purple-700 text-sm">创建和管理系统权限，设置访问控制和角色分配</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Key className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-green-800">App Token管理</h4>
                          </div>
                          <p className="text-green-700 text-sm">管理应用访问令牌和API密钥配置</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <MessageSquare className="h-6 w-6 text-orange-600" />
                            </div>
                            <h4 className="font-semibold text-orange-800">短信管理</h4>
                          </div>
                          <p className="text-orange-700 text-sm">查看和管理系统短信记录和通知</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <BarChart3 className="h-6 w-6 text-red-600" />
                            </div>
                            <h4 className="font-semibold text-red-800">数据分析</h4>
                          </div>
                          <p className="text-red-700 text-sm">查看系统使用统计和用户行为分析</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                              <Settings className="h-6 w-6 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-teal-800">系统设置</h4>
                          </div>
                          <p className="text-teal-700 text-sm">配置系统参数和高级功能设置</p>
                        </CardContent>
                      </Card>
                      
                      {/* 教学管理功能 */}
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Users className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h4 className="font-semibold text-indigo-800">学生管理</h4>
                          </div>
                          <p className="text-indigo-700 text-sm">管理所有学生用户，查看学生信息和设置</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                              <FlaskConical className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h4 className="font-semibold text-emerald-800">实验管理</h4>
                          </div>
                          <p className="text-emerald-700 text-sm">查看所有学生的实验进度和结果</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-pink-100 rounded-lg">
                              <BookOpen className="h-6 w-6 text-pink-600" />
                            </div>
                            <h4 className="font-semibold text-pink-800">学习进度</h4>
                          </div>
                          <p className="text-pink-700 text-sm">查看所有学生的课程学习进度和记录</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                              <BarChart3 className="h-6 w-6 text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-amber-800">学习分析</h4>
                          </div>
                          <p className="text-amber-700 text-sm">分析学生的学习数据和进度统计</p>
                        </CardContent>
                      </Card>
                    </div>
                  )
                } else if (isStudent) {
                  // 学生：显示学习相关功能卡片
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FlaskConical className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-green-800">我的实验</h4>
                          </div>
                          <p className="text-green-700 text-sm">查看和管理您的实验进度和结果</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-blue-800">学习记录</h4>
                          </div>
                          <p className="text-blue-700 text-sm">查看您的学习历史和进度统计</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <User className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-purple-800">个人设置</h4>
                          </div>
                          <p className="text-purple-700 text-sm">管理您的个人信息和账户设置</p>
                        </CardContent>
                      </Card>
                    </div>
                  )
                } else {
                  // 访客或其他角色：显示基本功能卡片
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <h4 className="font-semibold text-gray-800">基本信息</h4>
                          </div>
                          <p className="text-gray-700 text-sm">查看您的账户基本信息和设置</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-blue-800">权限说明</h4>
                          </div>
                          <p className="text-blue-700 text-sm">了解您的账户权限和可用功能</p>
                        </CardContent>
                      </Card>
                    </div>
                  )
                }
              }
            })()}
          </>
        )









      case 'settings':
        return (
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* 头像显示区域 */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="用户头像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarForm(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    更新头像
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">用户名</label>
                    <p className="text-lg font-medium text-gray-900">{user.username}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">用户ID</label>
                    <p className="text-lg font-mono font-medium text-gray-900">{user.id}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-3"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    修改密码
                  </Button>
                </div>

                {/* 修改密码表单 */}
                {showPasswordForm && (
                  <Card className="border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">修改密码</CardTitle>
                      <CardDescription>请输入当前密码和新密码</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">当前密码 *</label>
                        <input
                          type="password"
                          placeholder="请输入当前密码"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">新密码 *</label>
                        <input
                          type="password"
                          placeholder="请输入新密码（至少6位）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">确认新密码 *</label>
                        <input
                          type="password"
                          placeholder="请再次输入新密码"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            })
                          }}
                          className="px-6"
                          disabled={isChangingPassword}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gray-600 hover:bg-gray-700 px-6"
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? '修改中...' : '确认修改'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 头像上传表单 */}
                {showAvatarForm && (
                  <Card className="border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">更新头像</CardTitle>
                      <CardDescription>上传新的头像图片</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AvatarUpload
                        currentAvatar={user.avatar}
                        onAvatarChange={handleAvatarChange}
                        onCancel={() => setShowAvatarForm(false)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'user-management':
        // 权限检查：carbon账号拥有超级权限，教师可以访问用户管理
        const userRoles = user?.roles || []
        const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
        const isCarbon = user?.username === 'carbon'
        const canManageUsers = isCarbon || primaryRole === 'teacher' || primaryRole === 'admin'
        
        // 调试信息：显示当前用户的用户管理权限判断
        console.log('=== 用户管理权限判断调试 ===')
        console.log('用户名:', user?.username)
        console.log('用户角色:', userRoles)
        console.log('主要角色:', primaryRole)
        console.log('isCarbon:', isCarbon)
        console.log('canManageUsers:', canManageUsers)
        
        if (!canManageUsers) {
          return (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-red-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800 mb-2">权限不足</h2>
                    <p className="text-red-600">您没有权限访问用户管理功能。只有管理员和老师可以管理用户。</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }
        
        return (
          <div className="space-y-6">
            {/* 用户管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isCarbon ? '超级用户管理' : '用户管理'}
                </h2>
                {isCarbon && (
                  <p className="text-sm text-gray-600 mt-1">您拥有超级权限，可以查看和管理所有用户信息</p>
                )}
                {primaryRole === 'teacher' && !isCarbon && (
                  <p className="text-sm text-gray-600 mt-1">管理所有学生用户，查看学生信息和设置</p>
                )}
              </div>
                              {/* 创建用户按钮已移动到操作按钮区域，避免重复 */}
            </div>

            {/* 操作按钮区域 */}
            <div className="flex gap-2 mb-4">
              {/* 清理多角色数据按钮 - 只有carbon账号可以操作 */}
              {isCarbon && (
                <Button
                  variant="outline"
                  onClick={cleanupMultipleRoles}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  清理多角色数据
                </Button>
              )}
              {/* 创建用户按钮 */}
              {(isCarbon || primaryRole === 'teacher' || primaryRole === 'admin') && (
                <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      创建用户
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建新用户</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="username">用户名 *</Label>
                        <Input
                          id="username"
                          value={createUserForm.username}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, username: e.target.value })}
                          placeholder="请输入用户名"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">手机号</Label>
                        <Input
                          id="phone"
                          value={createUserForm.phone}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                          placeholder="请输入手机号"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">密码</Label>
                        <Input
                          id="password"
                          type="password"
                          value={createUserForm.password_encrypted}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, password_encrypted: e.target.value })}
                          placeholder="请输入密码"
                        />
                      </div>
                      <Button onClick={handleCreateUser} className="w-full">
                        创建用户
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* 搜索栏 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="搜索用户..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 用户列表 */}
            <Card>
              <CardContent className="p-6">
                {/* 权限提示 */}
                {isCarbon && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <Shield className="h-4 w-4" />
                      <span>您拥有超级权限，可以查看和管理所有用户信息，不受角色约束。</span>
                    </div>
                  </div>
                )}
                {(primaryRole === 'teacher' || primaryRole === 'admin') && !isCarbon && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Shield className="h-4 w-4" />
                      <span>您正在查看所有学生用户。作为老师，您只能查看和管理学生角色的用户。</span>
                    </div>
                  </div>
                )}
                
                {/* 用户数量统计 */}
                {!userLoading && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        {isCarbon ? '超级用户查看' : (primaryRole === 'teacher' || primaryRole === 'admin') ? '学生用户' : '总用户'}数量: 
                        <span className="font-semibold ml-1">
                          {users.filter(user => {
                            if (isCarbon) {
                              // carbon账号可以看到所有用户
                              return true
                            }
                            if (primaryRole === 'teacher' || primaryRole === 'admin') {
                              // 老师只能看到学生用户，不能看到同为老师的用户
                              const userRoles = user.roles || []
                              const userPrimaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
                              return userPrimaryRole === 'student'
                            }
                            // 管理员可以看到所有用户
                            return true
                          }).length}
                        </span>
                      </span>
                      {isCarbon && (
                        <span className="text-purple-600">
                          (超级权限：查看所有用户)
                        </span>
                      )}
                      {(primaryRole === 'teacher' || primaryRole === 'admin') && !isCarbon && (
                        <span className="text-blue-600">
                          (仅显示学生角色用户)
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {userLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-24"></div>
                            <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                  </div>
                        <div className="flex space-x-2">
                          <div className="h-8 bg-gray-300 rounded w-16"></div>
                          <div className="h-8 bg-gray-300 rounded w-16"></div>
                          <div className="h-8 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-4">
                    {/* 根据角色过滤用户：carbon账号可以看到所有用户，老师只能看到学生用户 */}
                    {users
                      .filter(user => {
                        if (isCarbon) {
                          // carbon账号可以看到所有用户
                          return true
                        }
                        if (primaryRole === 'teacher' || primaryRole === 'admin') {
                          // 老师只能看到学生用户，不能看到同为老师的用户
                          const userRoles = user.roles || []
                          const userPrimaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
                          return userPrimaryRole === 'student'
                        }
                        // 管理员可以看到所有用户
                        return true
                      })
                      .map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.username || '未知用户'}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  {user.phone}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                {user.registered_at ? new Date(user.registered_at).toLocaleDateString() : '未知时间'}
                              </span>
                            </div>
                            {/* 显示用户角色 */}
                            {user.roles && user.roles.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">角色:</span>
                                {Array.isArray(user.roles) ? (
                                  <>
                                    <Badge variant="secondary" className="text-xs">
                                      {(() => {
                                        const role = user.roles[0]
                                        if (typeof role === 'string') {
                                          // 如果是字符串（如 'teacher'），通过角色类型标签函数转换
                                          return getRoleTypeLabel(role)
                                        } else if (role && typeof role === 'object') {
                                          // 如果是对象，使用 role_name 或 role_type
                                          return role.role_name || getRoleTypeLabel(role.role_type) || '未知角色'
                                        }
                                        return '未知角色'
                                      })()}
                                    </Badge>
                                  </>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {user.roles}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            角色选择
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                          >
                            <Key className="w-4 h-4 mr-1" />
                            重置密码
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="space-y-2">
                      <div className="text-lg">
                        {isCarbon ? '暂无用户数据' : (primaryRole === 'teacher' || primaryRole === 'admin') ? '暂无学生用户数据' : '暂无用户数据'}
                      </div>
                      <div className="text-sm">
                        {isCarbon 
                          ? '当前没有用户数据，点击"创建用户"按钮添加第一个用户'
                          : (primaryRole === 'teacher' || primaryRole === 'admin')
                            ? '当前没有学生角色的用户，或者所有学生用户都已被过滤'
                            : '点击"创建用户"按钮添加第一个用户'
                        }
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 分页 */}
            {totalUsers > userPageSize && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUserCurrentPage(Math.max(0, userCurrentPage - 1))}
                    disabled={userCurrentPage === 0}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4">
                    {userCurrentPage + 1} / {Math.ceil(totalUsers / userPageSize)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setUserCurrentPage(userCurrentPage + 1)}
                    disabled={userCurrentPage >= Math.ceil(totalUsers / userPageSize) - 1}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}

            {/* 编辑用户对话框 */}
            <Dialog open={editUserDialogOpen} onOpenChange={(open) => {
              setEditUserDialogOpen(open)
              if (!open) {
                // 关闭对话框时重置状态
                setSelectedUser(null)
                setSelectedRoleIds([])
              }
            }}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>编辑用户 - {selectedUser?.username}</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>用户ID</Label>
                        <Input value={selectedUser.user_id} disabled />
                      </div>
                      <div>
                        <Label>用户名</Label>
                        <Input value={selectedUser.username} disabled />
                      </div>
                      <div>
                        <Label>手机号</Label>
                        <Input value={selectedUser.phone || ''} disabled />
                      </div>
                      <div>
                        <Label>注册时间</Label>
                        <Input value={selectedUser.registered_at ? new Date(selectedUser.registered_at).toLocaleString() : '未知'} disabled />
                      </div>
                    </div>
                    <div>
                      
                      {/* 角色选择说明 */}
                      <div className="mt-2 mb-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">角色选择说明</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                          <div>• <strong>教师</strong>: 拥有所有权限，可以管理用户、权限和系统</div>
                          <div>• <strong>学生</strong>: 只能查看自己的实验进度和学习情况</div>
                          <div>• <strong>访客</strong>: 只能查看公开信息</div>
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          <strong>重要</strong>: 每个用户只能有一个角色。选择新角色将完全替换现有角色，不会累加。
                        </div>
                        <div className="mt-1 text-xs text-amber-600">
                          💡 系统将自动清理历史多角色数据，确保每个用户只有一个角色。
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        {roles.length > 0 ? (
                          roles.map((role) => {
                            const isSelected = selectedRoleIds.includes(role.role_id)
                            const roleType = role.role_type
                            
                            // 检查是否与已选角色冲突
                            const selectedRoles = roles.filter(r => selectedRoleIds.includes(r.role_id))
                            const selectedTypes = selectedRoles.map(r => r.role_type)
                            
                            let isConflicting = false
                            let conflictReason = ''
                            
                            if (isSelected) {
                              // 检查当前选中的角色是否与其他选中角色冲突
                              if ((roleType === 'teacher' || roleType === 'admin') && (selectedTypes.includes('student') || selectedTypes.includes('guest'))) {
                                isConflicting = true
                                conflictReason = '教师不能与学生或访客角色同时存在'
                              } else if (roleType === 'student' && selectedTypes.includes('guest')) {
                                isConflicting = true
                                conflictReason = '学生不能与访客角色同时存在'
                              }
                            } else {
                              // 检查当前角色是否与已选角色冲突
                              if ((roleType === 'teacher' || roleType === 'admin') && (selectedTypes.includes('student') || selectedTypes.includes('guest'))) {
                                isConflicting = true
                                conflictReason = '教师不能与学生或访客角色同时存在'
                              } else if (roleType === 'student' && selectedTypes.includes('guest')) {
                                isConflicting = true
                                conflictReason = '学生不能与访客角色同时存在'
                              }
                            }
                            
                            return (
                              <div key={role.role_id} className={`p-3 rounded-lg border ${
                                isConflicting 
                                  ? 'border-red-200 bg-red-50' 
                                  : isSelected 
                                    ? 'border-blue-200 bg-blue-50' 
                                    : 'border-gray-200 bg-gray-50'
                              }`}>
                                <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`role-${role.role_id}`}
                              name="role-selection"
                              className="border-gray-300"
                              checked={isSelected}
                              onChange={(e) => handleRoleSelectionChange(role.role_id, e.target.checked)}
                              disabled={isConflicting && !isSelected}
                            />
                                  <Label htmlFor={`role-${role.role_id}`} className="text-sm font-medium">
                                    {role.role_name} 
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                      roleType === 'teacher' || roleType === 'admin' ? 'bg-blue-100 text-blue-800' :
                                      roleType === 'student' ? 'bg-green-100 text-green-800' :
                                      roleType === 'guest' ? 'bg-gray-100 text-gray-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {roleType === 'teacher' || roleType === 'admin' ? '教师' :
                                       roleType === 'student' ? '学生' :
                                       roleType === 'guest' ? '访客' :
                                       '未知'}
                                    </span>
                            </Label>
                          </div>
                                
                                {role.remark && (
                                  <div className="mt-1 text-xs text-gray-600 ml-6">
                                    {role.remark}
                      </div>
                                )}
                                
                                {isConflicting && (
                                  <div className="mt-2 text-xs text-red-600 ml-6">
                                    ⚠️ {conflictReason}
                    </div>
                                )}
                              </div>
                            )
                          })
                        ) : (
                          <div className="text-gray-500 text-sm">暂无可用角色</div>
                        )}
                      </div>
                      
                      {/* 当前选择状态 */}
                      {selectedRoleIds.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-700">
                            <strong>已选择角色:</strong>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedRoleIds.map(roleId => {
                              const role = roles.find(r => r.role_id === roleId)
                              return role ? (
                                <Badge key={roleId} variant="secondary" className="text-xs">
                                  {role.role_name} ({getRoleTypeLabel(role.role_type)})
                                </Badge>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditUserDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button 
                        onClick={() => handleSaveUserRoles(selectedUser.user_id, selectedRoleIds)}
                        disabled={selectedRoleIds.length === 0}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        保存角色设置
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* 密码重置对话框 */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={(open) => {
              setResetPasswordDialogOpen(open)
              if (!open) {
                // 关闭对话框时重置状态
                setSelectedUser(null)
                setResetPasswordForm({
                  newPassword: '',
                  confirmPassword: ''
                })
              }
            }}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>重置用户密码 - {selectedUser?.username}</DialogTitle>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">⚠️ 注意事项</p>
                        <p>• 此操作将重置用户 <strong>{selectedUser.username}</strong> 的密码</p>
                        <p>• 重置后用户需要使用新密码登录</p>
                        <p>• 请确保新密码符合安全要求</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="请输入新密码（至少6位）"
                          value={resetPasswordForm.newPassword}
                          onChange={(e) => setResetPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">确认新密码</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="请再次输入新密码"
                          value={resetPasswordForm.confirmPassword}
                          onChange={(e) => setResetPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline" 
                        onClick={() => setResetPasswordDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button 
                        onClick={handleResetPasswordSubmit}
                        disabled={isResettingPassword}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {isResettingPassword ? '重置中...' : '确认重置'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )

      case 'class-management':
        // 权限检查：只有admin角色和carbon账号可以访问班级管理
        const classUserRoles = user?.roles || []
        const classPrimaryRole = Array.isArray(classUserRoles) && classUserRoles.length > 0 ? classUserRoles[0] : null
        const isClassCarbon = user?.username === 'carbon'
        const canManageClasses = isClassCarbon || classPrimaryRole === 'admin'
        
        if (!canManageClasses) {
          return (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-red-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800 mb-2">权限不足</h2>
                    <p className="text-red-600">您没有权限访问班级管理功能。只有管理员和超级管理员可以管理班级。</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        }
        
        return (
          <div className="space-y-6">
            {/* 班级管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isClassCarbon ? '超级班级管理' : '班级管理'}
                </h2>
                {isClassCarbon && (
                  <p className="text-sm text-gray-600 mt-1">您拥有超级权限，可以查看和管理所有班级信息</p>
                )}
                {classPrimaryRole === 'admin' && !isClassCarbon && (
                  <p className="text-sm text-gray-600 mt-1">管理所有班级，查看班级信息和学生分布</p>
                )}
              </div>
            </div>

            {/* 班级管理功能卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-800">班级列表</h4>
                  </div>
                  <p className="text-blue-700 text-sm">查看所有班级信息，包括班级名称、学生数量和创建时间</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-800">创建班级</h4>
                  </div>
                  <p className="text-green-700 text-sm">创建新的班级，设置班级名称、描述和备注信息</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-purple-800">学生分配</h4>
                  </div>
                  <p className="text-purple-700 text-sm">为班级分配学生，管理班级成员和权限设置</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-800">班级统计</h4>
                  </div>
                  <p className="text-orange-700 text-sm">查看班级统计信息，包括学生数量、活跃度和学习进度</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Settings className="h-6 w-6 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-teal-800">班级设置</h4>
                  </div>
                  <p className="text-teal-700 text-sm">配置班级参数，设置班级规则和访问权限</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-red-800">班级报告</h4>
                  </div>
                  <p className="text-red-700 text-sm">生成班级报告，导出班级数据和统计信息</p>
                </CardContent>
              </Card>
            </div>





            {/* 班级信息卡片 */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">班级概览</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => router.push('/dashboard/classes')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    管理班级
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {classStats.totalClasses}
                    </div>
                    <div className="text-sm text-blue-600">班级总数</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {classStats.ongoingClasses}
                    </div>
                    <div className="text-sm text-blue-600">进行中班级</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {classStats.totalStudents}
                    </div>
                    <div className="text-sm text-blue-600">学生总数</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-blue-600 text-sm">
                    点击"管理班级"按钮查看详细班级信息和学生管理
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'role-management':
        return (
          <div className="space-y-6">
            {/* 角色管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">角色管理</h2>
              </div>
            </div>

            {/* 搜索栏 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="搜索角色..."
                        value={roleSearchTerm}
                        onChange={(e) => setRoleSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 角色列表 */}
            <Card>
              <CardContent className="p-6">
                {roleLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                  </div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无角色数据</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roles
                      .filter(role => 
                        !roleSearchTerm || 
                        role.role_name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
                        role.role_type.toLowerCase().includes(roleSearchTerm.toLowerCase())
                      )
                      .map((role) => (
                        <div key={role.role_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Shield className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{role.role_name}</h3>
                                <Badge className={getRoleTypeColor(role.role_type)}>
                                  {getRoleTypeLabel(role.role_type)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Shield className="w-4 h-4" />
                                  <span>角色类型: {getRoleTypeLabel(role.role_type)}</span>
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
                              onClick={() => handleSetRolePermissions(role)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              设置用户权限
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
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 分页 */}
            {totalRoles > rolePageSize && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setRoleCurrentPage(Math.max(0, roleCurrentPage - 1))}
                    disabled={roleCurrentPage === 0}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4">
                    {roleCurrentPage + 1} / {Math.ceil(totalRoles / rolePageSize)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setRoleCurrentPage(roleCurrentPage + 1)}
                    disabled={roleCurrentPage >= Math.ceil(totalRoles / rolePageSize) - 1}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}

            {/* 编辑角色对话框 */}
            <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>编辑角色 - {selectedRole?.role_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit_role_name">角色名称 *</Label>
                    <Input
                      id="edit_role_name"
                      value={editRoleForm.role_name}
                      onChange={(e) => setEditRoleForm({ ...editRoleForm, role_name: e.target.value })}
                      placeholder="请输入角色名称"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_role_type">角色类型 *</Label>
                    <Select value={editRoleForm.role_type} onValueChange={(value) => setEditRoleForm({ ...editRoleForm, role_type: value })}>
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
                      value={editRoleForm.remark}
                      onChange={(e) => setEditRoleForm({ ...editRoleForm, remark: e.target.value })}
                      placeholder="请输入备注信息"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveRoleEdit}>
                      保存
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* 权限设置对话框 */}
            <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>设置角色权限 - {selectedRoleForPermissions?.role_name}</DialogTitle>
                </DialogHeader>
                {selectedRoleForPermissions && (
                  <div className="space-y-6">
                    {/* 权限说明 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">权限说明</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div>• <strong>教师角色</strong>: 可以查看所有学生、实验进度、学习情况，管理用户和权限</div>
                        <div>• <strong>学生角色</strong>: 只能查看自己的实验进度和学习情况</div>
                        <div>• <strong>访客角色</strong>: 只能查看公开信息</div>
                      </div>
                    </div>

                    {/* 权限设置表单 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">详细权限设置</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canViewAllStudents"
                              checked={permissionsForm.canViewAllStudents}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canViewAllStudents: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canViewAllStudents" className="text-sm">查看所有学生</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canViewAllExperiments"
                              checked={permissionsForm.canViewAllExperiments}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canViewAllExperiments: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canViewAllExperiments" className="text-sm">查看所有实验</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canViewAllLearningProgress"
                              checked={permissionsForm.canViewAllLearningProgress}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canViewAllLearningProgress: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canViewAllLearningProgress" className="text-sm">查看所有学习进度</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canViewAnalytics"
                              checked={permissionsForm.canViewAnalytics}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canViewAnalytics: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canViewAnalytics" className="text-sm">查看分析数据</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canManageUsers"
                              checked={permissionsForm.canManageUsers}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canManageUsers: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canManageUsers" className="text-sm">管理用户</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canManageRoles"
                              checked={permissionsForm.canManageRoles}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canManageRoles: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canManageRoles" className="text-sm">管理角色</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canExportData"
                              checked={permissionsForm.canExportData}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canExportData: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canExportData" className="text-sm">导出数据</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="canManageSystem"
                              checked={permissionsForm.canManageSystem}
                              onChange={(e) => setPermissionsForm({ ...permissionsForm, canManageSystem: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="canManageSystem" className="text-sm">系统管理</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setPermissionsDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSavePermissions} className="bg-blue-600 hover:bg-blue-700">
                        保存权限设置
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )

      case 'app-token-management':
        return (
          <div className="space-y-6">
            {/* App Token 管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">App Token 管理</h2>
                <p className="text-gray-600">查看当前应用的令牌状态</p>
              </div>
            </div>

            {/* App Token 列表 */}
            <Card>
              <CardContent className="p-6">
                {appTokenLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">加载中...</p>
                  </div>
                ) : appTokens.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无 App Token 数据</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appTokens.map((token) => (
                      <div key={`${token.app_key}-${token.expired_at}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                            <Key className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{token.app_key}</h3>
                              <Badge className={token.status === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {token.status === 'valid' ? '有效' : '无效'}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              {token.expired_at && (
                                <div className="flex items-center space-x-1">
                                  <span>过期时间: {new Date(token.expired_at).toLocaleString('zh-CN')}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-mono bg-gray-100 p-2 rounded text-gray-600 break-all">
                                {token.token}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 分页 */}
            {totalAppTokens > appTokenPageSize && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setAppTokenCurrentPage(Math.max(0, appTokenCurrentPage - 1))}
                    disabled={appTokenCurrentPage === 0}
                  >
                    上一页
                  </Button>
                  <span className="flex items-center px-4">
                    {appTokenCurrentPage + 1} / {Math.ceil(totalAppTokens / appTokenPageSize)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setAppTokenCurrentPage(appTokenCurrentPage + 1)}
                    disabled={appTokenCurrentPage >= Math.ceil(totalAppTokens / appTokenPageSize) - 1}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </div>
        )

      case 'sms-management':
        return (
          <div className="space-y-6">
            {/* 短信管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">短信管理</h2>
                <p className="text-gray-600">管理系统中的所有短信记录和通知</p>
              </div>
            </div>

            {/* 短信记录列表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">短信管理功能</div>
                    <div className="text-sm">这里将显示短信记录管理界面</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'data-analytics':
        return (
          <div className="space-y-6">
            {/* 数据分析头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">数据分析</h2>
                <p className="text-gray-600">查看系统使用统计和用户行为分析</p>
              </div>
            </div>

            {/* 分析图表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">数据分析功能</div>
                    <div className="text-sm">这里将显示系统使用统计和用户行为分析图表</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'system-settings':
        return (
          <div className="space-y-6">
            {/* 系统设置头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
                <p className="text-gray-600">配置系统参数和高级功能设置</p>
              </div>
            </div>

            {/* 设置选项 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">系统设置功能</div>
                    <div className="text-sm">这里将显示系统配置和高级设置选项</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'student-management':
        return (
          <div className="space-y-6">
            {/* 学生管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">学生管理</h2>
                <p className="text-gray-600">查看和管理所有学生的实验进度和学习情况</p>
              </div>
            </div>

            {/* 学生列表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">学生管理功能</div>
                    <div className="text-sm">这里将显示学生列表和管理界面</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'experiment-management':
        return (
          <div className="space-y-6">
            {/* 实验管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">实验管理</h2>
                <p className="text-gray-600">管理学生的实验进度和结果</p>
              </div>
            </div>

            {/* 实验列表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">实验管理功能</div>
                    <div className="text-sm">这里将显示实验列表和管理界面</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'learning-analytics':
        return (
          <div className="space-y-6">
            {/* 学习分析头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">学习分析</h2>
                <p className="text-gray-600">分析学生的学习数据和进度统计</p>
              </div>
            </div>

            {/* 分析图表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">学习分析功能</div>
                    <div className="text-sm">这里将显示学习数据分析和图表</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'my-experiments':
        return (
          <div className="space-y-6">
            {/* 我的实验头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">我的实验</h2>
                <p className="text-gray-600">查看和管理您的实验进度和结果</p>
              </div>
            </div>

            {/* 实验列表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">我的实验功能</div>
                    <div className="text-sm">这里将显示您的实验列表和进度</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'learning-progress':
        return (
          <div className="space-y-6">
            {/* 学习进度头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">学习进度</h2>
                <p className="text-gray-600">查看您的学习历史和进度统计</p>
              </div>
            </div>

            {/* 进度图表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">学习进度功能</div>
                    <div className="text-sm">这里将显示您的学习进度和统计图表</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'resources-management':
        return (
          <div className="space-y-6">
            {/* 资料库管理头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">资料库管理</h2>
                <p className="text-gray-600">管理教学资料、文档和资源文件</p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/resources')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                进入资料库
              </Button>
            </div>

            {/* 资料库概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{resourcesStats.totalRepositories}</p>
                    <p className="text-sm text-gray-600">资料库总数</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">{resourcesStats.totalDocuments}</p>
                    <p className="text-sm text-gray-600">文档总数</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{resourcesStats.supportedTypes}</p>
                    <p className="text-sm text-gray-600">支持类型</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 快速操作 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/resources')}
                    className="h-16 text-left justify-start"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold">创建资料库</div>
                        <div className="text-sm text-gray-500">新建一个资料库来管理文档</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/resources')}
                    className="h-16 text-left justify-start"
                  >
                    <div className="flex items-center space-x-3">
                      <Search className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-semibold">搜索资料</div>
                        <div className="text-sm text-gray-500">快速查找需要的教学资料</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'learning-record':
        return (
          <div className="space-y-6">
            {/* 学习记录头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">学习记录</h2>
                <p className="text-gray-600">查看您的学习历史和进度统计</p>
              </div>
            </div>

            {/* 记录列表 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">学习记录功能</div>
                    <div className="text-sm">这里将显示您的学习记录和统计图表</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'personal-settings':
        return (
          <div className="space-y-6">
            {/* 个人设置头部 */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">个人设置</h2>
                <p className="text-gray-600">管理您的个人信息和账户设置</p>
              </div>
            </div>

            {/* 设置选项 */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-gray-500">
                  <div className="space-y-2">
                    <div className="text-lg">个人设置功能</div>
                    <div className="text-sm">这里将显示您的个人信息和账户设置选项</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  // 处理设置角色权限
  const handleSetRolePermissions = (role: Role) => {
    setSelectedRoleForPermissions(role)
    
    // 根据角色类型设置默认权限
    let defaultPermissions = { ...permissionsForm }
    
    switch (role.role_type) {
      case 'teacher':
        defaultPermissions = {
          canViewAllStudents: true,
          canViewAllExperiments: true,
          canViewAllLearningProgress: true,
          canManageUsers: true,
          canManageRoles: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSystem: true
        }
        break
      case 'student':
        defaultPermissions = {
          canViewAllStudents: false,
          canViewAllExperiments: false,
          canViewAllLearningProgress: false,
          canManageUsers: false,
          canManageRoles: false,
          canViewAnalytics: false,
          canExportData: false,
          canManageSystem: false
        }
        break
      case 'guest':
        defaultPermissions = {
          canViewAllStudents: false,
          canViewAllExperiments: false,
          canViewAllLearningProgress: false,
          canManageUsers: false,
          canManageRoles: false,
          canViewAnalytics: false,
          canExportData: false,
          canManageSystem: false
        }
        break
    }
    
    setPermissionsForm(defaultPermissions)
    setPermissionsDialogOpen(true)
  }

  // 处理保存权限设置
  const handleSavePermissions = async () => {
    if (!selectedRoleForPermissions) return
    
    try {
      console.log('保存角色权限设置:', {
        role: selectedRoleForPermissions.role_name,
        permissions: permissionsForm
      })
      
      // 调用API保存权限设置
      await updateRolePermissions(selectedRoleForPermissions.role_id, permissionsForm)
      
      toast.success('权限设置保存成功')
      setPermissionsDialogOpen(false)
      setSelectedRoleForPermissions(null)
      
      // 刷新角色列表
      fetchRoles()
    } catch (error: any) {
      console.error('保存权限设置失败:', error)
      toast.error(`保存权限设置失败: ${error.message}`)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white shadow-sm w-80 flex-shrink-0">
          <SidebarHeader className="border-b border-gray-200 p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden border-2 border-white shadow-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="用户头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">个人中心</h2>
                <p className="text-sm text-gray-600">欢迎回来，{user.username}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveMenu(item.id)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 ${
                          activeMenu === item.id 
                            ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeMenu === item.id 
                            ? 'bg-green-200 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-base">{item.title}</div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full justify-start h-12 text-gray-700 hover:text-gray-900 hover:bg-white border-gray-300"
              >
                <Home className="h-5 w-5 mr-3" />
                返回首页
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <LogOut className="h-5 w-5 mr-3" />
                退出登录
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 min-w-0 overflow-auto">
          <div className="w-full h-full p-8 pl-20">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {menuItems.find(item => item.id === activeMenu)?.title || '个人中心'}
                </h1>
                {/* 所有调试按钮和测试信息已隐藏 */}
              </div>
              <SidebarTrigger className="lg:hidden p-3 bg-white rounded-lg border border-gray-200 shadow-sm" />
            </div>

            {/* 动态内容区域 */}
            {renderContent()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

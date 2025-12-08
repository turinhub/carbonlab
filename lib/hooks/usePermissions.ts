import { useUserStore } from '@/lib/stores/user-store'

// 权限类型定义
export interface UserPermissions {
  canViewAllStudents: boolean
  canViewAllExperiments: boolean
  canViewAllLearningProgress: boolean
  canManageUsers: boolean
  canManageRoles: boolean
  canViewAnalytics: boolean
  canExportData: boolean
  canManageSystem: boolean
}

// 根据角色类型获取默认权限
export const getDefaultPermissions = (roleType: string): UserPermissions => {
  switch (roleType) {
    case 'admin':
      return {
        canViewAllStudents: true,
        canViewAllExperiments: true,
        canViewAllLearningProgress: true,
        canManageUsers: true,
        canManageRoles: true,
        canViewAnalytics: true,
        canExportData: true,
        canManageSystem: true
      }
    case 'teacher':
      return {
        canViewAllStudents: true,
        canViewAllExperiments: true,
        canViewAllLearningProgress: true,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: true,
        canExportData: true,
        canManageSystem: false
      }
    case 'student':
      return {
        canViewAllStudents: false,
        canViewAllExperiments: false,
        canViewAllLearningProgress: false,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageSystem: false
      }
    case 'guest':
      return {
        canViewAllStudents: false,
        canViewAllExperiments: false,
        canViewAllLearningProgress: false,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageSystem: false
      }
    default:
      return {
        canViewAllStudents: false,
        canViewAllExperiments: false,
        canViewAllLearningProgress: false,
        canManageUsers: false,
        canManageRoles: false,
        canViewAnalytics: false,
        canExportData: false,
        canManageSystem: false
      }
  }
}

// 权限控制Hook
export const usePermissions = () => {
  const { user } = useUserStore()
  const userRoles = user?.roles || []
  
  // 获取用户权限
  const getUserPermissions = (): UserPermissions => {
    if (!user || !userRoles || userRoles.length === 0) {
      return getDefaultPermissions('guest')
    }
    
    // 如果用户有多个角色，取最高权限
    if (userRoles.includes('admin')) {
      return getDefaultPermissions('admin')
    } else if (userRoles.includes('teacher')) {
      return getDefaultPermissions('teacher')
    } else if (userRoles.includes('student')) {
      return getDefaultPermissions('student')
    } else {
      return getDefaultPermissions('guest')
    }
  }
  
  // 检查特定权限
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    const permissions = getUserPermissions()
    return permissions[permission] || false
  }
  
  // 检查多个权限（全部满足）
  const hasAllPermissions = (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  // 检查多个权限（满足任一）
  const hasAnyPermission = (permissions: (keyof UserPermissions)[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  // 常用权限检查函数
  const canViewAllStudents = () => hasPermission('canViewAllStudents')
  const canViewAllExperiments = () => hasPermission('canViewAllExperiments')
  const canViewAllLearningProgress = () => hasPermission('canViewAllLearningProgress')
  const canManageUsers = () => hasPermission('canManageUsers')
  const canManageRoles = () => hasPermission('canManageRoles')
  const canViewAnalytics = () => hasPermission('canViewAnalytics')
  const canExportData = () => hasPermission('canExportData')
  const canManageSystem = () => hasPermission('canManageSystem')
  
  // 检查是否是管理员
  const isAdmin = () => hasPermission('canManageSystem')
  
  // 检查是否是教师
  const isTeacher = () => hasPermission('canViewAllStudents') && !hasPermission('canManageUsers')
  
  // 检查是否是学生
  const isStudent = () => !hasPermission('canViewAllStudents') && !hasPermission('canManageUsers')
  
  return {
    // 权限对象
    permissions: getUserPermissions(),
    
    // 权限检查函数
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // 常用权限检查
    canViewAllStudents,
    canViewAllExperiments,
    canViewAllLearningProgress,
    canManageUsers,
    canManageRoles,
    canViewAnalytics,
    canExportData,
    canManageSystem,
    
    // 角色检查
    isAdmin,
    isTeacher,
    isStudent,
    
    // 用户信息
    user,
    userRoles
  }
}

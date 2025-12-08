import { 
  Role, 
  RolesResponse, 
  CreateRoleRequest, 
  UpdateRoleRequest, 
  RolesQueryParams 
} from '@/lib/types/tale'
import { appTokenService } from '@/lib/services/app-token-service'

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'

  // 获取角色列表 - 重新实现以避免缓存问题
export async function getRoles(params: RolesQueryParams, appKey?: string): Promise<RolesResponse> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  console.log('角色管理API使用的token:', appToken.substring(0, 20) + '...')
  console.log('=== 角色管理API调用开始 ===')

  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  })
  
  if (params.role_type) {
    searchParams.append('role_type', params.role_type)
  }
  
  // 强制使用正确的端点
  const endpoint = '/rbac/v1/roles'
  const timestamp = Date.now()
  const url = `${API_BASE_URL}${endpoint}?${searchParams}&_t=${timestamp}`
  
  console.log('角色管理API请求URL:', url)
  console.log('确认使用正确的端点:', endpoint)
  console.log('API版本: v1.0.2 - 强制使用 /rbac/v1/roles 端点')
  console.log('请求参数:', Object.fromEntries(searchParams.entries()))
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })
    
    console.log('角色管理API响应状态:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('获取角色列表失败:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('角色列表API响应:', result)
    console.log('=== 角色管理API调用成功 ===')
    return result
  } catch (error) {
    console.error('角色管理API调用异常:', error)
    throw error
  }
}

// 创建角色
export async function createRole(data: CreateRoleRequest, appKey?: string): Promise<Role> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  return result.data
}

// 更新角色
export async function updateRole(roleId: string, data: UpdateRoleRequest, appKey?: string): Promise<Role> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  return result.data
}

// 删除角色
export async function deleteRole(roleId: string, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 为角色添加权限
export async function addPrivilegesToRole(roleId: string, privilegeIds: string[], appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/role/${roleId}/privileges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({ privilege_ids: privilegeIds }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 为角色移除权限
export async function removePrivilegesFromRole(roleId: string, privilegeIds: string[], appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/role/${roleId}/privileges`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({ privilege_ids: privilegeIds }),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 更新角色权限
export async function updateRolePermissions(roleId: string, permissions: any, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  console.log('更新角色权限API调用开始，角色ID:', roleId)
  console.log('权限数据:', permissions)
  console.log('API端点:', `${API_BASE_URL}/rbac/v1/roles/${roleId}/permissions`)

  const response = await fetch(`${API_BASE_URL}/rbac/v1/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(permissions),
  })

  console.log('更新角色权限API响应状态:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('更新角色权限API失败:', response.status, errorText)
    
    // 尝试解析错误信息
    try {
      const parsedError = JSON.parse(errorText)
      if (parsedError.msg) {
        throw new Error(`更新角色权限失败: ${parsedError.msg}`)
      }
    } catch (parseError) {
      // 如果无法解析JSON，使用原始错误文本
    }
    
    throw new Error(`更新角色权限失败: HTTP ${response.status} - ${errorText}`)
  }

  // 尝试解析成功响应
  try {
    const result = await response.json()
    console.log('更新角色权限成功，响应:', result)
    
    if (result.code && result.code !== 200) {
      throw new Error(result.msg || '更新角色权限失败')
    }
  } catch (parseError) {
    // 如果响应不是JSON格式，可能是空响应，这是正常的
    console.log('更新角色权限成功（无响应内容）')
  }
}


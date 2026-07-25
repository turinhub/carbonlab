'use server'

import type { CreateUserResponse } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export interface ServerActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface UserManagementData {
  app: {
    app_name: string
    app_key: string
    org_id: string
    app_id: string
  }
  user: {
    registered_at: string
    user_id: string
    phone?: string
    username: string
    nick_name?: string
    email?: string
    remark?: string
    avatar_url?: string
    latest_login_time?: string
    is_frozen?: boolean
  }
  third_party: Record<string, unknown>
  user_roles: Array<{
    role_id: string
    role_name: string
    role_type: string
    role_property: Record<string, unknown>
    expired_at?: string
  }>
  user_privileges: string[]
  user_groups: Array<{
    groupId: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
    remark: string
    memberCount: number
  }>
}

export interface UpdateUserRequest {
  username?: string
  nick_name?: string
  phone?: string
  email?: string
  remark?: string
}

export interface UpdateUserPasswordRequest {
  user_id: string
  password_encrypted: string
}

function toUserManagementData(result: CreateUserResponse): UserManagementData {
  return {
    app: {
      app_name: result.app.appName,
      app_key: result.app.appKey,
      org_id: result.app.orgId ?? '',
      app_id: result.app.appId,
    },
    user: {
      registered_at: result.user.createdAt,
      latest_login_time: result.user.updatedAt,
      user_id: result.user.userId,
      phone: result.user.phone,
      username: result.user.username,
      nick_name: result.user.nickname,
      email: result.user.email,
      remark: result.user.remark,
      avatar_url: result.user.avatarUrl,
      is_frozen: result.user.isFrozen,
    },
    third_party: {},
    user_roles: result.userRoles.map(role => ({
      role_id: role.roleId,
      role_name: role.roleName,
      role_type: role.roleType ?? '',
      role_property: role.roleProperty ?? {},
      expired_at: role.expiredAt,
    })),
    user_privileges: result.userPrivileges.map(
      privilege => privilege.privilegeName
    ),
    user_groups: result.userGroups.map(group => ({
      groupId: group.groupId,
      name: group.name,
      description: group.description ?? '',
      createdAt: '',
      updatedAt: '',
      remark: group.remark ?? '',
      memberCount: 0,
    })),
  }
}

async function getUser(userId: string): Promise<UserManagementData> {
  const result = await createTaleServerAppClient().users.getById(userId, {
    userId,
    includeRbac: true,
    includeLoginMethods: true,
    includeUserGroups: true,
  })
  return toUserManagementData(result)
}

export async function getUserDetailAction(
  userId: string
): Promise<ServerActionResult<UserManagementData>> {
  try {
    return { success: true, data: await getUser(userId) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败',
    }
  }
}

export async function getUserDetailForManagementAction(
  userId: string
): Promise<ServerActionResult<UserManagementData>> {
  try {
    return { success: true, data: await getUser(userId) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败',
    }
  }
}

export async function updateUserAction(
  userId: string,
  userData: UpdateUserRequest
): Promise<ServerActionResult<void>> {
  try {
    await createTaleServerAppClient().users.update(userId, {
      username: userData.username,
      nickname: userData.nick_name,
      phone: userData.phone,
      email: userData.email,
      remark: userData.remark,
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新用户信息失败',
    }
  }
}

export async function updateUserPasswordAction(
  passwordData: UpdateUserPasswordRequest
): Promise<ServerActionResult<void>> {
  try {
    await createTaleServerAppClient().users.updatePassword({
      userId: passwordData.user_id,
      passwordEncrypted: passwordData.password_encrypted,
    })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新用户密码失败',
    }
  }
}

export async function getAvatarPresignedUrlAction(
  ossKey: string
): Promise<
  ServerActionResult<{
    ossKey: string
    presignedUrl: string
    expireTimeInSeconds: number
  }>
> {
  try {
    const data =
      await createTaleServerAppClient().users.getAvatarPresignedUrl(ossKey)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : '获取头像预签名URL失败',
    }
  }
}

export async function uploadAvatarAction(
  file: File,
  userId: string
): Promise<ServerActionResult<{ avatar_oss_key: string }>> {
  try {
    const result = await createTaleServerAppClient().users.uploadAvatar(
      file,
      userId
    )
    return {
      success: true,
      data: { avatar_oss_key: result.avatarOssKey },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '头像上传失败',
    }
  }
}

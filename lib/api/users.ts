'use server'

import type {
  AppUser,
  UsersQueryParams,
  UsersResponse,
} from '@/lib/types/tale'
import {
  toLegacyAppUser,
  toLegacyUsersResponse,
} from '@/lib/server/tale-legacy-adapters'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export async function getUsers(
  params?: UsersQueryParams
): Promise<UsersResponse> {
  const result = await createTaleServerAppClient().users.list({
    page: params?.page,
    size: params?.size,
    sort: params?.sort_by
      ? `${params.sort_by},${params.sort_direction ?? 'asc'}`
      : undefined,
    keyword: params?.keyword ?? params?.search,
    userRoles: params?.user_roles ? [params.user_roles] : undefined,
  })
  return toLegacyUsersResponse(result)
}

export interface UpdateUserPasswordRequest {
  user_id: string
  password_encrypted: string
}

export async function updateUserPassword(
  passwordData: UpdateUserPasswordRequest
): Promise<void> {
  await createTaleServerAppClient().users.updatePassword({
    userId: passwordData.user_id,
    passwordEncrypted: passwordData.password_encrypted,
  })
}

export interface UpdateUserRequest {
  username?: string
  nick_name?: string
  email?: string
  phone?: string
  remark?: string
}

export async function updateUser(
  userId: string,
  userData: UpdateUserRequest
): Promise<void> {
  await createTaleServerAppClient().users.update(userId, {
    username: userData.username,
    nickname: userData.nick_name,
    email: userData.email,
    phone: userData.phone,
    remark: userData.remark,
  })
}

export async function deleteUser(
  userId: string
): Promise<void> {
  await createTaleServerAppClient().users.delete(userId)
}

export interface CreateUserRequest {
  username: string
  phone?: string
  password_encrypted?: string
}

export async function createUser(
  userData: CreateUserRequest
): Promise<AppUser> {
  const result = await createTaleServerAppClient().users.create({
    username: userData.username,
    phone: userData.phone,
    passwordEncrypted: userData.password_encrypted,
  })
  return toLegacyAppUser(result)
}

export interface UserDetailResponse {
  data: AppUser & {
    user_login_methods?: Array<{
      methodType: string
      identifier: string
      oauthService?: string
      isActivate: boolean
    }>
  }
  code: number
  msg: string
}

export async function getUserDetail(
  userId: string
): Promise<UserDetailResponse> {
  const result = await createTaleServerAppClient().users.getById(userId, {
    userId,
    includeRbac: true,
    includeLoginMethods: true,
    includeUserGroups: true,
  })

  return {
    data: toLegacyAppUser(result),
    code: 200,
    msg: 'OK',
  }
}

export interface SaveUserRolesRequest {
  role_ids: string[]
}

export async function saveUserRoles(
  userId: string,
  roleData: SaveUserRolesRequest
): Promise<void> {
  await createTaleServerAppClient().rbac.assignRolesToUser(userId, {
    roleIds: roleData.role_ids,
  })
}

export interface RemoveUserRoleRequest {
  role_ids: string[]
}

export async function removeUserRole(
  userId: string,
  roleData: RemoveUserRoleRequest
): Promise<void> {
  await createTaleServerAppClient().rbac.unassignRolesFromUser(userId, {
    roleIds: roleData.role_ids,
  })
}

export interface SaveUserPrivilegesRequest {
  privilege_ids: string[]
  started_at?: string
  expired_at?: string
  assignment_type?: string
  assignment_ref?: string
  remark?: string
}

export async function saveUserPrivileges(
  userId: string,
  privilegeData: SaveUserPrivilegesRequest
): Promise<void> {
  await createTaleServerAppClient().rbac.assignPrivilegesToUser(userId, {
    privilegeIds: privilegeData.privilege_ids,
    startedAt: privilegeData.started_at,
    expiredAt: privilegeData.expired_at,
    assignmentType: privilegeData.assignment_type,
    assignmentRef: privilegeData.assignment_ref,
    remark: privilegeData.remark,
  })
}

export interface RemoveUserPrivilegeRequest {
  privilege_ids: string[]
}

export async function removeUserPrivilege(
  userId: string,
  privilegeData: RemoveUserPrivilegeRequest
): Promise<void> {
  await createTaleServerAppClient().rbac.unassignPrivilegesFromUser(userId, {
    privilegeIds: privilegeData.privilege_ids,
  })
}

export interface PresignedUrlResponse {
  data: {
    ossKey: string
    presignedUrl: string
    expireTimeInSeconds: number
  }
  code: number
  msg: string
}

export async function getAvatarPresignedUrl(
  userId: string
): Promise<PresignedUrlResponse['data']> {
  return createTaleServerAppClient().users.getAvatarPresignedUrl(userId)
}

export interface AvatarUploadResponse {
  data: {
    avatar_oss_key: string
  }
  code: number
  msg: string
}

export async function uploadAvatar(
  file: File,
  userId: string
): Promise<AvatarUploadResponse['data']> {
  const result = await createTaleServerAppClient().users.uploadAvatar(file, userId)
  return { avatar_oss_key: result.avatarOssKey }
}

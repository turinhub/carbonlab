'use server'

import type { UserGroupInfo, UserGroupMember as SdkUserGroupMember } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export interface Class {
  groupId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  remark: string
  memberCount: number
}

export type UserGroup = Class

export interface ClassesResponse {
  total: number
  content: Class[]
  pageable: {
    sort: { orders: unknown[] }
    pageNumber: number
    pageSize: number
  }
}

export interface ClassesQueryParams {
  page: number
  size: number
  keyword?: string
  search?: string
}

export interface CreateClassRequest {
  name: string
  description?: string
  remark?: string
}

export interface UpdateClassRequest {
  name?: string
  description?: string
  remark?: string
}

export type UpdateUserGroupRequest = UpdateClassRequest

function toClass(group: UserGroupInfo): Class {
  return {
    groupId: group.groupId,
    name: group.name,
    description: group.description ?? '',
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    remark: group.remark ?? '',
    memberCount: group.memberCount,
  }
}

export async function getClasses(
  params?: ClassesQueryParams
): Promise<ClassesResponse> {
  const result = await createTaleServerAppClient().userGroups.list({
    page: params?.page,
    size: params?.size,
    keyword: params?.keyword ?? params?.search,
  })
  return {
    total: result.total,
    content: result.content.map(toClass),
    pageable: {
      sort: { orders: result.sort },
      pageNumber: result.page,
      pageSize: result.size,
    },
  }
}

export async function getClass(
  classId: string
): Promise<Class> {
  return toClass(await createTaleServerAppClient().userGroups.get(classId))
}

export async function createClass(
  classData: CreateClassRequest
): Promise<Class> {
  const result = await createTaleServerAppClient().userGroups.create(classData)
  return toClass(result)
}

export async function updateClass(
  classId: string,
  classData: UpdateClassRequest
): Promise<Class> {
  const result = await createTaleServerAppClient().userGroups.update(
    classId,
    classData
  )
  return toClass(result)
}

export async function getUserGroup(
  groupId: string
): Promise<UserGroup> {
  return getClass(groupId)
}

export async function updateUserGroup(
  groupId: string,
  groupData: UpdateClassRequest
): Promise<UserGroup> {
  return updateClass(groupId, groupData)
}

export async function deleteClass(
  classId: string
): Promise<void> {
  await createTaleServerAppClient().userGroups.delete(classId)
}

export interface UserGroupMember {
  userId: string
  username: string
  phone: string
  isFrozen: boolean
  createdAt: string
}

export interface UserGroupMembersResponse {
  data: {
    total: number
    content: UserGroupMember[]
    pageable: {
      sort: { orders: unknown[] }
      pageNumber: number
      pageSize: number
    }
  }
  code: number
  msg: string
}

function toMember(member: SdkUserGroupMember): UserGroupMember {
  return {
    userId: member.userId,
    username: member.username,
    phone: member.phone,
    isFrozen: member.isFrozen,
    createdAt: member.createdAt,
  }
}

export async function getUserGroupMembers(
  groupId: string,
  page = 0,
  size = 10
): Promise<UserGroupMembersResponse> {
  const result = await createTaleServerAppClient().userGroups.listMembers(groupId, {
    page,
    size,
  })
  return {
    data: {
      total: result.total,
      content: result.content.map(toMember),
      pageable: {
        sort: { orders: result.sort },
        pageNumber: result.page,
        pageSize: result.size,
      },
    },
    code: 200,
    msg: 'OK',
  }
}

export async function addMembersToUserGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  await createTaleServerAppClient().userGroups.addMembers(groupId, { userIds })
}

export async function removeMembersFromUserGroup(
  groupId: string,
  userIds: string[]
): Promise<void> {
  await createTaleServerAppClient().userGroups.removeMembers(groupId, { userIds })
}

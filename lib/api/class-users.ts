'use server'

import type { UserListItem } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export interface ClassUser {
  user: {
    user_id: string
    username: string
    phone: string
    email?: string
    is_frozen?: boolean
    created_at?: string
  }
  user_roles: string[]
  user_groups?: unknown[]
}

export interface ClassUsersResponse {
  total: number
  content: ClassUser[]
  pageable: {
    sort: { orders: unknown[] }
    pageNumber: number
    pageSize: number
  }
}

export interface ClassUsersQueryParams {
  page?: number
  size?: number
  search?: string
}

function toClassUser(item: UserListItem): ClassUser {
  return {
    user: {
      user_id: item.user.userId,
      username: item.user.username,
      phone: item.user.phone,
      email: item.user.email,
      is_frozen: item.user.isFrozen,
      created_at: item.user.createdAt,
    },
    user_roles: item.userRoles.map(role => role.roleId),
    user_groups: item.userGroups,
  }
}

export async function getClassUsers(
  params?: ClassUsersQueryParams
): Promise<ClassUsersResponse> {
  const result = await createTaleServerAppClient().users.list({
    page: params?.page,
    size: params?.size,
    keyword: params?.search,
  })
  return {
    total: result.total,
    content: result.content.map(toClassUser),
    pageable: {
      sort: { orders: result.sort },
      pageNumber: result.page,
      pageSize: result.size,
    },
  }
}

export async function getClassUser(
  userId: string
): Promise<ClassUser> {
  const result = await createTaleServerAppClient().users.getById(userId, {
    userId,
    includeRbac: true,
    includeUserGroups: true,
  })
  return {
    user: {
      user_id: result.user.userId,
      username: result.user.username,
      phone: result.user.phone,
      email: result.user.email,
      is_frozen: result.user.isFrozen,
      created_at: result.user.createdAt,
    },
    user_roles: result.userRoles.map(role => role.roleId),
    user_groups: result.userGroups,
  }
}

export async function searchClassUsers(
  keyword: string,
  page = 0,
  size = 10
): Promise<ClassUsersResponse> {
  return getClassUsers({ page, size, search: keyword })
}

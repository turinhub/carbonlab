'use server'

import type {
  CreateRoleRequest,
  Role,
  RolesQueryParams,
  RolesResponse,
  UpdateRoleRequest,
} from '@/lib/types/tale'
import {
  toLegacyRole,
  toLegacyRolesResponse,
} from '@/lib/server/tale-legacy-adapters'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export async function getRoles(
  params: RolesQueryParams
): Promise<RolesResponse> {
  const result = await createTaleServerAppClient().rbac.listRoles({
    page: params.page,
    size: params.size,
    roleType: params.role_type,
  })
  return toLegacyRolesResponse(result)
}

export async function createRole(
  data: CreateRoleRequest
): Promise<Role> {
  const result = await createTaleServerAppClient().rbac.createRole({
    roleName: data.role_name,
    roleType: data.role_type,
    roleProperty: data.role_property,
    remark: data.remark ?? data.description,
  })
  return toLegacyRole(result)
}

export async function updateRole(
  roleId: string,
  data: UpdateRoleRequest
): Promise<Role> {
  const result = await createTaleServerAppClient().rbac.updateRole(roleId, {
    roleName: data.role_name,
    roleType: data.role_type,
    roleProperty: data.role_property,
    remark: data.remark ?? data.description,
  })
  return toLegacyRole(result)
}

export async function deleteRole(
  roleId: string
): Promise<void> {
  await createTaleServerAppClient().rbac.deleteRole(roleId)
}

export async function addPrivilegesToRole(
  roleId: string,
  privilegeIds: string[]
): Promise<void> {
  await createTaleServerAppClient().rbac.assignPrivilegesToRole(roleId, {
    privilegeIds,
  })
}

export async function removePrivilegesFromRole(
  roleId: string,
  privilegeIds: string[]
): Promise<void> {
  await createTaleServerAppClient().rbac.unassignPrivilegesFromRole(roleId, {
    privilegeIds,
  })
}

export async function updateRolePermissions(
  roleId: string,
  permissions: Record<string, boolean>
): Promise<void> {
  await createTaleServerAppClient().rbac.updateRole(roleId, {
    roleProperty: permissions,
  })
}
